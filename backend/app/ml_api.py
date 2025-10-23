"""
ML 모델 API 엔드포인트
감정 분석, 토픽 모델링, 추천 시스템 API
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from .model_integration import model_integration, load_models_from_directory

router = APIRouter(prefix="/api/ml", tags=["ML Models"])

# 요청 모델들
class SentimentRequest(BaseModel):
    text: str
    model_name: Optional[str] = "sentiment_model"

class TopicRequest(BaseModel):
    text: str
    model_name: Optional[str] = "topic_model"

class RecommendationRequest(BaseModel):
    user_id: str
    model_name: Optional[str] = "recommendation_model"
    num_recommendations: Optional[int] = 10

class VideoAnalysisRequest(BaseModel):
    video_id: str

class ModelUploadRequest(BaseModel):
    model_name: str
    model_type: str
    model_path: str

# 응답 모델들
class SentimentResponse(BaseModel):
    sentiment_label: str
    sentiment_score: float
    confidence: float
    model_version: str

class TopicResponse(BaseModel):
    topics: List[Dict[str, Any]]
    model_version: str

class RecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    user_id: str
    total_count: int

class VideoSentimentResponse(BaseModel):
    video_id: str
    total_comments: int
    positive_count: int
    negative_count: int
    neutral_count: int
    avg_sentiment_score: float
    sentiment_ratio: float

@router.post("/sentiment", response_model=SentimentResponse)
async def analyze_sentiment(request: SentimentRequest):
    """텍스트 감정 분석"""
    try:
        result = model_integration.predict_sentiment(
            text=request.text,
            model_name=request.model_name
        )
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return SentimentResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/topics", response_model=TopicResponse)
async def analyze_topics(request: TopicRequest):
    """텍스트 토픽 분석"""
    try:
        result = model_integration.predict_topics(
            text=request.text,
            model_name=request.model_name
        )
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return TopicResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """사용자별 추천 생성"""
    try:
        recommendations = model_integration.generate_recommendations(
            user_id=request.user_id,
            model_name=request.model_name,
            num_recommendations=request.num_recommendations
        )
        
        if recommendations and 'error' in recommendations[0]:
            raise HTTPException(status_code=400, detail=recommendations[0]['error'])
        
        return RecommendationResponse(
            recommendations=recommendations,
            user_id=request.user_id,
            total_count=len(recommendations)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{user_id}")
async def get_user_recommendations(
    user_id: str,
    limit: int = Query(10, ge=1, le=50)
):
    """사용자별 기존 추천 조회"""
    try:
        recommendations = model_integration.get_user_recommendations(
            user_id=user_id,
            limit=limit
        )
        
        return {
            "user_id": user_id,
            "recommendations": recommendations,
            "total_count": len(recommendations)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/video-sentiment", response_model=VideoSentimentResponse)
async def analyze_video_sentiment(request: VideoAnalysisRequest):
    """비디오 댓글 감정 분석"""
    try:
        result = model_integration.analyze_video_sentiment(
            video_id=request.video_id
        )
        
        if 'error' in result:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return VideoSentimentResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/models/upload")
async def upload_model(request: ModelUploadRequest):
    """모델 업로드 및 등록"""
    try:
        if not os.path.exists(request.model_path):
            raise HTTPException(status_code=400, detail="Model file not found")
        
        success = model_integration.load_model_from_pkl(
            model_path=request.model_path,
            model_name=request.model_name,
            model_type=request.model_type
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to load model")
        
        # 데이터베이스에 저장
        db_success = model_integration.save_model_to_database(
            model_name=request.model_name,
            model_path=request.model_path,
            model_type=request.model_type
        )
        
        if not db_success:
            raise HTTPException(status_code=500, detail="Failed to save model to database")
        
        return {
            "message": f"Model {request.model_name} uploaded successfully",
            "model_name": request.model_name,
            "model_type": request.model_type,
            "model_path": request.model_path
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def list_models():
    """등록된 모델 목록 조회"""
    try:
        conn = model_integration.get_mysql_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT model_name, model_type, model_version, accuracy_score, 
                   training_date, is_active, model_size
            FROM model_storage 
            ORDER BY training_date DESC
        """)
        
        models = cur.fetchall()
        
        return {
            "models": [
                {
                    "model_name": model[0],
                    "model_type": model[1],
                    "model_version": model[2],
                    "accuracy_score": float(model[3]) if model[3] else 0.0,
                    "training_date": model[4].isoformat() if model[4] else None,
                    "is_active": bool(model[5]),
                    "model_size": model[6] if model[6] else 0
                }
                for model in models
            ],
            "total_count": len(models)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/models/load-from-directory")
async def load_models_from_dir(models_dir: str = "models/"):
    """모델 디렉토리에서 모든 PKL 파일 로드"""
    try:
        load_models_from_directory(models_dir)
        
        return {
            "message": f"Models loaded from directory: {models_dir}",
            "directory": models_dir
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    """ML 서비스 상태 확인"""
    try:
        # Redis 연결 확인
        redis_client = model_integration.get_redis_client()
        redis_client.ping()
        
        # MySQL 연결 확인
        conn = model_integration.get_mysql_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        
        # 로드된 모델 수 확인
        loaded_models = len(model_integration.models)
        
        return {
            "status": "healthy",
            "redis_connected": True,
            "mysql_connected": True,
            "loaded_models": loaded_models,
            "available_models": list(model_integration.models.keys())
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "redis_connected": False,
            "mysql_connected": False,
            "loaded_models": 0
        }

@router.post("/batch-sentiment")
async def batch_sentiment_analysis(
    video_ids: List[str] = Query(..., description="비디오 ID 목록"),
    model_name: str = Query("sentiment_model", description="사용할 모델명")
):
    """여러 비디오의 댓글 감정 분석 (배치 처리)"""
    try:
        results = []
        
        for video_id in video_ids:
            result = model_integration.analyze_video_sentiment(video_id)
            results.append(result)
        
        return {
            "processed_videos": len(results),
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trending-topics")
async def get_trending_topics(
    limit: int = Query(10, ge=1, le=50),
    period: str = Query("daily", regex="^(hourly|daily|weekly|monthly)$")
):
    """트렌드 토픽 조회"""
    try:
        conn = model_integration.get_mysql_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT topic, topic_score, related_keywords, video_count, total_views
            FROM trending_topics 
            WHERE trend_period = %s
            ORDER BY topic_score DESC
            LIMIT %s
        """, (period, limit))
        
        topics = cur.fetchall()
        
        return {
            "trending_topics": [
                {
                    "topic": topic[0],
                    "topic_score": float(topic[1]),
                    "related_keywords": topic[2],
                    "video_count": topic[3],
                    "total_views": topic[4]
                }
                for topic in topics
            ],
            "period": period,
            "total_count": len(topics)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
