"use client";

import { Suspense, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/ProgressBar";
import { AutoToast } from "@/components/AutoToast";
import Link from "next/link";
import { 
  BarChart3, 
  TrendingUp, 
  Heart, 
  Search, 
  Star, 
  Users,
  PlayCircle,
  MessageSquare,
  Target,
  Zap
} from "lucide-react";

export default function Home() {
  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <AutoToast />
        <ProgressBar />
        
        {/* Hero Section */}
        <section className="hero min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 relative overflow-hidden">
          {/* Background Travel Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-20 h-20 bg-blue-300 rounded-full"></div>
            <div className="absolute top-40 right-20 w-16 h-16 bg-green-300 rounded-full"></div>
            <div className="absolute bottom-40 left-20 w-12 h-12 bg-yellow-300 rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-300 rounded-full"></div>
          </div>

          {/* Flying Airplane Animation */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Airplane 1 - Bigger */}
            <div className="absolute top-1/4 left-0 transform -translate-x-20 animate-fly-1">
              <div className="text-6xl">✈️</div>
            </div>
            
            {/* Airplane 2 - Bigger */}
            <div className="absolute top-1/3 right-0 transform translate-x-20 animate-fly-2">
              <div className="text-5xl">🛩️</div>
            </div>
            
            {/* Airplane 3 - Bigger */}
            <div className="absolute top-1/2 left-0 transform -translate-x-16 animate-fly-3">
              <div className="text-4xl">✈️</div>
            </div>

            {/* Hot Air Balloon */}
            <div className="absolute top-1/6 left-1/4 animate-float">
              <div className="text-4xl">🎈</div>
            </div>

            {/* Cloud Animation */}
            <div className="absolute top-1/5 right-1/4 animate-cloud-1">
              <div className="text-3xl opacity-60">☁️</div>
            </div>
            
            <div className="absolute top-2/3 left-1/3 animate-cloud-2">
              <div className="text-2xl opacity-40">☁️</div>
            </div>

            <div className="absolute top-1/2 right-1/3 animate-cloud-3">
              <div className="text-xl opacity-50">☁️</div>
            </div>
          </div>
          
          <div className="hero-content text-center relative z-10">
            <div className="max-w-4xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sky-700 mb-6">
                새로운 여행의 시작, Yotuberabo와 함께!
              </h1>
              <p className="text-lg sm:text-xl text-sky-700 mb-8 max-w-4xl mx-auto">
                AI가 당신의 여행 취향을 분석하여 완벽한 영상을 추천해드립니다.
                <br className="hidden sm:block" />
                지금 바로 당신만의 여행을 발견하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/recommendations" className="btn btn-lg w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white border-none shadow-lg">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  여행 시작하기
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-sky-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-sky-800 mb-4">
                개인화된 추천 기능
              </h2>
              <p className="text-lg sm:text-xl text-sky-700 max-w-3xl mx-auto">
                AI가 당신의 취향을 학습하여 완벽한 영상을 추천합니다
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="card bg-white shadow-xl border border-sky-100 hover:shadow-2xl transition-shadow">
                <div className="card-body text-center">
                  <Heart className="w-12 h-12 text-sky-500 mx-auto mb-4" />
                  <h3 className="card-title justify-center mb-2 text-sky-800">취향 분석</h3>
                  <p className="text-sky-600">
                    당신의 시청 패턴을 분석하여 개인화된 추천을 제공합니다
                  </p>
                </div>
              </div>
              
              <div className="card bg-white shadow-xl border border-sky-100 hover:shadow-2xl transition-shadow">
                <div className="card-body text-center">
                  <TrendingUp className="w-12 h-12 text-sky-500 mx-auto mb-4" />
                  <h3 className="card-title justify-center mb-2 text-sky-800">트렌드 추천</h3>
                  <p className="text-sky-600">
                    실시간 인기 키워드와 트렌드를 반영한 맞춤 영상을 추천합니다
                  </p>
                </div>
              </div>
              
              <div className="card bg-white shadow-xl border border-sky-100 hover:shadow-2xl transition-shadow">
                <div className="card-body text-center">
                  <Star className="w-12 h-12 text-sky-500 mx-auto mb-4" />
                  <h3 className="card-title justify-center mb-2 text-sky-800">맞춤 추천</h3>
                  <p className="text-sky-600">
                    당신만을 위한 개인화된 알고리즘으로 완벽한 영상을 추천합니다
                  </p>
                </div>
              </div>
              
              <div className="card bg-white shadow-xl border border-sky-100 hover:shadow-2xl transition-shadow">
                <div className="card-body text-center">
                  <Users className="w-12 h-12 text-sky-500 mx-auto mb-4" />
                  <h3 className="card-title justify-center mb-2 text-sky-800">관심 채널</h3>
                  <p className="text-sky-600">
                    당신이 좋아할 만한 새로운 채널을 발견하고 추천합니다
                  </p>
                </div>
              </div>
              
              <div className="card bg-white shadow-xl border border-sky-100 hover:shadow-2xl transition-shadow">
                <div className="card-body text-center">
                  <MessageSquare className="w-12 h-12 text-sky-500 mx-auto mb-4" />
                  <h3 className="card-title justify-center mb-2 text-sky-800">시청 히스토리</h3>
                  <p className="text-sky-600">
                    당신의 시청 기록을 분석하여 더 정확한 추천을 제공합니다
                  </p>
                </div>
              </div>
              
              <div className="card bg-white shadow-xl border border-sky-100 hover:shadow-2xl transition-shadow">
                <div className="card-body text-center">
                  <Target className="w-12 h-12 text-sky-500 mx-auto mb-4" />
                  <h3 className="card-title justify-center mb-2 text-sky-800">스마트 큐레이션</h3>
                  <p className="text-sky-600">
                    AI가 당신의 시간대와 상황에 맞는 최적의 영상을 큐레이션합니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-gradient-to-r from-sky-500 to-blue-600">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                {/* Left Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    여행 피드백
                  </h2>
                  <p className="text-sky-100 mb-2">
                    Yotuberabo와 함께 여행하면서 불편을 느끼셨나요?
                  </p>
                  <p className="text-sky-100 mb-6">
                    지금 바로 알려주세요.
                  </p>
                  <button className="btn bg-white text-sky-600 hover:bg-sky-50 border-none px-6 py-3 rounded-lg transition-colors">
                    피드백 보내기
                  </button>
                </div>
                
                {/* Right Graphics */}
                <div className="flex-1 flex justify-center lg:justify-end">
                  <div className="relative">
                    {/* Document Icon */}
                    <div className="w-24 h-32 bg-white/20 rounded-lg flex items-center justify-center shadow-lg backdrop-blur-sm">
                      <div className="w-16 h-20 bg-white/30 rounded border-2 border-white/40 flex flex-col items-center justify-center">
                        <div className="w-12 h-1 bg-white/60 rounded mb-2"></div>
                        <div className="w-10 h-1 bg-white/60 rounded mb-1"></div>
                        <div className="w-8 h-1 bg-white/60 rounded"></div>
                      </div>
                    </div>
                    
                    {/* Exclamation Mark Emoji */}
                    <div className="absolute -bottom-2 -right-2 text-4xl transform rotate-12">
                      ⚠️
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
