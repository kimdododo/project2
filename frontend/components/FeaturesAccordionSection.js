"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { AtSign, CreditCard, UserCircle2, Paintbrush } from "lucide-react";

// 기능 배열은 아코디언에 표시될 기능 목록입니다.
// - title: 기능의 제목
// - description: 기능에 대한 설명(클릭 시)
// - type: 미디어 유형(비디오 또는 이미지)
// - path: 미디어 경로(더 나은 SEO를 위해 로컬 경로를 사용해 보세요)
// - format: 미디어의 형식(유형이 '비디오'인 경우)
// - alt: 이미지의 대체 텍스트(유형이 'image'인 경우)
const features = [
  {
    title: "서버 / Database",
    description:
      "supabase를 활용하여 최대한 빠른 개발을 선호합니다. 서버 및 DB 관리에 시간을 쓸 필요 없이 이젠 핵심 기능 개발에 집중할 수 있습니다. 관계형 DB와 서버리스 함수, 스케줄러도 사용 가능합니다.",
    type: "image",
    path: "/feature-accordion/supabase-logo-light.png",
    format: "image",
    alt: "Supabase Logo",
    svg: <AtSign className="w-6 h-6" />,
  },
  {
    title: "결제",
    description:
      "몇달이 걸리는 가장 까다로운 결제 개발도 빠르게 토스 페이먼츠를 통해 바로 사용해보세요. 신용카드, 간편결제, 휴대폰결제 등 다양한 결제 수단을 제공합니다. 백엔드에서는 체크아웃 세션 생성, 웹훅으로 사용자 계정 업데이트(구독, 일회성 결제 등)를 지원합니다.",
    type: "image",
    path: "/feature-accordion/tosspayments-logo.png",
    format: "image",
    alt: "tosspayments-logo",
    svg: <CreditCard className="w-6 h-6" />,
  },
  {
    title: "회원가입, 카카오/구글 로그인",
    description:
      "이메일 임시 로그인(Magic Link), 카카오/구글 등 소셜 로그인(10개 이상 지원), Supabase에 사용자 저장, 비공개/보호된 페이지 및 API 호출 등을 지원합니다. 배포하는 순간 바로 소셜로그인 사용 가능하며 백엔드 로직 또한 사용자가 원하는대로 커스텀 가능합니다.",
    type: "image",
    path: "/feature-accordion/login.png",
    format: "image",
    alt: "login feature image",
    svg: <UserCircle2 className="w-6 h-6" />,
  },
  {
    title: "스타일, 컴포넌트",
    description:
      "디자인과 스타일에 시간을 낭비하지 마세요. 컴포넌트, 애니메이션 및 섹션, daisyUI가 포함된 20개 이상의 테마, 자동 다크 모드 등을 지원하여 개발 시간을 단축하고 사용자 경험을 향상시킬 수 있습니다.",
    type: "image",
    path: "/feature-accordion/component.png",
    format: "image",
    alt: "component example image",
    svg: <Paintbrush className="w-6 h-6" />,
  },
];

// An SEO-friendly accordion component including the title and a description (when clicked.)
const Item = ({ feature, isOpen, setFeatureSelected }) => {
  const accordion = useRef(null);
  const { title, description, svg } = feature;

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-medium text-left md:text-lg"
        onClick={(e) => {
          e.preventDefault();
          setFeatureSelected();
        }}
        aria-expanded={isOpen}
      >
        <span className={`duration-100 ${isOpen ? "text-primary" : ""}`}>
          {svg}
        </span>
        <span
          className={`flex-1 text-base-content ${
            isOpen ? "text-primary font-semibold" : ""
          }`}
        >
          <h3 className="inline">{title}</h3>
        </span>
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out text-base-content-secondary overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed">{description}</div>
      </div>
    </li>
  );
};

// A component to display the media (video or image) of the feature. If the type is not specified, it will display an empty div.
// Video are set to autoplay for best UX.
const Media = ({ feature }) => {
  const { type, path, format, alt } = feature;
  const style = "rounded-2xl aspect-square w-full sm:w-[26rem]";
  const size = {
    width: 500,
    height: 500,
  };

  if (type === "video") {
    return (
      <video
        className={style}
        autoPlay
        muted
        loop
        playsInline
        controls
        width={size.width}
        height={size.height}
      >
        <source src={path} type={format} />
      </video>
    );
  } else if (type === "image") {
    return (
      <div className="flex justify-center border rounded-2xl p-4 object-contain object-center">
        <Image
          src={path}
          alt={alt}
          className={`${style} object-contain object-center`}
          width={size.width}
          height={size.height}
        />
      </div>
    );
  } else {
    return <div className={`${style} !border-none`}></div>;
  }
};

// A component to display 2 to 5 features in an accordion.
// By default, the first feature is selected. When a feature is clicked, the others are closed.
const FeaturesAccordion = () => {
  const [featureSelected, setFeatureSelected] = useState(0);

  return (
    <section
      className="py-24 md:py-32 space-y-24 md:space-y-32 max-w-7xl mx-auto bg-base-100 "
      id="features"
    >
      <div className="px-8">
        <h2 className="font-extrabold text-4xl lg:text-6xl tracking-tight mb-12 md:mb-24">
          핵심 기능만 개발하여 빠르게 배포하고
          <span className="bg-neutral text-neutral-content px-2 md:px-4 ml-1 md:ml-1.5 leading-relaxed whitespace-nowrap">
            바로 매출을 올려보세요!
          </span>
        </h2>
        <div className=" flex flex-col md:flex-row gap-12 md:gap-24">
          <div className="grid grid-cols-1 items-stretch gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20">
            <ul className="w-full">
              {features.map((feature, i) => (
                <Item
                  key={feature.title}
                  index={i}
                  feature={feature}
                  isOpen={featureSelected === i}
                  setFeatureSelected={() => setFeatureSelected(i)}
                />
              ))}
            </ul>

            <Media feature={features[featureSelected]} key={featureSelected} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesAccordion;
