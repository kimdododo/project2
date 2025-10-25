"""
실시간 YouTube 데이터 수집을 위한 Kafka Producer
"""
import json
import logging
from datetime import datetime
from typing import Dict, List, Any
from kafka import KafkaProducer
from kafka.errors import KafkaError
import os

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealtimeKafkaProducer:
    """실시간 YouTube 데이터를 Kafka로 전송하는 Producer"""
    
    def __init__(self):
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'kafka:29092')
        self.producer = None
        self._connect()
    
    def _connect(self):
        """Kafka Producer 연결"""
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda x: json.dumps(x, ensure_ascii=False).encode('utf-8'),
                key_serializer=lambda x: x.encode('utf-8') if x else None,
                acks='all',  # 모든 복제본에 쓰기 확인
                retries=3,
                retry_backoff_ms=100,
                request_timeout_ms=30000,
                max_block_ms=10000
            )
            logger.info(f"Kafka Producer 연결 성공: {self.bootstrap_servers}")
        except Exception as e:
            logger.error(f"Kafka Producer 연결 실패: {e}")
            raise
    
    def send_video_data(self, video_data: Dict[str, Any]):
        """비디오 데이터를 Kafka로 전송"""
        try:
            # 토픽: korean-travel-videos
            topic = 'korean-travel-videos'
            key = video_data.get('id', 'unknown')
            
            # 메타데이터 추가
            message = {
                **video_data,
                'timestamp': datetime.now().isoformat(),
                'source': 'realtime_collection',
                'processing_type': 'video'
            }
            
            future = self.producer.send(topic, value=message, key=key)
            result = future.get(timeout=10)
            
            logger.info(f"비디오 데이터 전송 성공: {key} -> {result.topic}[{result.partition}]")
            return True
            
        except KafkaError as e:
            logger.error(f"Kafka 전송 실패: {e}")
            return False
        except Exception as e:
            logger.error(f"비디오 데이터 전송 오류: {e}")
            return False
    
    def send_comment_data(self, comment_data: Dict[str, Any]):
        """댓글 데이터를 Kafka로 전송"""
        try:
            # 토픽: korean-travel-comments
            topic = 'korean-travel-comments'
            key = comment_data.get('id', 'unknown')
            
            # 메타데이터 추가
            message = {
                **comment_data,
                'timestamp': datetime.now().isoformat(),
                'source': 'realtime_collection',
                'processing_type': 'comment'
            }
            
            future = self.producer.send(topic, value=message, key=key)
            result = future.get(timeout=10)
            
            logger.info(f"댓글 데이터 전송 성공: {key} -> {result.topic}[{result.partition}]")
            return True
            
        except KafkaError as e:
            logger.error(f"Kafka 전송 실패: {e}")
            return False
        except Exception as e:
            logger.error(f"댓글 데이터 전송 오류: {e}")
            return False
    
    def send_sentiment_data(self, sentiment_data: Dict[str, Any]):
        """감정분석 데이터를 Kafka로 전송"""
        try:
            # 토픽: sentiment-analysis
            topic = 'sentiment-analysis'
            key = f"{sentiment_data.get('video_id', 'unknown')}_{sentiment_data.get('comment_id', 'unknown')}"
            
            # 메타데이터 추가
            message = {
                **sentiment_data,
                'timestamp': datetime.now().isoformat(),
                'source': 'realtime_sentiment',
                'processing_type': 'sentiment'
            }
            
            future = self.producer.send(topic, value=message, key=key)
            result = future.get(timeout=10)
            
            logger.info(f"감정분석 데이터 전송 성공: {key} -> {result.topic}[{result.partition}]")
            return True
            
        except KafkaError as e:
            logger.error(f"Kafka 전송 실패: {e}")
            return False
        except Exception as e:
            logger.error(f"감정분석 데이터 전송 오류: {e}")
            return False
    
    def send_recommendation_data(self, recommendation_data: Dict[str, Any]):
        """추천 데이터를 Kafka로 전송"""
        try:
            # 토픽: recommendations
            topic = 'recommendations'
            key = recommendation_data.get('user_id', 'anonymous')
            
            # 메타데이터 추가
            message = {
                **recommendation_data,
                'timestamp': datetime.now().isoformat(),
                'source': 'realtime_recommendation',
                'processing_type': 'recommendation'
            }
            
            future = self.producer.send(topic, value=message, key=key)
            result = future.get(timeout=10)
            
            logger.info(f"추천 데이터 전송 성공: {key} -> {result.topic}[{result.partition}]")
            return True
            
        except KafkaError as e:
            logger.error(f"Kafka 전송 실패: {e}")
            return False
        except Exception as e:
            logger.error(f"추천 데이터 전송 오류: {e}")
            return False
    
    def send_batch_data(self, data_list: List[Dict[str, Any]], data_type: str):
        """배치 데이터를 Kafka로 전송"""
        success_count = 0
        total_count = len(data_list)
        
        for data in data_list:
            try:
                if data_type == 'video':
                    success = self.send_video_data(data)
                elif data_type == 'comment':
                    success = self.send_comment_data(data)
                elif data_type == 'sentiment':
                    success = self.send_sentiment_data(data)
                elif data_type == 'recommendation':
                    success = self.send_recommendation_data(data)
                else:
                    logger.error(f"알 수 없는 데이터 타입: {data_type}")
                    continue
                
                if success:
                    success_count += 1
                    
            except Exception as e:
                logger.error(f"배치 데이터 전송 오류: {e}")
                continue
        
        logger.info(f"배치 전송 완료: {success_count}/{total_count} 성공")
        return success_count, total_count
    
    def flush(self):
        """Producer 버퍼 플러시"""
        if self.producer:
            self.producer.flush()
    
    def close(self):
        """Producer 연결 종료"""
        if self.producer:
            self.producer.close()
            logger.info("Kafka Producer 연결 종료")

# 전역 Producer 인스턴스
kafka_producer = RealtimeKafkaProducer()

def get_kafka_producer():
    """Kafka Producer 인스턴스 반환"""
    return kafka_producer
