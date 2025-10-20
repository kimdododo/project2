import os
import json
import logging
from typing import Optional, Dict, Any
from kafka import KafkaProducer, KafkaConsumer
from kafka.errors import KafkaError

logger = logging.getLogger(__name__)

class KafkaClient:
    def __init__(self):
        self.bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
        self.producer = None
        self.consumer = None
    
    def get_producer(self) -> KafkaProducer:
        """Get or create Kafka producer"""
        if self.producer is None:
            try:
                self.producer = KafkaProducer(
                    bootstrap_servers=self.bootstrap_servers,
                    value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                    key_serializer=lambda k: k.encode('utf-8') if k else None,
                    retries=3,
                    acks='all',
                    request_timeout_ms=30000
                )
                logger.info(f"Kafka producer connected to {self.bootstrap_servers}")
            except KafkaError as e:
                logger.error(f"Failed to create Kafka producer: {e}")
                raise
        return self.producer
    
    def get_consumer(self, topic: str, group_id: str) -> KafkaConsumer:
        """Get or create Kafka consumer for specific topic and group"""
        try:
            consumer = KafkaConsumer(
                topic,
                bootstrap_servers=self.bootstrap_servers,
                group_id=group_id,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                key_deserializer=lambda k: k.decode('utf-8') if k else None,
                auto_offset_reset='earliest',
                enable_auto_commit=True,
                auto_commit_interval_ms=1000
            )
            logger.info(f"Kafka consumer created for topic {topic} with group {group_id}")
            return consumer
        except KafkaError as e:
            logger.error(f"Failed to create Kafka consumer: {e}")
            raise
    
    def send_message(self, topic: str, message: Dict[Any, Any], key: Optional[str] = None) -> bool:
        """Send message to Kafka topic"""
        try:
            producer = self.get_producer()
            future = producer.send(topic, value=message, key=key)
            record_metadata = future.get(timeout=10)
            logger.info(f"Message sent to topic {topic}, partition {record_metadata.partition}, offset {record_metadata.offset}")
            return True
        except KafkaError as e:
            logger.error(f"Failed to send message to topic {topic}: {e}")
            return False
    
    def consume_messages(self, topic: str, group_id: str, timeout_ms: int = 1000):
        """Consume messages from Kafka topic"""
        try:
            consumer = self.get_consumer(topic, group_id)
            for message in consumer:
                yield {
                    'topic': message.topic,
                    'partition': message.partition,
                    'offset': message.offset,
                    'key': message.key,
                    'value': message.value,
                    'timestamp': message.timestamp
                }
        except KafkaError as e:
            logger.error(f"Failed to consume messages from topic {topic}: {e}")
            raise
    
    def close(self):
        """Close producer and consumer connections"""
        if self.producer:
            self.producer.close()
            self.producer = None
        if self.consumer:
            self.consumer.close()
            self.consumer = None
        logger.info("Kafka connections closed")

# Global Kafka client instance
kafka_client = KafkaClient()

# Convenience functions
def send_to_kafka(topic: str, message: Dict[Any, Any], key: Optional[str] = None) -> bool:
    """Send message to Kafka topic"""
    return kafka_client.send_message(topic, message, key)

def consume_from_kafka(topic: str, group_id: str, timeout_ms: int = 1000):
    """Consume messages from Kafka topic"""
    return kafka_client.consume_messages(topic, group_id, timeout_ms)
