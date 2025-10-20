"use client";

import { useState } from "react";
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Search,
  Filter,
  Menu,
  X,
  Home
} from "lucide-react";

export default function MobileHeader({ title, subtitle, icon: Icon, onFilterClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-sky-600">Yotuberabo</h2>
                <p className="text-xs text-gray-500">{subtitle}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {onFilterClick && (
                <button 
                  onClick={onFilterClick}
                  className="btn btn-sm btn-outline"
                >
                  <Filter className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="btn btn-sm btn-outline"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="bg-white h-full w-64 shadow-lg">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-sky-600">Yotuberabo</h2>
                  <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                  <Home className="w-5 h-5" />
                  홈
                </a>
                <a href="/recommendations" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                  <Users className="w-5 h-5" />
                  채널 추천
                </a>
                <a href="/analysis" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                  <TrendingUp className="w-5 h-5" />
                  채널 분석
                </a>
                <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100">
                  <BarChart3 className="w-5 h-5" />
                  대시보드
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
