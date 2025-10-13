"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// 줄바꿈을 넣으실 때는 \n 을 사용해주세요.
const faqList = [
  {
    question: "SupaNextTemplate을 결제하면 정확히 무엇이 제공되나요?",
    answer:
      "1. 온라인 비즈니스를 운영하는데 필요한 모든 상용구 코드(서버, DB, 회원가입&로그인, 결제, 블로그, UI 구성 요소 등)가 포함된 NextJS 스타터킷입니다. Nextjs14 버전과 app router를 지원합니다.\n\n 2. 해당 스타터킷은 사업에 필요한 모든 요소를 준비해뒀기에 핵심 기능만 개발하면 바로 스타트업을 시작할 수 있습니다!\n\n",
  },
  {
    question: "단순한 웹사이트 템플릿 아닌가요?",
    answer:
      "단순한 템플릿 그 이상입니다. hero section, pricing section, FAQ section, 블로그 등의 섹션을 복사/붙여넣기를 통해 사이트를 빠르게 구축할 수 있으며 버튼, 모달, 팝오버 등과 같은 다양한 UI 컴포넌트도 얻을 수 있습니다.\n\n 스타터킷에는 자주 사용되는 모든 백엔드 API, 회원가입, 로그인, 결제, 이메일, SEO 등 온라인 비즈니스를 운영하는 데 필요한 편리한 도구도 함께 제공됩니다.",
  },
  {
    question: "어떻게 사용하나요?",
    answer:
      "1. 결제 > 2. 깃허브 프로젝트 초대 > 3. 코드 다운로드 및 바로 사용하기 순서로 이뤄집니다. 자세한 사용 사항은 Document(문서)를 참고해주세요. 정말 상세하게 잘 쓰여져 있답니다! 만약 부족한 부분이 있다면 언제든지 업데이트 하겠습니다 :)",
  },
  {
    question: "프로젝트마다 라이센스를 따로 구매해야 하나요?",
    answer:
      "아니요, 라이센스 한번 구매시 평생 사용 가능하며 다른 프로젝트에도 사용 가능합니다. 라이센스는 개인 사용자(혹은 1인 사업가) 또는 회사 단위로 구매할 수 있습니다. 회사의 경우에는 사용자 한명당 라이센스를 구매해야 합니다. 라이센스는 양도 및 공유 불가능합니다.",
  },
  {
    question: "환불이 가능한가요?",
    answer:
      "제품의 특성상 코드가 제공되기 때문에 환불이 불가능합니다. 구매전 충분히 고려 바랍니다.",
  },
];

const Item = ({ item }) => {
  const accordion = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li>
      <button
        className="relative flex gap-2 items-center w-full py-5 text-base font-semibold text-left border-t md:text-lg border-base-content/6"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
      >
        <span
          className={`flex-1 text-base-content ${isOpen ? "text-primary" : ""}`}
        >
          {item?.question}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        ref={accordion}
        className={`transition-all duration-300 ease-in-out opacity-80 overflow-hidden`}
        style={
          isOpen
            ? { maxHeight: accordion?.current?.scrollHeight, opacity: 1 }
            : { maxHeight: 0, opacity: 0 }
        }
      >
        <div className="pb-5 leading-relaxed whitespace-pre-line">
          <p>{item?.answer}</p>
        </div>
      </div>
    </li>
  );
};

const FAQ = () => {
  return (
    <section className="bg-base-1 00" id="faq">
      <div className="py-24 px-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-12">
        <div className="flex flex-col text-left basis-1/2">
          <p className="inline-block font-semibold text-primary mb-4">FAQ</p>
          <p className="sm:text-4xl text-3xl font-extrabold text-base-content">
            구매전 꼭 읽어보세요 :)
          </p>
        </div>

        <ul className="basis-1/2">
          {faqList.map((item, i) => (
            <Item key={i} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default FAQ;
