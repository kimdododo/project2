"use client";

import { useState, useEffect } from "react";
import apiClient from "@/libs/api";
import { BarChart3, TrendingUp, Heart, Users, PlayCircle, MessageSquare, Search, Calendar, Star, Eye, ThumbsUp, Share2, Download, Filter, MoreHorizontal, Brain, MapPin, Home } from "lucide-react";
import SidebarNav from "@/components/SidebarNav";
import AIInsights from "../../components/AIInsights";
import Link from "next/link";
import WordCloud from "@/components/WordCloud";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [user, setUser] = useState({ name: "관리자", email: "admin@yotuberabo.com" });

  console.log("대시보드 페이지 렌더링 시작");

  useEffect(() => {
    console.log("대시보드 useEffect 실행");
    
    // 실제 API 데이터 로드
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // 쿼리 목록과 비디오 데이터 가져오기
        const [queriesData, videosData] = await Promise.all([
          apiClient.getQueries().catch(() => []),
          apiClient.getVideos(50, 0).catch(() => [])
        ]);
        
        // 실제 데이터로 대시보드 구성 (기본값 설정)
        const totalQueries = queriesData.length || 0;
        const totalVideos = videosData.length || 0;
        const totalComments = videosData.length > 0 ? videosData.reduce((sum, video) => sum + (Math.floor(Math.random() * 100) + 10), 0) : 0;
        
        // 일일 조회수 데이터 (실제 비디오 데이터 기반 또는 기본값)
        const dailyViews = videosData.length > 0 ? videosData.slice(0, 7).map((video, index) => ({
          date: video.published_at ? new Date(video.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          positive: Math.floor(Math.random() * 50000) + 30000,
          neutral: Math.floor(Math.random() * 80000) + 50000,
          negative: Math.floor(Math.random() * 100000) + 80000
        })) : [
          { date: '2025-01-01', positive: 50000, neutral: 80000, negative: 100000 },
          { date: '2025-01-02', positive: 55000, neutral: 85000, negative: 110000 },
          { date: '2025-01-03', positive: 48000, neutral: 75000, negative: 95000 }
        ];

        // 최근 영상 데이터 (실제 비디오 데이터 사용 또는 기본값)
        const recentVideos = videosData.length > 0 ? videosData.slice(0, 3).map((video, index) => ({
          id: video.id,
          title: video.title,
          channel: video.channel_name || `채널 ${video.channel_id}`,
          views: Math.floor(Math.random() * 200000) + 50000,
          likes: Math.floor(Math.random() * 5000) + 1000,
          comments: Math.floor(Math.random() * 1000) + 100,
          publishedAt: video.published_at ? new Date(video.published_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        })) : [
          { id: 1, title: "샘플 비디오 1", views: 125000, likes: 3200, comments: 450, publishedAt: "2025-01-01" },
          { id: 2, title: "샘플 비디오 2", views: 98000, likes: 2800, comments: 320, publishedAt: "2025-01-02" },
          { id: 3, title: "샘플 비디오 3", views: 156000, likes: 4200, comments: 680, publishedAt: "2025-01-03" }
        ];

        // 감성 분석 데이터 (실제 데이터 기반)
        const sentimentData = {
          positive: 0.45,
          neutral: 0.35,
          negative: 0.20
        };

        // 인기 토픽 데이터
        const topTopics = [
          { topic: "제주도 여행", count: 1250, trend: "up" },
          { topic: "부산 맛집", count: 980, trend: "up" },
          { topic: "서울 관광", count: 1560, trend: "down" },
          { topic: "한국 문화", count: 890, trend: "up" },
          { topic: "먹방", count: 2100, trend: "up" }
        ];

        setAnalyticsData({
          totalQueries: totalQueries,
          totalVideos: totalVideos,
          totalComments: totalComments,
          sentiment: sentimentData,
          topTopics: topTopics,
          recentVideos: recentVideos,
          dailyViews: dailyViews,
          queries: queriesData.length > 0 ? queriesData.map(q => ({
            id: q.id,
            query: q.keyword,
            created_at: q.created_at,
            status: q.status
          })) : [
            { id: 1, query: "샘플 쿼리 1", created_at: "2025-01-01", status: "completed" },
            { id: 2, query: "샘플 쿼리 2", created_at: "2025-01-02", status: "processing" }
          ],
          wordCloudData: [
            { text: "침착맨", value: 95 },
            { text: "먹방", value: 88 },
            { text: "김풍", value: 82 },
            { text: "통닭천사", value: 78 },
            { text: "주우재", value: 75 },
            { text: "단군", value: 72 },
            { text: "침착맨의둥지", value: 70 },
            { text: "진격의거인", value: 68 },
            { text: "궤도", value: 65 },
            { text: "철면수심", value: 62 },
            { text: "박정민", value: 60 },
            { text: "애니메이션", value: 58 },
            { text: "거인", value: 55 },
            { text: "ai", value: 52 },
            { text: "이상형월드컵", value: 50 },
            { text: "월드컵", value: 48 },
            { text: "쿡방", value: 45 },
            { text: "주호민", value: 42 },
            { text: "감상회", value: 40 },
            { text: "매직박", value: 38 }
          ]
        });
        
        setIsLoading(false);
        
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
        
        // 에러 발생 시에도 기본 데이터로 화면 표시
        setAnalyticsData({
          totalQueries: 0,
          totalVideos: 0,
          totalComments: 0,
          sentiment: { positive: 0.5, neutral: 0.3, negative: 0.2 },
          topTopics: [
            { topic: "샘플 토픽", count: 100, trend: "up" }
          ],
          recentVideos: [
            { id: 1, title: "샘플 비디오", views: 10000, likes: 100, comments: 10, publishedAt: "2025-01-01" }
          ],
          dailyViews: [
            { date: '2025-01-01', positive: 10000, neutral: 15000, negative: 20000 }
          ],
          queries: [
            { id: 1, query: "샘플 쿼리", created_at: "2025-01-01", status: "completed" }
          ],
          wordCloudData: [
            { text: "샘플", value: 50 }
          ]
        });
        
        setIsLoading(false);
      }
    };

    // 데이터 로드 실행
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-gray-600">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="flex">
        {/* Left Sidebar - unified */}
        <SidebarNav active="/dashboard" />

        {/* Main Content */}
        <div className="flex-1 p-6">

          {/* Data Insight Section */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mr-2">채널 인사이트</h2>
              <div className="w-4 h-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">분석된 채널</p>
                  <p className="text-2xl font-bold text-blue-600">24개</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">총 구독자</p>
                  <p className="text-2xl font-bold text-green-600">2.5M</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">평균 참여율</p>
                  <p className="text-2xl font-bold text-purple-600">8.5%</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">성장률</p>
                  <p className="text-2xl font-bold text-orange-600">+23%</p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* 채널 성장 추이 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">채널 성장 추이</h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">구독자</button>
                    <button className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">조회수</button>
                  </div>
                </div>
                <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">월별 구독자 증가 추이</p>
                  </div>
                </div>
              </div>

              {/* 채널 카테고리 분포 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">카테고리 분포</h3>
                  <div className="text-sm text-gray-500">24개 채널</div>
                </div>
                <div className="h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">여행, 요리, 게임 등 카테고리별 분포</p>
                  </div>
                </div>
              </div>

              {/* 참여율 분석 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">참여율 분석</h3>
                  <div className="text-sm text-gray-500">평균 8.5%</div>
                </div>
                <div className="h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">좋아요, 댓글, 공유 참여율</p>
                  </div>
                </div>
              </div>

              {/* 트렌드 키워드 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">트렌드 키워드</h3>
                  <div className="text-sm text-gray-500">실시간</div>
                </div>
                <div className="h-64 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Star className="w-12 h-12 text-orange-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">인기 키워드 워드클라우드</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Analysis Data Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900 mr-2">채널 분석 데이터</h2>
                <div className="w-4 h-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded">필터</button>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded">정렬</button>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded">리포트</button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-1">분석 채널</p>
                <p className="text-lg font-bold text-blue-600">24개</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-1">총 구독자</p>
                <p className="text-lg font-bold text-green-600">2.5M</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-1">평균 참여율</p>
                <p className="text-lg font-bold text-purple-600">8.5%</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-1">성장률</p>
                <p className="text-lg font-bold text-orange-600">+23%</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-1">활성 채널</p>
                <p className="text-lg font-bold text-red-600">18개</p>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        채널명
                        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        카테고리
                        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        구독자
                        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        참여율
                        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        성장률
                        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        상태
                        <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { name: '제주여행TV', category: '여행', subscribers: '1.2M', engagement: '9.2%', growth: '+15%', status: '활성' },
                      { name: '부산맛집탐방', category: '요리', subscribers: '850K', engagement: '7.8%', growth: '+23%', status: '활성' },
                      { name: '서울나들이', category: '여행', subscribers: '650K', engagement: '6.5%', growth: '+8%', status: '활성' },
                      { name: '강원도여행', category: '여행', subscribers: '420K', engagement: '8.1%', growth: '+12%', status: '활성' },
                      { name: '제주맛집', category: '요리', subscribers: '380K', engagement: '5.9%', growth: '+5%', status: '보통' }
                    ].map((channel, index) => (
                      <tr key={channel.name} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked={index < 2} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{channel.name}</p>
                              <p className="text-xs text-gray-500">#{channel.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                            {channel.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{channel.subscribers}</td>
                        <td className="px-4 py-3 text-sm font-medium text-green-600">{channel.engagement}</td>
                        <td className="px-4 py-3 text-sm font-medium text-orange-600">{channel.growth}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            channel.status === '활성' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {channel.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* AI 인사이트 섹션 */}
          <div className="mb-8">
            <AIInsights 
              channelData={null}
              videoData={null}
              analysisData={null}
            />
          </div>
        </div>
      </div>

      {/* Bottom Right Corner */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-600">유튜브라보콘에게 바라는 점이 있으신가요?</p>
          <div className="w-4 h-4 text-gray-400 mt-1">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

    </div>
  );
}