"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Brain, 
  Heart, 
  MapPin, 
  Users, 
  TrendingUp, 
  Star,
  Filter,
  BarChart3,
  Target,
  Zap,
  Globe,
  Calendar,
  Search,
  MessageSquare,
  Home
} from "lucide-react";

export default function Personalization() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmotion, setSelectedEmotion] = useState('positive');
  const [selectedIntent, setSelectedIntent] = useState('힐링');
  const [selectedSegment, setSelectedSegment] = useState('preferences');

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">개인화 추천을 불러오는 중...</p>
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

  // 감정 기반 추천 데이터
  const emotionRecommendations = {
    positive: [
      { title: "제주도 해돋이 명소", channel: "제주여행TV", score: 95, reason: "긍정적인 댓글이 많은 힐링 여행지" },
      { title: "부산 감천문화마을", channel: "부산여행", score: 92, reason: "활기찬 분위기의 문화 체험" },
      { title: "강릉 커피거리", channel: "강릉여행", score: 88, reason: "따뜻한 분위기의 카페 투어" }
    ],
    neutral: [
      { title: "서울 한강공원", channel: "서울여행", score: 85, reason: "편안한 분위기의 도심 휴식" },
      { title: "경주 불국사", channel: "경주여행", score: 82, reason: "평온한 역사 문화 체험" }
    ],
    calm: [
      { title: "전주 한옥마을", channel: "전주여행", score: 90, reason: "조용하고 평화로운 전통 마을" },
      { title: "안동 하회마을", channel: "안동여행", score: 87, reason: "고요한 전통 문화 체험" }
    ]
  };

  // 의도 기반 추천 데이터
  const intentRecommendations = {
    '힐링': [
      { title: "제주도 힐링 여행", channel: "제주힐링", score: 96, keywords: ["힐링", "휴식", "자연"] },
      { title: "강원도 산림욕", channel: "강원힐링", score: 93, keywords: ["산림욕", "명상", "치유"] }
    ],
    '가성비': [
      { title: "서울 무료 명소", channel: "서울가성비", score: 94, keywords: ["무료", "가성비", "도심"] },
      { title: "부산 저렴한 맛집", channel: "부산가성비", score: 91, keywords: ["맛집", "저렴", "로컬"] }
    ],
    '사진 명소': [
      { title: "인스타 감성 카페", channel: "인스타여행", score: 98, keywords: ["인스타", "사진", "감성"] },
      { title: "제주도 포토스팟", channel: "제주포토", score: 95, keywords: ["포토스팟", "예쁜", "SNS"] }
    ]
  };

  // 개인 맞춤형 분석 데이터
  const personalData = {
    preferences: {
      title: "나의 여행 선호도",
      data: [
        { category: "힐링 여행", percentage: 85, trend: "+15%", description: "최근 3개월간 힐링 관련 영상 시청률" },
        { category: "맛집 탐방", percentage: 72, trend: "+8%", description: "맛집 관련 콘텐츠 관심도" },
        { category: "자연 경관", percentage: 68, trend: "+12%", description: "자연 풍경 영상 선호도" },
        { category: "문화 체험", percentage: 45, trend: "+5%", description: "전통 문화 관련 관심도" }
      ]
    },
    behavior: {
      title: "나의 시청 패턴",
      data: [
        { pattern: "주말 시청", percentage: 78, trend: "+20%", description: "주말에 집중적으로 시청하는 패턴" },
        { pattern: "저녁 시간", percentage: 65, trend: "+10%", description: "저녁 7-9시 시청 선호" },
        { pattern: "긴 영상", percentage: 82, trend: "+18%", description: "20분 이상 영상 선호도" },
        { pattern: "반복 시청", percentage: 58, trend: "+25%", description: "좋아하는 영상 반복 시청" }
      ]
    },
    interests: {
      title: "나의 관심 키워드",
      data: [
        { keyword: "제주도", percentage: 92, trend: "+30%", description: "가장 많이 검색한 키워드" },
        { keyword: "힐링", percentage: 88, trend: "+22%", description: "힐링 관련 콘텐츠 선호" },
        { keyword: "맛집", percentage: 75, trend: "+15%", description: "맛집 탐방 관심도" },
        { keyword: "자연", percentage: 68, trend: "+8%", description: "자연 경관 선호도" }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <h2 className="font-bold text-sky-600">유튜브라보콘</h2>
              <p className="text-sm text-gray-500">개인화 추천</p>
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
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <Home className="w-5 h-5" />
              홈
            </Link>
            <Link href="/recommendations" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <Users className="w-5 h-5" />
              채널 추천
            </Link>
            <Link href="/analysis" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
              <TrendingUp className="w-5 h-5" />
              채널 분석
            </Link>
            <Link href="/personalization" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
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
            <Link href="/qa" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
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
        <div className="max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">개인화 추천</h1>
            <p className="text-gray-600">AI가 분석한 당신만의 맞춤 여행 추천</p>
          </div>

          {/* 감정 기반 추천 */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-semibold text-gray-900">감정 기반 추천</h2>
            </div>
            
            <div className="flex gap-4 mb-6">
              {[
                { key: 'positive', label: '긍정적 분위기', color: 'bg-green-100 text-green-800' },
                { key: 'neutral', label: '중립적 분위기', color: 'bg-gray-100 text-gray-800' },
                { key: 'calm', label: '조용한 여행', color: 'bg-blue-100 text-blue-800' }
              ].map((emotion) => (
                <button
                  key={emotion.key}
                  onClick={() => setSelectedEmotion(emotion.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedEmotion === emotion.key 
                      ? emotion.color 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {emotion.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emotionRecommendations[selectedEmotion].map((rec, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{rec.title}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{rec.score}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{rec.channel}</p>
                  <p className="text-xs text-gray-500">{rec.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 의도 기반 탐색 */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">의도 기반 탐색</h2>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {['힐링', '가성비', '사진 명소', '맛집', '액티비티', '문화체험', '자연', '도시'].map((intent) => (
                <button
                  key={intent}
                  onClick={() => setSelectedIntent(intent)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedIntent === intent 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {intent}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intentRecommendations[selectedIntent]?.map((rec, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{rec.title}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{rec.score}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{rec.channel}</p>
                  <div className="flex flex-wrap gap-1">
                    {rec.keywords.map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )) || (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  해당 의도에 대한 추천이 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 개인 맞춤형 분석 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">나만의 맞춤 분석</h2>
            </div>
            
            <div className="flex gap-4 mb-6">
              {[
                { key: 'preferences', label: '여행 선호도', icon: Heart },
                { key: 'behavior', label: '시청 패턴', icon: Calendar },
                { key: 'interests', label: '관심 키워드', icon: Globe }
              ].map((segment) => (
                <button
                  key={segment.key}
                  onClick={() => setSelectedSegment(segment.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedSegment === segment.key 
                      ? 'bg-indigo-100 text-indigo-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <segment.icon className="w-4 h-4" />
                  {segment.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">{personalData[selectedSegment].title}</h3>
              {personalData[selectedSegment].data.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">
                        {selectedSegment === 'preferences' ? item.category : 
                         selectedSegment === 'behavior' ? item.pattern : item.keyword}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 font-medium">
                        {item.percentage}%
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {item.trend}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
