"use client";

import React from "react";
import { useRouter } from "next/navigation";
import cn from "clsx";
import { MoveLeft, Home } from "lucide-react";

// 모바일 사이즈에 적합
// 뒤로가기와 홈버튼 같이 있음
const ButtonBackHome = (props) => {
  const router = useRouter();
  return (
    <div className="flex flex-rows justify-start">
      <div className="text-center flex flex-row gap-1">
        <button
          className="btn btn-ghost btn-sm px-0"
          onClick={() => {
            router.back();
          }}
        >
          <MoveLeft className={cn("w-6 h-6", props.className)} />
        </button>
        <button
          className="btn btn-ghost btn-sm px-1"
          onClick={() => {
            router.push("/");
          }}
        >
          <Home className={cn("w-6 h-6")} />
        </button>
      </div>
    </div>
  );
};

export default ButtonBackHome;
