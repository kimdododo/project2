"""
실시간 WebSocket 서버
"""
import json
import logging
import asyncio
from datetime import datetime
from typing import Set, Dict, Any
import websockets
from websockets.exceptions import ConnectionClosed, WebSocketException
from fastapi import WebSocket, WebSocketDisconnect
import uvicorn

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealtimeWebSocketManager:
    """실시간 WebSocket 연결 관리"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.connection_info: Dict[WebSocket, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, client_info: Dict[str, Any] = None):
        """WebSocket 연결 수락"""
        await websocket.accept()
        self.active_connections.add(websocket)
        
        if client_info:
            self.connection_info[websocket] = client_info
        else:
            self.connection_info[websocket] = {
                'connected_at': datetime.now().isoformat(),
                'client_id': f"client_{len(self.active_connections)}"
            }
        
        logger.info(f"WebSocket 연결 수락: {len(self.active_connections)}개 연결")
        
        # 연결 확인 메시지 전송
        await self.send_personal_message(websocket, {
            'type': 'connection_established',
            'message': '실시간 연결이 설정되었습니다',
            'timestamp': datetime.now().isoformat()
        })
    
    def disconnect(self, websocket: WebSocket):
        """WebSocket 연결 해제"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            if websocket in self.connection_info:
                del self.connection_info[websocket]
        
        logger.info(f"WebSocket 연결 해제: {len(self.active_connections)}개 연결")
    
    async def send_personal_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """개별 WebSocket에 메시지 전송"""
        try:
            await websocket.send_text(json.dumps(message, ensure_ascii=False))
        except (ConnectionClosed, WebSocketDisconnect):
            self.disconnect(websocket)
        except Exception as e:
            logger.error(f"개별 메시지 전송 오류: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: Dict[str, Any]):
        """모든 연결된 WebSocket에 메시지 브로드캐스트"""
        if not self.active_connections:
            return
        
        disconnected_connections = set()
        message_text = json.dumps(message, ensure_ascii=False)
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message_text)
            except (ConnectionClosed, WebSocketDisconnect):
                disconnected_connections.add(connection)
            except Exception as e:
                logger.error(f"브로드캐스트 오류: {e}")
                disconnected_connections.add(connection)
        
        # 연결이 끊어진 클라이언트 제거
        for connection in disconnected_connections:
            self.disconnect(connection)
    
    async def send_to_user(self, user_id: str, message: Dict[str, Any]):
        """특정 사용자에게 메시지 전송"""
        for connection, info in self.connection_info.items():
            if info.get('user_id') == user_id:
                await self.send_personal_message(connection, message)
                break
    
    async def send_to_topic(self, topic: str, message: Dict[str, Any]):
        """특정 토픽 구독자에게 메시지 전송"""
        for connection, info in self.connection_info.items():
            if topic in info.get('subscribed_topics', []):
                await self.send_personal_message(connection, message)
    
    def get_connection_count(self) -> int:
        """현재 연결 수 반환"""
        return len(self.active_connections)
    
    def get_connection_info(self) -> Dict[str, Any]:
        """연결 정보 반환"""
        return {
            'total_connections': len(self.active_connections),
            'connections': [
                {
                    'client_id': info.get('client_id'),
                    'user_id': info.get('user_id'),
                    'connected_at': info.get('connected_at'),
                    'subscribed_topics': info.get('subscribed_topics', [])
                }
                for info in self.connection_info.values()
            ]
        }

# 전역 WebSocket 매니저
websocket_manager = RealtimeWebSocketManager()

class RealtimeWebSocketHandler:
    """실시간 WebSocket 핸들러"""
    
    def __init__(self):
        self.manager = websocket_manager
    
    async def handle_websocket(self, websocket: WebSocket, client_id: str = None):
        """WebSocket 연결 처리"""
        client_info = {
            'client_id': client_id or f"client_{datetime.now().timestamp()}",
            'connected_at': datetime.now().isoformat(),
            'subscribed_topics': []
        }
        
        await self.manager.connect(websocket, client_info)
        
        try:
            while True:
                # 클라이언트로부터 메시지 수신
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # 메시지 타입별 처리
                await self._handle_client_message(websocket, message)
                
        except WebSocketDisconnect:
            self.manager.disconnect(websocket)
        except Exception as e:
            logger.error(f"WebSocket 처리 오류: {e}")
            self.manager.disconnect(websocket)
    
    async def _handle_client_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """클라이언트 메시지 처리"""
        message_type = message.get('type')
        
        if message_type == 'subscribe':
            # 토픽 구독
            topic = message.get('topic')
            if topic:
                self.manager.connection_info[websocket]['subscribed_topics'].append(topic)
                await self.manager.send_personal_message(websocket, {
                    'type': 'subscription_confirmed',
                    'topic': topic,
                    'message': f'{topic} 토픽을 구독했습니다'
                })
        
        elif message_type == 'unsubscribe':
            # 토픽 구독 해제
            topic = message.get('topic')
            if topic:
                subscribed_topics = self.manager.connection_info[websocket].get('subscribed_topics', [])
                if topic in subscribed_topics:
                    subscribed_topics.remove(topic)
                await self.manager.send_personal_message(websocket, {
                    'type': 'unsubscription_confirmed',
                    'topic': topic,
                    'message': f'{topic} 토픽 구독을 해제했습니다'
                })
        
        elif message_type == 'ping':
            # 연결 확인
            await self.manager.send_personal_message(websocket, {
                'type': 'pong',
                'timestamp': datetime.now().isoformat()
            })
        
        elif message_type == 'get_info':
            # 연결 정보 요청
            await self.manager.send_personal_message(websocket, {
                'type': 'connection_info',
                'data': self.manager.get_connection_info()
            })
        
        else:
            # 알 수 없는 메시지 타입
            await self.manager.send_personal_message(websocket, {
                'type': 'error',
                'message': f'알 수 없는 메시지 타입: {message_type}'
            })
    
    async def send_video_update(self, video_data: Dict[str, Any]):
        """비디오 업데이트 전송"""
        message = {
            'type': 'video_update',
            'data': video_data,
            'timestamp': datetime.now().isoformat()
        }
        await self.manager.send_to_topic('videos', message)
    
    async def send_comment_update(self, comment_data: Dict[str, Any]):
        """댓글 업데이트 전송"""
        message = {
            'type': 'comment_update',
            'data': comment_data,
            'timestamp': datetime.now().isoformat()
        }
        await self.manager.send_to_topic('comments', message)
    
    async def send_sentiment_update(self, sentiment_data: Dict[str, Any]):
        """감정분석 업데이트 전송"""
        message = {
            'type': 'sentiment_update',
            'data': sentiment_data,
            'timestamp': datetime.now().isoformat()
        }
        await self.manager.send_to_topic('sentiment', message)
    
    async def send_recommendation_update(self, recommendation_data: Dict[str, Any]):
        """추천 업데이트 전송"""
        message = {
            'type': 'recommendation_update',
            'data': recommendation_data,
            'timestamp': datetime.now().isoformat()
        }
        await self.manager.send_to_topic('recommendations', message)
    
    async def send_system_notification(self, notification: Dict[str, Any]):
        """시스템 알림 전송"""
        message = {
            'type': 'system_notification',
            'data': notification,
            'timestamp': datetime.now().isoformat()
        }
        await self.manager.broadcast(message)

# 전역 WebSocket 핸들러
websocket_handler = RealtimeWebSocketHandler()

def get_websocket_handler():
    """WebSocket 핸들러 인스턴스 반환"""
    return websocket_handler

def get_websocket_manager():
    """WebSocket 매니저 인스턴스 반환"""
    return websocket_manager
