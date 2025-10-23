"""
모델 통합 및 추천 시스템
PKL 파일을 로드하여 실시간 분석 및 추천 제공
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
import pymysql
from sqlalchemy import create_engine, text
import joblib
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import redis

# 데이터베이스 연결 설정
MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_PORT = int(os.getenv('MYSQL_PORT', '3307'))
MYSQL_DB = os.getenv('MYSQL_DB', 'yt')
MYSQL_USER = os.getenv('MYSQL_USER', 'ytuser')
MYSQL_PW = os.getenv('MYSQL_PW', 'ytpw')

# Redis 연결 설정
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', '6379'))

class ModelIntegration:
    """모델 통합 및 추천 시스템 클래스"""
    
    def __init__(self):
        self.mysql_conn = None
        self.redis_client = None
        self.models = {}
        self.vectorizers = {}
        
    def get_mysql_connection(self):
        """MySQL 연결"""
        if not self.mysql_conn:
            self.mysql_conn = pymysql.connect(
                host=MYSQL_HOST,
                port=MYSQL_PORT,
                user=MYSQL_USER,
                password=MYSQL_PW,
                database=MYSQL_DB,
                charset='utf8mb4',
                autocommit=True
            )
        return self.mysql_conn
    
    def get_redis_client(self):
        """Redis 연결"""
        if not self.redis_client:
            self.redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                decode_responses=True
            )
        return self.redis_client
    
    def load_model_from_pkl(self, model_path: str, model_name: str, model_type: str) -> bool:
        """PKL 파일에서 모델 로드"""
        try:
            if not os.path.exists(model_path):
                print(f"[ERROR] Model file not found: {model_path}")
                return False
            
            # PKL 파일 로드
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            # 모델 데이터 구조 확인 및 저장
            if isinstance(model_data, dict):
                # 딕셔너리 형태의 모델 데이터
                self.models[model_name] = {
                    'model': model_data.get('model'),
                    'vectorizer': model_data.get('vectorizer'),
                    'type': model_type,
                    'version': model_data.get('version', '1.0'),
                    'accuracy': model_data.get('accuracy', 0.0),
                    'metadata': model_data.get('metadata', {})
                }
            else:
                # 단일 모델 객체
                self.models[model_name] = {
                    'model': model_data,
                    'vectorizer': None,
                    'type': model_type,
                    'version': '1.0',
                    'accuracy': 0.0,
                    'metadata': {}
                }
            
            print(f"[INFO] Model loaded successfully: {model_name}")
            return True
            
        except Exception as e:
            print(f"[ERROR] Failed to load model {model_name}: {e}")
            return False
    
    def save_model_to_database(self, model_name: str, model_path: str, model_type: str) -> bool:
        """모델 정보를 데이터베이스에 저장"""
        try:
            conn = self.get_mysql_connection()
            cur = conn.cursor()
            
            model_info = self.models.get(model_name)
            if not model_info:
                print(f"[ERROR] Model {model_name} not found in memory")
                return False
            
            # 모델 파일 크기 계산
            model_size = os.path.getsize(model_path)
            
            # 기존 모델 비활성화
            cur.execute("""
                UPDATE model_storage 
                SET is_active = FALSE 
                WHERE model_name = %s
            """, (model_name,))
            
            # 새 모델 정보 저장
            cur.execute("""
                INSERT INTO model_storage 
                (model_name, model_type, model_version, model_path, model_size, 
                 accuracy_score, training_date, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                model_name,
                model_type,
                model_info['version'],
                model_path,
                model_size,
                model_info['accuracy'],
                datetime.now(),
                True
            ))
            
            print(f"[INFO] Model {model_name} saved to database")
            return True
            
        except Exception as e:
            print(f"[ERROR] Failed to save model to database: {e}")
            return False
    
    def predict_sentiment(self, text: str, model_name: str = 'sentiment_model') -> Dict[str, Any]:
        """감정 분석 예측"""
        try:
            if model_name not in self.models:
                return {'error': f'Model {model_name} not loaded'}
            
            model_info = self.models[model_name]
            model = model_info['model']
            vectorizer = model_info['vectorizer']
            
            # 텍스트 전처리 및 벡터화
            if vectorizer:
                text_vector = vectorizer.transform([text])
            else:
                # 기본 TF-IDF 벡터화
                vectorizer = TfidfVectorizer(max_features=1000)
                text_vector = vectorizer.fit_transform([text])
            
            # 예측 수행
            if hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba(text_vector)[0]
                prediction = model.predict(text_vector)[0]
                
                # 감정 라벨 매핑
                sentiment_labels = ['negative', 'neutral', 'positive']
                sentiment_label = sentiment_labels[prediction] if prediction < len(sentiment_labels) else 'neutral'
                confidence = max(probabilities)
            else:
                prediction = model.predict(text_vector)[0]
                sentiment_label = 'positive' if prediction > 0 else 'negative'
                confidence = abs(prediction)
            
            return {
                'sentiment_label': sentiment_label,
                'sentiment_score': float(prediction),
                'confidence': float(confidence),
                'model_version': model_info['version']
            }
            
        except Exception as e:
            print(f"[ERROR] Sentiment prediction failed: {e}")
            return {'error': str(e)}
    
    def predict_topics(self, text: str, model_name: str = 'topic_model') -> Dict[str, Any]:
        """토픽 모델링 예측"""
        try:
            if model_name not in self.models:
                return {'error': f'Model {model_name} not loaded'}
            
            model_info = self.models[model_name]
            model = model_info['model']
            vectorizer = model_info['vectorizer']
            
            # 텍스트 벡터화
            if vectorizer:
                text_vector = vectorizer.transform([text])
            else:
                vectorizer = TfidfVectorizer(max_features=1000)
                text_vector = vectorizer.fit_transform([text])
            
            # 토픽 예측
            if hasattr(model, 'transform'):
                topic_probs = model.transform(text_vector)[0]
                top_topics = np.argsort(topic_probs)[::-1][:5]  # 상위 5개 토픽
                
                topics = []
                for topic_id in top_topics:
                    topics.append({
                        'topic_id': int(topic_id),
                        'probability': float(topic_probs[topic_id]),
                        'topic_name': f'Topic_{topic_id}'
                    })
                
                return {
                    'topics': topics,
                    'model_version': model_info['version']
                }
            else:
                return {'error': 'Model does not support topic prediction'}
                
        except Exception as e:
            print(f"[ERROR] Topic prediction failed: {e}")
            return {'error': str(e)}
    
    def generate_recommendations(self, user_id: str, model_name: str = 'recommendation_model', 
                               num_recommendations: int = 10) -> List[Dict[str, Any]]:
        """추천 시스템"""
        try:
            if model_name not in self.models:
                return [{'error': f'Model {model_name} not loaded'}]
            
            model_info = self.models[model_name]
            model = model_info['model']
            
            # 사용자 프로필 가져오기
            conn = self.get_mysql_connection()
            cur = conn.cursor()
            
            cur.execute("""
                SELECT preferences, watch_history, favorite_categories
                FROM user_profiles 
                WHERE user_id = %s
            """, (user_id,))
            
            user_data = cur.fetchone()
            if not user_data:
                # 새 사용자 프로필 생성
                cur.execute("""
                    INSERT INTO user_profiles (user_id, username, preferences, watch_history, favorite_categories)
                    VALUES (%s, %s, %s, %s, %s)
                """, (user_id, f'user_{user_id}', '{}', '[]', '[]'))
                user_data = ('{}', '[]', '[]')
            
            preferences = json.loads(user_data[0]) if user_data[0] else {}
            watch_history = json.loads(user_data[1]) if user_data[1] else []
            favorite_categories = json.loads(user_data[2]) if user_data[2] else []
            
            # 추천 생성 (모델 타입에 따라)
            if hasattr(model, 'predict'):
                # 협업 필터링 또는 하이브리드 모델
                recommendations = self._generate_collaborative_recommendations(
                    user_id, model, num_recommendations
                )
            else:
                # 콘텐츠 기반 추천
                recommendations = self._generate_content_based_recommendations(
                    user_id, preferences, favorite_categories, num_recommendations
                )
            
            # 추천 결과를 데이터베이스에 저장
            self._save_recommendations_to_db(user_id, recommendations)
            
            return recommendations
            
        except Exception as e:
            print(f"[ERROR] Recommendation generation failed: {e}")
            return [{'error': str(e)}]
    
    def _generate_collaborative_recommendations(self, user_id: str, model: Any, 
                                              num_recommendations: int) -> List[Dict[str, Any]]:
        """협업 필터링 추천"""
        try:
            conn = self.get_mysql_connection()
            cur = conn.cursor()
            
            # 사용자-아이템 행렬 생성
            cur.execute("""
                SELECT video_id, COUNT(*) as interaction_count
                FROM user_behavior_logs 
                WHERE user_id = %s AND action_type IN ('view', 'like', 'comment')
                GROUP BY video_id
            """, (user_id,))
            
            user_interactions = dict(cur.fetchall())
            
            # 모든 비디오 가져오기
            cur.execute("""
                SELECT id, title, channel_id, view_count, like_count, category_id
                FROM videos 
                ORDER BY view_count DESC 
                LIMIT 1000
            """)
            
            all_videos = cur.fetchall()
            
            # 추천 점수 계산
            recommendations = []
            for video_id, title, channel_id, view_count, like_count, category_id in all_videos:
                if video_id not in user_interactions:  # 아직 상호작용하지 않은 비디오
                    # 간단한 점수 계산 (실제로는 모델 사용)
                    score = (view_count * 0.3 + like_count * 0.7) / 1000000
                    
                    recommendations.append({
                        'video_id': video_id,
                        'title': title,
                        'channel_id': channel_id,
                        'score': score,
                        'reason': 'Popular content'
                    })
            
            # 점수순으로 정렬하고 상위 N개 반환
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            return recommendations[:num_recommendations]
            
        except Exception as e:
            print(f"[ERROR] Collaborative recommendation failed: {e}")
            return []
    
    def _generate_content_based_recommendations(self, user_id: str, preferences: Dict, 
                                              favorite_categories: List, 
                                              num_recommendations: int) -> List[Dict[str, Any]]:
        """콘텐츠 기반 추천"""
        try:
            conn = self.get_mysql_connection()
            cur = conn.cursor()
            
            # 사용자 선호 카테고리 기반 추천
            if favorite_categories:
                placeholders = ','.join(['%s'] * len(favorite_categories))
                cur.execute(f"""
                    SELECT id, title, channel_id, view_count, like_count, category_id
                    FROM videos 
                    WHERE category_id IN ({placeholders})
                    ORDER BY view_count DESC 
                    LIMIT %s
                """, favorite_categories + [num_recommendations * 2])
            else:
                # 인기 비디오 추천
                cur.execute("""
                    SELECT id, title, channel_id, view_count, like_count, category_id
                    FROM videos 
                    ORDER BY view_count DESC 
                    LIMIT %s
                """, (num_recommendations * 2,))
            
            videos = cur.fetchall()
            recommendations = []
            
            for video_id, title, channel_id, view_count, like_count, category_id in videos:
                score = (view_count * 0.4 + like_count * 0.6) / 1000000
                recommendations.append({
                    'video_id': video_id,
                    'title': title,
                    'channel_id': channel_id,
                    'score': score,
                    'reason': 'Content-based recommendation'
                })
            
            return recommendations[:num_recommendations]
            
        except Exception as e:
            print(f"[ERROR] Content-based recommendation failed: {e}")
            return []
    
    def _save_recommendations_to_db(self, user_id: str, recommendations: List[Dict[str, Any]]):
        """추천 결과를 데이터베이스에 저장"""
        try:
            conn = self.get_mysql_connection()
            cur = conn.cursor()
            
            # 기존 추천 비활성화
            cur.execute("""
                UPDATE recommendations 
                SET is_active = FALSE 
                WHERE user_id = %s
            """, (user_id,))
            
            # 새 추천 저장
            for rec in recommendations:
                cur.execute("""
                    INSERT INTO recommendations 
                    (user_id, video_id, recommendation_type, score, reason, model_version, expires_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    user_id,
                    rec['video_id'],
                    'content_based',  # 또는 모델 타입에 따라
                    rec['score'],
                    rec.get('reason', ''),
                    '1.0',
                    datetime.now() + timedelta(days=7)  # 7일 후 만료
                ))
            
            print(f"[INFO] Saved {len(recommendations)} recommendations for user {user_id}")
            
        except Exception as e:
            print(f"[ERROR] Failed to save recommendations: {e}")
    
    def analyze_video_sentiment(self, video_id: str) -> Dict[str, Any]:
        """비디오의 댓글 감정 분석"""
        try:
            conn = self.get_mysql_connection()
            cur = conn.cursor()
            
            # 비디오의 댓글들 가져오기
            cur.execute("""
                SELECT id, text FROM comments 
                WHERE video_id = %s 
                ORDER BY like_count DESC 
                LIMIT 100
            """, (video_id,))
            
            comments = cur.fetchall()
            if not comments:
                return {'error': 'No comments found for this video'}
            
            # 각 댓글에 대해 감정 분석
            sentiment_results = []
            positive_count = 0
            negative_count = 0
            neutral_count = 0
            total_sentiment_score = 0
            
            for comment_id, text in comments:
                sentiment = self.predict_sentiment(text)
                if 'error' not in sentiment:
                    sentiment_results.append({
                        'comment_id': comment_id,
                        'sentiment_label': sentiment['sentiment_label'],
                        'sentiment_score': sentiment['sentiment_score'],
                        'confidence': sentiment['confidence']
                    })
                    
                    # 집계
                    if sentiment['sentiment_label'] == 'positive':
                        positive_count += 1
                    elif sentiment['sentiment_label'] == 'negative':
                        negative_count += 1
                    else:
                        neutral_count += 1
                    
                    total_sentiment_score += sentiment['sentiment_score']
            
            # 비디오별 감정 집계 업데이트
            total_comments = len(sentiment_results)
            avg_sentiment_score = total_sentiment_score / total_comments if total_comments > 0 else 0
            sentiment_ratio = positive_count / total_comments if total_comments > 0 else 0
            
            # 데이터베이스 업데이트
            cur.execute("""
                INSERT INTO video_sentiment_agg 
                (video_id, positive_count, negative_count, neutral_count, 
                 total_comments, avg_sentiment_score, sentiment_ratio)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    positive_count = VALUES(positive_count),
                    negative_count = VALUES(negative_count),
                    neutral_count = VALUES(neutral_count),
                    total_comments = VALUES(total_comments),
                    avg_sentiment_score = VALUES(avg_sentiment_score),
                    sentiment_ratio = VALUES(sentiment_ratio)
            """, (video_id, positive_count, negative_count, neutral_count, 
                  total_comments, avg_sentiment_score, sentiment_ratio))
            
            return {
                'video_id': video_id,
                'total_comments': total_comments,
                'positive_count': positive_count,
                'negative_count': negative_count,
                'neutral_count': neutral_count,
                'avg_sentiment_score': avg_sentiment_score,
                'sentiment_ratio': sentiment_ratio,
                'sentiment_results': sentiment_results[:10]  # 상위 10개만 반환
            }
            
        except Exception as e:
            print(f"[ERROR] Video sentiment analysis failed: {e}")
            return {'error': str(e)}
    
    def get_user_recommendations(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """사용자별 추천 조회"""
        try:
            conn = self.get_mysql_connection()
            cur = conn.cursor()
            
            cur.execute("""
                SELECT r.video_id, v.title, v.channel_id, v.view_count, v.like_count, 
                       r.score, r.recommendation_type, r.reason, r.created_at
                FROM recommendations r
                JOIN videos v ON r.video_id = v.id
                WHERE r.user_id = %s AND r.is_active = TRUE
                ORDER BY r.score DESC
                LIMIT %s
            """, (user_id, limit))
            
            recommendations = cur.fetchall()
            
            return [
                {
                    'video_id': rec[0],
                    'title': rec[1],
                    'channel_id': rec[2],
                    'view_count': rec[3],
                    'like_count': rec[4],
                    'score': float(rec[5]),
                    'recommendation_type': rec[6],
                    'reason': rec[7],
                    'created_at': rec[8].isoformat() if rec[8] else None
                }
                for rec in recommendations
            ]
            
        except Exception as e:
            print(f"[ERROR] Failed to get user recommendations: {e}")
            return []

# 전역 모델 인스턴스
model_integration = ModelIntegration()

def load_models_from_directory(models_dir: str = "models/"):
    """모델 디렉토리에서 모든 PKL 파일 로드"""
    if not os.path.exists(models_dir):
        print(f"[WARNING] Models directory not found: {models_dir}")
        return
    
    for filename in os.listdir(models_dir):
        if filename.endswith('.pkl'):
            model_path = os.path.join(models_dir, filename)
            model_name = filename.replace('.pkl', '')
            
            # 모델 타입 추정
            if 'sentiment' in model_name.lower():
                model_type = 'sentiment'
            elif 'topic' in model_name.lower():
                model_type = 'topic_modeling'
            elif 'recommend' in model_name.lower():
                model_type = 'recommendation'
            else:
                model_type = 'classification'
            
            success = model_integration.load_model_from_pkl(model_path, model_name, model_type)
            if success:
                model_integration.save_model_to_database(model_name, model_path, model_type)
                print(f"[INFO] Model {model_name} loaded and saved to database")

# 모델 로드 (시작 시 자동 실행)
if __name__ == "__main__":
    load_models_from_directory()
