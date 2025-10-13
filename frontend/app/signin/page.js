"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import config from "@/config";
import HeaderCenter from "@/components/HeaderCenter";
import ButtonGoogleLogin from "@/components/ButtonGoogleLogin";
import ButtonKakaoLogin from "@/components/ButtonKakaoLogin";

// Supabase 회원가입 및 로그인 페이지
export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSignup = async (e, options) => {
    e?.preventDefault();

    setIsLoading(true);

    try {
      const { type, provider } = options;
      const redirectURL = window.location.origin + "/api/auth/callback";

      if (type === "oauth") {
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: redirectURL,
          },
        });
      }
    } catch (error) {
      console.error(error);
      if (error.message === "Invalid OTP") {
        toast.error("OTP 코드가 올바르지 않습니다.");
      } else if (error.message === "Invalid login credentials") {
        toast.error("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
      } else {
        toast.error(error.message || "로그인에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) throw new Error("BAD_CREDENTIALS");

      const data = await res.json();
      if (!data?.access_token || !data?.user) throw new Error("BAD_SHAPE");

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 디버깅 확인
      console.log("saved token?", !!localStorage.getItem("access_token"));
      console.log("saved user?", !!localStorage.getItem("user"));

      toast.success("로그인에 성공했습니다!");
      
      const redirectTo = searchParams.get("redirect") || "/recommendations";
      router.replace(redirectTo); // SPA 네비게이션
    } catch (err) {
      console.error(err);
      toast.error("로그인 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-8 md:p-24" data-theme={config.colors.theme}>
      <HeaderCenter content={"로그인이 필요한 서비스예요."} />
      <div className="space-y-8 max-w-xl mx-auto">
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">
              <span className="label-text">이메일</span>
            </label>
            <input
              id="email"
              type="email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              <span className="label-text">비밀번호</span>
            </label>
            <input
              id="password"
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "이메일로 로그인"
            )}
          </button>
        </form>

        <div className="divider">또는</div>

        <ButtonGoogleLogin
          isLoading={isLoading}
          onClick={(e) =>
            handleSignup(e, { type: "oauth", provider: "google" })
          }
        />
        <ButtonKakaoLogin
          isLoading={isLoading}
          onClick={(e) => handleSignup(e, { type: "oauth", provider: "kakao" })}
        />

        <div className="text-center">
          <p className="text-sm">
            계정이 없으신가요?{" "}
            <a href="/signup" className="link link-primary">
              회원가입
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
