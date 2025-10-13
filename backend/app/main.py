from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine
from .db import engine, SessionLocal
from .models import Query, Video, Comment, VideoSentimentAgg, Topic
import os
import asyncio
import requests
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict

# YouTube API Key
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# 채널 정보 캐시
channel_cache: Dict[str, str] = {}

async def get_channel_name(channel_id: str) -> str:
    """YouTube 채널 ID로 실제 채널명을 가져옵니다."""
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "AIzaSyBvOkBwv7wjH4fE8oY2cQ9mN3pL6sT1uV7w":
        # 예시 API 키이거나 설정되지 않은 경우, 더 나은 폴백 제공
        channel_names = {
            "UCA1MVioFnBn_bqS2ilm_xxQ": "침착맨",
            "UCHpIHu4LzmNuD8bsE6mZLSA": "김풍",
            "UCT-P9EQ1haAci7gJ-UsMO5Q": "통닭천사",
            "UCwjMQYL9vgbqGzxYW6dVhTw": "주우재",
            "UCt51cinfjae_b1g7U9mvzFg": "단군"
        }
        return channel_names.get(channel_id, f"채널 {channel_id[:8]}...")
    
    # 캐시에서 확인
    if channel_id in channel_cache:
        return channel_cache[channel_id]
    
    try:
        url = "https://www.googleapis.com/youtube/v3/channels"
        params = {
            "part": "snippet",
            "id": channel_id,
            "key": YOUTUBE_API_KEY
        }
        
        response = await asyncio.to_thread(requests.get, url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data.get("items"):
            channel_name = data["items"][0]["snippet"]["title"]
            channel_cache[channel_id] = channel_name
            return channel_name
        else:
            return f"채널 {channel_id[:8]}..."
    except Exception as e:
        print(f"채널 정보 조회 실패: {e}")
        return f"채널 {channel_id[:8]}..."

# FastAPI app instance
app = FastAPI()

# CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunIn(BaseModel):
    keyword: str

class RunOut(BaseModel):
    query_id: int

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

# JWT 설정
SECRET_KEY = "yotuberabo-secret-key-2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 관리자 계정 정보
ADMIN_EMAIL = "admin@naver.com"
ADMIN_PASSWORD = "1234"

# 인증 의존성
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="인증이 필요합니다.")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="토큰이 유효하지 않습니다.")
        return {"email": email, "role": payload.get("role", "user")}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="토큰이 유효하지 않습니다.")

@app.post("/api/run", response_model=RunOut)
async def run(payload: RunIn):
    async with SessionLocal() as s:
        q = Query(keyword=payload.keyword, status="pending")
        s.add(q)
        await s.flush()
        await s.commit()
        # Trigger Airflow DAG asynchronously (non-blocking)
        async def _trigger():
            base = os.getenv("AIRFLOW_BASE", "http://localhost:8080")
            token = os.getenv("AIRFLOW_TOKEN")
            headers = {"Content-Type": "application/json"}
            if token:
                headers["Authorization"] = f"Bearer {token}"
            url = f"{base}/api/v1/dags/youtube_ingest/dagRuns"
            data = {"conf": {"query_id": q.id, "keyword": payload.keyword}}
            def _post():
                try:
                    return requests.post(url, json=data, headers=headers, timeout=10)
                except Exception:
                    return None
            resp = await asyncio.to_thread(_post)
            return resp is not None and (resp.status_code < 400)
        asyncio.create_task(_trigger())
        return {"query_id": q.id}

# 요약은 query_id 받도록 변경
@app.get("/api/summary")
async def summary(query_id: int, current_user: dict = Depends(get_current_user)):
    async with SessionLocal() as s:
        # Query 정보 가져오기
        query = await s.get(Query, query_id)
        if not query:
            return {"error": "Query not found"}
        
        # 비디오 수 계산
        video_count = await s.execute(
            text("SELECT COUNT(*) FROM videos")
        )
        videos = video_count.scalar() or 0
        
        # 댓글 수 계산
        comment_count = await s.execute(
            text("SELECT COUNT(*) FROM comments")
        )
        comments = comment_count.scalar() or 0
        
        # 감정 분석 결과 가져오기 (평균)
        sentiment_result = await s.execute(
            text("""
                SELECT AVG(pos) as pos, AVG(neu) as neu, AVG(neg) as neg 
                FROM video_sentiment_agg
            """)
        )
        sentiment_row = sentiment_result.fetchone()
        
        if sentiment_row and sentiment_row.pos is not None:
            sentiment = {
                "pos": round(float(sentiment_row.pos), 2),
                "neu": round(float(sentiment_row.neu), 2),
                "neg": round(float(sentiment_row.neg), 2)
            }
        else:
            sentiment = {"pos": 0.5, "neu": 0.3, "neg": 0.2}
        
        # 토픽 분석 결과 가져오기
        topics_result = await s.execute(
            text("""
                SELECT topic_label, AVG(probability) as ratio
                FROM topics 
                GROUP BY topic_label 
                ORDER BY ratio DESC 
                LIMIT 5
            """)
        )
        topics = [
            {"label": row.topic_label, "ratio": round(float(row.ratio), 2)}
            for row in topics_result.fetchall()
        ]
        
        return {
            "query_id": query_id,
            "videos": videos,
            "comments": comments,
            "sentiment": sentiment,
            "topics": topics,
        }

# 추가 API 엔드포인트들
@app.get("/api/queries")
async def get_queries(current_user: dict = Depends(get_current_user)):
    """모든 쿼리 목록 조회"""
    async with SessionLocal() as s:
        result = await s.execute(text("SELECT * FROM queries ORDER BY created_at DESC"))
        queries = result.fetchall()
        return [
            {
                "id": q.id,
                "keyword": q.keyword,
                "status": q.status,
                "videos": q.videos,
                "comments": q.comments,
                "created_at": q.created_at.isoformat() if q.created_at else None
            }
            for q in queries
        ]

@app.get("/api/videos")
async def get_videos(limit: int = 10, offset: int = 0, current_user: dict = Depends(get_current_user)):
    """비디오 목록 조회"""
    async with SessionLocal() as s:
        result = await s.execute(
            text("SELECT * FROM videos ORDER BY published_at DESC LIMIT :limit OFFSET :offset"),
            {"limit": limit, "offset": offset}
        )
        videos = result.fetchall()
        
        # 각 비디오의 채널명과 댓글, 태그를 가져오기
        video_list = []
        for v in videos:
            channel_name = await get_channel_name(v.channel_id)
            
            # 해당 비디오의 긍정 댓글 가져오기
            positive_comments_result = await s.execute(
                text("""
                    SELECT c.text FROM comments c 
                    JOIN comment_sentiment cs ON c.id = cs.comment_id 
                    WHERE c.video_id = :video_id AND cs.label = 'pos' 
                    AND c.text IS NOT NULL AND c.text != '' 
                    LIMIT 3
                """),
                {"video_id": v.id}
            )
            positive_comments = [row[0] for row in positive_comments_result.fetchall()]
            
            # 해당 비디오의 부정 댓글 가져오기
            negative_comments_result = await s.execute(
                text("""
                    SELECT c.text FROM comments c 
                    JOIN comment_sentiment cs ON c.id = cs.comment_id 
                    WHERE c.video_id = :video_id AND cs.label = 'neg' 
                    AND c.text IS NOT NULL AND c.text != '' 
                    LIMIT 3
                """),
                {"video_id": v.id}
            )
            negative_comments = [row[0] for row in negative_comments_result.fetchall()]
            
            # 해당 비디오의 토픽 가져오기
            topics_result = await s.execute(
                text("SELECT topic_label FROM topics WHERE video_id = :video_id LIMIT 3"),
                {"video_id": v.id}
            )
            topics = [row[0] for row in topics_result.fetchall()]
            
            video_list.append({
                "id": v.id,
                "title": v.title,
                "channel_id": v.channel_id,
                "channel_name": channel_name,
                "published_at": v.published_at.isoformat() if v.published_at else None,
                "positive_comments": positive_comments,
                "negative_comments": negative_comments,
                "topics": topics
            })
        
        return video_list

@app.post("/api/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """로그인 API"""
    print(f"로그인 시도: {login_data.email}")
    print(f"입력된 비밀번호: {login_data.password}")
    print(f"관리자 이메일: {ADMIN_EMAIL}")
    print(f"관리자 비밀번호: {ADMIN_PASSWORD}")
    
    # 관리자 계정 확인
    if login_data.email == ADMIN_EMAIL and login_data.password == ADMIN_PASSWORD:
        print("로그인 성공!")
        # JWT 토큰 생성
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode = {"sub": login_data.email, "exp": expire, "role": "admin"}
        access_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": login_data.email,
                "role": "admin",
                "name": "관리자"
            }
        }
    
    print("로그인 실패!")
    raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")

@app.get("/api/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """현재 사용자 정보 조회"""
    return {
        "email": current_user["email"],
        "role": current_user["role"],
        "name": "관리자"
    }

@app.get("/api/auth/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """토큰 유효성 검증"""
    return {
        "valid": True,
        "user": {
            "email": current_user["email"],
            "role": current_user["role"]
        }
    }

@app.get("/api/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    try:
        async with SessionLocal() as s:
            await s.execute(text("SELECT 1"))
            return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
