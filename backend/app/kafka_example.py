"""
Kafka 사용 예제
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging
from .kafka_client import send_to_kafka, consume_from_kafka

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/kafka", tags=["kafka"])

@router.post("/send")
async def send_message(topic: str, message: Dict[str, Any], key: str = None):
    """
    Kafka 토픽에 메시지 전송
    """
    try:
        success = send_to_kafka(topic, message, key)
        if success:
            return {"status": "success", "message": f"Message sent to topic {topic}"}
        else:
            raise HTTPException(status_code=500, detail="Failed to send message")
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/topics/{topic}/consume")
async def consume_messages(topic: str, group_id: str = "default-group", limit: int = 10):
    """
    Kafka 토픽에서 메시지 소비
    """
    try:
        messages = []
        count = 0
        for message in consume_from_kafka(topic, group_id):
            messages.append(message)
            count += 1
            if count >= limit:
                break
        
        return {
            "status": "success",
            "topic": topic,
            "group_id": group_id,
            "message_count": len(messages),
            "messages": messages
        }
    except Exception as e:
        logger.error(f"Error consuming messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# YouTube 데이터 처리 예제
@router.post("/youtube/process")
async def process_youtube_data(video_data: Dict[str, Any]):
    """
    YouTube 데이터를 Kafka로 전송하여 처리
    """
    try:
        # YouTube 데이터를 Kafka로 전송
        success = send_to_kafka(
            topic="youtube-videos",
            message=video_data,
            key=video_data.get("video_id")
        )
        
        if success:
            return {
                "status": "success",
                "message": "YouTube data sent to Kafka for processing"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to send YouTube data to Kafka")
    except Exception as e:
        logger.error(f"Error processing YouTube data: {e}")
        raise HTTPException(status_code=500, detail=str(e))
