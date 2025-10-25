"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  MessageCircle, 
  Star, 
  TrendingUp,
  Filter,
  Search,
  Plane,
  Camera,
  Utensils,
  Mountain
} from "lucide-react";

export default function TravelPage() {
  const [videos, setVideos] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [trends, setTrends] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    destination: "",
    travelType: "",
    budget: "",
    season: ""
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTravelData();
  }, []);

  const loadTravelData = async () => {
    try {
      setIsLoading(true);
      
      // 여행 비디오 로드
      const videosResponse = await fetch('/api/travel/videos?limit=20');
      const videosData = await videosResponse.json();
      setVideos(videosData.videos || []);

      // 인기 여행지 로드
      const destinationsResponse = await fetch('/api/travel/destinations');
      const destinationsData = await destinationsResponse.json();
      setDestinations(destinationsData.destinations || []);

      // 여행 트렌드 로드
      const trendsResponse = await fetch('/api/travel/trends');
      const trendsData = await trendsResponse.json();
      setTrends(trendsData);

    } catch (error) {
      console.error('여행 데이터 로드 실패:', error);
      // 샘플 데이터로 대체
      setVideos(generateSampleTravelVideos());
      setDestinations(generateSampleDestinations());
      setTrends(generateSampleTrends());
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleTravelVideos = () => [
    {
      id: "travel_1",
      title: "제주도 3박4일 완벽 가이드 | 혼자여행 추천 코스",
      destination: "제주도",
      travel_type: "혼자여행",
      budget_range: "보통",
      season: "봄",
      view_count: 125000,
      like_count: 3200,
      comment_count: 450,
      thumbnail_url: "https://img.youtube.com/vi/sample1/mqdefault.jpg",
      positive_comments: ["정말 유용한 정보네요!", "다음 제주도 여행 때 참고하겠습니다"],
      negative_comments: ["일부 정보가 부정확해요"],
      sentiment: { avg_score: 0.7, positive_count: 320, negative_count: 50, neutral_count: 80 }
    },
    {
      id: "travel_2", 
      title: "일본 도쿄 맛집 투어 | 커플여행 추천",
      destination: "일본",
      travel_type: "커플여행",
      budget_range: "비쌈",
      season: "가을",
      view_count: 89000,
      like_count: 2100,
      comment_count: 320,
      thumbnail_url: "https://img.youtube.com/vi/sample2/mqdefault.jpg",
      positive_comments: ["맛집 정보 정말 좋아요!", "일본 여행 계획에 도움됐어요"],
      negative_comments: ["예산이 생각보다 많이 들었어요"],
      sentiment: { avg_score: 0.8, positive_count: 250, negative_count: 30, neutral_count: 40 }
    },
    {
      id: "travel_3",
      title: "부산 가족여행 완벽 가이드 | 아이들과 함께",
      destination: "부산",
      travel_type: "가족여행", 
      budget_range: "저렴",
      season: "여름",
      view_count: 156000,
      like_count: 4100,
      comment_count: 580,
      thumbnail_url: "https://img.youtube.com/vi/sample3/mqdefault.jpg",
      positive_comments: ["가족여행에 정말 도움됐어요!", "아이들이 너무 좋아했어요"],
      negative_comments: ["여름에 너무 더웠어요"],
      sentiment: { avg_score: 0.9, positive_count: 450, negative_count: 40, neutral_count: 90 }
    }
  ];

  const generateSampleDestinations = () => [
    { destination: "제주도", video_count: 45, total_views: 2500000, avg_sentiment: 0.8, popularity_score: 95 },
    { destination: "일본", video_count: 38, total_views: 1800000, avg_sentiment: 0.7, popularity_score: 88 },
    { destination: "부산", video_count: 32, total_views: 1200000, avg_sentiment: 0.9, avg_sentiment: 0.9, popularity_score: 82 },
    { destination: "대만", video_count: 28, total_views: 950000, avg_sentiment: 0.8, popularity_score: 75 },
    { destination: "태국", video_count: 25, total_views: 800000, avg_sentiment: 0.6, popularity_score: 68 }
  ];

  const generateSampleTrends = () => ({
    travel_types: [
      { type: "혼자여행", video_count: 45, avg_views: 125000, avg_sentiment: 0.8 },
      { type: "커플여행", video_count: 38, avg_views: 98000, avg_sentiment: 0.7 },
      { type: "가족여행", video_count: 32, avg_views: 156000, avg_sentiment: 0.9 },
      { type: "힐링여행", video_count: 28, avg_views: 87000, avg_sentiment: 0.8 }
    ],
    seasons: [
      { season: "봄", video_count: 35, avg_views: 110000 },
      { season: "여름", video_count: 42, avg_views: 135000 },
      { season: "가을", video_count: 38, avg_views: 120000 },
      { season: "겨울", video_count: 25, avg_views: 95000 }
    ],
    budgets: [
      { budget_range: "저렴", video_count: 40, avg_views: 98000 },
      { budget_range: "보통", video_count: 35, avg_views: 125000 },
      { budget_range: "비쌈", video_count: 25, avg_views: 145000 }
    ]
  });

  const getTravelTypeIcon = (type) => {
    switch(type) {
      case "혼자여행": return <Users className="w-4 h-4" />;
      case "커플여행": return <Heart className="w-4 h-4" />;
      case "가족여행": return <Users className="w-4 h-4" />;
      case "힐링여행": return <Mountain className="w-4 h-4" />;
      case "맛집여행": return <Utensils className="w-4 h-4" />;
      case "사진여행": return <Camera className="w-4 h-4" />;
      default: return <Plane className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (score) => {
    if (score >= 0.7) return "text-green-600";
    if (score >= 0.4) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredVideos = videos.filter(video => {
    if (filters.destination && video.destination !== filters.destination) return false;
    if (filters.travelType && video.travel_type !== filters.travelType) return false;
    if (filters.budget && video.budget_range !== filters.budget) return false;
    if (filters.season && video.season !== filters.season) return false;
    if (searchQuery && !video.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧳 여행 데이터 분석</h1>
        <p className="text-gray-600">YouTube 여행 콘텐츠의 감정 분석과 트렌드를 확인해보세요</p>
      </div>

      <Tabs defaultValue="videos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="videos">여행 영상</TabsTrigger>
          <TabsTrigger value="destinations">인기 여행지</TabsTrigger>
          <TabsTrigger value="trends">트렌드 분석</TabsTrigger>
          <TabsTrigger value="recommendations">추천 시스템</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-6">
          {/* 필터 섹션 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                필터 및 검색
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="영상 제목 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filters.destination} onValueChange={(value) => setFilters({...filters, destination: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="여행지 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체 여행지</SelectItem>
                    {destinations.map(dest => (
                      <SelectItem key={dest.destination} value={dest.destination}>
                        {dest.destination}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.travelType} onValueChange={(value) => setFilters({...filters, travelType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="여행 유형" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체 유형</SelectItem>
                    <SelectItem value="혼자여행">혼자여행</SelectItem>
                    <SelectItem value="커플여행">커플여행</SelectItem>
                    <SelectItem value="가족여행">가족여행</SelectItem>
                    <SelectItem value="힐링여행">힐링여행</SelectItem>
                    <SelectItem value="맛집여행">맛집여행</SelectItem>
                    <SelectItem value="사진여행">사진여행</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.budget} onValueChange={(value) => setFilters({...filters, budget: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="예산 범위" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체 예산</SelectItem>
                    <SelectItem value="저렴">저렴</SelectItem>
                    <SelectItem value="보통">보통</SelectItem>
                    <SelectItem value="비쌈">비쌈</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.season} onValueChange={(value) => setFilters({...filters, season: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="계절" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">전체 계절</SelectItem>
                    <SelectItem value="봄">봄</SelectItem>
                    <SelectItem value="여름">여름</SelectItem>
                    <SelectItem value="가을">가을</SelectItem>
                    <SelectItem value="겨울">겨울</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 영상 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="aspect-video bg-gray-200 relative">
                  <img 
                    src={video.thumbnail_url} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      {video.destination}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      {video.season}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-2 mb-2">{video.title}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      {getTravelTypeIcon(video.travel_type)}
                      <span>{video.travel_type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{video.destination}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        {video.view_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {video.like_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {video.comment_count}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 ${getSentimentColor(video.sentiment.avg_score)}`}>
                      <Star className="w-4 h-4" />
                      <span>{(video.sentiment.avg_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="font-medium">긍정 댓글:</span>
                      <p className="text-gray-600 line-clamp-1">{video.positive_comments[0]}</p>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">부정 댓글:</span>
                      <p className="text-gray-600 line-clamp-1">{video.negative_comments[0]}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="destinations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>인기 여행지 순위</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {destinations.map((dest, index) => (
                  <div key={dest.destination} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{dest.destination}</h3>
                        <p className="text-sm text-gray-600">
                          {dest.video_count}개 영상 • {dest.total_views.toLocaleString()} 조회수
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {dest.popularity_score.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600">인기도</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>여행 유형별 트렌드</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trends.travel_types?.map((type, index) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <span className="font-medium">{type.type}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{type.video_count}개</div>
                        <div className="text-xs text-gray-600">{type.avg_views.toLocaleString()} 평균 조회수</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>계절별 트렌드</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trends.seasons?.map((season, index) => (
                    <div key={season.season} className="flex items-center justify-between">
                      <span className="font-medium">{season.season}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{season.video_count}개</div>
                        <div className="text-xs text-gray-600">{season.avg_views.toLocaleString()} 평균 조회수</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>예산별 트렌드</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trends.budgets?.map((budget, index) => (
                    <div key={budget.budget_range} className="flex items-center justify-between">
                      <span className="font-medium">{budget.budget_range}</span>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{budget.video_count}개</div>
                        <div className="text-xs text-gray-600">{budget.avg_views.toLocaleString()} 평균 조회수</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>개인화된 여행 추천</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">사용자의 선호도에 따른 맞춤형 여행 추천을 제공합니다.</p>
              <Button className="w-full">
                추천 시스템 시작하기
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
