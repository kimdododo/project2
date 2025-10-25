from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from app.db import SessionLocal
# from app.auth import get_current_user
import json
from typing import List, Optional

router = APIRouter()

@router.post("/api/travel/collect")
async def start_travel_data_collection(
    keywords: List[str] = Query(..., description="수집할 여행 키워드 목록")
):
    """여행 데이터 수집 시작"""
    try:
        # 여행 키워드 검증
        valid_keywords = []
        travel_keywords = [
            "제주도 여행", "서울 여행", "부산 여행", "일본 여행", "대만 여행", "태국 여행",
            "혼자 여행", "커플 여행", "가족 여행", "힐링 여행", "맛집 여행", "사진 여행"
        ]
        
        for keyword in keywords:
            if any(travel_kw in keyword for travel_kw in travel_keywords):
                valid_keywords.append(keyword)
        
        if not valid_keywords:
            raise HTTPException(status_code=400, detail="유효한 여행 키워드가 없습니다.")
        
        # 데이터베이스에 수집 요청 저장
        async with SessionLocal() as s:
            result = await s.execute(
                text("""
                    INSERT INTO queries (keyword, status, videos, comments, created_at)
                    VALUES (:keyword, 'running', 0, 0, NOW())
                """),
                {"keyword": ", ".join(valid_keywords)}
            )
            await s.commit()
            
            # 생성된 쿼리 ID 가져오기
            query_result = await s.execute(
                text("SELECT LAST_INSERT_ID() as query_id")
            )
            query_id = query_result.fetchone()[0]
        
        return {
            "message": "여행 데이터 수집이 시작되었습니다.",
            "query_id": query_id,
            "keywords": valid_keywords,
            "status": "running"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"데이터 수집 시작 실패: {str(e)}")

@router.get("/api/travel/videos")
async def get_travel_videos(
    destination: Optional[str] = Query(None, description="여행지 필터"),
    travel_type: Optional[str] = Query(None, description="여행 유형 필터"),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    # current_user: dict = Depends(get_current_user)
):
    """여행 비디오 목록 조회"""
    try:
        async with SessionLocal() as s:
            # 기본 쿼리
            base_query = """
                SELECT tv.*, c.title as channel_name, c.subscriber_count
                FROM travel_videos tv
                LEFT JOIN channels c ON tv.channel_id = c.id
                WHERE 1=1
            """
            params = {"limit": limit, "offset": offset}
            
            # 필터 조건 추가
            if destination:
                base_query += " AND tv.destination = :destination"
                params["destination"] = destination
            
            if travel_type:
                base_query += " AND tv.travel_type = :travel_type"
                params["travel_type"] = travel_type
            
            base_query += " ORDER BY tv.published_at DESC LIMIT :limit OFFSET :offset"
            
            result = await s.execute(text(base_query), params)
            videos = result.fetchall()
            
            # 각 비디오의 감정 분석 결과 가져오기
            video_list = []
            for v in videos:
                # 긍정/부정 댓글 가져오기
                positive_result = await s.execute(
                    text("""
                        SELECT c.text FROM comments c 
                        JOIN travel_comment_sentiment tcs ON c.id = tcs.comment_id 
                        WHERE c.video_id = :video_id AND tcs.sentiment_label = 'positive'
                        AND c.text IS NOT NULL AND c.text != '' 
                        LIMIT 3
                    """),
                    {"video_id": v.id}
                )
                positive_comments = [row[0] for row in positive_result.fetchall()]
                
                negative_result = await s.execute(
                    text("""
                        SELECT c.text FROM comments c 
                        JOIN travel_comment_sentiment tcs ON c.id = tcs.comment_id 
                        WHERE c.video_id = :video_id AND tcs.sentiment_label = 'negative'
                        AND c.text IS NOT NULL AND c.text != '' 
                        LIMIT 3
                    """),
                    {"video_id": v.id}
                )
                negative_comments = [row[0] for row in negative_result.fetchall()]
                
                # 감정 분석 통계
                sentiment_result = await s.execute(
                    text("""
                        SELECT 
                            AVG(sentiment_score) as avg_sentiment,
                            COUNT(CASE WHEN sentiment_label = 'positive' THEN 1 END) as positive_count,
                            COUNT(CASE WHEN sentiment_label = 'negative' THEN 1 END) as negative_count,
                            COUNT(CASE WHEN sentiment_label = 'neutral' THEN 1 END) as neutral_count
                        FROM travel_comment_sentiment 
                        WHERE video_id = :video_id
                    """),
                    {"video_id": v.id}
                )
                sentiment_stats = sentiment_result.fetchone()
                
                video_data = {
                    "id": v.id,
                    "title": v.title,
                    "description": v.description,
                    "channel_name": v.channel_name or f"채널 {v.channel_id}",
                    "published_at": v.published_at.isoformat() if v.published_at else None,
                    "view_count": v.view_count,
                    "like_count": v.like_count,
                    "comment_count": v.comment_count,
                    "destination": v.destination,
                    "travel_type": v.travel_type,
                    "budget_range": v.budget_range,
                    "season": v.season,
                    "thumbnail_url": v.thumbnail_url,
                    "tags": json.loads(v.tags) if v.tags else [],
                    "positive_comments": positive_comments,
                    "negative_comments": negative_comments,
                    "sentiment": {
                        "avg_score": float(sentiment_stats[0]) if sentiment_stats[0] else 0.0,
                        "positive_count": sentiment_stats[1] or 0,
                        "negative_count": sentiment_stats[2] or 0,
                        "neutral_count": sentiment_stats[3] or 0
                    }
                }
                video_list.append(video_data)
            
            return {
                "videos": video_list,
                "total": len(video_list),
                "filters": {
                    "destination": destination,
                    "travel_type": travel_type
                }
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"여행 비디오 조회 실패: {str(e)}")

@router.get("/api/travel/destinations")
async def get_popular_destinations(
    limit: int = Query(10, ge=1, le=50),
    # current_user: dict = Depends(get_current_user)
):
    """인기 여행지 조회"""
    try:
        async with SessionLocal() as s:
            result = await s.execute(
                text("""
                    SELECT 
                        destination,
                        COUNT(*) as video_count,
                        SUM(view_count) as total_views,
                        AVG(tcs.sentiment_score) as avg_sentiment
                    FROM travel_videos tv
                    LEFT JOIN travel_comment_sentiment tcs ON tv.id = tcs.video_id
                    WHERE destination IS NOT NULL AND destination != '기타'
                    GROUP BY destination
                    ORDER BY video_count DESC, total_views DESC
                    LIMIT :limit
                """),
                {"limit": limit}
            )
            destinations = result.fetchall()
            
            return {
                "destinations": [
                    {
                        "destination": dest[0],
                        "video_count": dest[1],
                        "total_views": dest[2],
                        "avg_sentiment": float(dest[3]) if dest[3] else 0.0,
                        "popularity_score": (dest[1] * 0.7 + (dest[2] / 10000) * 0.3) if dest[2] else dest[1]
                    }
                    for dest in destinations
                ]
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"인기 여행지 조회 실패: {str(e)}")

@router.get("/api/travel/trends")
async def get_travel_trends(
    period: str = Query("weekly", description="분석 기간 (daily, weekly, monthly)"),
    # current_user: dict = Depends(get_current_user)
):
    """여행 트렌드 분석"""
    try:
        async with SessionLocal() as s:
            # 여행 유형별 트렌드
            travel_type_result = await s.execute(
                text("""
                    SELECT 
                        travel_type,
                        COUNT(*) as video_count,
                        AVG(view_count) as avg_views,
                        AVG(tcs.sentiment_score) as avg_sentiment
                    FROM travel_videos tv
                    LEFT JOIN travel_comment_sentiment tcs ON tv.id = tcs.video_id
                    WHERE travel_type IS NOT NULL
                    GROUP BY travel_type
                    ORDER BY video_count DESC
                """)
            )
            travel_types = travel_type_result.fetchall()
            
            # 계절별 트렌드
            season_result = await s.execute(
                text("""
                    SELECT 
                        season,
                        COUNT(*) as video_count,
                        AVG(view_count) as avg_views
                    FROM travel_videos tv
                    WHERE season IS NOT NULL
                    GROUP BY season
                    ORDER BY video_count DESC
                """)
            )
            seasons = season_result.fetchall()
            
            # 예산별 트렌드
            budget_result = await s.execute(
                text("""
                    SELECT 
                        budget_range,
                        COUNT(*) as video_count,
                        AVG(view_count) as avg_views
                    FROM travel_videos tv
                    WHERE budget_range IS NOT NULL
                    GROUP BY budget_range
                    ORDER BY video_count DESC
                """)
            )
            budgets = budget_result.fetchall()
            
            return {
                "travel_types": [
                    {
                        "type": tt[0],
                        "video_count": tt[1],
                        "avg_views": int(tt[2]) if tt[2] else 0,
                        "avg_sentiment": float(tt[3]) if tt[3] else 0.0
                    }
                    for tt in travel_types
                ],
                "seasons": [
                    {
                        "season": s[0],
                        "video_count": s[1],
                        "avg_views": int(s[2]) if s[2] else 0
                    }
                    for s in seasons
                ],
                "budgets": [
                    {
                        "budget_range": b[0],
                        "video_count": b[1],
                        "avg_views": int(b[2]) if b[2] else 0
                    }
                    for b in budgets
                ],
                "period": period
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"여행 트렌드 조회 실패: {str(e)}")

@router.get("/api/travel/recommendations")
async def get_travel_recommendations(
    user_preferences: Optional[str] = Query(None, description="사용자 선호도 (JSON)"),
    limit: int = Query(10, ge=1, le=50),
    # current_user: dict = Depends(get_current_user)
):
    """개인화된 여행 추천"""
    try:
        # 사용자 선호도 파싱
        preferences = {}
        if user_preferences:
            try:
                preferences = json.loads(user_preferences)
            except:
                preferences = {}
        
        async with SessionLocal() as s:
            # 기본 추천 쿼리
            base_query = """
                SELECT tv.*, c.title as channel_name,
                       AVG(tcs.sentiment_score) as avg_sentiment,
                       COUNT(tcs.id) as comment_count
                FROM travel_videos tv
                LEFT JOIN channels c ON tv.channel_id = c.id
                LEFT JOIN travel_comment_sentiment tcs ON tv.id = tcs.video_id
                WHERE 1=1
            """
            params = {"limit": limit}
            
            # 선호도 기반 필터링
            if preferences.get("destination"):
                base_query += " AND tv.destination = :destination"
                params["destination"] = preferences["destination"]
            
            if preferences.get("travel_type"):
                base_query += " AND tv.travel_type = :travel_type"
                params["travel_type"] = preferences["travel_type"]
            
            if preferences.get("budget_range"):
                base_query += " AND tv.budget_range = :budget_range"
                params["budget_range"] = preferences["budget_range"]
            
            if preferences.get("season"):
                base_query += " AND tv.season = :season"
                params["season"] = preferences["season"]
            
            base_query += """
                GROUP BY tv.id
                ORDER BY avg_sentiment DESC, tv.view_count DESC
                LIMIT :limit
            """
            
            result = await s.execute(text(base_query), params)
            recommendations = result.fetchall()
            
            return {
                "recommendations": [
                    {
                        "id": rec.id,
                        "title": rec.title,
                        "destination": rec.destination,
                        "travel_type": rec.travel_type,
                        "budget_range": rec.budget_range,
                        "season": rec.season,
                        "view_count": rec.view_count,
                        "avg_sentiment": float(rec.avg_sentiment) if rec.avg_sentiment else 0.0,
                        "comment_count": rec.comment_count,
                        "channel_name": rec.channel_name,
                        "thumbnail_url": rec.thumbnail_url
                    }
                    for rec in recommendations
                ],
                "preferences_used": preferences
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"여행 추천 조회 실패: {str(e)}")
