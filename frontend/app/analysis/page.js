"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import apiClient from "@/libs/api";
import { 
  Search, 
  BarChart3, 
  TrendingUp, 
  Users, 
  PlayCircle, 
  MessageSquare,
  Heart,
  Eye,
  ThumbsUp,
  Calendar,
  Filter,
  Download,
  Share2,
  Star,
  Brain,
  MapPin,
  Home
} from "lucide-react";
import AIInsights from "../../components/AIInsights";
export default function ChannelAnalysis() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

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
    console.log('분석 페이지 - 사용자 정보 로드됨:', userData);
  }, []);

  // URL 파라미터 처리
  useEffect(() => {
    const videoTitle = searchParams.get('video');
    if (videoTitle) {
      setSelectedVideo(videoTitle);
      setSearchQuery(videoTitle);
      // 해당 영상의 분석 데이터 로드
      loadVideoAnalysis(videoTitle);
    }
  }, [searchParams]);

  const loadVideoAnalysis = async (videoTitle) => {
    setIsLoading(true);
    try {
      // 영상 분석 데이터 로드 (데모 데이터)
      const videoAnalysisData = {
        title: videoTitle,
        channel: "제주여행TV",
        views: 125000,
        likes: 3200,
        comments: 450,
        publishedAt: "2024-01-15",
        sentiment: {
          positive: 85,
          neutral: 10,
          negative: 5
        },
        keywords: ["제주도", "여행코스", "3박4일", "맛집", "관광지"],
        recommendationScore: 95,
        analysisDetails: {
          engagement: 92,
          trendScore: 88,
          keywordMatch: 95,
          sentimentScore: 85
        }
      };
      
      setAnalysisData(videoAnalysisData);
      setSelectedChannel(videoAnalysisData.channel);
    } catch (error) {
      console.error('영상 분석 데이터 로드 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      // 실제 API 호출로 YouTube 데이터 수집 시작
      const response = await apiClient.startDataCollection(searchQuery);
      const queryId = response.query_id;
      
      // 데이터 수집이 완료될 때까지 폴링
      const pollForData = async () => {
        try {
          const summaryData = await apiClient.getSummary(queryId);
          
          if (summaryData && summaryData.videos > 0) {
            // 실제 데이터로 채널 정보 설정
            setSelectedChannel({
              id: `query_${queryId}`,
              name: `${searchQuery} 관련 채널`,
              subscribers: summaryData.videos * 1000, // 추정값
              totalViews: summaryData.videos * 50000, // 추정값
              videoCount: summaryData.videos,
              joinDate: new Date().toISOString().split('T')[0],
              description: `${searchQuery} 키워드로 수집된 데이터 분석 결과입니다.`,
              avatar: "/api/placeholder/100/100"
            });
            
            // 실제 분석 데이터 설정
            setAnalysisData({
              sentiment: summaryData.sentiment || { pos: 0.5, neu: 0.3, neg: 0.2 },
              topKeywords: summaryData.topics?.map(topic => ({
                keyword: topic.label,
                count: Math.round(topic.ratio * 100),
                trend: "up"
              })) || [],
              performance: {
                avgViews: summaryData.videos * 1000,
                avgLikes: summaryData.videos * 50,
                avgComments: summaryData.comments || 0,
                engagementRate: 0.032
              },
              recentVideos: [], // 비디오 목록은 별도 API로 가져올 수 있음
              competitors: []
            });
            
            setIsLoading(false);
          } else {
            // 아직 데이터가 준비되지 않았으면 3초 후 다시 시도
            setTimeout(pollForData, 3000);
          }
        } catch (error) {
          console.error('데이터 조회 실패:', error);
          setIsLoading(false);
          toast.error('데이터 조회에 실패했습니다.');
        }
      };
      
      // 첫 번째 폴링 시작
      setTimeout(pollForData, 2000);
      
    } catch (error) {
      console.error('검색 실패:', error);
      setIsLoading(false);
      toast.error('검색에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-sky-600">Yotuberabo</h2>
              <p className="text-sm text-gray-500">채널 분석</p>
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
            <Link href="/analysis" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">채널 분석 & AI 인사이트</h1>
                <p className="text-gray-600">YouTube 채널의 상세 분석 및 AI 기반 인사이트</p>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-outline btn-sm">
                  <Download className="w-4 h-4 mr-2" />
                  리포트 다운로드
                </button>
                <button className="btn btn-primary btn-sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  공유하기
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
        {/* 검색 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">채널 검색</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="YouTube 채널명 또는 URL을 입력하세요"
                className="input input-bordered w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button 
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="loading loading-spinner loading-sm"></div>
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              분석 시작
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="loading loading-spinner loading-lg mb-4"></div>
            <p className="text-gray-600">채널 데이터를 분석하고 있습니다...</p>
          </div>
        )}

        {selectedVideo && analysisData && (
          <>
            {/* 영상 분석 결과 */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">영상 분석 결과</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 영상 기본 정보 */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{analysisData.title}</h4>
                    <p className="text-gray-600">채널: {analysisData.channel}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">조회수</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{analysisData.views.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">좋아요</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{analysisData.likes.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">댓글</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{analysisData.comments.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">업로드</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{analysisData.publishedAt}</p>
                    </div>
                  </div>
                </div>

                {/* 감정 분석 및 추천 점수 */}
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">추천 점수: {analysisData.recommendationScore}%</span>
                    </div>
                    <p className="text-sm text-blue-700">높은 감정 점수와 인기 키워드 매칭</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">긍정적 감정</span>
                        <span className="text-sm font-semibold text-gray-900">{analysisData.sentiment.positive}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: `${analysisData.sentiment.positive}%`}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">트렌드 점수</span>
                        <span className="text-sm font-semibold text-gray-900">{analysisData.analysisDetails.trendScore}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${analysisData.analysisDetails.trendScore}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 키워드 태그 */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">관련 키워드</h4>
                <div className="flex flex-wrap gap-2">
                  {(analysisData?.keywords || []).map((keyword, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      #{keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="mt-6 flex gap-3">
                <button className="btn btn-primary">
                  <PlayCircle className="w-4 h-4 mr-2" />
                  영상 보기
                </button>
                <button className="btn btn-outline">
                  <Star className="w-4 h-4 mr-2" />
                  즐겨찾기
                </button>
                <button className="btn btn-outline">
                  <Filter className="w-4 h-4 mr-2" />
                  상세 분석
                </button>
              </div>
            </div>
          </>
        )}

        {selectedChannel && analysisData && (
          <>
            {/* 채널 정보 */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedChannel?.name || '채널명 없음'}</h2>
                  <p className="text-gray-600 mb-4">{selectedChannel?.description || '설명 없음'}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{(selectedChannel?.subscribers || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">구독자</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{(selectedChannel?.totalViews || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">총 조회수</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{(selectedChannel?.videoCount || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">영상 수</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{Math.round((analysisData?.performance?.engagementRate || 0) * 100)}%</p>
                      <p className="text-sm text-gray-600">참여율</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 감정 분석 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 분석</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">긍정적</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${analysisData.sentiment.pos * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(analysisData.sentiment.pos * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">중립적</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${analysisData.sentiment.neu * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(analysisData.sentiment.neu * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">부정적</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${analysisData.sentiment.neg * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(analysisData.sentiment.neg * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 인기 키워드 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 키워드</h3>
                <div className="space-y-3">
                  {(analysisData?.topKeywords || []).map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">#{keyword.keyword}</span>
                        <TrendingUp className={`w-4 h-4 ${
                          keyword.trend === 'up' ? 'text-green-500' : 
                          keyword.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(keyword.count / 50) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{keyword.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 최근 영상 */}
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">최근 영상</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {(analysisData?.recentVideos || []).map((video) => (
                  <div key={video.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{video.title}</h4>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {video.views.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {video.publishedAt}
                          </span>
                        </div>
                      </div>
                      <button className="btn btn-sm btn-outline">
                        분석 보기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 경쟁사 분석 */}
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">경쟁사 분석</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(analysisData?.competitors || []).map((competitor, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{competitor?.name || '경쟁사'}</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>구독자: {(competitor?.subscribers || 0).toLocaleString()}</p>
                        <p>평균 조회수: {(competitor?.avgViews || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* AI 인사이트 섹션 */}
        {selectedChannel && analysisData && (
          <div className="mt-8">
            <AIInsights 
              channelData={selectedChannel}
              videoData={selectedVideo}
              analysisData={analysisData}
            />
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
