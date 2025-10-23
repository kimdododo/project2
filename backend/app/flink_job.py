#!/usr/bin/env python3
"""
Flink 실시간 스트림 처리 작업
Kafka → Flink → MySQL/Redis 파이프라인
"""

import os
import json
import logging
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.table import StreamTableEnvironment
from pyflink.table.descriptors import Schema, OldCsv, FileSystem, ConnectorDescriptor
from pyflink.table.types import DataTypes
from pyflink.common.typeinfo import Types
from pyflink.datastream.connectors import FlinkKafkaConsumer, FlinkKafkaProducer
from pyflink.common.serialization import SimpleStringSchema
from pyflink.common.time import Time
from pyflink.datastream.functions import MapFunction, KeyedProcessFunction
from pyflink.datastream.state import ValueStateDescriptor
from pyflink.common.typeinfo import Types
import redis
import pymysql
from datetime import datetime

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealtimeEventProcessor(MapFunction):
    """실시간 이벤트 처리 함수"""
    
    def __init__(self):
        self.redis_client = None
        self.mysql_conn = None
    
    def setup_connections(self):
        """연결 설정"""
        try:
            # Redis 연결
            self.redis_client = redis.Redis(
                host=os.getenv('REDIS_HOST', 'redis'),
                port=int(os.getenv('REDIS_PORT', '6379')),
                decode_responses=True
            )
            
            # MySQL 연결
            self.mysql_conn = pymysql.connect(
                host=os.getenv('MYSQL_HOST', 'mysql'),
                port=int(os.getenv('MYSQL_PORT', '3306')),
                user=os.getenv('MYSQL_USER', 'ytuser'),
                password=os.getenv('MYSQL_PW', 'ytpw'),
                database=os.getenv('MYSQL_DB', 'yt'),
                charset='utf8mb4',
                autocommit=True
            )
            
            logger.info("Connections established")
            
        except Exception as e:
            logger.error(f"Failed to setup connections: {e}")
            raise
    
    def map(self, value):
        """이벤트 처리 메인 함수"""
        try:
            if not self.redis_client:
                self.setup_connections()
            
            # JSON 파싱
            event_data = json.loads(value)
            event_type = event_data.get('event_type')
            video_id = event_data.get('video_id')
            
            logger.info(f"Processing event: {event_type} for video: {video_id}")
            
            # 이벤트 타입별 처리
            if event_type == 'view':
                self.process_view_event(event_data)
            elif event_type == 'like':
                self.process_like_event(event_data)
            elif event_type == 'comment':
                self.process_comment_event(event_data)
            elif event_type == 'analytics':
                self.process_analytics_event(event_data)
            
            # Redis에 실시간 데이터 캐싱
            self.cache_realtime_data(video_id, event_data)
            
            # MySQL에 이벤트 저장
            self.save_event_to_mysql(event_data)
            
            return json.dumps({
                'status': 'processed',
                'video_id': video_id,
                'event_type': event_type,
                'timestamp': datetime.now().isoformat()
            })
            
        except Exception as e:
            logger.error(f"Failed to process event: {e}")
            return json.dumps({
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            })
    
    def process_view_event(self, event_data):
        """조회 이벤트 처리"""
        video_id = event_data['video_id']
        
        # 조회 수 증가
        view_key = f"views:video:{video_id}"
        self.redis_client.incr(view_key)
        self.redis_client.expire(view_key, 86400)  # 24시간 TTL
        
        # 트렌딩 스코어 업데이트
        self.update_trending_score(video_id)
    
    def process_like_event(self, event_data):
        """좋아요 이벤트 처리"""
        video_id = event_data['video_id']
        
        # 좋아요 수 증가
        like_key = f"likes:video:{video_id}"
        self.redis_client.incr(like_key)
        self.redis_client.expire(like_key, 86400)  # 24시간 TTL
        
        # 트렌딩 스코어 업데이트
        self.update_trending_score(video_id)
    
    def process_comment_event(self, event_data):
        """댓글 이벤트 처리"""
        video_id = event_data['video_id']
        
        # 댓글 수 증가
        comment_key = f"comments:video:{video_id}"
        self.redis_client.incr(comment_key)
        self.redis_client.expire(comment_key, 86400)  # 24시간 TTL
        
        # 감정 분석 (간단한 구현)
        if 'comment_text' in event_data:
            sentiment = self.analyze_sentiment(event_data['comment_text'])
            self.cache_sentiment_data(video_id, sentiment)
        
        # 트렌딩 스코어 업데이트
        self.update_trending_score(video_id)
    
    def process_analytics_event(self, event_data):
        """분석 이벤트 처리"""
        video_id = event_data['video_id']
        analytics = event_data.get('analytics', {})
        
        # 분석 데이터 캐싱
        analytics_key = f"analytics:video:{video_id}"
        self.redis_client.setex(
            analytics_key,
            7200,  # 2시간 TTL
            json.dumps(analytics)
        )
    
    def analyze_sentiment(self, text):
        """간단한 감정 분석"""
        positive_words = ['좋', '최고', '훌륭', '멋', '사랑', '감사', '대박']
        negative_words = ['나쁘', '최악', '싫', '화나', '짜증', '실망']
        
        text_lower = text.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        
        if pos_count > neg_count:
            return {'label': 'pos', 'score': 0.7}
        elif neg_count > pos_count:
            return {'label': 'neg', 'score': 0.3}
        else:
            return {'label': 'neu', 'score': 0.5}
    
    def cache_sentiment_data(self, video_id, sentiment):
        """감정 분석 데이터 캐싱"""
        sentiment_key = f"sentiment:video:{video_id}"
        self.redis_client.setex(
            sentiment_key,
            3600,  # 1시간 TTL
            json.dumps(sentiment)
        )
    
    def update_trending_score(self, video_id):
        """트렌딩 스코어 업데이트"""
        try:
            # 현재 통계 조회
            views = int(self.redis_client.get(f"views:video:{video_id}") or 0)
            likes = int(self.redis_client.get(f"likes:video:{video_id}") or 0)
            comments = int(self.redis_client.get(f"comments:video:{video_id}") or 0)
            
            # 트렌딩 스코어 계산 (가중 평균)
            trending_score = (views * 0.4 + likes * 0.3 + comments * 0.3)
            
            # Redis에 저장
            trending_key = f"trending:video:{video_id}"
            self.redis_client.setex(
                trending_key,
                3600,  # 1시간 TTL
                str(trending_score)
            )
            
            logger.info(f"Updated trending score for {video_id}: {trending_score}")
            
        except Exception as e:
            logger.error(f"Failed to update trending score: {e}")
    
    def cache_realtime_data(self, video_id, event_data):
        """실시간 데이터 캐싱"""
        try:
            # 최근 이벤트 저장 (최대 100개)
            events_key = f"recent_events:video:{video_id}"
            self.redis_client.lpush(events_key, json.dumps(event_data))
            self.redis_client.ltrim(events_key, 0, 99)  # 최대 100개 유지
            self.redis_client.expire(events_key, 3600)  # 1시간 TTL
            
        except Exception as e:
            logger.error(f"Failed to cache realtime data: {e}")
    
    def save_event_to_mysql(self, event_data):
        """MySQL에 이벤트 저장"""
        try:
            cursor = self.mysql_conn.cursor()
            
            cursor.execute("""
                INSERT INTO realtime_events (
                    event_type, video_id, user_id, event_data, created_at
                ) VALUES (%s, %s, %s, %s, %s)
            """, (
                event_data.get('event_type'),
                event_data.get('video_id'),
                event_data.get('user_id'),
                json.dumps(event_data),
                datetime.now()
            ))
            
        except Exception as e:
            logger.error(f"Failed to save event to MySQL: {e}")

def create_flink_job():
    """Flink 작업 생성"""
    try:
        # StreamExecutionEnvironment 생성
        env = StreamExecutionEnvironment.get_execution_environment()
        env.set_parallelism(1)
        env.set_stream_time_characteristic(Time.EventTime)
        
        # Kafka 소스 설정
        kafka_consumer = FlinkKafkaConsumer(
            topics=['youtube_events', 'user_interactions', 'analytics_events'],
            deserialization_schema=SimpleStringSchema(),
            properties={
                'bootstrap.servers': 'kafka:29092',
                'group.id': 'flink-realtime-processor',
                'auto.offset.reset': 'earliest'
            }
        )
        
        # 스트림 생성
        stream = env.add_source(kafka_consumer)
        
        # 이벤트 처리
        processed_stream = stream.map(RealtimeEventProcessor())
        
        # 결과를 Kafka로 전송 (선택사항)
        kafka_producer = FlinkKafkaProducer(
            topic='processed_events',
            serialization_schema=SimpleStringSchema(),
            producer_config={
                'bootstrap.servers': 'kafka:29092'
            }
        )
        
        processed_stream.add_sink(kafka_producer)
        
        # 작업 실행
        logger.info("Starting Flink realtime processing job...")
        env.execute("Realtime Event Processing")
        
    except Exception as e:
        logger.error(f"Failed to create Flink job: {e}")
        raise

if __name__ == "__main__":
    create_flink_job()
