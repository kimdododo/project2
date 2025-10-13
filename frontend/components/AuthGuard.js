"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }) {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const token = localStorage.getItem("access_token");
    console.log("path", pathname, "token", token);
    
    // /signin 페이지는 예외 처리
    if (pathname === "/signin") {
      setIsReady(true);
      return;
    }
    
    // 토큰이 있으면 절대 /signin으로 보내지 않음
    if (token) {
      console.log("토큰 존재, 페이지 접근 허용");
      setIsReady(true);
      return;
    }
    
    // 토큰이 없으면 /signin으로 리다이렉트
    console.log("토큰 없음, /signin으로 리다이렉트");
    router.replace("/signin");
  }, [pathname, router]);

  // 검사 완료 전 아무것도 렌더하지 않음
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <p className="text-gray-600">인증 상태를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return children;
}
