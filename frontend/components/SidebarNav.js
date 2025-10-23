"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import config from "@/config";
import { Home, Users, TrendingUp, Brain, BarChart3, Calendar, Heart, MessageSquare, Search } from "lucide-react";

export default function SidebarNav({ active = "/recommendations" }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);
  const items = [
    { href: "/", label: "홈", icon: Home },
    { href: "/recommendations", label: "채널 추천", icon: Users },
    { href: "/analysis", label: "채널 분석", icon: TrendingUp },
    { href: "/personalization", label: "개인화 추천", icon: Brain },
    { href: "/dashboard", label: "대시보드", icon: BarChart3 },
    { href: "/planner", label: "여행 계획", icon: Calendar },
    { href: "/taste", label: "내 취향", icon: Heart },
    { href: "/qa", label: "여행 Q&A", icon: MessageSquare },
    { href: "/settings", label: "설정", icon: Search },
  ];

  return (
    <aside className="w-64 bg-base-100 border-r border-base-200">
      <div className="p-6">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-sky-600">{config?.appName || "Yotuberabo"}</h2>
          </div>
        </div>
        {/* User card on top */}
        {user && (
          <div className="mb-6 p-3 bg-base-200 rounded-lg">
            <p className="text-sm text-base-content/70">안녕하세요,</p>
            <p className="font-medium text-base-content">{user.name}</p>
            <p className="text-xs text-base-content/60">{user.email}</p>
          </div>
        )}

        <nav className="space-y-2">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                href === active ? "bg-blue-50 text-blue-700 border border-blue-200" : "text-base-content/70 hover:bg-base-200"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-8 pt-4 border-t border-base-200">
          <button
            onClick={() => {
              try {
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
              } catch {}
              window.location.href = "/signin";
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
          >
            <Users className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
}


