'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function RealtimeTestPage() {
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    videos: 0,
    comments: 0,
    sentiments: 0,
    recommendations: 0
  });
  const [realtimeData, setRealtimeData] = useState({
    latestVideos: [],
    latestComments: [],
    sentimentTrends: [],
    recommendations: []
  });

  // WebSocket 연결
  useEffect(() => {
    const connectWebSocket = () => {
      const websocket = new WebSocket('ws://localhost:8000/ws');
      
      websocket.onopen = () => {
        console.log('WebSocket 연결 성공');
        setIsConnected(true);
        setWs(websocket);
        
        // 구독 요청
        websocket.send(JSON.stringify({
          type: 'subscribe',
          topic: 'videos'
        }));
        
        websocket.send(JSON.stringify({
          type: 'subscribe',
          topic: 'comments'
        }));
        
        websocket.send(JSON.stringify({
          type: 'subscribe',
          topic: 'sentiment'
        }));
        
        websocket.send(JSON.stringify({
          type: 'subscribe',
          topic: 'recommendations'
        }));
      };
      
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('실시간 데이터 수신:', data);
        
        // 메시지 추가
        setMessages(prev => [...prev.slice(-9), {
          id: Date.now(),
          type: data.type,
          timestamp: data.timestamp,
          data: data.data
        }]);
        
        // 통계 업데이트
        if (data.type === 'video_update') {
          setStats(prev => ({ ...prev, videos: prev.videos + 1 }));
          setRealtimeData(prev => ({
            ...prev,
            latestVideos: [data.data, ...prev.latestVideos.slice(0, 4)]
          }));
        } else if (data.type === 'comment_update') {
          setStats(prev => ({ ...prev, comments: prev.comments + 1 }));
          setRealtimeData(prev => ({
            ...prev,
            latestComments: [data.data, ...prev.latestComments.slice(0, 4)]
          }));
        } else if (data.type === 'sentiment_update') {
          setStats(prev => ({ ...prev, sentiments: prev.sentiments + 1 }));
          setRealtimeData(prev => ({
            ...prev,
            sentimentTrends: [data.data, ...prev.sentimentTrends.slice(0, 4)]
          }));
        } else if (data.type === 'recommendation_update') {
          setStats(prev => ({ ...prev, recommendations: prev.recommendations + 1 }));
          setRealtimeData(prev => ({
            ...prev,
            recommendations: [data.data, ...prev.recommendations.slice(0, 4)]
          }));
        }
      };
      
      websocket.onclose = () => {
        console.log('WebSocket 연결 종료');
        setIsConnected(false);
        setWs(null);
        
        // 3초 후 재연결 시도
        setTimeout(connectWebSocket, 3000);
      };
      
      websocket.onerror = (error) => {
        console.error('WebSocket 오류:', error);
      };
    };
    
    connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // 연결 상태 표시
  const getConnectionStatus = () => {
    if (isConnected) {
      return <Badge color="green">연결됨</Badge>;
    } else {
      return <Badge color="red">연결 끊김</Badge>;
    }
  };

  // 메시지 타입별 색상
  const getMessageColor = (type) => {
    switch (type) {
      case 'video_update': return 'bg-blue-50 border-blue-200';
      case 'comment_update': return 'bg-green-50 border-green-200';
      case 'sentiment_update': return 'bg-yellow-50 border-yellow-200';
      case 'recommendation_update': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  // 감정분석 결과 색상
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            실시간 처리 시스템 테스트
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">WebSocket 상태:</span>
            {getConnectionStatus()}
            <span className="text-sm text-gray-500">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">비디오</p>
                <p className="text-2xl font-bold text-blue-600">{stats.videos}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">📹</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">댓글</p>
                <p className="text-2xl font-bold text-green-600">{stats.comments}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">💬</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">감정분석</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.sentiments}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">😊</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">추천</p>
                <p className="text-2xl font-bold text-purple-600">{stats.recommendations}</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-sm">🎯</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 실시간 메시지 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">실시간 메시지</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border ${getMessageColor(message.type)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {message.type.replace('_update', '')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {message.type === 'video_update' && (
                      <div>
                        <p className="font-medium">{message.data.title}</p>
                        <p className="text-xs text-gray-500">
                          조회수: {message.data.view_count?.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {message.type === 'comment_update' && (
                      <div>
                        <p className="font-medium">{message.data.text}</p>
                        <p className="text-xs text-gray-500">
                          작성자: {message.data.author_name}
                        </p>
                      </div>
                    )}
                    {message.type === 'sentiment_update' && (
                      <div>
                        <p className="font-medium">
                          감정: <span className={getSentimentColor(message.data.sentiment)}>
                            {message.data.sentiment}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          신뢰도: {(message.data.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {message.type === 'recommendation_update' && (
                      <div>
                        <p className="font-medium">추천 영상</p>
                        <p className="text-xs text-gray-500">
                          사용자: {message.data.user_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  실시간 데이터를 기다리는 중...
                </div>
              )}
            </div>
          </Card>

          {/* 최신 데이터 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">최신 데이터</h2>
            <div className="space-y-4">
              {/* 최신 비디오 */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">최신 비디오</h3>
                <div className="space-y-2">
                  {realtimeData.latestVideos.map((video, index) => (
                    <div key={index} className="p-2 bg-blue-50 rounded border">
                      <p className="text-sm font-medium">{video.title}</p>
                      <p className="text-xs text-gray-500">
                        조회수: {video.view_count?.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 최신 댓글 */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">최신 댓글</h3>
                <div className="space-y-2">
                  {realtimeData.latestComments.map((comment, index) => (
                    <div key={index} className="p-2 bg-green-50 rounded border">
                      <p className="text-sm font-medium">{comment.text}</p>
                      <p className="text-xs text-gray-500">
                        작성자: {comment.author_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 감정분석 트렌드 */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">감정분석 트렌드</h3>
                <div className="space-y-2">
                  {realtimeData.sentimentTrends.map((sentiment, index) => (
                    <div key={index} className="p-2 bg-yellow-50 rounded border">
                      <p className="text-sm font-medium">
                        감정: <span className={getSentimentColor(sentiment.sentiment)}>
                          {sentiment.sentiment}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        신뢰도: {(sentiment.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 테스트 버튼 */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => {
              if (ws) {
                ws.send(JSON.stringify({
                  type: 'ping'
                }));
              }
            }}
            disabled={!isConnected}
            className="mr-4"
          >
            연결 테스트
          </Button>
          <Button
            onClick={() => {
              setMessages([]);
              setStats({ videos: 0, comments: 0, sentiments: 0, recommendations: 0 });
              setRealtimeData({
                latestVideos: [],
                latestComments: [],
                sentimentTrends: [],
                recommendations: []
              });
            }}
            variant="outline"
          >
            데이터 초기화
          </Button>
        </div>
      </div>
    </div>
  );
}
