const pricingPlans = [
  {
    name: "베이직",
    amount: 220000,
    description: "기본 템플릿 사용자, 업데이트 X",
    features: [
      { name: "Nextjs 상용구 코드", isShow: true },
      { name: "SEO 최적화", isShow: true },
      { name: "resend 이메일 API", isShow: true },
      { name: "Supabase DB", isShow: true },
      { name: "간편한 소셜 로그인", isShow: true },
      { name: "컴포넌트, 애니메이션", isShow: true },
      { name: "무제한 프로젝트", isShow: true },
      { name: "이메일 우선 답변", isShow: false },
      { name: "평생 업데이트", isShow: false },
    ],
  },
  {
    name: "프로",
    amount: 330000,
    description: "가장 인기 있는 선택, 평생 업데이트.",
    features: [
      { name: "Nextjs 상용구 코드", isShow: true },
      { name: "SEO 최적화", isShow: true },
      { name: "resend 이메일 API", isShow: true },
      { name: "Supabase DB", isShow: true },
      { name: "간편한 소셜 로그인", isShow: true },
      { name: "컴포넌트, 애니메이션", isShow: true },
      { name: "무제한 프로젝트", isShow: true },
      { name: "이메일 우선 답변", isShow: true },
      { name: "평생 업데이트", isShow: true },
    ],
    isFeatured: true,
  },
  {
    name: "비즈니스",
    amount: 550000,
    description: "회사용, 팀을 위한 라이센스",
    features: [
      { name: "Nextjs 상용구 코드", isShow: true },
      { name: "SEO 최적화", isShow: true },
      { name: "resend 이메일 API", isShow: true },
      { name: "Supabase DB", isShow: true },
      { name: "간편한 소셜 로그인", isShow: true },
      { name: "컴포넌트, 애니메이션", isShow: true },
      { name: "무제한 프로젝트", isShow: true },
      { name: "이메일 우선 답변", isShow: true },
      { name: "평생 업데이트", isShow: true },
    ],
  },
];

export default pricingPlans;
