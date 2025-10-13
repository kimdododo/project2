"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Download, 
  Trash2,
  Save,
  Users,
  BarChart3,
  Search,
  TrendingUp,
  Brain,
  MapPin,
  Calendar,
  Heart,
  MessageSquare,
  Home
} from "lucide-react";
export default function Settings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    darkMode: false,
    language: 'ko',
    autoRefresh: true,
    // 개인화 추천 설정
    emotionSettings: {
      positiveTone: true,
      neutralTone: false,
      calmTone: false
    },
    intentSettings: {
      '힐링': false,
      '가성비': false,
      '사진 명소': false,
      '맛집': false,
      '액티비티': false,
      '문화체험': false,
      '자연': false,
      '도시': false
    },
    segmentSettings: {
      ageAnalysis: true,
      regionAnalysis: true,
      topicAnalysis: true
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
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-gray-600">로그인이 필요합니다...</p>
          <button 
            onClick={() => window.location.href = '/signin'}
            className="btn btn-primary mt-4"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    setIsLoading(true);
    // TODO: 실제 설정 저장 로직
    setTimeout(() => {
      setIsLoading(false);
      alert('설정이 저장되었습니다.');
    }, 1000);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/signin';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-sky-600">Yotuberabo</h2>
              <p className="text-sm text-gray-500">설정</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <Link 
              href="/" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Home className="w-5 h-5" />
              홈
            </Link>
            <Link 
              href="/recommendations" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Users className="w-5 h-5" />
              채널 추천
            </Link>
            <Link 
              href="/analysis" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <TrendingUp className="w-5 h-5" />
              채널 분석
            </Link>
            <Link 
              href="/personalization" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Brain className="w-5 h-5" />
              개인화 추천
            </Link>
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <BarChart3 className="w-5 h-5" />
              대시보드
            </Link>
            <Link 
              href="/map" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <MapPin className="w-5 h-5" />
              지도
            </Link>
            <Link 
              href="/planner" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Calendar className="w-5 h-5" />
              여행 계획
            </Link>
            <Link 
              href="/taste" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <Heart className="w-5 h-5" />
              내 취향
            </Link>
            <Link 
              href="/qa" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              <MessageSquare className="w-5 h-5" />
              여행 Q&A
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200"
            >
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
      <div className="flex-1 p-8">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">설정</h1>
            <p className="text-gray-600">계정 및 애플리케이션 설정을 관리하세요.</p>
          </div>

          <div className="space-y-8">
            {/* 개인화 추천 설정 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">개인화 추천 설정</h2>
              </div>
              <div className="space-y-6">
                {/* 감정 기반 추천 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">감정 기반 추천</h3>
                  <p className="text-sm text-gray-600 mb-4">댓글 감정분석을 통한 여행지·영상 톤 분석</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        id="positive-tone"
                        className="checkbox checkbox-primary" 
                        checked={settings.emotionSettings.positiveTone}
                        onChange={(e) => setSettings({
                          ...settings, 
                          emotionSettings: {...settings.emotionSettings, positiveTone: e.target.checked}
                        })}
                      />
                      <label htmlFor="positive-tone" className="text-sm font-medium text-gray-700">
                        긍정적 분위기
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        id="neutral-tone"
                        className="checkbox checkbox-primary" 
                        checked={settings.emotionSettings.neutralTone}
                        onChange={(e) => setSettings({
                          ...settings, 
                          emotionSettings: {...settings.emotionSettings, neutralTone: e.target.checked}
                        })}
                      />
                      <label htmlFor="neutral-tone" className="text-sm font-medium text-gray-700">
                        중립적 분위기
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="checkbox" 
                        id="calm-tone"
                        className="checkbox checkbox-primary" 
                        checked={settings.emotionSettings.calmTone}
                        onChange={(e) => setSettings({
                          ...settings, 
                          emotionSettings: {...settings.emotionSettings, calmTone: e.target.checked}
                        })}
                      />
                      <label htmlFor="calm-tone" className="text-sm font-medium text-gray-700">
                        조용한 여행
                      </label>
                    </div>
                  </div>
                </div>

                {/* 의도 기반 탐색 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">의도 기반 탐색</h3>
                  <p className="text-sm text-gray-600 mb-4">키워드 의도 파악으로 맞춤형 여행 추천</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['힐링', '가성비', '사진 명소', '맛집', '액티비티', '문화체험', '자연', '도시'].map((intent) => (
                      <div key={intent} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`intent-${intent}`}
                          className="checkbox checkbox-sm checkbox-primary" 
                          checked={settings.intentSettings[intent] || false}
                          onChange={(e) => setSettings({
                            ...settings, 
                            intentSettings: {...settings.intentSettings, [intent]: e.target.checked}
                          })}
                        />
                        <label htmlFor={`intent-${intent}`} className="text-sm text-gray-700">
                          {intent}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 시청자 세그먼트 분석 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">시청자 세그먼트 분석</h3>
                  <p className="text-sm text-gray-600 mb-4">연령·지역별 시청 패턴 및 관심 주제 분석</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">연령대별 분석</h4>
                        <p className="text-sm text-gray-500">나이대별 선호 여행 스타일 분석</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="toggle toggle-primary" 
                        checked={settings.segmentSettings.ageAnalysis}
                        onChange={(e) => setSettings({
                          ...settings, 
                          segmentSettings: {...settings.segmentSettings, ageAnalysis: e.target.checked}
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">지역별 분석</h4>
                        <p className="text-sm text-gray-500">지역별 인기 여행지 및 관심사 분석</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="toggle toggle-primary" 
                        checked={settings.segmentSettings.regionAnalysis}
                        onChange={(e) => setSettings({
                          ...settings, 
                          segmentSettings: {...settings.segmentSettings, regionAnalysis: e.target.checked}
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">관심 주제 분석</h4>
                        <p className="text-sm text-gray-500">'혼자 여행', '부모님과 여행' 등 주제별 분석</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="toggle toggle-primary" 
                        checked={settings.segmentSettings.topicAnalysis}
                        onChange={(e) => setSettings({
                          ...settings, 
                          segmentSettings: {...settings.segmentSettings, topicAnalysis: e.target.checked}
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 알림 설정 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">알림 설정</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">푸시 알림</h3>
                    <p className="text-sm text-gray-500">새로운 추천이나 업데이트 알림을 받습니다.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settings.notifications}
                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">이메일 업데이트</h3>
                    <p className="text-sm text-gray-500">주요 업데이트를 이메일로 받습니다.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settings.emailUpdates}
                    onChange={(e) => setSettings({...settings, emailUpdates: e.target.checked})}
                  />
                </div>
              </div>
            </div>

            {/* 외관 설정 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">외관 설정</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">다크 모드</h3>
                    <p className="text-sm text-gray-500">어두운 테마를 사용합니다.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settings.darkMode}
                    onChange={(e) => setSettings({...settings, darkMode: e.target.checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">언어</h3>
                    <p className="text-sm text-gray-500">애플리케이션 언어를 선택하세요.</p>
                  </div>
                  <select 
                    className="select select-bordered w-32"
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 데이터 설정 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <Download className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">데이터 관리</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">자동 새로고침</h3>
                    <p className="text-sm text-gray-500">데이터를 자동으로 새로고침합니다.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={settings.autoRefresh}
                    onChange={(e) => setSettings({...settings, autoRefresh: e.target.checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">데이터 내보내기</h3>
                    <p className="text-sm text-gray-500">분석 데이터를 다운로드합니다.</p>
                  </div>
                  <button className="btn btn-outline btn-sm">
                    <Download className="w-4 h-4 mr-2" />
                    내보내기
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">데이터 삭제</h3>
                    <p className="text-sm text-gray-500">모든 분석 데이터를 삭제합니다.</p>
                  </div>
                  <button className="btn btn-error btn-sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제
                  </button>
                </div>
              </div>
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end">
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="btn btn-primary btn-lg"
              >
                {isLoading ? (
                  <>
                    <div className="loading loading-spinner loading-sm mr-2"></div>
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    설정 저장
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
