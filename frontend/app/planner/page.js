"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Search, Filter, MapPin, Users, Heart, Star, TrendingUp, Clock, Eye, ThumbsUp, MessageSquare, Share2, Bookmark, BarChart3, Brain, Plus, X, Save, Download, Plane, Hotel, Utensils, Camera, Home } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";

export default function PlannerPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tripPlan, setTripPlan] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: 0,
    companions: [],
    interests: []
  });
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

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

  // 데모 장소 데이터
  const demoPlaces = [
    {
      id: 1,
      name: "제주도 성산일출봉",
      type: "관광지",
      category: "자연",
      time: "2-3시간",
      cost: "무료",
      rating: 4.8,
      image: "/api/placeholder/200/150",
      description: "제주도에서 가장 아름다운 일출을 볼 수 있는 곳"
    },
    {
      id: 2,
      name: "제주도 흑돼지 거리",
      type: "맛집",
      category: "음식",
      time: "1-2시간",
      cost: "30,000원",
      rating: 4.5,
      image: "/api/placeholder/200/150",
      description: "제주도 대표 음식 흑돼지를 맛볼 수 있는 거리"
    },
    {
      id: 3,
      name: "제주도 카페 거리",
      type: "카페",
      category: "휴식",
      time: "1시간",
      cost: "10,000원",
      rating: 4.6,
      image: "/api/placeholder/200/150",
      description: "제주도 특색 있는 카페들을 즐길 수 있는 거리"
    }
  ];

  // 장소 추가
  const addPlace = (place) => {
    if (!selectedPlaces.find(p => p.id === place.id)) {
      setSelectedPlaces([...selectedPlaces, place]);
    }
  };

  // 장소 제거
  const removePlace = (placeId) => {
    setSelectedPlaces(selectedPlaces.filter(p => p.id !== placeId));
  };

  // 여행 계획 생성
  const generatePlan = () => {
    // AI 기반 여행 계획 생성 로직
    console.log("여행 계획 생성:", tripPlan);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">여행 계획 페이지를 불러오는 중...</p>
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
      <SidebarNav active="/planner" />

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">여행 계획</h1>
            <p className="text-gray-600">일정·예산·루트 초안 생성, 영상/POI 드래그 앤 드롭</p>
          </div>

          {/* Trip Planning Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">여행 정보 입력</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 목적지 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">목적지</label>
                <input
                  type="text"
                  value={tripPlan.destination}
                  onChange={(e) => setTripPlan({...tripPlan, destination: e.target.value})}
                  placeholder="예: 제주도"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 여행 기간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">여행 기간</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={tripPlan.startDate}
                    onChange={(e) => setTripPlan({...tripPlan, startDate: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={tripPlan.endDate}
                    onChange={(e) => setTripPlan({...tripPlan, endDate: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 예산 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">예산 (원)</label>
                <input
                  type="number"
                  value={tripPlan.budget}
                  onChange={(e) => setTripPlan({...tripPlan, budget: parseInt(e.target.value)})}
                  placeholder="예: 500000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 동행자 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">동행자</label>
                <select
                  multiple
                  value={tripPlan.companions}
                  onChange={(e) => setTripPlan({...tripPlan, companions: Array.from(e.target.selectedOptions, option => option.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="혼자">혼자</option>
                  <option value="커플">커플</option>
                  <option value="가족">가족</option>
                  <option value="친구">친구</option>
                  <option value="단체">단체</option>
                </select>
              </div>
            </div>

            {/* 관심사 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">관심사</label>
              <div className="flex flex-wrap gap-2">
                {['힐링', '맛집', '사진', '액티비티', '문화', '자연', '쇼핑', '야경'].map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      const newInterests = tripPlan.interests.includes(interest)
                        ? tripPlan.interests.filter(i => i !== interest)
                        : [...tripPlan.interests, interest];
                      setTripPlan({...tripPlan, interests: newInterests});
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      tripPlan.interests.includes(interest)
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            {/* 계획 생성 버튼 */}
            <div className="mt-6 text-center">
              <button
                onClick={generatePlan}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Brain className="w-5 h-5 inline mr-2" />
                AI 여행 계획 생성
              </button>
            </div>
          </div>

          {/* Suggested Places */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">추천 장소</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demoPlaces.map((place) => (
                <div key={place.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{place.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{place.type} · {place.category}</p>
                      <p className="text-xs text-gray-500 mb-2">{place.description}</p>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{place.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{place.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 font-medium">{place.cost}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => addPlace(place)}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Plus className="w-4 h-4 inline mr-1" />
                          추가
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

          {/* Selected Places */}
          {selectedPlaces.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">선택된 장소</h2>
              <div className="space-y-3">
                {selectedPlaces.map((place) => (
                  <div key={place.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">{place.name}</h3>
                        <p className="text-sm text-gray-600">{place.type} · {place.time} · {place.cost}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removePlace(place.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Save Plan */}
              <div className="mt-6 flex gap-4">
                <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  <Save className="w-4 h-4" />
                  계획 저장
                </button>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  내보내기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
