import { ArrowDown } from "lucide-react";

const Arrow = ({ extraStyle }) => {
  return (
    <ArrowDown
      className={`shrink-0 w-12 stroke-neutral-content opacity-70 ${extraStyle}`}
    />
  );
};

const Step = ({ emoji, text }) => {
  return (
    <div className="w-full md:w-48 flex flex-col gap-2 items-center justify-center">
      <span className="text-4xl">{emoji}</span>
      <h3 className="font-bold">{text}</h3>
    </div>
  );
};

// 이 상품이 고객의 어떤 문제를 해결하는지 구체적으로 설명해주세요.
const Problem = () => {
  return (
    <section className="bg-base-content text-neutral-content">
      <div className="max-w-7xl mx-auto px-8 py-16 md:py-32 text-center">
        <h2 className="max-w-3xl mx-auto font-extrabold text-4xl md:text-5xl tracking-tight mb-6 md:mb-8">
          {`정부지원금이나 수천만원 투자받아서 개발한 제품이 실패하는 이유는 무엇일까요?
          `}
        </h2>
        <p className="max-w-xl mx-auto text-lg opacity-90 leading-relaxed mb-12 md:mb-20">
          스타트업의 평균 MVP 개발 기간 3개월.. 최소 비용 500만원부터
          3천만원까지. 대부분의 스타트업이 기본 기능(회원가입, 로그인, 결제,
          이메일 등)만 개발하다가 많은 비용을 소모하고 실패합니다.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-6">
          <Step emoji="🧑‍💻" text="서버 세팅하고 회원가입, 로그인 개발에만 2주" />

          <Arrow extraStyle="max-md:-scale-x-100 md:-rotate-90" />

          <Step emoji="😮‍💨" text="개발했는데 또 에러나네? 유지보수에 1주" />

          <Arrow extraStyle="md:-scale-x-100 md:-rotate-90" />

          <Step
            emoji="😔"
            text="게시판이랑 결제, 메인 기능은 대체 언제 개발하지?"
          />
        </div>
      </div>
    </section>
  );
};

export default Problem;
