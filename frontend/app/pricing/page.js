"use client";

import Link from "next/link";

const plans = [
  {
    key: "free",
    name: "베이직",
    price: 0,
    unit: "무료",
    cta: { label: "시작하기", href: "/signup" },
    features: [
      "채널 검색 일 3회",
      "채널 상세 조회 일 3회",
      "영상 상세 조회 일 3회",
      "AI 유튜브 콘텐츠 메이커 일 5회",
      "유튜브 수익 계산기 일 5회",
    ],
    badge: "Free",
  },
  {
    key: "standard",
    name: "스탠다드",
    price: 9900,
    unit: "/월",
    cta: { label: "시작하기", href: "/signup" },
    features: [
      "채널 추천 · 채널 분석",
      "AI 댓글 감정 분석 요약",
      "트렌드/키워드 매칭 추천",
      "개인화 추천 기본",
      "영상 상세 통계(조회·좋아요·댓글)",
      "지도 보기 및 기본 필터",
    ],
  },
  {
    key: "startup",
    name: "스타트업",
    price: 19000,
    unit: "/월",
    recommended: true,
    cta: { label: "시작하기", href: "/signup" },
    features: [
      "스탠다드의 모든 기능",
      "개인화 추천 고급(취향 학습)",
      "긍/부정 댓글 토픽 랭킹",
      "대시보드(채널·영상 지표)",
      "여행 일정 플래너(저장/공유)",
      "지도 검색(지역·태그) 고급 필터",
    ],
  },
  {
    key: "pro",
    name: "프로페셔널",
    price: 29000,
    unit: "/월",
    cta: { label: "세일즈 문의", href: "/qa" },
    features: [
      "팀 인원 10인",
      "커스텀 대시보드/리포트",
      "데이터 내보내기(CSV)",
      "즐겨찾기/워크스페이스 공유",
      "우선 지원",
    ],
  },
];

const formatKRW = (n) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">요금제</h1>
          <p className="text-gray-600 mt-2">팀 규모와 사용량에 맞는 플랜을 선택하세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div key={p.key} className={`rounded-2xl border ${p.recommended ? "border-pink-300 shadow-xl" : "border-gray-200 shadow"} bg-white flex flex-col`}>
              {p.recommended && (
                <div className="px-4 pt-4">
                  <span className="inline-block text-xs font-semibold text-pink-700 bg-pink-100 rounded-full px-3 py-1">추천</span>
                </div>
              )}
              <div className="p-6 flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{p.name}</h3>
                <div className="mb-6">
                  {p.price === 0 ? (
                    <div className="text-3xl font-extrabold text-gray-900">Free</div>
                  ) : (
                    <div className="flex items-end gap-1">
                      <div className="text-3xl font-extrabold text-gray-900">{formatKRW(p.price)}</div>
                      <div className="text-sm text-gray-500 mb-1">{p.unit}</div>
                    </div>
                  )}
                </div>

                <ul className="space-y-2 text-sm">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 text-green-600">✓</span>
                      <span className="text-gray-700">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 pt-0">
                <Link href={p.cta.href} className={`btn w-full ${p.recommended ? "btn-primary" : "btn-outline"}`}>
                  {p.cta.label}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


