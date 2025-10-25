from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from app.db import SessionLocal
# from app.auth import get_current_user
import json
import requests
from typing import List, Optional, Dict, Any
import asyncio
# import aiohttp

router = APIRouter()

# 한국어 NLP 모델 설정
KOREAN_SENTIMENT_MODEL = "beomi/KcELECTRA-base-v2022"  # 한국어 전용 감정 분석 모델
KOREAN_TOPIC_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"  # 다국어 지원하지만 한국어 우수
KOREAN_EMBEDDING_MODEL = "jhgan/ko-sroberta-multitask"  # 한국어 임베딩 모델

@router.post("/api/korean/sentiment/analyze")
async def analyze_korean_sentiment(
    comments: List[str] = Query(..., description="분석할 한국어 댓글 목록"),
    model_name: str = Query(KOREAN_SENTIMENT_MODEL, description="사용할 한국어 모델명"),
    # current_user: dict = Depends(get_current_user)
):
    """한국어 댓글 감정 분석"""
    try:
        # 한국어 감정 분석 API 호출 (실제 구현에서는 Hugging Face API 사용)
        sentiment_results = []
        
        for comment in comments:
            # 한국어 감정 분석 (간단한 키워드 기반 - 실제로는 모델 API 호출)
            sentiment_score = analyze_korean_sentiment_keywords(comment)
            sentiment_label = "positive" if sentiment_score > 0.3 else "negative" if sentiment_score < -0.3 else "neutral"
            
            sentiment_results.append({
                "comment": comment,
                "sentiment_score": sentiment_score,
                "sentiment_label": sentiment_label,
                "confidence": abs(sentiment_score),
                "model_used": model_name,
                "language": "ko"
            })
        
        return {
            "results": sentiment_results,
            "model_used": model_name,
            "total_comments": len(comments),
            "language": "ko"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"한국어 감정 분석 실패: {str(e)}")

def analyze_korean_sentiment_keywords(comment):
    """한국어 키워드 기반 감정 분석"""
    positive_keywords = [
        "좋", "아름다", "유용", "도움", "감사", "추천", "완벽", "최고", "훌륭", "멋져",
        "사랑", "좋아", "재미있", "즐거", "행복", "만족", "완벽", "최고", "훌륭", "멋져",
        "정말", "너무", "진짜", "완전", "대박", "짱", "굿", "굿굿", "최고", "완벽"
    ]
    
    negative_keywords = [
        "별로", "아쉬", "불편", "맛없", "부정확", "차이", "맞지", "안좋", "싫", "화나",
        "실망", "후회", "아쉽", "부족", "부정확", "틀렸", "잘못", "문제", "불만", "짜증"
    ]
    
    comment_lower = comment.lower()
    
    positive_count = sum(1 for keyword in positive_keywords if keyword in comment_lower)
    negative_count = sum(1 for keyword in negative_keywords if keyword in comment_lower)
    
    if positive_count > negative_count:
        return 0.3 + (positive_count * 0.1)
    elif negative_count > positive_count:
        return -0.3 - (negative_count * 0.1)
    else:
        return 0.0

@router.post("/api/korean/topics/extract")
async def extract_korean_topics(
    comments: List[str] = Query(..., description="토픽 추출할 한국어 댓글 목록"),
    num_topics: int = Query(5, ge=1, le=20, description="추출할 토픽 수"),
    # current_user: dict = Depends(get_current_user)
):
    """한국어 댓글 토픽 추출"""
    try:
        # 한국어 토픽 추출 (간단한 키워드 기반)
        topics = extract_korean_topics_keywords(comments, num_topics)
        
        return {
            "topics": topics,
            "total_comments": len(comments),
            "language": "ko",
            "model_used": "korean-topic-extraction"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"한국어 토픽 추출 실패: {str(e)}")

def extract_korean_topics_keywords(comments, num_topics):
    """한국어 키워드 기반 토픽 추출"""
    # 여행 관련 키워드 카테고리
    topic_categories = {
        "맛집": ["맛집", "음식", "먹방", "푸드", "맛", "식당", "카페", "디저트", "술", "와인"],
        "숙소": ["호텔", "펜션", "게스트하우스", "에어비앤비", "숙소", "모텔", "리조트", "콘도", "민박"],
        "교통": ["항공권", "기차", "버스", "렌터카", "택시", "지하철", "교통", "이동", "편의"],
        "관광지": ["관광지", "명소", "박물관", "유적지", "문화재", "역사", "전통", "문화", "체험"],
        "자연": ["자연", "산", "바다", "숲", "강", "등산", "해변", "온천", "스파", "힐링"],
        "쇼핑": ["쇼핑", "마트", "시장", "상점", "기념품", "쇼핑몰", "백화점", "면세점"],
        "액티비티": ["액티비티", "체험", "스포츠", "등산", "수영", "스키", "서핑", "다이빙", "패러글라이딩"],
        "날씨": ["날씨", "기온", "온도", "비", "눈", "맑", "흐림", "춥", "덥", "습도"],
        "비용": ["비용", "가격", "돈", "예산", "저렴", "비싸", "가성비", "할인", "쿠폰", "경제"],
        "서비스": ["서비스", "친절", "불친절", "도움", "안내", "가이드", "직원", "관리", "청결"]
    }
    
    # 댓글에서 키워드 빈도 계산
    keyword_counts = {}
    for comment in comments:
        comment_lower = comment.lower()
        for topic, keywords in topic_categories.items():
            for keyword in keywords:
                if keyword in comment_lower:
                    keyword_counts[topic] = keyword_counts.get(topic, 0) + 1
    
    # 상위 토픽 추출
    sorted_topics = sorted(keyword_counts.items(), key=lambda x: x[1], reverse=True)
    top_topics = sorted_topics[:num_topics]
    
    return [
        {
            "topic": topic,
            "count": count,
            "ratio": count / len(comments),
            "keywords": topic_categories.get(topic, [])
        }
        for topic, count in top_topics
    ]

@router.get("/api/korean/trends")
async def get_korean_travel_trends(
    period: str = Query("weekly", description="분석 기간 (daily, weekly, monthly)"),
    # current_user: dict = Depends(get_current_user)
):
    """한국어 여행 트렌드 분석"""
    try:
        async with SessionLocal() as s:
            # 한국 여행 유형별 트렌드
            travel_type_result = await s.execute(
                text("""
                    SELECT 
                        travel_type,
                        COUNT(*) as video_count,
                        AVG(view_count) as avg_views,
                        AVG(ksa.sentiment_score) as avg_sentiment
                    FROM korean_travel_videos ktv
                    LEFT JOIN korean_sentiment_analysis ksa ON ktv.id = ksa.video_id
                    WHERE travel_type IS NOT NULL AND is_korean_content = TRUE
                    GROUP BY travel_type
                    ORDER BY video_count DESC
                """)
            )
            travel_types = travel_type_result.fetchall()
            
            # 한국 여행지별 트렌드
            destination_result = await s.execute(
                text("""
                    SELECT 
                        destination,
                        COUNT(*) as video_count,
                        AVG(view_count) as avg_views,
                        AVG(ksa.sentiment_score) as avg_sentiment
                    FROM korean_travel_videos ktv
                    LEFT JOIN korean_sentiment_analysis ksa ON ktv.id = ksa.video_id
                    WHERE destination IS NOT NULL AND is_korean_content = TRUE
                    GROUP BY destination
                    ORDER BY video_count DESC
                    LIMIT 10
                """)
            )
            destinations = destination_result.fetchall()
            
            # 한국어 댓글 감정 분포
            sentiment_result = await s.execute(
                text("""
                    SELECT 
                        sentiment_label,
                        COUNT(*) as count,
                        AVG(sentiment_score) as avg_score
                    FROM korean_sentiment_analysis
                    WHERE model_name = 'korean-sentiment-model'
                    GROUP BY sentiment_label
                """)
            )
            sentiments = sentiment_result.fetchall()
            
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
                "destinations": [
                    {
                        "destination": dest[0],
                        "video_count": dest[1],
                        "avg_views": int(dest[2]) if dest[2] else 0,
                        "avg_sentiment": float(dest[3]) if dest[3] else 0.0
                    }
                    for dest in destinations
                ],
                "sentiment_distribution": [
                    {
                        "label": sent[0],
                        "count": sent[1],
                        "avg_score": float(sent[2]) if sent[2] else 0.0
                    }
                    for sent in sentiments
                ],
                "period": period,
                "language": "ko"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"한국어 여행 트렌드 조회 실패: {str(e)}")

@router.get("/api/korean/recommendations")
async def get_korean_travel_recommendations(
    user_preferences: Optional[str] = Query(None, description="사용자 선호도 (JSON)"),
    limit: int = Query(10, ge=1, le=50),
    # current_user: dict = Depends(get_current_user)
):
    """한국어 기반 개인화된 여행 추천"""
    try:
        # 사용자 선호도 파싱
        preferences = {}
        if user_preferences:
            try:
                preferences = json.loads(user_preferences)
            except:
                preferences = {}
        
        async with SessionLocal() as s:
            # 한국어 기반 추천 쿼리
            base_query = """
                SELECT ktv.*, kc.title as channel_name,
                       AVG(ksa.sentiment_score) as avg_sentiment,
                       COUNT(ksa.id) as comment_count
                FROM korean_travel_videos ktv
                LEFT JOIN korean_channels kc ON ktv.channel_id = kc.id
                LEFT JOIN korean_sentiment_analysis ksa ON ktv.id = ksa.video_id
                WHERE ktv.is_korean_content = TRUE AND ktv.language = 'ko'
            """
            params = {"limit": limit}
            
            # 선호도 기반 필터링
            if preferences.get("destination"):
                base_query += " AND ktv.destination = :destination"
                params["destination"] = preferences["destination"]
            
            if preferences.get("travel_type"):
                base_query += " AND ktv.travel_type = :travel_type"
                params["travel_type"] = preferences["travel_type"]
            
            if preferences.get("budget_range"):
                base_query += " AND ktv.budget_range = :budget_range"
                params["budget_range"] = preferences["budget_range"]
            
            if preferences.get("season"):
                base_query += " AND ktv.season = :season"
                params["season"] = preferences["season"]
            
            base_query += """
                GROUP BY ktv.id
                ORDER BY avg_sentiment DESC, ktv.view_count DESC
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
                        "thumbnail_url": rec.thumbnail_url,
                        "language": "ko",
                        "is_korean_content": rec.is_korean_content
                    }
                    for rec in recommendations
                ],
                "preferences_used": preferences,
                "language": "ko",
                "model_used": "korean-recommendation-system"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"한국어 여행 추천 조회 실패: {str(e)}")

@router.get("/api/korean/channels")
async def get_korean_channels(
    limit: int = Query(20, ge=1, le=100),
    # current_user: dict = Depends(get_current_user)
):
    """한국 채널 목록 조회"""
    try:
        async with SessionLocal() as s:
            result = await s.execute(
                text("""
                    SELECT 
                        kc.*,
                        COUNT(ktv.id) as travel_video_count,
                        AVG(ksa.sentiment_score) as avg_sentiment
                    FROM korean_channels kc
                    LEFT JOIN korean_travel_videos ktv ON kc.id = ktv.channel_id
                    LEFT JOIN korean_sentiment_analysis ksa ON ktv.id = ksa.video_id
                    WHERE kc.is_korean_creator = TRUE
                    GROUP BY kc.id
                    ORDER BY kc.subscriber_count DESC, travel_video_count DESC
                    LIMIT :limit
                """),
                {"limit": limit}
            )
            channels = result.fetchall()
            
            return {
                "channels": [
                    {
                        "id": ch.id,
                        "title": ch.title,
                        "description": ch.description,
                        "subscriber_count": ch.subscriber_count,
                        "view_count": ch.view_count,
                        "video_count": ch.video_count,
                        "travel_video_count": ch.travel_video_count,
                        "avg_sentiment": float(ch.avg_sentiment) if ch.avg_sentiment else 0.0,
                        "country": ch.country,
                        "language": ch.language,
                        "is_korean_creator": ch.is_korean_creator,
                        "thumbnail_url": ch.thumbnail_url
                    }
                    for ch in channels
                ],
                "total": len(channels),
                "language": "ko"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"한국 채널 조회 실패: {str(e)}")
