"use client";

import React from "react";
import { useRouter } from "next/navigation";
import cn from "clsx";
import { MoveLeft } from "lucide-react";

const ButtonBack = (props) => {
  const router = useRouter();
  return (
    <div className="flex flex-rows justify-start">
      <div className="text-center">
        <button
          className="btn btn-ghost btn-sm pl-0"
          onClick={() => {
            if (!props.href || props.href === "") {
              router.back();
            } else {
              router.push(props.href);
            }
          }}
        >
          <MoveLeft className={cn("w-6 h-6", props.className)} />
          {props.content}
        </button>
      </div>
    </div>
  );
};

export default ButtonBack;
