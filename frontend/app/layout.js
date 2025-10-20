import { Noto_Sans_KR } from "next/font/google";
import PlausibleProvider from "next-plausible";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import AuthGuard from "@/components/AuthGuard";
import config from "@/config";
import "./globals.css";
// import { JalnanGothic } from "./globals.css";

// 기본 폰트
// const font = Inter({ subsets: ["latin"] });

// google에서 제공하는 폰트는 다음과 같이 사용할 수 있습니다.
// 한글 제공하는 폰트 : Noto_Sans_KR, Nanum_Gothic, Nanum_Myeongjo, Do_Hyeon, Hahmlet, Orbit
const font = Noto_Sans_KR({
  // weight: ["400"], // 특정 weight만 추가하고 싶은 경우 주석 해제.
  subsets: ["latin"],
});

// 커스텀 폰트(다운로드 받은 경우)는 public/fonts 경로에서 사용해주세요.

export const viewport = {
  // Will use the primary color of your theme to show a nice theme color in the URL bar of supported browsers
  themeColor: config.colors.main,
  width: "device-width",
  initialScale: 1,
  // PWA 지원
  userScalable: false,
  maximumScale: 1,
};

// This adds default SEO tags to all pages in our app.
// You can override them in each page passing params to getSOTags() function.
export const metadata = getSEOTags();

export default function RootLayout({ children }) {
  return (
    <html lang="ko" data-theme={config.colors.theme} className={font.className}>
      {config.domainName && (
        <head>
          <PlausibleProvider domain={config.domainName} />
          {/* PWA 메타 태그 */}
          <meta name="application-name" content="Yotuberabo" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Yotuberabo" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-config" content="/icons/browserconfig.xml" />
          <meta name="msapplication-TileColor" content="#0ea5e9" />
          <meta name="msapplication-tap-highlight" content="no" />
          <meta name="theme-color" content="#0ea5e9" />
          
          <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" />
          
          <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#0ea5e9" />
          <link rel="shortcut icon" href="/favicon.ico" />
        </head>
      )}
      <body>
        {/* ClientLayout contains all the client wrappers (Crisp chat support, toast messages, tooltips, etc.) */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
