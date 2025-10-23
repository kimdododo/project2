"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import logo from "@/app/icon.png";
import config from "@/config";

const links = [
  {
    href: "/recommendations",
    label: "채널 추천",
  },
  {
    href: "/analysis",
    label: "채널 분석",
  },
  {
    href: "/personalization",
    label: "개인화 추천",
  },
  {
    href: "/dashboard",
    label: "대시보드",
  },
  {
    href: "/planner",
    label: "여행 계획",
  },
  {
    href: "/taste",
    label: "내 취향",
  },
  {
    href: "/qa",
    label: "여행 Q&A",
  },
  {
    href: "/pricing",
    label: "가격",
  },
];

const cta = (
  <Link href="/signin" className="btn btn-primary rounded-3xl">
    로그인하기
  </Link>
);

// 왼쪽에는 로고가 있는 헤더, 중앙에는 링크(예: 가격, 리뷰 등), 오른쪽에는 CTA(예: 시작하기 또는 로그인)가 있습니다.
// 헤더는 반응형입니다. 모바일에서는 링크가 버거 버튼 뒤에 숨겨져 있습니다.
const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // setIsOpen(false) 경로가 변경될 때(예: 사용자가 모바일에서 링크를 클릭할 때)
  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="">
      <nav
        className="container flex items-center justify-between px-8 py-4 mx-auto"
        aria-label="Global"
      >
        {/* 해당 div > Link > Image에 로고를 넣어주세요. */}
        <div className="flex lg:flex-1">
          <Link
            className="flex items-center gap-2 shrink-0 "
            href="/"
            title={`${config.appName} hompage`}
          >
            <span className="font-extrabold text-2xl text-sky-600">{config.appName}</span>
          </Link>
        </div>
        {/* 모바일에서 메뉴를 열 수 있는 버거 버튼 */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setIsOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-base-content"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        {/* large 사이즈 화면에 표시되는 링크 */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-center lg:gap-8 lg:items-center">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className="link link-hover text-base font-medium whitespace-nowrap"
              title={link.label}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* large 사이즈 화면에 표시되는 CTA + Theme */}
        <div className="hidden lg:flex lg:items-center lg:justify-end lg:ml-12 gap-2">
          <ThemeToggle />
          {cta}
        </div>
      </nav>

      {/* 모바일 메뉴, 메뉴 상태에 따라 표시/숨기기. */}
      <div className={`relative z-50 ${isOpen ? "" : "hidden"}`}>
        <div
          className={`fixed inset-y-0 right-0 z-10 w-full px-8 py-4 overflow-y-auto bg-base-200 sm:max-w-sm sm:ring-1 sm:ring-neutral/10 transform origin-right transition ease-in-out duration-300`}
        >
          {/* small 사이즈 화면 : 로고 */}
          <div className="flex items-center justify-between">
            <Link
              className="flex items-center gap-2 shrink-0 "
              title={`${config.appName} hompage`}
              href="/"
            >
              <span className="font-extrabold text-2xl text-sky-600">{config.appName}</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* small 사이즈 화면 : 링크 */}
          <div className="flow-root mt-6">
            <div className="py-4">
              <div className="flex flex-col gap-y-4 items-start">
                {links.map((link) => (
                  <Link
                    href={link.href}
                    key={link.href}
                    className="link link-hover text-lg font-medium"
                    title={link.label}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="divider"></div>
            {/* small 사이즈 화면 : CTA */}
            <div className="flex flex-col">{cta}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
