#!/usr/bin/env python3
"""
실시간 처리 파이프라인 시작 스크립트
Kafka → Flink → MySQL/Redis
"""

import os
import sys
import time
import logging
import subprocess
import requests
from datetime import datetime

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RealtimeProcessor:
    def __init__(self):
        self.kafka_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
        self.redis_host = os.getenv('REDIS_HOST', 'localhost')
        self.redis_port = int(os.getenv('REDIS_PORT', '6379'))
        self.mysql_host = os.getenv('MYSQL_HOST', 'localhost')
        self.mysql_port = int(os.getenv('MYSQL_PORT', '3307'))
        
    def check_dependencies(self):
        """의존성 서비스 상태 확인"""
        logger.info("Checking dependencies...")
        
        # Kafka 상태 확인 (Kafka UI 포트 변경)
        try:
            response = requests.get("http://localhost:8090", timeout=5)
            if response.status_code == 200:
                logger.info("✓ Kafka UI is running")
            else:
                logger.warning("⚠ Kafka UI status unknown")
        except Exception as e:
            logger.warning(f"⚠ Kafka UI connection failed: {e}")
            # Kafka UI가 없어도 Kafka 자체는 동작할 수 있음
        
        # Redis 상태 확인
        try:
            import redis
            r = redis.Redis(host=self.redis_host, port=self.redis_port, decode_responses=True)
            r.ping()
            logger.info("✓ Redis is running")
        except Exception as e:
            logger.error(f"✗ Redis connection failed: {e}")
            return False
        
        # MySQL 상태 확인
        try:
            import pymysql
            conn = pymysql.connect(
                host=self.mysql_host,
                port=self.mysql_port,
                user=os.getenv('MYSQL_USER', 'ytuser'),
                password=os.getenv('MYSQL_PW', 'ytpw'),
                database=os.getenv('MYSQL_DB', 'yt')
            )
            conn.close()
            logger.info("✓ MySQL is running")
        except Exception as e:
            logger.error(f"✗ MySQL connection failed: {e}")
            return False
        
        return True
    
    def create_kafka_topics(self):
        """Kafka 토픽 생성"""
        logger.info("Creating Kafka topics...")
        
        topics = [
            'youtube_events',
            'user_interactions', 
            'analytics_events',
            'processed_events'
        ]
        
        for topic in topics:
            try:
                # Kafka 토픽 생성 명령어
                cmd = [
                    'docker', 'exec', 'project-kafka',
                    'kafka-topics', '--create',
                    '--topic', topic,
                    '--bootstrap-server', 'localhost:9092',
                    '--partitions', '3',
                    '--replication-factor', '1'
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                if result.returncode == 0:
                    logger.info(f"✓ Topic '{topic}' created")
                else:
                    logger.warning(f"⚠ Topic '{topic}' may already exist")
                    
            except Exception as e:
                logger.error(f"✗ Failed to create topic '{topic}': {e}")
    
    def setup_mysql_tables(self):
        """MySQL 테이블 설정"""
        logger.info("Setting up MySQL tables...")
        
        try:
            import pymysql
            conn = pymysql.connect(
                host=self.mysql_host,
                port=self.mysql_port,
                user=os.getenv('MYSQL_USER', 'ytuser'),
                password=os.getenv('MYSQL_PW', 'ytpw'),
                database=os.getenv('MYSQL_DB', 'yt')
            )
            
            with conn.cursor() as cursor:
                # 실시간 스키마 파일 실행
                schema_file = '/app/sql/realtime_schema.sql'
                if os.path.exists(schema_file):
                    with open(schema_file, 'r') as f:
                        schema_sql = f.read()
                    
                    # SQL 문장별로 실행
                    for statement in schema_sql.split(';'):
                        statement = statement.strip()
                        if statement:
                            cursor.execute(statement)
                    
                    conn.commit()
                    logger.info("✓ MySQL tables created")
                else:
                    logger.warning("⚠ Schema file not found, creating basic tables...")
                    self.create_basic_tables(cursor)
            
            conn.close()
            
        except Exception as e:
            logger.error(f"✗ Failed to setup MySQL tables: {e}")
    
    def create_basic_tables(self, cursor):
        """기본 테이블 생성"""
        basic_tables = [
            """
            CREATE TABLE IF NOT EXISTS realtime_events (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                event_type VARCHAR(50) NOT NULL,
                video_id VARCHAR(64) NOT NULL,
                user_id VARCHAR(64),
                event_data JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """,
            """
            CREATE TABLE IF NOT EXISTS realtime_analytics (
                video_id VARCHAR(64) PRIMARY KEY,
                view_count INT DEFAULT 0,
                like_count INT DEFAULT 0,
                comment_count INT DEFAULT 0,
                trending_score FLOAT DEFAULT 0.0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """
        ]
        
        for table_sql in basic_tables:
            cursor.execute(table_sql)
    
    def start_flink_job(self):
        """Flink 작업 시작"""
        logger.info("Starting Flink job...")
        
        try:
            # Flink 작업 디렉토리로 이동
            flink_job_path = 'backend/app/flink_job.py'
            
            if os.path.exists(flink_job_path):
                # Flink 작업 실행
                cmd = [
                    'python', flink_job_path
                ]
                
                logger.info(f"Executing: {' '.join(cmd)}")
                subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                logger.info("✓ Flink job started")
            else:
                logger.error(f"✗ Flink job file not found: {flink_job_path}")
                return False
                
        except Exception as e:
            logger.error(f"✗ Failed to start Flink job: {e}")
            return False
        
        return True
    
    def start_realtime_api(self):
        """실시간 API 서버 시작"""
        logger.info("Starting realtime API server...")
        
        try:
            # FastAPI 서버 시작
            cmd = [
                'uvicorn', 'app.main:app',
                '--host', '0.0.0.0',
                '--port', '8000',
                '--reload'
            ]
            
            logger.info(f"Executing: {' '.join(cmd)}")
            subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info("✓ Realtime API server started")
            
        except Exception as e:
            logger.error(f"✗ Failed to start realtime API: {e}")
            return False
        
        return True
    
    def generate_sample_events(self):
        """샘플 이벤트 생성"""
        logger.info("Generating sample events...")
        
        try:
            from backend.app.kafka_client import send_to_kafka
            
            sample_events = [
                {
                    'event_type': 'view',
                    'video_id': 'sample_video_001',
                    'user_id': 'user_001',
                    'timestamp': datetime.now().isoformat(),
                    'data': {'source': 'web', 'device': 'desktop'}
                },
                {
                    'event_type': 'like',
                    'video_id': 'sample_video_001',
                    'user_id': 'user_002',
                    'timestamp': datetime.now().isoformat(),
                    'data': {'reaction': 'thumbs_up'}
                },
                {
                    'event_type': 'comment',
                    'video_id': 'sample_video_001',
                    'user_id': 'user_003',
                    'timestamp': datetime.now().isoformat(),
                    'data': {
                        'comment_text': 'Great video!',
                        'sentiment': 'positive'
                    }
                }
            ]
            
            for event in sample_events:
                send_to_kafka('youtube_events', event, event['video_id'])
                time.sleep(0.1)  # 간격 조절
            
            logger.info("✓ Sample events generated")
            
        except Exception as e:
            logger.error(f"✗ Failed to generate sample events: {e}")
    
    def run(self):
        """실시간 처리 파이프라인 실행"""
        logger.info("Starting realtime processing pipeline...")
        
        # 1. 의존성 확인
        if not self.check_dependencies():
            logger.error("Dependency check failed. Exiting.")
            return False
        
        # 2. Kafka 토픽 생성
        self.create_kafka_topics()
        
        # 3. MySQL 테이블 설정
        self.setup_mysql_tables()
        
        # 4. Flink 작업 시작
        if not self.start_flink_job():
            logger.error("Failed to start Flink job. Exiting.")
            return False
        
        # 5. 실시간 API 시작
        if not self.start_realtime_api():
            logger.error("Failed to start realtime API. Exiting.")
            return False
        
        # 6. 샘플 이벤트 생성 (테스트용)
        time.sleep(5)  # 서비스 시작 대기
        self.generate_sample_events()
        
        logger.info("✓ Realtime processing pipeline started successfully!")
        logger.info("API available at: http://localhost:8000")
        logger.info("Flink UI available at: http://localhost:8081")
        logger.info("Kafka UI available at: http://localhost:8081")
        
        return True

def main():
    """메인 함수"""
    processor = RealtimeProcessor()
    
    try:
        success = processor.run()
        if success:
            logger.info("Realtime processing pipeline is running...")
            # 무한 루프로 실행 상태 유지
            while True:
                time.sleep(60)
                logger.info("Pipeline is still running...")
        else:
            logger.error("Failed to start realtime processing pipeline")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("Shutting down realtime processing pipeline...")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
