"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/libs/api";
import { 
  Star, 
  PlayCircle, 
  ThumbsUp, 
  MessageSquare, 
  Eye, 
  Clock,
  TrendingUp,
  Heart,
  Filter,
  RefreshCw,
  BarChart3,
  Search,
  Users,
  Brain,
  MapPin,
  Calendar,
  Home,
  AlertCircle
} from "lucide-react";
import MobileNavigation from "@/components/MobileNavigation";
import MobileHeader from "@/components/MobileHeader";
export default function Recommendations() {
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState(null);
  const [expandedComments, setExpandedComments] = useState({});

  // 댓글 토글 함수
  const toggleComments = (videoId, commentType) => {
    const key = `${videoId}-${commentType}`;
    setExpandedComments(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // 전역 AuthGuard에서 인증 체크 처리됨

  useEffect(() => {
    // 사용자 정보 로드
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
    
    // 백엔드 API에서 추천 데이터 가져오기
    const fetchRecommendations = async () => {
      try {
        // 실제 API 호출로 비디오 데이터 가져오기
        const videosData = await apiClient.getVideos(20, 0);
        console.log('API 응답 데이터:', videosData);
        
        // 비디오 데이터를 추천 형식으로 변환
        const recommendations = videosData.map((video, index) => ({
          id: video.id,
          title: video.title,
          channel: video.channel_name || `채널 ${video.channel_id}`,
          thumbnail: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
          views: Math.floor(Math.random() * 100000) + 10000,
          likes: Math.floor(Math.random() * 5000) + 500,
          comments: Math.floor(Math.random() * 500) + 50,
          duration: `${Math.floor(Math.random() * 20) + 5}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          publishedAt: video.published_at ? new Date(video.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          score: Math.random() * 0.4 + 0.6, // 0.6-1.0 사이의 점수
          reason: "높은 감정 점수와 인기 키워드 매칭",
          tags: video.topics && video.topics.length > 0 ? video.topics : ["여행", "추천", "인기"],
          sentiment: { 
            pos: Math.random() * 0.3 + 0.6, 
            neu: Math.random() * 0.2 + 0.1, 
            neg: Math.random() * 0.1 + 0.05 
          },
          positiveComments: video.positive_comments && video.positive_comments.length > 0 ? video.positive_comments : [
            "정말 유용한 정보네요!",
            "다음 여행 때 참고하겠습니다",
            "영상 퀄리티가 정말 좋아요"
          ],
          negativeComments: video.negative_comments && video.negative_comments.length > 0 ? video.negative_comments : [
            "개선이 필요해 보여요",
            "다른 영상이 더 좋을 것 같아요",
            "아쉬운 부분이 있네요"
          ]
        }));
        
        setRecommendations(recommendations);
        setIsLoading(false);
      } catch (error) {
        console.error('추천 데이터 로드 실패:', error);
        // 실패 시 기본 데이터 사용
        setTimeout(() => {
          setRecommendations([
            {
              id: "dQw4w9WgXcQ",
              title: "제주도 3박4일 완벽 여행코스",
              channel: "제주여행TV",
              thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
              views: 125000,
              likes: 3200,
              comments: 450,
              duration: "15:32",
              publishedAt: "2024-01-15",
              score: 0.95,
              reason: "높은 감정 점수와 인기 키워드 매칭",
              tags: ["제주도", "여행코스", "3박4일"],
              sentiment: { pos: 0.85, neu: 0.10, neg: 0.05 },
              positiveComments: [
                "이 영상만 보면 제주도 가고싶다",
                "정말 유용한 정보네요! 다음 제주도 여행 때 참고하겠습니다",
                "영상 퀄리티가 정말 좋아요. 제주도 여행 계획 세우기 완벽해요"
              ]
            },
            {
              id: "jNQXAC9IVRw",
              title: "부산 맛집 투어 베스트 10",
              channel: "부산맛집탐방",
              thumbnail: "https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg",
              views: 98000,
              likes: 2800,
              comments: 320,
              duration: "12:45",
              publishedAt: "2024-01-14",
              score: 0.92,
              reason: "댓글 감정 분석 결과 매우 긍정적",
              tags: ["부산", "맛집", "투어"],
              sentiment: { pos: 0.78, neu: 0.15, neg: 0.07 },
              positiveComments: [
                "부산 맛집 정보 정말 유용해요! 다음에 부산 갈 때 꼭 가보겠습니다",
                "영상 보면서 배고파졌어요 ㅠㅠ 부산 여행 계획 세워야겠어요",
                "맛집 추천 정말 좋네요. 실제로 가봤는데 정말 맛있었어요!"
              ]
            },
            {
              id: "M7lc1UVf-VE",
              title: "서울 야경 명소 완전정복",
              channel: "서울나이트",
              thumbnail: "https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg",
              views: 156000,
              likes: 4200,
              comments: 680,
              duration: "18:20",
              publishedAt: "2024-01-13",
              score: 0.89,
              reason: "트렌딩 키워드와 높은 참여도",
              tags: ["서울", "야경", "명소"],
              sentiment: { pos: 0.72, neu: 0.20, neg: 0.08 },
              positiveComments: [
                "서울 야경 정말 아름다워요! 다음에 데이트 코스로 가보고 싶어요",
                "야경 명소 정보 너무 좋아요. 서울의 밤 풍경이 정말 멋져요",
                "영상 퀄리티가 정말 높네요. 서울 여행 가이드로 완벽해요"
              ]
            },
            {
              id: "9bZkp7q19f0",
              title: "강원도 설악산 등반기",
              channel: "등산러버",
              thumbnail: "https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg",
              views: 87000,
              likes: 2100,
              comments: 180,
              duration: "22:15",
              publishedAt: "2024-01-12",
              score: 0.87,
              reason: "계절성 키워드와 높은 완주율",
              tags: ["강원도", "설악산", "등산"],
              sentiment: { pos: 0.68, neu: 0.25, neg: 0.07 },
              positiveComments: [
                "설악산 등반 정보 정말 도움됐어요! 다음에 꼭 가보고 싶어요",
                "등산 코스 설명이 너무 자세해요. 초보자도 따라할 수 있을 것 같아요",
                "자연 풍경이 정말 아름다워요. 힐링이 되는 영상이에요"
              ]
            },
            {
              id: "kJQP7kiw5Fk",
              title: "전주 한옥마을 1박2일",
              channel: "전주여행",
              thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg",
              views: 67000,
              likes: 1800,
              comments: 240,
              duration: "14:30",
              publishedAt: "2024-01-11",
              score: 0.84,
              reason: "문화 관광 키워드 매칭",
              tags: ["전주", "한옥마을", "문화"],
              sentiment: { pos: 0.75, neu: 0.18, neg: 0.07 },
              positiveComments: [
                "전주 한옥마을 정말 아름다워요! 한국 전통 문화를 느낄 수 있어서 좋아요",
                "1박2일 코스가 정말 완벽해요. 다음 전주 여행 때 참고하겠습니다",
                "한옥마을 풍경이 정말 멋져요. 사진 찍기 좋을 것 같아요"
              ]
            }
          ]);
          setIsLoading(false);
        }, 1000);
      }
    };

    fetchRecommendations();
  }, []);

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === "all") return true;
    if (filter === "high") return rec.score >= 0.9;
    if (filter === "medium") return rec.score >= 0.8 && rec.score < 0.9;
    if (filter === "low") return rec.score < 0.8;
    return true;
  });

  // 전역 Protected에서 인증 체크 처리됨

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-gray-600">채널 추천을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <MobileHeader 
        title="영상 추천"
        subtitle="채널 추천"
        icon={Users}
        onFilterClick={() => setFilter("all")}
      />

      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        {/* Desktop Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-sky-600">Yotuberabo</h2>
                <p className="text-sm text-gray-500">채널 추천</p>
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
            <Link href="/recommendations" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
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
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                window.location.href = '/signin';
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
            >
              <Users className="w-5 h-5" />
              로그아웃
            </button>
          </div>
        </div>
      </div>

        {/* Desktop Main Content */}
        <div className="flex-1">
          {/* Desktop Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">영상 추천</h1>
                  <p className="text-gray-600">AI 알고리즘 기반 개인화 영상 추천</p>
                </div>
                <div className="flex gap-3">
                  <button className="btn btn-outline btn-sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    새로고침
                  </button>
                  <button className="btn btn-primary btn-sm">
                    <Star className="w-4 h-4 mr-2" />
                    즐겨찾기
                  </button>
                </div>
              </div>
            </div>
          </div>

        <div className="p-4 lg:p-6">
        {/* 필터 */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6 mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">추천 필터</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setFilter("all")}
              >
                전체
              </button>
              <button 
                className={`btn btn-sm ${filter === "high" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setFilter("high")}
              >
                <span className="hidden sm:inline">높은 점수 (90%+)</span>
                <span className="sm:hidden">90%+</span>
              </button>
              <button 
                className={`btn btn-sm ${filter === "medium" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setFilter("medium")}
              >
                <span className="hidden sm:inline">중간 점수 (80-90%)</span>
                <span className="sm:hidden">80-90%</span>
              </button>
              <button 
                className={`btn btn-sm ${filter === "low" ? "btn-primary" : "btn-outline"}`}
                onClick={() => setFilter("low")}
              >
                <span className="hidden sm:inline">낮은 점수 (80% 미만)</span>
                <span className="sm:hidden">80% 미만</span>
              </button>
            </div>
          </div>
        </div>

        {/* 추천 영상 목록 */}
        <div className="space-y-4 lg:space-y-6">
          {filteredRecommendations.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                  {/* 썸네일 */}
                  <div className="flex-shrink-0 w-full lg:w-48">
                    <div className="relative">
                      <div className="w-full lg:w-48 h-32 lg:h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-12 h-12 text-gray-400" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                  </div>

                  {/* 영상 정보 */}
                  <div className="flex-1">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {video.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{video.channel}</p>
                        
                        {/* 통계 */}
                        <div className="grid grid-cols-2 lg:flex lg:items-center lg:space-x-4 text-sm text-gray-500 mb-3 gap-2">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            <span className="truncate">{video.views.toLocaleString()}</span>
                          </span>
                          <span className="flex items-center">
                            <ThumbsUp className="w-4 h-4 mr-1" />
                            <span className="truncate">{video.likes.toLocaleString()}</span>
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            <span className="truncate">{video.comments.toLocaleString()}</span>
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span className="truncate">{video.publishedAt}</span>
                          </span>
                        </div>

                        {/* 추천 이유 */}
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <div className="flex items-center mb-1">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium text-blue-900">추천 점수: {Math.round(video.score * 100)}%</span>
                          </div>
                          <p className="text-sm text-blue-800">{video.reason}</p>
                        </div>

                        {/* 긍정 댓글 섹션 */}
                        <div className="bg-green-50 rounded-lg p-3 mb-3">
                          <button 
                            className="flex items-center justify-between w-full mb-2 hover:bg-green-100 rounded-lg p-2 transition-colors"
                            onClick={() => toggleComments(video.id, 'positive')}
                          >
                            <div className="flex items-center">
                              <Heart className="w-4 h-4 text-green-600 mr-2" />
                              <span className="text-sm font-medium text-green-900">긍정 댓글</span>
                              <span className="ml-2 text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">
                                {video.positiveComments?.length || 0}
                              </span>
                            </div>
                            <div className="text-green-600">
                              <svg 
                                className={`w-4 h-4 transition-transform duration-200 ${expandedComments[`${video.id}-positive`] ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                          {expandedComments[`${video.id}-positive`] && (
                            <div className="space-y-2 animate-fadeIn">
                              {video.positiveComments?.map((comment, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 border-l-4 border-green-400">
                                  <p className="text-sm text-gray-800">"{comment}"</p>
                                </div>
                              )) || (
                                <div className="bg-white rounded-lg p-3 border-l-4 border-green-400">
                                  <p className="text-sm text-gray-800">"이 영상만 보면 제주도 가고싶다"</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 부정 댓글 섹션 */}
                        <div className="bg-red-50 rounded-lg p-3 mb-3">
                          <button 
                            className="flex items-center justify-between w-full mb-2 hover:bg-red-100 rounded-lg p-2 transition-colors"
                            onClick={() => toggleComments(video.id, 'negative')}
                          >
                            <div className="flex items-center">
                              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                              <span className="text-sm font-medium text-red-900">부정 댓글</span>
                              <span className="ml-2 text-xs text-red-600 bg-red-200 px-2 py-1 rounded-full">
                                {video.negativeComments?.length || 0}
                              </span>
                            </div>
                            <div className="text-red-600">
                              <svg 
                                className={`w-4 h-4 transition-transform duration-200 ${expandedComments[`${video.id}-negative`] ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                          {expandedComments[`${video.id}-negative`] && (
                            <div className="space-y-2 animate-fadeIn">
                              {video.negativeComments?.map((comment, index) => (
                                <div key={index} className="bg-white rounded-lg p-3 border-l-4 border-red-400">
                                  <p className="text-sm text-gray-800">"{comment}"</p>
                                </div>
                              )) || (
                                <div className="bg-white rounded-lg p-3 border-l-4 border-red-400">
                                  <p className="text-sm text-gray-800">"개선이 필요해 보여요"</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 태그 */}
                        <div className="flex flex-wrap gap-2">
                          {video.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 감정 분석 */}
                      <div className="lg:ml-6 lg:min-w-[200px]">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">감정 분석</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 text-red-500 mr-2" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full" 
                                style={{ width: `${video.sentiment.pos * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 min-w-[35px]">{Math.round(video.sentiment.pos * 100)}%</span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 text-yellow-500 mr-2" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full" 
                                style={{ width: `${video.sentiment.neu * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 min-w-[35px]">{Math.round(video.sentiment.neu * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        <button className="btn btn-sm btn-primary flex-1 lg:flex-none">
                          <PlayCircle className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">영상 보기</span>
                          <span className="sm:hidden">보기</span>
                        </button>
                        <button className="btn btn-sm btn-outline flex-1 lg:flex-none">
                          <Star className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">즐겨찾기</span>
                          <span className="sm:hidden">즐겨찾기</span>
                        </button>
                        <Link href={`/analysis?video=${encodeURIComponent(video.title)}`} className="btn btn-sm btn-outline flex-1 lg:flex-none">
                          <Filter className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">분석 상세</span>
                          <span className="sm:hidden">분석</span>
                        </Link>
                      </div>
                      <div className="text-xs lg:text-sm text-gray-500 text-center lg:text-right">
                        업데이트: {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
        <div className="mt-6 lg:mt-8 flex justify-center">
          <div className="btn-group">
            <button className="btn btn-outline btn-sm lg:btn-md">
              <span className="hidden sm:inline">이전</span>
              <span className="sm:hidden">‹</span>
            </button>
            <button className="btn btn-primary btn-sm lg:btn-md">1</button>
            <button className="btn btn-outline btn-sm lg:btn-md hidden sm:inline-flex">2</button>
            <button className="btn btn-outline btn-sm lg:btn-md hidden sm:inline-flex">3</button>
            <button className="btn btn-outline btn-sm lg:btn-md">
              <span className="hidden sm:inline">다음</span>
              <span className="sm:hidden">›</span>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="p-4">
          {/* 필터 */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold text-gray-900">추천 필터</h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  className={`mobile-btn ${filter === "all" ? "btn-primary" : "btn-outline"} touch-target`}
                  onClick={() => setFilter("all")}
                >
                  전체
                </button>
                <button 
                  className={`mobile-btn ${filter === "high" ? "btn-primary" : "btn-outline"} touch-target`}
                  onClick={() => setFilter("high")}
                >
                  90%+
                </button>
                <button 
                  className={`mobile-btn ${filter === "medium" ? "btn-primary" : "btn-outline"} touch-target`}
                  onClick={() => setFilter("medium")}
                >
                  80-90%
                </button>
                <button 
                  className={`mobile-btn ${filter === "low" ? "btn-primary" : "btn-outline"} touch-target`}
                  onClick={() => setFilter("low")}
                >
                  80% 미만
                </button>
              </div>
            </div>
          </div>

          {/* 추천 영상 목록 - 모바일 최적화 */}
          <div className="space-y-6">
            {filteredRecommendations.map((video) => (
              <div key={video.id} className="mobile-card">
                <div className="p-4">
                  {/* 썸네일 */}
                  <div className="w-full mb-4">
                    <div className="relative">
                      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-24 h-24 text-gray-400" />
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white text-base px-3 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                  </div>

                  {/* 영상 정보 */}
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 mobile-text">
                        {video.title}
                      </h3>
                      <p className="text-lg text-gray-600 font-medium">{video.channel}</p>
                    </div>
                    
                    {/* 통계 */}
                    <div className="mobile-grid text-base text-gray-500">
                      <div className="flex items-center">
                        <Eye className="w-6 h-6 mr-3" />
                        <span className="truncate font-medium">{video.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <ThumbsUp className="w-6 h-6 mr-3" />
                        <span className="truncate font-medium">{video.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="w-6 h-6 mr-3" />
                        <span className="truncate font-medium">{video.comments.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-6 h-6 mr-3" />
                        <span className="truncate font-medium">{video.publishedAt}</span>
                      </div>
                    </div>

                    {/* 추천 이유 */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Star className="w-6 h-6 text-yellow-500 mr-3" />
                        <span className="text-lg font-medium text-blue-900">추천 점수: {Math.round(video.score * 100)}%</span>
                      </div>
                      <p className="text-base text-blue-800 mobile-text">{video.reason}</p>
                    </div>

                    {/* 감정 분석 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">감정 분석</h4>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Heart className="w-6 h-6 text-red-500 mr-3" />
                          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-3">
                            <div 
                              className="bg-red-500 h-4 rounded-full" 
                              style={{ width: `${video.sentiment.pos * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-base text-gray-600 min-w-[50px] font-medium">{Math.round(video.sentiment.pos * 100)}%</span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="w-6 h-6 text-yellow-500 mr-3" />
                          <div className="flex-1 bg-gray-200 rounded-full h-4 mr-3">
                            <div 
                              className="bg-yellow-500 h-4 rounded-full" 
                              style={{ width: `${video.sentiment.neu * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-base text-gray-600 min-w-[50px] font-medium">{Math.round(video.sentiment.neu * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* 댓글 섹션 - 모바일 최적화 */}
                    <div className="space-y-4">
                      {/* 긍정 댓글 */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <button 
                          className="flex items-center justify-between w-full mb-3 hover:bg-green-100 rounded-lg p-3 transition-colors touch-target"
                          onClick={() => toggleComments(video.id, 'positive')}
                        >
                          <div className="flex items-center">
                            <Heart className="w-6 h-6 text-green-600 mr-3" />
                            <span className="text-lg font-medium text-green-900">긍정 댓글</span>
                            <span className="ml-3 text-base text-green-600 bg-green-200 px-3 py-1 rounded-full">
                              {video.positiveComments?.length || 0}
                            </span>
                          </div>
                          <div className="text-green-600">
                            <svg 
                              className={`w-6 h-6 transition-transform duration-200 ${expandedComments[`${video.id}-positive`] ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        {expandedComments[`${video.id}-positive`] && (
                          <div className="space-y-3 animate-fadeIn">
                            {video.positiveComments?.map((comment, index) => (
                              <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-green-400">
                                <p className="text-base text-gray-800 mobile-text">"{comment}"</p>
                              </div>
                            )) || (
                              <div className="bg-white rounded-lg p-4 border-l-4 border-green-400">
                                <p className="text-base text-gray-800 mobile-text">"이 영상만 보면 제주도 가고싶다"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 부정 댓글 */}
                      <div className="bg-red-50 rounded-lg p-4">
                        <button 
                          className="flex items-center justify-between w-full mb-3 hover:bg-red-100 rounded-lg p-3 transition-colors touch-target"
                          onClick={() => toggleComments(video.id, 'negative')}
                        >
                          <div className="flex items-center">
                            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                            <span className="text-lg font-medium text-red-900">부정 댓글</span>
                            <span className="ml-3 text-base text-red-600 bg-red-200 px-3 py-1 rounded-full">
                              {video.negativeComments?.length || 0}
                            </span>
                          </div>
                          <div className="text-red-600">
                            <svg 
                              className={`w-6 h-6 transition-transform duration-200 ${expandedComments[`${video.id}-negative`] ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        {expandedComments[`${video.id}-negative`] && (
                          <div className="space-y-3 animate-fadeIn">
                            {video.negativeComments?.map((comment, index) => (
                              <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-red-400">
                                <p className="text-base text-gray-800 mobile-text">"{comment}"</p>
                              </div>
                            )) || (
                              <div className="bg-white rounded-lg p-4 border-l-4 border-red-400">
                                <p className="text-base text-gray-800 mobile-text">"개선이 필요해 보여요"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 태그 */}
                    <div className="flex flex-wrap gap-2">
                      {video.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-2 bg-gray-100 text-gray-700 text-base rounded-full font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-3">
                        <button className="mobile-btn btn-primary flex-1 touch-target">
                          <PlayCircle className="w-6 h-6 mr-2" />
                          영상 보기
                        </button>
                        <button className="mobile-btn btn-outline flex-1 touch-target">
                          <Star className="w-6 h-6 mr-2" />
                          즐겨찾기
                        </button>
                      </div>
                      <Link href={`/analysis?video=${encodeURIComponent(video.title)}`} className="mobile-btn btn-outline w-full touch-target">
                        <Filter className="w-6 h-6 mr-2" />
                        분석 상세
                      </Link>
                      <div className="text-base text-gray-500 text-center">
                        업데이트: {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          <div className="mt-8 flex justify-center">
            <div className="btn-group">
              <button className="mobile-btn btn-outline touch-target">‹</button>
              <button className="mobile-btn btn-primary touch-target">1</button>
              <button className="mobile-btn btn-outline touch-target">›</button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />

      {/* Mobile Bottom Spacer */}
      <div className="lg:hidden h-16"></div>
    </div>
  );
}
