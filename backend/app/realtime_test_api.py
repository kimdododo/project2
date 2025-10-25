"""
실시간 테스트용 API 엔드포인트
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
import json
import random
from typing import Dict, List, Any

router = APIRouter(prefix="/realtime-test", tags=["realtime-test"])

# 테스트용 샘플 데이터
SAMPLE_VIDEOS = [
    {
        "id": "video_001",
        "title": "제주도 여행 완벽 가이드",
        "description": "제주도의 숨은 명소들을 소개합니다",
        "channel_id": "korean_traveler_001",
        "view_count": 125000,
        "like_count": 8500,
        "comment_count": 1200,
        "travel_keyword": "제주도",
        "destination": "제주도",
        "travel_type": "관광",
        "budget_range": "중간",
        "season": "봄",
        "thumbnail_url": "https://example.com/jeju.jpg"
    },
    {
        "id": "video_002", 
        "title": "부산 해운대 맛집 투어",
        "description": "부산 해운대의 맛있는 식당들을 소개합니다",
        "channel_id": "korean_traveler_002",
        "view_count": 89000,
        "like_count": 6200,
        "comment_count": 890,
        "travel_keyword": "부산",
        "destination": "부산",
        "travel_type": "맛집",
        "budget_range": "저렴",
        "season": "여름",
        "thumbnail_url": "https://example.com/busan.jpg"
    },
    {
        "id": "video_003",
        "title": "서울 명동 쇼핑 가이드",
        "description": "서울 명동에서 쇼핑하는 방법을 알려드립니다",
        "channel_id": "korean_traveler_003",
        "view_count": 156000,
        "like_count": 11200,
        "comment_count": 1800,
        "travel_keyword": "서울",
        "destination": "서울",
        "travel_type": "쇼핑",
        "budget_range": "고가",
        "season": "가을",
        "thumbnail_url": "https://example.com/seoul.jpg"
    }
]

SAMPLE_COMMENTS = [
    "정말 좋은 영상이네요! 다음에 가볼게요",
    "정보가 너무 유용해요 감사합니다",
    "이런 곳이 있었군요 놀랍네요",
    "다음 여행 계획에 도움이 될 것 같아요",
    "영상 퀄리티가 정말 좋네요",
    "추천해주신 곳들 다 가보고 싶어요",
    "여행 정보가 정말 상세하네요",
    "다음 영상도 기대됩니다"
]

SAMPLE_AUTHORS = [
    "여행러123", "관광객456", "백패커789", "휴가족001",
    "여행마니아", "관광지애호가", "휴양지러버", "여행계획자"
]

@router.get("/")
async def get_test_info():
    """실시간 테스트 정보"""
    return {
        "message": "실시간 처리 시스템 테스트 API",
        "status": "active",
        "endpoints": {
            "trigger_video": "/realtime-test/trigger/video",
            "trigger_comment": "/realtime-test/trigger/comment", 
            "trigger_sentiment": "/realtime-test/trigger/sentiment",
            "trigger_recommendation": "/realtime-test/trigger/recommendation",
            "get_stats": "/realtime-test/stats"
        }
    }

@router.post("/trigger/video")
async def trigger_video_test():
    """비디오 데이터 테스트 트리거"""
    try:
        # 랜덤 비디오 선택
        video = random.choice(SAMPLE_VIDEOS).copy()
        video["id"] = f"test_video_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        video["published_at"] = datetime.now().isoformat()
        
        # Kafka Producer로 전송
        from .realtime_kafka_producer import get_kafka_producer
        producer = get_kafka_producer()
        
        success = producer.send_video_data(video)
        
        if success:
            return {
                "status": "success",
                "message": "비디오 데이터 전송 성공",
                "data": video
            }
        else:
            raise HTTPException(status_code=500, detail="비디오 데이터 전송 실패")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"비디오 테스트 오류: {str(e)}")

@router.post("/trigger/comment")
async def trigger_comment_test():
    """댓글 데이터 테스트 트리거"""
    try:
        # 랜덤 댓글 생성
        comment = {
            "id": f"test_comment_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "video_id": random.choice(SAMPLE_VIDEOS)["id"],
            "text": random.choice(SAMPLE_COMMENTS),
            "author_name": random.choice(SAMPLE_AUTHORS),
            "like_count": random.randint(0, 100),
            "published_at": datetime.now().isoformat()
        }
        
        # Kafka Producer로 전송
        from .realtime_kafka_producer import get_kafka_producer
        producer = get_kafka_producer()
        
        success = producer.send_comment_data(comment)
        
        if success:
            return {
                "status": "success",
                "message": "댓글 데이터 전송 성공",
                "data": comment
            }
        else:
            raise HTTPException(status_code=500, detail="댓글 데이터 전송 실패")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"댓글 테스트 오류: {str(e)}")

@router.post("/trigger/sentiment")
async def trigger_sentiment_test():
    """감정분석 데이터 테스트 트리거"""
    try:
        # 랜덤 감정분석 결과 생성
        sentiments = ["positive", "negative", "neutral"]
        sentiment = random.choice(sentiments)
        confidence = random.uniform(0.6, 0.95)
        
        sentiment_data = {
            "video_id": random.choice(SAMPLE_VIDEOS)["id"],
            "comment_id": f"test_comment_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "sentiment": sentiment,
            "confidence": confidence,
            "positive_count": random.randint(0, 5) if sentiment == "positive" else 0,
            "negative_count": random.randint(0, 3) if sentiment == "negative" else 0,
            "analyzed_at": datetime.now().isoformat()
        }
        
        # Kafka Producer로 전송
        from .realtime_kafka_producer import get_kafka_producer
        producer = get_kafka_producer()
        
        success = producer.send_sentiment_data(sentiment_data)
        
        if success:
            return {
                "status": "success",
                "message": "감정분석 데이터 전송 성공",
                "data": sentiment_data
            }
        else:
            raise HTTPException(status_code=500, detail="감정분석 데이터 전송 실패")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"감정분석 테스트 오류: {str(e)}")

@router.post("/trigger/recommendation")
async def trigger_recommendation_test():
    """추천 데이터 테스트 트리거"""
    try:
        # 랜덤 추천 데이터 생성
        recommendation_data = {
            "user_id": f"test_user_{random.randint(1000, 9999)}",
            "video_id": random.choice(SAMPLE_VIDEOS)["id"],
            "score": random.uniform(0.7, 0.95),
            "reason": random.choice([
                "사용자 관심사와 일치",
                "인기 있는 콘텐츠",
                "최근 업로드된 영상",
                "사용자 히스토리 기반"
            ]),
            "created_at": datetime.now().isoformat()
        }
        
        # Kafka Producer로 전송
        from .realtime_kafka_producer import get_kafka_producer
        producer = get_kafka_producer()
        
        success = producer.send_recommendation_data(recommendation_data)
        
        if success:
            return {
                "status": "success",
                "message": "추천 데이터 전송 성공",
                "data": recommendation_data
            }
        else:
            raise HTTPException(status_code=500, detail="추천 데이터 전송 실패")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"추천 테스트 오류: {str(e)}")

@router.get("/stats")
async def get_test_stats():
    """테스트 통계 정보"""
    return {
        "message": "실시간 테스트 통계",
        "timestamp": datetime.now().isoformat(),
        "sample_data": {
            "videos": len(SAMPLE_VIDEOS),
            "comments": len(SAMPLE_COMMENTS),
            "authors": len(SAMPLE_AUTHORS)
        },
        "kafka_topics": [
            "korean-travel-videos",
            "korean-travel-comments", 
            "sentiment-analysis",
            "recommendations"
        ]
    }

@router.post("/trigger/all")
async def trigger_all_tests():
    """모든 테스트 트리거"""
    try:
        results = []
        
        # 비디오 테스트
        video_result = await trigger_video_test()
        results.append({"type": "video", "result": video_result})
        
        # 댓글 테스트
        comment_result = await trigger_comment_test()
        results.append({"type": "comment", "result": comment_result})
        
        # 감정분석 테스트
        sentiment_result = await trigger_sentiment_test()
        results.append({"type": "sentiment", "result": sentiment_result})
        
        # 추천 테스트
        recommendation_result = await trigger_recommendation_test()
        results.append({"type": "recommendation", "result": recommendation_result})
        
        return {
            "status": "success",
            "message": "모든 테스트 트리거 완료",
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"전체 테스트 오류: {str(e)}")
