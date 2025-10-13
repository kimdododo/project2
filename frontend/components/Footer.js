import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import logo from "@/app/icon.png";
import { useState } from "react";
import { ChevronDown, Globe, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

// 사업자 관련 정보
const companyInfo = {
  name: "수파 스타트업",
  company_number: "123-45-67890",
  selling_number: "제2024-서울-00000호",
  owner: "김수파",
  address:
    "광주광역시 대성학원",
  email: "supa@supastartup.com",
};

const Footer = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("Korean");

  return (
    <footer className="bg-gradient-to-br from-blue-800 to-blue-900 border-t border-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-8 py-24">
        {/* 고객센터 정보 */}
        <div className="mb-8 pb-6 border-b border-blue-700">
          <p className="text-sm text-blue-200">
            고객센터 : 광주광역시 인공지능사관학교 데이터분석반
          </p>
        </div>

        <div className="flex lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
          <div className="w-64 flex-shrink-0 md:mx-0 mx-auto text-left">
            <Link
              href="/#"
              aria-current="page"
              className="flex gap-2 justify-start items-center "
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                priority={true}
                className="w-6 h-6"
                width={24}
                height={24}
              />
              <strong className="font-extrabold tracking-tight text-base md:text-lg">
                {config.appName}
              </strong>
            </Link>
            {/* 앱 설명 */}
            <p className="mt-3 text-sm text-white">{config.appDescription}</p>

            <p className="mt-3 text-sm text-gray-500">
              Copyright © {new Date().getFullYear()} - All rights reserved
            </p>
            {/* 사업자 정보 */}
            <p className="mt-3 text-sm text-gray-500">
              {companyInfo.name} | 사업자등록번호 : {companyInfo.company_number}{" "}
              | 대표자명 : {companyInfo.owner}
            </p>
          </div>
          
          <div className="flex-grow flex flex-wrap justify-start -mb-10 md:mt-0 mt-10 text-left">
            {/* 첫 번째 컬럼 */}
            <div className="lg:w-1/4 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-blue-300 tracking-widest text-sm text-left mb-3">
                서비스
              </div>
              <div className="flex flex-col justify-start items-start gap-2 mb-10 text-sm">
                <Link href="/tos" className="link link-hover">
                  서비스 이용약관
                </Link>
                <Link href="/privacy-policy" className="link link-hover">
                  개인정보 처리방침
                </Link>
                <Link href="/location" className="link link-hover">
                  위치기반서비스 이용약관
                </Link>
                <Link href="/consumer-protection" className="link link-hover">
                  금융소비자보호
                </Link>
              </div>
            </div>

            {/* 두 번째 컬럼 */}
            <div className="lg:w-1/4 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-blue-300 tracking-widest text-sm text-left mb-3">
                금융서비스
              </div>
              <div className="flex flex-col justify-start items-start gap-2 mb-10 text-sm">
                <Link href="/financial-terms" className="link link-hover">
                  통합 금융정보 서비스 약관
                </Link>
                <Link href="/recruitment-privacy" className="link link-hover">
                  개인정보 처리방침
                </Link>
                <Link href="/merchant-notice" className="link link-hover">
                  고지사항
                </Link>
                <Link href="/business-privacy" className="link link-hover">
                  개인정보 처리방침
                </Link>
              </div>
            </div>

            {/* 세 번째 컬럼 */}
            <div className="lg:w-1/4 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-blue-300 tracking-widest text-sm text-left mb-3">
                데이터서비스
              </div>
              <div className="flex flex-col justify-start items-start gap-2 mb-10 text-sm">
                <Link href="/mydata-terms" className="link link-hover">
                  마이데이터 서비스 이용약관
                </Link>
                <Link href="/admin-privacy" className="link link-hover">
                  어드민 서비스 개인정보 처리방침
                </Link>
                <Link href="/electronic-signature" className="link link-hover">
                  전자서명인증업무준칙
                </Link>
                <Link href="/quick-transfer-privacy" className="link link-hover">
                  퀵계좌이체 개인정보 처리방침
                </Link>
              </div>
            </div>

            {/* 네 번째 컬럼 */}
            <div className="lg:w-1/4 md:w-1/2 w-full px-4">
              <div className="footer-title font-semibold text-blue-300 tracking-widest text-sm text-left mb-3">
                이용자권리
              </div>
              <div className="flex flex-col justify-start items-start gap-2 mb-10 text-sm">
                <Link href="/user-rights" className="link link-hover">
                  이용자의 권리 및 유의사항
                </Link>
                <Link href="/cctv-policy" className="link link-hover">
                  고정형 영상정보처리기기 운영 관리 방침
                </Link>
                <Link href="/electronic-certificate" className="link link-hover">
                  전자인증서비스 약관
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 섹션 */}
        <div className="mt-8 pt-6 border-t border-blue-700 flex flex-col md:flex-row justify-between items-center">
          {/* 소셜 미디어 아이콘 */}
          <div className="flex gap-4 mb-4 md:mb-0">
            <a href="#" className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors">
              <Globe className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          </div>

          {/* 언어 선택 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg">🇰🇷</span>
              <span className="text-sm">{selectedLanguage}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {isLanguageOpen && (
              <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[120px]">
                <button
                  onClick={() => {
                    setSelectedLanguage("Korean");
                    setIsLanguageOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span>🇰🇷</span>
                  Korean
                </button>
                <button
                  onClick={() => {
                    setSelectedLanguage("English");
                    setIsLanguageOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span>🇺🇸</span>
                  English
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
