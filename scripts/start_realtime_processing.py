#!/usr/bin/env python3
"""
실시간 처리 시스템 시작 스크립트
"""
import asyncio
import logging
import signal
import sys
import os
from datetime import datetime

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.realtime_flink_consumer import get_flink_consumer
from backend.app.realtime_websocket import get_websocket_handler
from backend.app.realtime_kafka_producer import get_kafka_producer

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RealtimeProcessingSystem:
    """실시간 처리 시스템"""
    
    def __init__(self):
        self.flink_consumer = get_flink_consumer()
        self.websocket_handler = get_websocket_handler()
        self.kafka_producer = get_kafka_producer()
        self.running = False
    
    async def start(self):
        """실시간 처리 시스템 시작"""
        try:
            logger.info("실시간 처리 시스템 시작")
            self.running = True
            
            # Kafka 토픽 목록
            topics = [
                'korean-travel-videos',
                'korean-travel-comments',
                'sentiment-analysis',
                'recommendations'
            ]
            
            # Flink Consumer 시작 (별도 스레드에서)
            import threading
            consumer_thread = threading.Thread(
                target=self.flink_consumer.start_consuming,
                args=(topics,),
                daemon=True
            )
            consumer_thread.start()
            
            logger.info(f"Kafka Consumer 시작: {topics}")
            
            # WebSocket 핸들러 시작
            await self.websocket_handler.start_websocket_server()
            
        except Exception as e:
            logger.error(f"실시간 처리 시스템 시작 오류: {e}")
            raise
    
    async def stop(self):
        """실시간 처리 시스템 중지"""
        try:
            logger.info("실시간 처리 시스템 중지")
            self.running = False
            
            # 연결 종료
            self.flink_consumer.close()
            self.kafka_producer.close()
            
            logger.info("실시간 처리 시스템 중지 완료")
            
        except Exception as e:
            logger.error(f"실시간 처리 시스템 중지 오류: {e}")
    
    def signal_handler(self, signum, frame):
        """시그널 핸들러"""
        logger.info(f"시그널 수신: {signum}")
        asyncio.create_task(self.stop())

async def main():
    """메인 함수"""
    # 실시간 처리 시스템 인스턴스 생성
    system = RealtimeProcessingSystem()
    
    # 시그널 핸들러 등록
    signal.signal(signal.SIGINT, system.signal_handler)
    signal.signal(signal.SIGTERM, system.signal_handler)
    
    try:
        # 시스템 시작
        await system.start()
        
        # 시스템이 실행 중일 때까지 대기
        while system.running:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("키보드 인터럽트 수신")
    except Exception as e:
        logger.error(f"시스템 오류: {e}")
    finally:
        # 시스템 중지
        await system.stop()

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 실시간 처리 시스템 시작")
    print("=" * 60)
    print(f"시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("처리 토픽:")
    print("  - korean-travel-videos")
    print("  - korean-travel-comments")
    print("  - sentiment-analysis")
    print("  - recommendations")
    print("=" * 60)
    
    # 이벤트 루프 실행
    asyncio.run(main())