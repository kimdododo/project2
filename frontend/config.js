import themes from "daisyui/src/theming/themes";

const config = {
  // 필수 : 웹앱 이름을 적어주세요.
  appName: "Yotuberabo",
  // 필수 : 앱 설명 (SEO 태그에 사용됨. 덮어쓸 수 있음)
  appDescription:
    "유튜브 시청자들을 위한 AI 기반 영상 추천 서비스입니다. 개인화된 알고리즘으로 당신에게 딱 맞는 영상을 찾아드립니다.",
  // 필수입력 (https:// 빼고 도메인만 입력. 끝에 /도 빼야 함. ex) yoursite.com
  domainName: "traveltube-analytics.com",
  supportEmail: "support@traveltube-analytics.com",
  colors: {
    // 필수 - DaisyUI 테마 설정 (비워두면 기본 라이트/다크 모드 사용)
    theme: ["bumblebee"],
    // 필수 - 앱 전체 기본 색상 (DaisyUI 테마 색상 사용)
    main: themes["bumblebee"]["primary"],
    // 또는 다음과 같이 사용자 정의 색상을 사용할 수 있습니다.
    // (버튼에 적용됨 ex. btn-primary)
    // main: "#f37055", // HEX 값만 넣어주세요.
  },
  auth: {
    // 필수 - 로그인 경로. 개인 경로 보호 및 401 오류 처리에 사용
    loginUrl: "/signin",
    // 필수 — 로그인 성공 후 리다이렉트될 개인 페이지 경로.
    callbackUrl: "/dashboard",
  },
};

export default config;
