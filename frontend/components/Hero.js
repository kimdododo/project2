import Image from "next/image";
import Link from "next/link";
import UserComment from "./UserComment";
import image from "@/public/hero/hero-image.jpg";

const Hero = () => {
  return (
    <section className="max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20">
      <div className="flex flex-col gap-8 items-center justify-center text-center lg:text-left lg:items-start lg:max-w-[42%]">
        <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight">
          여행 유튜브, AI로 더 똑똑하게 추천
        </h1>
        <p className="text-lg opacity-80 leading-relaxed">
          댓글 감정 분석과 키워드 매칭으로 내 취향에 맞는 여행 영상을 한곳에서.
          채널 분석, 개인화 추천, 지도/일정까지 바로 시작해 보세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/recommendations" className="btn btn-primary btn-wide">채널 추천 보러가기</Link>
          <Link href="/signin" className="btn btn-outline btn-wide">로그인하기</Link>
        </div>

        <UserComment priority={true} />
      </div>
      <div className="lg:w-full">
        <Image
          src={image}
          alt="Product Demo"
          className="w-full rounded-lg"
          priority={true}
          width={500}
          height={500}
        />
      </div>
    </section>
  );
};

export default Hero;
