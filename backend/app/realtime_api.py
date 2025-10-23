from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import json
import redis
import pymysql
import os
from .flink_processor import realtime_processor, cache_analytics_data, get_cached_analytics

router = APIRouter(prefix="/api/realtime", tags=["realtime"])

# Redis 연결 설정
def get_redis_client():
    return redis.Redis(
        host=os.getenv('REDIS_HOST', 'redis'),
        port=int(os.getenv('REDIS_PORT', '6379')),
        decode_responses=True
    )

# MySQL 연결 설정
def get_mysql_connection():
    return pymysql.connect(
        host=os.getenv('MYSQL_HOST', 'localhost'),
        port=int(os.getenv('MYSQL_PORT', '3307')),
        user=os.getenv('MYSQL_USER', 'ytuser'),
        password=os.getenv('MYSQL_PW', 'ytpw'),
        database=os.getenv('MYSQL_DB', 'yt'),
        charset='utf8mb4',
        autocommit=True
    )

# Pydantic 모델들
class RealtimeEvent(BaseModel):
    event_type: str
    video_id: str
    user_id: Optional[str] = None
    timestamp: datetime
    data: Dict[str, Any]

class AnalyticsData(BaseModel):
    video_id: str
    view_count: int
    like_count: int
    comment_count: int
    sentiment_score: float
    trending_score: float
    last_updated: datetime

class TrendingVideo(BaseModel):
    video_id: str
    title: str
    channel_name: str
    trending_score: float
    view_count: int
    sentiment_score: float

# 실시간 이벤트 발행
@router.post("/events")
async def publish_event(event: RealtimeEvent):
    """실시간 이벤트 발행"""
    try:
        # Redis에 이벤트 저장
        redis_client = get_redis_client()
        event_key = f"event:{event.video_id}:{int(event.timestamp.timestamp())}"
        
        redis_client.setex(
            event_key,
            3600,  # 1시간 TTL
            json.dumps(event.dict(), default=str)
        )
        
        # 실시간 분석 데이터 업데이트
        await update_realtime_analytics(event)
        
        return {"status": "success", "event_id": event_key}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to publish event: {str(e)}")

async def update_realtime_analytics(event: RealtimeEvent):
    """실시간 분석 데이터 업데이트"""
    try:
        redis_client = get_redis_client()
        analytics_key = f"analytics:video:{event.video_id}"
        
        # 기존 분석 데이터 조회
        existing_data = redis_client.get(analytics_key)
        if existing_data:
            analytics = json.loads(existing_data)
        else:
            analytics = {
                "video_id": event.video_id,
                "view_count": 0,
                "like_count": 0,
                "comment_count": 0,
                "sentiment_score": 0.0,
                "trending_score": 0.0,
                "last_updated": datetime.now().isoformat()
            }
        
        # 이벤트 타입에 따른 업데이트
        if event.event_type == "view":
            analytics["view_count"] += 1
        elif event.event_type == "like":
            analytics["like_count"] += 1
        elif event.event_type == "comment":
            analytics["comment_count"] += 1
        
        # 트렌딩 스코어 계산 (간단한 알고리즘)
        trending_score = calculate_trending_score(analytics)
        analytics["trending_score"] = trending_score
        analytics["last_updated"] = datetime.now().isoformat()
        
        # Redis에 업데이트된 분석 데이터 저장
        redis_client.setex(analytics_key, 7200, json.dumps(analytics))  # 2시간 TTL
        
    except Exception as e:
        print(f"Failed to update realtime analytics: {e}")

def calculate_trending_score(analytics: Dict[str, Any]) -> float:
    """트렌딩 스코어 계산"""
    view_weight = 0.4
    like_weight = 0.3
    comment_weight = 0.3
    
    view_score = min(analytics["view_count"] / 1000, 1.0)  # 최대 1000뷰로 정규화
    like_score = min(analytics["like_count"] / 100, 1.0)  # 최대 100좋아요로 정규화
    comment_score = min(analytics["comment_count"] / 50, 1.0)  # 최대 50댓글로 정규화
    
    return (view_score * view_weight + 
            like_score * like_weight + 
            comment_score * comment_weight) * 100

# 실시간 분석 데이터 조회
@router.get("/analytics/{video_id}")
async def get_realtime_analytics(video_id: str):
    """특정 비디오의 실시간 분석 데이터 조회"""
    try:
        redis_client = get_redis_client()
        analytics_key = f"analytics:video:{video_id}"
        
        analytics_data = redis_client.get(analytics_key)
        if not analytics_data:
            raise HTTPException(status_code=404, detail="Analytics data not found")
        
        return json.loads(analytics_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

# 트렌딩 비디오 조회
@router.get("/trending")
async def get_trending_videos(limit: int = Query(10, ge=1, le=50)):
    """트렌딩 비디오 목록 조회"""
    try:
        redis_client = get_redis_client()
        mysql_conn = get_mysql_connection()
        
        # Redis에서 모든 분석 데이터 조회
        pattern = "analytics:video:*"
        analytics_keys = redis_client.keys(pattern)
        
        trending_videos = []
        
        for key in analytics_keys:
            analytics_data = redis_client.get(key)
            if analytics_data:
                analytics = json.loads(analytics_data)
                
                # MySQL에서 비디오 정보 조회
                with mysql_conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT v.id, v.title, v.channel_id, c.channel_name
                        FROM videos v
                        LEFT JOIN channels c ON v.channel_id = c.id
                        WHERE v.id = %s
                    """, (analytics["video_id"],))
                    
                    video_info = cursor.fetchone()
                    if video_info:
                        trending_videos.append({
                            "video_id": video_info[0],
                            "title": video_info[1],
                            "channel_name": video_info[3] or "Unknown",
                            "trending_score": analytics["trending_score"],
                            "view_count": analytics["view_count"],
                            "sentiment_score": analytics["sentiment_score"]
                        })
        
        # 트렌딩 스코어로 정렬
        trending_videos.sort(key=lambda x: x["trending_score"], reverse=True)
        
        return trending_videos[:limit]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trending videos: {str(e)}")

# 실시간 대시보드 데이터
@router.get("/dashboard")
async def get_realtime_dashboard():
    """실시간 대시보드 데이터 조회"""
    try:
        redis_client = get_redis_client()
        mysql_conn = get_mysql_connection()
        
        # 전체 통계
        total_events = len(redis_client.keys("event:*"))
        active_videos = len(redis_client.keys("analytics:video:*"))
        
        # 최근 이벤트 (최근 1시간)
        recent_events = []
        event_keys = redis_client.keys("event:*")
        
        for key in event_keys[:10]:  # 최근 10개 이벤트
            event_data = redis_client.get(key)
            if event_data:
                event = json.loads(event_data)
                recent_events.append(event)
        
        # 트렌딩 비디오 (상위 5개)
        trending_videos = await get_trending_videos(5)
        
        return {
            "total_events": total_events,
            "active_videos": active_videos,
            "recent_events": recent_events,
            "trending_videos": trending_videos,
            "last_updated": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard data: {str(e)}")

# 실시간 알림 설정
@router.post("/notifications/subscribe")
async def subscribe_notifications(
    video_id: str,
    notification_types: List[str] = ["view", "like", "comment"]
):
    """실시간 알림 구독"""
    try:
        redis_client = get_redis_client()
        subscription_key = f"subscription:{video_id}"
        
        subscription_data = {
            "video_id": video_id,
            "notification_types": notification_types,
            "subscribed_at": datetime.now().isoformat()
        }
        
        redis_client.setex(
            subscription_key,
            86400,  # 24시간 TTL
            json.dumps(subscription_data)
        )
        
        return {"status": "subscribed", "video_id": video_id}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to subscribe: {str(e)}")

# 실시간 스트림 상태 확인
@router.get("/status")
async def get_realtime_status():
    """실시간 처리 상태 확인"""
    try:
        redis_client = get_redis_client()
        
        # Redis 연결 상태
        redis_status = "connected" if redis_client.ping() else "disconnected"
        
        # 활성 이벤트 수
        active_events = len(redis_client.keys("event:*"))
        active_analytics = len(redis_client.keys("analytics:video:*"))
        
        return {
            "redis_status": redis_status,
            "active_events": active_events,
            "active_analytics": active_analytics,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {
            "redis_status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
