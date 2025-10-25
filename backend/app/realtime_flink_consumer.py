"""
실시간 YouTube 데이터 처리를 위한 Flink Consumer
"""
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from kafka import KafkaConsumer
from kafka.errors import KafkaError
import redis
import mysql.connector
from mysql.connector import Error
import os
import asyncio
import websockets
from websockets.exceptions import ConnectionClosed

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealtimeFlinkConsumer:
    """실시간 YouTube 데이터를 처리하는 Flink Consumer"""
    
    def __init__(self):
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:29092')
        self.redis_host = os.getenv('REDIS_HOST', 'redis')
        self.redis_port = int(os.getenv('REDIS_PORT', '6379'))
        self.mysql_host = os.getenv('MYSQL_HOST', 'mysql')
        self.mysql_port = int(os.getenv('MYSQL_PORT', '3306'))
        self.mysql_user = os.getenv('MYSQL_USER', 'ytuser')
        self.mysql_password = os.getenv('MYSQL_PW', 'ytpw')
        self.mysql_database = os.getenv('MYSQL_DB', 'yt')
        
        # 연결 객체들
        self.redis_client = None
        self.mysql_connection = None
        self.websocket_clients = set()
        
        # 연결 초기화
        self._connect_redis()
        self._connect_mysql()
    
    def _connect_redis(self):
        """Redis 연결"""
        try:
            self.redis_client = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            # 연결 테스트
            self.redis_client.ping()
            logger.info(f"Redis 연결 성공: {self.redis_host}:{self.redis_port}")
        except Exception as e:
            logger.error(f"Redis 연결 실패: {e}")
            self.redis_client = None
    
    def _connect_mysql(self):
        """MySQL 연결"""
        try:
            self.mysql_connection = mysql.connector.connect(
                host=self.mysql_host,
                port=self.mysql_port,
                user=self.mysql_user,
                password=self.mysql_password,
                database=self.mysql_database,
                charset='utf8mb4',
                collation='utf8mb4_unicode_ci'
            )
            logger.info(f"MySQL 연결 성공: {self.mysql_host}:{self.mysql_port}")
        except Error as e:
            logger.error(f"MySQL 연결 실패: {e}")
            self.mysql_connection = None
    
    def process_video_data(self, video_data: Dict[str, Any]):
        """비디오 데이터 실시간 처리"""
        try:
            video_id = video_data.get('id')
            if not video_id:
                logger.warning("비디오 ID가 없습니다")
                return False
            
            # 1. Redis에 실시간 캐시 저장
            self._cache_video_data(video_data)
            
            # 2. MySQL에 저장
            self._store_video_data(video_data)
            
            # 3. 실시간 알림 전송
            self._send_realtime_notification('video', video_data)
            
            logger.info(f"비디오 데이터 처리 완료: {video_id}")
            return True
            
        except Exception as e:
            logger.error(f"비디오 데이터 처리 오류: {e}")
            return False
    
    def process_comment_data(self, comment_data: Dict[str, Any]):
        """댓글 데이터 실시간 처리"""
        try:
            comment_id = comment_data.get('id')
            if not comment_id:
                logger.warning("댓글 ID가 없습니다")
                return False
            
            # 1. 실시간 감정분석
            sentiment_result = self._analyze_sentiment_realtime(comment_data)
            
            # 2. Redis에 실시간 캐시 저장
            self._cache_comment_data(comment_data, sentiment_result)
            
            # 3. MySQL에 저장
            self._store_comment_data(comment_data, sentiment_result)
            
            # 4. 실시간 알림 전송
            self._send_realtime_notification('comment', {
                **comment_data,
                'sentiment': sentiment_result
            })
            
            logger.info(f"댓글 데이터 처리 완료: {comment_id}")
            return True
            
        except Exception as e:
            logger.error(f"댓글 데이터 처리 오류: {e}")
            return False
    
    def process_sentiment_data(self, sentiment_data: Dict[str, Any]):
        """감정분석 데이터 실시간 처리"""
        try:
            # 1. Redis에 실시간 감정분석 결과 저장
            self._cache_sentiment_data(sentiment_data)
            
            # 2. MySQL에 저장
            self._store_sentiment_data(sentiment_data)
            
            # 3. 실시간 알림 전송
            self._send_realtime_notification('sentiment', sentiment_data)
            
            logger.info("감정분석 데이터 처리 완료")
            return True
            
        except Exception as e:
            logger.error(f"감정분석 데이터 처리 오류: {e}")
            return False
    
    def process_recommendation_data(self, recommendation_data: Dict[str, Any]):
        """추천 데이터 실시간 처리"""
        try:
            user_id = recommendation_data.get('user_id')
            if not user_id:
                logger.warning("사용자 ID가 없습니다")
                return False
            
            # 1. Redis에 실시간 추천 결과 저장
            self._cache_recommendation_data(recommendation_data)
            
            # 2. MySQL에 저장
            self._store_recommendation_data(recommendation_data)
            
            # 3. 실시간 알림 전송
            self._send_realtime_notification('recommendation', recommendation_data)
            
            logger.info(f"추천 데이터 처리 완료: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"추천 데이터 처리 오류: {e}")
            return False
    
    def _analyze_sentiment_realtime(self, comment_data: Dict[str, Any]) -> Dict[str, Any]:
        """실시간 감정분석"""
        try:
            comment_text = comment_data.get('text', '')
            if not comment_text:
                return {'sentiment': 'neutral', 'confidence': 0.0}
            
            # 간단한 감정분석 (실제로는 ML 모델 사용)
            positive_words = ['좋다', '좋은', '훌륭', '최고', '멋지', '완벽', '대박', '최고']
            negative_words = ['나쁘', '싫다', '최악', '별로', '안좋', '실망', '최악']
            
            positive_count = sum(1 for word in positive_words if word in comment_text)
            negative_count = sum(1 for word in negative_words if word in comment_text)
            
            if positive_count > negative_count:
                sentiment = 'positive'
                confidence = min(0.9, 0.5 + (positive_count * 0.1))
            elif negative_count > positive_count:
                sentiment = 'negative'
                confidence = min(0.9, 0.5 + (negative_count * 0.1))
            else:
                sentiment = 'neutral'
                confidence = 0.5
            
            return {
                'sentiment': sentiment,
                'confidence': confidence,
                'positive_count': positive_count,
                'negative_count': negative_count,
                'analyzed_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"감정분석 오류: {e}")
            return {'sentiment': 'neutral', 'confidence': 0.0}
    
    def _cache_video_data(self, video_data: Dict[str, Any]):
        """비디오 데이터 Redis 캐시"""
        if not self.redis_client:
            return
        
        try:
            video_id = video_data.get('id')
            cache_key = f"video:{video_id}"
            
            # 1시간 TTL로 캐시
            self.redis_client.setex(
                cache_key,
                3600,
                json.dumps(video_data, ensure_ascii=False)
            )
            
            # 최신 비디오 목록에 추가
            self.redis_client.lpush("latest_videos", video_id)
            self.redis_client.ltrim("latest_videos", 0, 99)  # 최신 100개만 유지
            
        except Exception as e:
            logger.error(f"비디오 데이터 캐시 오류: {e}")
    
    def _cache_comment_data(self, comment_data: Dict[str, Any], sentiment_result: Dict[str, Any]):
        """댓글 데이터 Redis 캐시"""
        if not self.redis_client:
            return
        
        try:
            comment_id = comment_data.get('id')
            video_id = comment_data.get('video_id')
            
            # 댓글 데이터 캐시
            cache_key = f"comment:{comment_id}"
            comment_with_sentiment = {**comment_data, 'sentiment': sentiment_result}
            
            self.redis_client.setex(
                cache_key,
                3600,
                json.dumps(comment_with_sentiment, ensure_ascii=False)
            )
            
            # 비디오별 댓글 목록에 추가
            self.redis_client.lpush(f"video_comments:{video_id}", comment_id)
            self.redis_client.ltrim(f"video_comments:{video_id}", 0, 99)
            
        except Exception as e:
            logger.error(f"댓글 데이터 캐시 오류: {e}")
    
    def _cache_sentiment_data(self, sentiment_data: Dict[str, Any]):
        """감정분석 데이터 Redis 캐시"""
        if not self.redis_client:
            return
        
        try:
            video_id = sentiment_data.get('video_id')
            cache_key = f"sentiment:{video_id}"
            
            self.redis_client.setex(
                cache_key,
                3600,
                json.dumps(sentiment_data, ensure_ascii=False)
            )
            
        except Exception as e:
            logger.error(f"감정분석 데이터 캐시 오류: {e}")
    
    def _cache_recommendation_data(self, recommendation_data: Dict[str, Any]):
        """추천 데이터 Redis 캐시"""
        if not self.redis_client:
            return
        
        try:
            user_id = recommendation_data.get('user_id')
            cache_key = f"recommendations:{user_id}"
            
            self.redis_client.setex(
                cache_key,
                1800,  # 30분 TTL
                json.dumps(recommendation_data, ensure_ascii=False)
            )
            
        except Exception as e:
            logger.error(f"추천 데이터 캐시 오류: {e}")
    
    def _store_video_data(self, video_data: Dict[str, Any]):
        """비디오 데이터 MySQL 저장"""
        if not self.mysql_connection:
            return
        
        try:
            cursor = self.mysql_connection.cursor()
            
            # 비디오 데이터 저장
            insert_query = """
            INSERT INTO korean_travel_videos 
            (id, title, description, channel_id, published_at, view_count, like_count, 
             comment_count, language, travel_keyword, destination, travel_type, 
             budget_range, season, tags, thumbnail_url, is_korean_content)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            view_count = VALUES(view_count),
            like_count = VALUES(like_count),
            comment_count = VALUES(comment_count)
            """
            
            cursor.execute(insert_query, (
                video_data.get('id'),
                video_data.get('title'),
                video_data.get('description'),
                video_data.get('channel_id'),
                video_data.get('published_at'),
                video_data.get('view_count', 0),
                video_data.get('like_count', 0),
                video_data.get('comment_count', 0),
                video_data.get('language', 'ko'),
                video_data.get('travel_keyword'),
                video_data.get('destination'),
                video_data.get('travel_type'),
                video_data.get('budget_range'),
                video_data.get('season'),
                video_data.get('tags'),
                video_data.get('thumbnail_url'),
                video_data.get('is_korean_content', True)
            ))
            
            self.mysql_connection.commit()
            cursor.close()
            
        except Error as e:
            logger.error(f"비디오 데이터 MySQL 저장 오류: {e}")
    
    def _store_comment_data(self, comment_data: Dict[str, Any], sentiment_result: Dict[str, Any]):
        """댓글 데이터 MySQL 저장"""
        if not self.mysql_connection:
            return
        
        try:
            cursor = self.mysql_connection.cursor()
            
            # 댓글 데이터 저장
            insert_query = """
            INSERT INTO korean_travel_comments 
            (id, video_id, text, author_name, like_count, published_at, sentiment, confidence)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            like_count = VALUES(like_count),
            sentiment = VALUES(sentiment),
            confidence = VALUES(confidence)
            """
            
            cursor.execute(insert_query, (
                comment_data.get('id'),
                comment_data.get('video_id'),
                comment_data.get('text'),
                comment_data.get('author_name'),
                comment_data.get('like_count', 0),
                comment_data.get('published_at'),
                sentiment_result.get('sentiment'),
                sentiment_result.get('confidence')
            ))
            
            self.mysql_connection.commit()
            cursor.close()
            
        except Error as e:
            logger.error(f"댓글 데이터 MySQL 저장 오류: {e}")
    
    def _store_sentiment_data(self, sentiment_data: Dict[str, Any]):
        """감정분석 데이터 MySQL 저장"""
        if not self.mysql_connection:
            return
        
        try:
            cursor = self.mysql_connection.cursor()
            
            # 감정분석 데이터 저장
            insert_query = """
            INSERT INTO sentiment_analysis 
            (video_id, comment_id, sentiment, confidence, positive_count, negative_count, analyzed_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            sentiment = VALUES(sentiment),
            confidence = VALUES(confidence),
            positive_count = VALUES(positive_count),
            negative_count = VALUES(negative_count),
            analyzed_at = VALUES(analyzed_at)
            """
            
            cursor.execute(insert_query, (
                sentiment_data.get('video_id'),
                sentiment_data.get('comment_id'),
                sentiment_data.get('sentiment'),
                sentiment_data.get('confidence'),
                sentiment_data.get('positive_count'),
                sentiment_data.get('negative_count'),
                sentiment_data.get('analyzed_at')
            ))
            
            self.mysql_connection.commit()
            cursor.close()
            
        except Error as e:
            logger.error(f"감정분석 데이터 MySQL 저장 오류: {e}")
    
    def _store_recommendation_data(self, recommendation_data: Dict[str, Any]):
        """추천 데이터 MySQL 저장"""
        if not self.mysql_connection:
            return
        
        try:
            cursor = self.mysql_connection.cursor()
            
            # 추천 데이터 저장
            insert_query = """
            INSERT INTO recommendations 
            (user_id, video_id, score, reason, created_at)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            score = VALUES(score),
            reason = VALUES(reason),
            created_at = VALUES(created_at)
            """
            
            cursor.execute(insert_query, (
                recommendation_data.get('user_id'),
                recommendation_data.get('video_id'),
                recommendation_data.get('score'),
                recommendation_data.get('reason'),
                recommendation_data.get('created_at')
            ))
            
            self.mysql_connection.commit()
            cursor.close()
            
        except Error as e:
            logger.error(f"추천 데이터 MySQL 저장 오류: {e}")
    
    def _send_realtime_notification(self, notification_type: str, data: Dict[str, Any]):
        """실시간 알림 전송"""
        try:
            notification = {
                'type': notification_type,
                'data': data,
                'timestamp': datetime.now().isoformat()
            }
            
            # WebSocket으로 실시간 알림 전송
            asyncio.create_task(self._broadcast_websocket(notification))
            
        except Exception as e:
            logger.error(f"실시간 알림 전송 오류: {e}")
    
    async def _broadcast_websocket(self, notification: Dict[str, Any]):
        """WebSocket 브로드캐스트"""
        if not self.websocket_clients:
            return
        
        message = json.dumps(notification, ensure_ascii=False)
        disconnected_clients = set()
        
        for client in self.websocket_clients:
            try:
                await client.send(message)
            except ConnectionClosed:
                disconnected_clients.add(client)
            except Exception as e:
                logger.error(f"WebSocket 전송 오류: {e}")
                disconnected_clients.add(client)
        
        # 연결이 끊어진 클라이언트 제거
        self.websocket_clients -= disconnected_clients
    
    def start_consuming(self, topics: List[str]):
        """Kafka 토픽에서 데이터 소비 시작"""
        try:
            consumer = KafkaConsumer(
                *topics,
                bootstrap_servers=self.bootstrap_servers,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                group_id='realtime-flink-consumer',
                auto_offset_reset='latest',
                enable_auto_commit=True,
                auto_commit_interval_ms=1000
            )
            
            logger.info(f"Kafka Consumer 시작: {topics}")
            
            for message in consumer:
                try:
                    data = message.value
                    topic = message.topic
                    
                    logger.info(f"메시지 수신: {topic} -> {data.get('id', 'unknown')}")
                    
                    # 토픽별 처리
                    if topic == 'korean-travel-videos':
                        self.process_video_data(data)
                    elif topic == 'korean-travel-comments':
                        self.process_comment_data(data)
                    elif topic == 'sentiment-analysis':
                        self.process_sentiment_data(data)
                    elif topic == 'recommendations':
                        self.process_recommendation_data(data)
                    else:
                        logger.warning(f"알 수 없는 토픽: {topic}")
                    
                except Exception as e:
                    logger.error(f"메시지 처리 오류: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"Kafka Consumer 시작 오류: {e}")
    
    def close(self):
        """연결 종료"""
        if self.redis_client:
            self.redis_client.close()
        if self.mysql_connection:
            self.mysql_connection.close()
        logger.info("Flink Consumer 연결 종료")

# 전역 Consumer 인스턴스
flink_consumer = RealtimeFlinkConsumer()

def get_flink_consumer():
    """Flink Consumer 인스턴스 반환"""
    return flink_consumer
