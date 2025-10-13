module.exports = {
  // 필수: 자신의 도메인 주소를 여기에 추가하세요
  siteUrl: process.env.SITE_URL || "https://yoursite.com",
  generateRobotsTxt: true,
  // 이 옵션을 사용하여 사이트맵에서 제외할 경로를 지정합니다 (예: 사용자 대시보드). 기본적으로 NextJS 앱 라우터 메타데이터 파일은 제외됩니다 (https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
  exclude: ["/icon.*"],
};
