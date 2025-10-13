import Image from "next/image";
import UserComment from "./UserComment";

const Test = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-40">
      <div className="flex flex-col gap-10 lg:gap-10 items-center justify-center text-center lg:max-w-[70%]">
        <h1 className="font-jalnanGothic font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
          하루만에 스타트업 시작하기!
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          Nextjs와 각종 컴포넌트로 이뤄진 킷으로 SaaS, AI 도구, 웹앱 서비스를
          아이디어부터 제작까지 단 하루만에 배포해보세요. 회원가입, 로그인,
          결제, 게시판 등 모든 기능이 다 포함되어있습니다.
        </p>
        <button className="btn btn-primary rounded-3xl shadow-xl ">
          스타트업 쉽게 시작하기
        </button>

        <UserComment priority={true} />
      </div>
    </section>
  );
};

export default Test;
