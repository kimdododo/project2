"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Search, Filter, MapPin, Users, Calendar, Star, TrendingUp, Clock, Eye, ThumbsUp, MessageSquare, Share2, Bookmark, BarChart3, Brain, Bell, Settings, User, Target, Home } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";

export default function TastePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('profile');
  const [tasteProfile, setTasteProfile] = useState({
    preferences: {
      travelStyle: ['힐링', '맛집'],
      season: ['봄', '가을'],
      duration: ['2박3일', '3박4일'],
      companion: ['커플', '친구']
    },
    behavior: {
      watchTime: '저녁',
      favoriteChannels: ['제주여행TV', '부산맛집탐방'],
      avgWatchDuration: '15분',
      mostWatchedCategory: '여행'
    },
    interests: {
      topics: ['자연', '맛집', '힐링', '사진'],
      regions: ['제주도', '부산', '강릉'],
      activities: ['카페투어', '맛집탐방', '힐링여행']
    }
  });

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

  // 데모 시청 리포트 데이터
  const watchReport = {
    totalWatchTime: '45시간 30분',
    favoriteChannels: [
      { name: '제주여행TV', watchTime: '12시간', videos: 45 },
      { name: '부산맛집탐방', watchTime: '8시간', videos: 32 },
      { name: '강릉힐링', watchTime: '6시간', videos: 28 }
    ],
    topCategories: [
      { name: '여행', percentage: 45, color: 'bg-blue-500' },
      { name: '맛집', percentage: 30, color: 'bg-green-500' },
      { name: '힐링', percentage: 25, color: 'bg-purple-500' }
    ],
    monthlyTrend: [
      { month: '1월', watchTime: 8.5 },
      { month: '2월', watchTime: 12.3 },
      { month: '3월', watchTime: 15.7 },
      { month: '4월', watchTime: 18.2 }
    ]
  };

  // 데모 북마크 데이터
  const bookmarks = [
    {
      id: 1,
      title: "제주도 3박4일 완벽 여행코스",
      channel: "제주여행TV",
      thumbnail: "/api/placeholder/200/150",
      savedAt: "2024-01-15",
      tags: ["제주도", "힐링", "3박4일"]
    },
    {
      id: 2,
      title: "부산 맛집 투어 - 가성비 최고!",
      channel: "부산맛집탐방",
      thumbnail: "/api/placeholder/200/150",
      savedAt: "2024-01-12",
      tags: ["부산", "맛집", "가성비"]
    },
    {
      id: 3,
      title: "강릉 포토스팟 완벽 가이드",
      channel: "강릉포토",
      thumbnail: "/api/placeholder/200/150",
      savedAt: "2024-01-10",
      tags: ["강릉", "사진", "포토스팟"]
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">내 취향 페이지를 불러오는 중...</p>
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
      {/* Sidebar - unified */}
      <SidebarNav active="/taste" />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">내 취향</h1>
            <p className="text-gray-600">취향 프로파일, 시청기반 리포트, 북마크</p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedTab('profile')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'profile'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                취향 프로파일
              </button>
              <button
                onClick={() => setSelectedTab('report')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'report'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                시청 리포트
              </button>
              <button
                onClick={() => setSelectedTab('bookmarks')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'bookmarks'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bookmark className="w-4 h-4 inline mr-2" />
                북마크
              </button>
              <button
                onClick={() => setSelectedTab('alerts')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'alerts'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bell className="w-4 h-4 inline mr-2" />
                알림
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {selectedTab === 'profile' && (
            <div className="space-y-8">
              {/* 취향 프로파일 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">취향 프로파일</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 여행 스타일 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">여행 스타일</h3>
                    <div className="flex flex-wrap gap-2">
                      {tasteProfile.preferences.travelStyle.map((style) => (
                        <span key={style} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 선호 시즌 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">선호 시즌</h3>
                    <div className="flex flex-wrap gap-2">
                      {tasteProfile.preferences.season.map((season) => (
                        <span key={season} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                          {season}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 체류 기간 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">체류 기간</h3>
                    <div className="flex flex-wrap gap-2">
                      {tasteProfile.preferences.duration.map((duration) => (
                        <span key={duration} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                          {duration}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 동행자 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">동행자</h3>
                    <div className="flex flex-wrap gap-2">
                      {tasteProfile.preferences.companion.map((companion) => (
                        <span key={companion} className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                          {companion}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 관심사 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">관심사</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* 관심 주제 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">관심 주제</h3>
                    <div className="flex flex-wrap gap-2">
                      {tasteProfile.interests.topics.map((topic) => (
                        <span key={topic} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          #{topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 관심 지역 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">관심 지역</h3>
                    <div className="flex flex-wrap gap-2">
                      {tasteProfile.interests.regions.map((region) => (
                        <span key={region} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {region}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 관심 활동 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">관심 활동</h3>
                    <div className="flex flex-wrap gap-2">
                      {tasteProfile.interests.activities.map((activity) => (
                        <span key={activity} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'report' && (
            <div className="space-y-8">
              {/* 시청 통계 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">시청 통계</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{watchReport.totalWatchTime}</div>
                    <div className="text-sm text-gray-600">총 시청 시간</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">3</div>
                    <div className="text-sm text-gray-600">선호 채널</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">105</div>
                    <div className="text-sm text-gray-600">시청 영상</div>
                  </div>
                </div>

                {/* 카테고리 분포 */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">카테고리 분포</h3>
                  <div className="space-y-3">
                    {watchReport.topCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{category.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${category.color}`}
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{category.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 선호 채널 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">선호 채널</h2>
                <div className="space-y-4">
                  {watchReport.favoriteChannels.map((channel, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{channel.name}</h3>
                          <p className="text-sm text-gray-600">{channel.videos}개 영상</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{channel.watchTime}</div>
                        <div className="text-xs text-gray-500">시청 시간</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'bookmarks' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">북마크</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Bookmark className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{bookmark.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{bookmark.channel}</p>
                        <p className="text-xs text-gray-500 mb-3">저장일: {bookmark.savedAt}</p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {bookmark.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            <Eye className="w-4 h-4 inline mr-1" />
                            보기
                          </button>
                          <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'alerts' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">알림 설정</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">테마 신규 트렌드</h3>
                    <p className="text-sm text-gray-600">관심 주제의 새로운 트렌드 알림</p>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">새로운 추천</h3>
                    <p className="text-sm text-gray-600">맞춤형 추천 콘텐츠 알림</p>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">북마크 업데이트</h3>
                    <p className="text-sm text-gray-600">저장한 콘텐츠의 업데이트 알림</p>
                  </div>
                  <input type="checkbox" className="toggle toggle-primary" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
