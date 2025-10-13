"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Heart,
  Star,
  TrendingUp,
  Clock,
  Eye,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  BarChart3,
  Brain,
  Map,
  Layers,
  Sliders
} from "lucide-react";

export default function MapPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapView, setMapView] = useState('clusters'); // clusters, heatmap, timeline
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [timeRange, setTimeRange] = useState([0, 100]);

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

  // 데모 POI 데이터
  const demoPOIs = [
    {
      id: 1,
      name: "제주도 성산일출봉",
      type: "자연",
      coordinates: [33.4584, 126.9426],
      popularity: 95,
      videos: 45,
      avgRating: 4.8,
      tags: ["힐링", "자연", "일출"],
      thumbnail: "/api/placeholder/200/150"
    },
    {
      id: 2,
      name: "부산 감천문화마을",
      type: "문화",
      coordinates: [35.0972, 129.0103],
      popularity: 88,
      videos: 32,
      avgRating: 4.6,
      tags: ["문화", "사진", "예술"],
      thumbnail: "/api/placeholder/200/150"
    },
    {
      id: 3,
      name: "강릉 커피거리",
      type: "맛집",
      coordinates: [37.7519, 128.8761],
      popularity: 82,
      videos: 28,
      avgRating: 4.4,
      tags: ["맛집", "카페", "힐링"],
      thumbnail: "/api/placeholder/200/150"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">지도 페이지를 불러오는 중...</p>
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
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-sky-600">Yotuberabo</h2>
              <p className="text-sm text-gray-500">지도</p>
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
            <Link href="/map" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
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
        <div className="max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">지도</h1>
            <p className="text-gray-600">장소 클러스터, 인기 히트맵, 기간 슬라이더</p>
          </div>

          {/* Map Controls */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">지도 컨트롤</h2>
            
            {/* View Options */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">보기 옵션</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setMapView('clusters')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    mapView === 'clusters'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Layers className="w-4 h-4 inline mr-2" />
                  클러스터
                </button>
                <button
                  onClick={() => setMapView('heatmap')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    mapView === 'heatmap'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Map className="w-4 h-4 inline mr-2" />
                  히트맵
                </button>
                <button
                  onClick={() => setMapView('timeline')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    mapView === 'timeline'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-2" />
                  타임라인
                </button>
              </div>
            </div>

            {/* Time Range Slider */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">기간 슬라이더</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">2023년 1월</span>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={timeRange[0]}
                    onChange={(e) => setTimeRange([parseInt(e.target.value), timeRange[1]])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <span className="text-sm text-gray-500">2024년 12월</span>
              </div>
            </div>
          </div>

          {/* Map Container */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">지도</h2>
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">지도 컴포넌트</p>
                <p className="text-sm text-gray-400">Google Maps 또는 Leaflet 연동</p>
              </div>
            </div>
          </div>

          {/* POI List */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">관심 장소</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoPOIs.map((poi) => (
                <div key={poi.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{poi.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{poi.type}</p>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{poi.avgRating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span>{poi.popularity}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span>{poi.videos}개 영상</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {poi.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                          <MapPin className="w-4 h-4 inline mr-1" />
                          위치보기
                        </button>
                        <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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
