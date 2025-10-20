"use client";

import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import config from "@/config";
import ProgressBar from "@/components/ProgressBar";

/**
 * 전체 레이아웃을 감싸는 클라이언트 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. NextTopLoader - 페이지 이동시 상단에 로딩 프로그레스바를 표시
 * 2. Toaster - 토스트 메시지 표시 기능 제공
 * 3. ProgressBar - 페이지 스크롤 진행도를 표시 (선택적 사용)
 *
 * 사용 위치:
 * - app/layout.js에서 전체 앱을 감싸는 레이아웃으로 사용됨
 *
 * 참고:
 * - "use client" 지시문이 필요한 클라이언트 사이드 기능들을 모아둔 컴포넌트
 * - ProgressBar와 NextTopLoader는 겹치지 않도록 하나만 선택해서 사용
 */
const ClientLayout = ({ children }) => {
  return (
    <>
      <NextTopLoader color={config.colors.main} showSpinner={false} />
      {/* 전체 페이지에서 ProgressBar 컴포넌트를 사용하고 싶으면 활성화 해주세요. 대신 NextTopLoader 컴포넌트와 겹치기 떄문에 높이 조절이나 색상 조절이 필요합니다. */}
      {/* <ProgressBar /> */}

      {children}

      {/* 토스트 메시지 표시 */}
      <Toaster
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px',
            border: '2px solid #fbbf24',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#fbbf24',
            secondary: 'white',
          },
        }}
        position="bottom-right"
        containerStyle={{ bottom: 100, right: 16 }}
      />
    </>
  );
};

export default ClientLayout;
