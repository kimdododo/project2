"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MobileHeader from "@/components/MobileHeader";
import MobileNavigation from "@/components/MobileNavigation";
import SidebarNav from "@/components/SidebarNav";
import apiClient from "@/libs/api";
import { 
  Users, 
  Home, 
  TrendingUp, 
  Eye, 
  ThumbsUp, 
  MessageSquare, 
  Clock, 
  PlayCircle,
  Brain,
  BarChart3,
  MapPin,
  Calendar,
  Heart,
  AlertCircle
} from "lucide-react";

export default function Recommendations() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState({});
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    let mounted = true;
    const withCounts = (arr) => (arr || []).map((t) => ({ text: t, count: Math.floor(Math.random() * 200) + 30 }));
    const mockVideos = () => ([
      { id: "dQw4w9WgXcQ", title: "제주도 3박4일 완벽 여행코스", channel: "제주여행TV", duration: "15:32", publishedAt: "2024-01-15", views: 125000, likes: 3200, comments: 450, score: 0.95, sentiment: { pos: 0.85, neu: 0.1 }, tags: ["제주도", "여행코스"], positiveComments: withCounts(["좋아요", "도움돼요", "깔끔해요"]), negativeComments: withCounts(["아쉬워요"]) },
      { id: "jNQXAC9IVRw", title: "부산 맛집 투어 베스트 10", channel: "부산맛집탐방", duration: "12:45", publishedAt: "2024-01-14", views: 98000, likes: 2800, comments: 320, score: 0.92, sentiment: { pos: 0.78, neu: 0.15 }, tags: ["부산", "맛집"], positiveComments: withCounts(["가볼래요", "맛있어 보여요"]), negativeComments: withCounts(["정보가 부족해요"]) },
      { id: "M7lc1UVf-VE", title: "서울 야경 명소 완전정복", channel: "서울나이트", duration: "18:20", publishedAt: "2024-01-13", views: 156000, likes: 4200, comments: 680, score: 0.89, sentiment: { pos: 0.72, neu: 0.2 }, tags: ["서울", "야경"], positiveComments: withCounts(["멋져요", "뷰가 좋아요"]), negativeComments: withCounts(["소음이 커요"]) },
    ]);

    const fetchData = async () => {
      try {
        const list = await apiClient.getVideos(12, 0);
        if (!mounted) return;
        const mapped = (list || []).map((v) => ({
          id: v.id,
          title: v.title,
          channel: v.channel_name || `채널 ${v.channel_id}`,
          publishedAt: v.published_at ? new Date(v.published_at).toISOString().split("T")[0] : "",
          duration: `${Math.floor(Math.random() * 20) + 5}:${Math.floor(Math.random() * 60)
            .toString()
            .padStart(2, "0")}`,
          views: Math.floor(Math.random() * 100000) + 10000,
          likes: Math.floor(Math.random() * 5000) + 500,
          comments: Math.floor(Math.random() * 500) + 50,
          score: Math.random() * 0.4 + 0.6,
          sentiment: { pos: Math.random() * 0.3 + 0.6, neu: Math.random() * 0.2 + 0.1 },
          tags: v.topics && v.topics.length ? v.topics : ["여행", "추천", "인기"],
          thumbnail: v.thumbnail || v.thumbnail_url || (v.id ? `https://img.youtube.com/vi/${v.id}/mqdefault.jpg` : ""),
          positiveComments: withCounts(["정말 유용한 정보네요!", "다음 여행 때 참고하겠습니다", "영상 퀄리티가 정말 좋아요"]),
          negativeComments: withCounts(["개선이 필요해 보여요", "다른 영상이 더 나아요", "아쉬운 부분이 있네요"]),
        }));
        setVideos(mapped.length ? mapped : mockVideos());
      } catch (e) {
        // fallback mock data (3개)
        setVideos(mockVideos());
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = videos.filter((v) => {
    if (filter === "high") return v.score >= 0.9;
    if (filter === "medium") return v.score >= 0.8 && v.score < 0.9;
    if (filter === "low") return v.score < 0.8;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const toggle = (id, type) => {
    const key = `${id}-${type}`;
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MobileHeader title="영상 추천" subtitle="채널 추천" icon={Users} />

      {/* Desktop layout shell */}
      <div className="hidden lg:flex">
        {/* Sidebar */}
        <SidebarNav active="/recommendations" />

        {/* Main area */}
        <main className="flex-1">
          <header className="bg-white border-b">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">영상 추천</h1>
            </div>
          </header>
          <section className="p-6">
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline"}`} onClick={() => setFilter("all")}>
                  전체
                </button>
                <button className={`btn btn-sm ${filter === "high" ? "btn-primary" : "btn-outline"}`} onClick={() => setFilter("high")}>90%+</button>
                <button className={`btn btn-sm ${filter === "medium" ? "btn-primary" : "btn-outline"}`} onClick={() => setFilter("medium")}>80-90%</button>
                <button className={`btn btn-sm ${filter === "low" ? "btn-primary" : "btn-outline"}`} onClick={() => setFilter("low")}>80% 미만</button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-16 text-gray-500">불러오는 중...</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pageItems.map((v) => (
                  <div key={v.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex gap-4">
                      <div className="w-48 flex-shrink-0">
                        <div className="relative w-48 h-28 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                          {/* 썸네일: API 제공 이미지 우선, 없으면 유튜브 썸네일 */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={v.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            src={v.thumbnail || (v.id ? `https://img.youtube.com/vi/${v.id}/mqdefault.jpg` : "")}
                            onError={(e) => {
                              e.currentTarget.src = v.id ? `https://img.youtube.com/vi/${v.id}/mqdefault.jpg` : "";
                            }}
                          />
                          <span className="absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">{v.duration}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{v.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{v.channel}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center"><Eye className="w-4 h-4 mr-1" />{v.views.toLocaleString()}</span>
                          <span className="flex items-center"><ThumbsUp className="w-4 h-4 mr-1" />{v.likes.toLocaleString()}</span>
                          <span className="flex items-center"><MessageSquare className="w-4 h-4 mr-1" />{v.comments.toLocaleString()}</span>
                          <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{v.publishedAt}</span>
                          <span className="ml-auto text-blue-600 font-medium">추천 {Math.round(v.score * 100)}%</span>
                        </div>
                        {/* Sentiment bars */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 text-red-500 mr-2" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${Math.round((v.sentiment?.pos || 0) * 100)}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-600 min-w-[32px]">{Math.round((v.sentiment?.pos || 0) * 100)}%</span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 text-yellow-500 mr-2" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${Math.round((v.sentiment?.neu || 0) * 100)}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-600 min-w-[32px]">{Math.round((v.sentiment?.neu || 0) * 100)}%</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(v.tags || []).map((t, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">#{t}</span>
                          ))}
                        </div>

                        {/* Comments sections */}
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Positive */}
                          <div className="bg-green-50 rounded p-2">
                            <button className="w-full flex items-center justify-between p-2 hover:bg-green-100 rounded" onClick={() => toggle(v.id, "pos")}>
                              <span className="flex items-center text-green-800 text-sm font-medium">
                                <Heart className="w-4 h-4 mr-2" />긍정 댓글
                              </span>
                              <span className="text-xs text-green-800">{(v.positiveComments || []).reduce((s, it) => s + (it.count || 0), 0).toLocaleString()}</span>
                            </button>
                            {expanded[`${v.id}-pos`] && (
                              <div className="mt-2 divide-y">
                                {(v.positiveComments || []).map((c, i) => (
                                  <div key={i} className="flex items-center justify-between bg-white p-2 text-sm">
                                    <span className="text-gray-800">{c.text || c}</span>
                                    <span className="text-gray-500">{(c.count || 0).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Negative */}
                          <div className="bg-red-50 rounded p-2">
                            <button className="w-full flex items-center justify-between p-2 hover:bg-red-100 rounded" onClick={() => toggle(v.id, "neg")}>
                              <span className="flex items-center text-red-800 text-sm font-medium">
                                <AlertCircle className="w-4 h-4 mr-2" />부정 댓글
                              </span>
                              <span className="text-xs text-red-800">{(v.negativeComments || []).reduce((s, it) => s + (it.count || 0), 0).toLocaleString()}</span>
                            </button>
                            {expanded[`${v.id}-neg`] && (
                              <div className="mt-2 divide-y">
                                {(v.negativeComments || []).map((c, i) => (
                                  <div key={i} className="flex items-center justify-between bg-white p-2 text-sm">
                                    <span className="text-gray-800">{c.text || c}</span>
                                    <span className="text-gray-500">{(c.count || 0).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-6 flex justify-center gap-2">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>이전</button>
              <span className="px-3 py-2 text-sm text-gray-600">{page} / {totalPages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>다음</button>
            </div>
          </section>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNavigation />

      {/* Spacer for mobile */}
      <div className="lg:hidden h-16"></div>
    </div>
  );
}