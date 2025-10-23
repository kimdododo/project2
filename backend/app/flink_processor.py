import os
import json
import logging
from typing import Dict, Any, List
import redis
import pymysql
from datetime import datetime

# Flink 관련 import는 실제 사용 시에만 import
try:
    from pyflink.datastream import StreamExecutionEnvironment
    from pyflink.table import StreamTableEnvironment
    from pyflink.table.types import DataTypes
    from pyflink.common.typeinfo import Types
    from pyflink.datastream.connectors import FlinkKafkaConsumer, FlinkKafkaProducer
    from pyflink.common.serialization import SimpleStringSchema
    from pyflink.common.time import Time
    from pyflink.datastream.functions import MapFunction, KeyedProcessFunction
    from pyflink.datastream.state import ValueStateDescriptor
    FLINK_AVAILABLE = True
except ImportError:
    FLINK_AVAILABLE = False

logger = logging.getLogger(__name__)

class RealtimeDataProcessor:
    def __init__(self):
        self.redis_client = None
        self.mysql_conn = None
        self.env = None
        self.table_env = None
        
    def setup_connections(self):
        """Redis와 MySQL 연결 설정"""
        try:
            # Redis 연결
            self.redis_client = redis.Redis(
                host=os.getenv('REDIS_HOST', 'redis'),
                port=int(os.getenv('REDIS_PORT', '6379')),
                decode_responses=True
            )
            logger.info("Redis connection established")
            
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
            logger.info("MySQL connection established")
            
        except Exception as e:
            logger.error(f"Failed to setup connections: {e}")
            raise
    
    def setup_flink_environment(self):
        """Flink 환경 설정"""
        try:
            # StreamExecutionEnvironment 생성
            self.env = StreamExecutionEnvironment.get_execution_environment()
            self.env.set_parallelism(1)
            self.env.set_stream_time_characteristic(TimeCharacteristic.EventTime)
            
            # TableEnvironment 생성
            self.table_env = StreamTableEnvironment.create(self.env)
            
            # Kafka 커넥터 설정
            kafka_jar_path = "/opt/flink/lib/flink-sql-connector-kafka-1.18.0.jar"
            self.table_env.get_config().get_configuration().set_string(
                "pipeline.jars", kafka_jar_path
            )
            
            logger.info("Flink environment setup completed")
            
        except Exception as e:
            logger.error(f"Failed to setup Flink environment: {e}")
            raise
    
    def create_kafka_source_table(self, topic: str) -> str:
        """Kafka 소스 테이블 생성"""
        table_name = f"kafka_source_{topic}"
        
        ddl = f"""
        CREATE TABLE {table_name} (
            key STRING,
            value STRING,
            topic STRING,
            partition_id INT,
            offset BIGINT,
            timestamp BIGINT
        ) WITH (
            'connector' = 'kafka',
            'topic' = '{topic}',
            'properties.bootstrap.servers' = 'kafka:29092',
            'properties.group.id' = 'flink-consumer',
            'scan.startup.mode' = 'earliest-offset',
            'format' = 'json'
        )
        """
        
        self.table_env.execute_sql(ddl)
        logger.info(f"Kafka source table created: {table_name}")
        return table_name
    
    def create_mysql_sink_table(self, table_name: str) -> str:
        """MySQL 싱크 테이블 생성"""
        sink_name = f"mysql_sink_{table_name}"
        
        ddl = f"""
        CREATE TABLE {sink_name} (
            id STRING,
            data STRING,
            processed_at TIMESTAMP(3)
        ) WITH (
            'connector' = 'jdbc',
            'url' = 'jdbc:mysql://mysql:3306/yt',
            'table-name' = '{table_name}',
            'username' = 'ytuser',
            'password' = 'ytpw',
            'driver' = 'com.mysql.cj.jdbc.Driver'
        )
        """
        
        self.table_env.execute_sql(ddl)
        logger.info(f"MySQL sink table created: {sink_name}")
        return sink_name
    
    def process_realtime_data(self, topic: str):
        """실시간 데이터 처리"""
        try:
            # 소스 테이블 생성
            source_table = self.create_kafka_source_table(topic)
            
            # 데이터 변환 및 처리
            processed_table = f"""
            SELECT 
                key,
                value,
                CURRENT_TIMESTAMP as processed_at
            FROM {source_table}
            """
            
            # MySQL에 저장
            sink_table = self.create_mysql_sink_table("realtime_events")
            
            # 스트림 실행
            self.table_env.execute_sql(f"""
                INSERT INTO {sink_table}
                {processed_table}
            """)
            
            logger.info(f"Realtime processing started for topic: {topic}")
            
        except Exception as e:
            logger.error(f"Failed to process realtime data: {e}")
            raise
    
    def cache_to_redis(self, key: str, data: Dict[str, Any], ttl: int = 3600):
        """Redis에 데이터 캐싱"""
        try:
            if self.redis_client:
                self.redis_client.setex(
                    key, 
                    ttl, 
                    json.dumps(data, default=str)
                )
                logger.info(f"Data cached to Redis: {key}")
        except Exception as e:
            logger.error(f"Failed to cache to Redis: {e}")
    
    def get_from_redis(self, key: str) -> Dict[str, Any]:
        """Redis에서 데이터 조회"""
        try:
            if self.redis_client:
                data = self.redis_client.get(key)
                if data:
                    return json.loads(data)
        except Exception as e:
            logger.error(f"Failed to get from Redis: {e}")
        return {}
    
    def update_mysql_realtime(self, table: str, data: Dict[str, Any]):
        """MySQL 실시간 업데이트"""
        try:
            if self.mysql_conn:
                cursor = self.mysql_conn.cursor()
                
                # 실시간 이벤트 테이블에 삽입
                cursor.execute("""
                    INSERT INTO realtime_events (id, data, processed_at)
                    VALUES (%s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        data = VALUES(data),
                        processed_at = VALUES(processed_at)
                """, (
                    data.get('id'),
                    json.dumps(data),
                    datetime.now()
                ))
                
                logger.info(f"MySQL updated with realtime data: {data.get('id')}")
                
        except Exception as e:
            logger.error(f"Failed to update MySQL: {e}")
    
    def start_realtime_processing(self, topics: List[str]):
        """실시간 처리 시작"""
        try:
            self.setup_connections()
            self.setup_flink_environment()
            
            for topic in topics:
                self.process_realtime_data(topic)
            
            # Flink 작업 실행
            self.env.execute("Realtime Data Processing")
            
        except Exception as e:
            logger.error(f"Failed to start realtime processing: {e}")
            raise
    
    def close_connections(self):
        """연결 종료"""
        try:
            if self.redis_client:
                self.redis_client.close()
            if self.mysql_conn:
                self.mysql_conn.close()
            logger.info("Connections closed")
        except Exception as e:
            logger.error(f"Failed to close connections: {e}")

# 전역 프로세서 인스턴스
realtime_processor = RealtimeDataProcessor()

def start_realtime_processing():
    """실시간 처리 시작 함수"""
    topics = ["youtube_events", "user_interactions", "analytics_events"]
    realtime_processor.start_realtime_processing(topics)

def cache_analytics_data(video_id: str, analytics: Dict[str, Any]):
    """분석 데이터를 Redis에 캐싱"""
    key = f"analytics:video:{video_id}"
    realtime_processor.cache_to_redis(key, analytics, ttl=7200)  # 2시간

def get_cached_analytics(video_id: str) -> Dict[str, Any]:
    """캐시된 분석 데이터 조회"""
    key = f"analytics:video:{video_id}"
    return realtime_processor.get_from_redis(key)
