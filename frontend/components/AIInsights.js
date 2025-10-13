"use client";

import { useState, useEffect } from "react";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  BarChart3,
  Users,
  Eye,
  MessageSquare,
  Heart
} from "lucide-react";

export default function AIInsights({ channelData, videoData, analysisData }) {
  const [insights, setInsights] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // AI 인사이트 생성 (데모 데이터)
  const generateInsights = async () => {
    setIsLoading(true);
    
    // 실제 LangChain 구현 대신 데모 데이터 사용
    setTimeout(() => {
      const mockInsights = {
        summary: "이 채널은 여행 콘텐츠 분야에서 강력한 성장세를 보이고 있습니다. 특히 제주도 관련 콘텐츠가 높은 참여도를 기록하고 있어, 지역 특화 콘텐츠 전략이 효과적임을 알 수 있습니다.",
        keyFindings: [
          {
            title: "높은 참여율",
            description: "평균 참여율 8.5%로 여행 채널 평균(5.2%) 대비 63% 높음",
            impact: "high",
            icon: TrendingUp
          },
          {
            title: "제주도 콘텐츠 선호도",
            description: "제주도 관련 영상의 평균 조회수가 전체 평균 대비 40% 높음",
            impact: "high",
            icon: Target
          },
          {
            title: "댓글 참여도",
            description: "댓글 대비 좋아요 비율이 1:15로 건강한 커뮤니티 형성",
            impact: "medium",
            icon: MessageSquare
          }
        ],
        trends: [
          {
            metric: "조회수 증가",
            value: "+23%",
            period: "최근 30일",
            trend: "up",
            description: "전월 대비 조회수 23% 증가"
          },
          {
            metric: "구독자 증가",
            value: "+15%",
            period: "최근 30일", 
            trend: "up",
            description: "전월 대비 구독자 15% 증가"
          },
          {
            metric: "평균 시청 시간",
            value: "4분 32초",
            period: "최근 7일",
            trend: "stable",
            description: "전주 대비 2% 증가"
          }
        ],
        opportunities: [
          {
            title: "계절별 콘텐츠 확장",
            description: "봄/여름 제주도 콘텐츠를 가을/겨울로 확장하여 연중 콘텐츠 제공",
            priority: "high",
            potential: "+35% 조회수 증가 예상"
          },
          {
            title: "협업 채널 발굴",
            description: "유사 여행 채널과의 협업을 통한 크로스 프로모션 기회",
            priority: "medium",
            potential: "+20% 구독자 증가 예상"
          },
          {
            title: "쇼츠 콘텐츠 확장",
            description: "인기 영상의 하이라이트를 쇼츠로 제작하여 추가 노출",
            priority: "medium",
            potential: "+25% 전체 조회수 증가 예상"
          }
        ]
      };

      const mockRecommendations = {
        contentStrategy: [
          {
            title: "제주도 시즌별 콘텐츠",
            description: "봄: 벚꽃, 여름: 해변, 가을: 단풍, 겨울: 눈꽃 테마로 계절별 시리즈 제작",
            impact: "high",
            effort: "medium"
          },
          {
            title: "로컬 맛집 탐방",
            description: "제주도 현지인만 아는 숨은 맛집 시리즈로 차별화된 콘텐츠 제공",
            impact: "high",
            effort: "low"
          },
          {
            title: "여행 팁 & 가이드",
            description: "실용적인 여행 정보를 담은 가이드 영상으로 검색 유입 증가",
            impact: "medium",
            effort: "low"
          }
        ],
        optimizationTips: [
          {
            title: "썸네일 최적화",
            description: "밝고 대비가 강한 색상 사용, 텍스트 오버레이로 핵심 정보 강조",
            category: "시각적",
            priority: "high"
          },
          {
            title: "제목 키워드 강화",
            description: "'제주도', '여행', '맛집', '관광지' 등 검색량 높은 키워드 활용",
            category: "SEO",
            priority: "high"
          },
          {
            title: "업로드 시간 최적화",
            description: "오후 7-9시 업로드로 시청자 활동 시간대 활용",
            category: "타이밍",
            priority: "medium"
          }
        ],
        growthOpportunities: [
          {
            title: "다른 지역 확장",
            description: "제주도 성공 경험을 바탕으로 부산, 강원도 등 다른 지역 콘텐츠 확장",
            potential: "+50% 채널 성장",
            timeline: "3-6개월"
          },
          {
            title: "라이브 스트리밍",
            description: "실시간 여행 현장 중계로 시청자와의 소통 강화",
            potential: "+30% 참여도 증가",
            timeline: "1-2개월"
          },
          {
            title: "커뮤니티 구축",
            description: "시청자 여행 후기 공유 플랫폼 구축으로 UGC 콘텐츠 확보",
            potential: "+40% 구독자 충성도",
            timeline: "2-4개월"
          }
        ]
      };

      setInsights(mockInsights);
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    }, 2000);
  };

  useEffect(() => {
    if (channelData || videoData || analysisData) {
      generateInsights();
    }
  }, [channelData, videoData, analysisData]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">AI 인사이트 분석 중...</h3>
        </div>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!insights || !recommendations) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* AI 인사이트 요약 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">AI 인사이트 브리핑</h3>
          <Sparkles className="w-5 h-5 text-yellow-500" />
        </div>
        <p className="text-gray-700 leading-relaxed mb-6">{insights.summary}</p>
        
        {/* 핵심 발견사항 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {insights.keyFindings.map((finding, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <finding.icon className={`w-5 h-5 ${
                  finding.impact === 'high' ? 'text-red-500' : 
                  finding.impact === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`} />
                <h4 className="font-semibold text-gray-900">{finding.title}</h4>
              </div>
              <p className="text-sm text-gray-600">{finding.description}</p>
            </div>
          ))}
        </div>

        {/* 트렌드 지표 */}
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">주요 트렌드</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">{trend.metric}</p>
                  <p className="text-xs text-gray-500">{trend.period}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {trend.trend === 'up' && <ArrowUp className="w-4 h-4 text-green-500" />}
                    {trend.trend === 'down' && <ArrowDown className="w-4 h-4 text-red-500" />}
                    {trend.trend === 'stable' && <Minus className="w-4 h-4 text-gray-500" />}
                    <span className={`font-bold ${
                      trend.trend === 'up' ? 'text-green-600' : 
                      trend.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>{trend.value}</span>
                  </div>
                  <p className="text-xs text-gray-500">{trend.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 추천 포인트 */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">AI 추천 포인트</h3>
          <Lightbulb className="w-5 h-5 text-yellow-500" />
        </div>

        {/* 콘텐츠 전략 */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            콘텐츠 전략
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.contentStrategy.map((strategy, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-gray-900">{strategy.title}</h5>
                  <div className="flex gap-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      strategy.impact === 'high' ? 'bg-red-100 text-red-700' : 
                      strategy.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {strategy.impact === 'high' ? '높음' : strategy.impact === 'medium' ? '중간' : '낮음'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>난이도:</span>
                  <span className={`px-2 py-1 rounded ${
                    strategy.effort === 'high' ? 'bg-red-100 text-red-700' : 
                    strategy.effort === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {strategy.effort === 'high' ? '높음' : strategy.effort === 'medium' ? '중간' : '낮음'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 최적화 팁 */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            최적화 팁
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.optimizationTips.map((tip, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-gray-900">{tip.title}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    tip.priority === 'high' ? 'bg-red-100 text-red-700' : 
                    tip.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {tip.priority === 'high' ? '높음' : tip.priority === 'medium' ? '중간' : '낮음'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{tip.description}</p>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  {tip.category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 성장 기회 */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            성장 기회
          </h4>
          <div className="space-y-4">
            {recommendations.growthOpportunities.map((opportunity, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-gray-900">{opportunity.title}</h5>
                  <span className="text-xs text-gray-500">{opportunity.timeline}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-600">{opportunity.potential}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
