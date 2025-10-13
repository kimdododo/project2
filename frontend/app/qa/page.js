"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MessageSquare, 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Heart,
  Star,
  TrendingUp,
  Clock,
  Eye,
  ThumbsUp,
  Calendar,
  Share2,
  Bookmark,
  BarChart3,
  Brain,
  Send,
  Bot,
  User,
  HelpCircle
} from "lucide-react";

export default function QAPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          return JSON.parse(userData);
        }
      } catch (error) {
        console.error('사용자 정보 로드 오류:', error);
      }
      return null;
    };

    const userData = loadUserData();
    setUser(userData);
    setIsLoading(false);
  }, []);

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/signin';
  };

  // 질문 제출
  const submitQuestion = async () => {
    if (!question.trim()) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistory(prev => [...prev, newMessage]);
    setQuestion("");
    setIsLoadingAnswer(true);

    // AI 답변 시뮬레이션
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(question),
        timestamp: new Date().toLocaleTimeString(),
        sources: [
          {
            title: "제주도 3박4일 완벽 여행코스",
            channel: "제주여행TV",
            url: "#",
            relevance: 95
          },
          {
            title: "제주도 숨겨진 명소들",
            channel: "제주힐링",
            url: "#",
            relevance: 88
          }
        ]
      };
      setChatHistory(prev => [...prev, aiResponse]);
      setIsLoadingAnswer(false);
    }, 2000);
  };

  // AI 응답 생성 (데모용)
  const generateAIResponse = (question) => {
    const responses = {
      "봄": "봄에는 제주도의 벚꽃과 유채꽃이 아름답습니다. 특히 4월 중순부터 5월 초까지가 최적기입니다.",
      "조용한": "조용한 섬을 찾으신다면 제주도의 우도나 추자도, 또는 전남의 완도나 진도가 좋습니다.",
      "섬": "한국의 아름다운 섬들로는 제주도, 울릉도, 거제도, 완도, 진도 등이 있습니다.",
      "여행": "여행 계획을 세우실 때는 계절, 예산, 동행자, 관심사 등을 고려하시는 것이 좋습니다."
    };

    for (const [keyword, response] of Object.entries(responses)) {
      if (question.includes(keyword)) {
        return response;
      }
    }

    return "죄송합니다. 해당 질문에 대한 정확한 답변을 찾지 못했습니다. 좀 더 구체적으로 질문해 주시면 도움을 드릴 수 있습니다.";
  };

  // 데모 질문들
  const demoQuestions = [
    "봄에 조용한 섬 추천해주세요",
    "제주도 3박4일 여행 코스 알려주세요",
    "가족 여행에 좋은 곳은 어디인가요?",
    "예산 50만원으로 갈 수 있는 여행지는?",
    "혼자 여행하기 좋은 곳 추천해주세요"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">여행 Q&A 페이지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
          <Link href="/signin" className="btn btn-primary">로그인하기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-sky-600">Yotuberabo</h2>
              <p className="text-sm text-gray-500">여행 Q&A</p>
            </div>
          </div>
          
          {/* 사용자 정보 */}
          {user && (
            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">안녕하세요,</p>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          
          <nav className="space-y-2">
            <Link href="/recommendations" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <Users className="w-5 h-5" />
              채널 추천
            </Link>
            <Link href="/analysis" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <TrendingUp className="w-5 h-5" />
              채널 분석
            </Link>
            <Link href="/personalization" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <Brain className="w-5 h-5" />
              개인화 추천
            </Link>
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <BarChart3 className="w-5 h-5" />
              대시보드
            </Link>
            <Link href="/map" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <MapPin className="w-5 h-5" />
              지도
            </Link>
            <Link href="/planner" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <Calendar className="w-5 h-5" />
              여행 계획
            </Link>
            <Link href="/taste" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <Heart className="w-5 h-5" />
              내 취향
            </Link>
            <Link href="/qa" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <MessageSquare className="w-5 h-5" />
              여행 Q&A
            </Link>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <Search className="w-5 h-5" />
              설정
            </Link>
          </nav>
          
          {/* 로그아웃 버튼 */}
          <div className="mt-8 pt-4 border-t">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
            >
              <Users className="w-5 h-5" />
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">여행 Q&A</h1>
            <p className="text-gray-600">"봄에 조용한 섬" 같은 자연어 질문 → RAG 답변+근거 영상</p>
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">AI 여행 상담사</h2>
                  <p className="text-sm text-gray-600">자연어로 여행 관련 질문을 해보세요</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>여행에 대해 궁금한 것을 물어보세요!</p>
                  <p className="text-sm">예: "봄에 조용한 섬 추천해주세요"</p>
                </div>
              )}

              {chatHistory.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-blue-600' 
                          : 'bg-gray-100'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>

                    {/* AI 응답의 근거 영상들 */}
                    {message.type === 'ai' && message.sources && (
                      <div className="mt-3 ml-11">
                        <p className="text-xs text-gray-600 mb-2">참고 영상:</p>
                        <div className="space-y-2">
                          {message.sources.map((source, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
                              <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                                <Eye className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{source.title}</p>
                                <p className="text-xs text-gray-600">{source.channel}</p>
                              </div>
                              <div className="text-xs text-gray-500">
                                {source.relevance}% 일치
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoadingAnswer && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && submitQuestion()}
                  placeholder="여행에 대해 궁금한 것을 물어보세요..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={submitQuestion}
                  disabled={!question.trim() || isLoadingAnswer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Demo Questions */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">자주 묻는 질문</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {demoQuestions.map((demoQ, index) => (
                <button
                  key={index}
                  onClick={() => setQuestion(demoQ)}
                  className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <p className="text-sm text-gray-700">{demoQ}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
