"use client";

import Image from "next/image";

export default function ButtonKakaoLogin({ isLoading, onClick, disabled }) {
  return (
    <button
      className="btn btn-block bg-[#FEE500] text-[#000000 85%] font-normal"
      onClick={onClick}
      disabled={disabled}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : (
        <Image
          src="/kakao-icon.png"
          alt="카카오 로그인"
          width={48}
          height={48}
          className="w-5 h-5"
        />
      )}
      <span className="text-sm font-normal ml-2">카카오 로그인</span>
    </button>
  );
}
