import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import config from "@/config";

export const dynamic = "force-dynamic";

// 이 라우트는 로그인 성공 후 호출됩니다. 코드를 세션으로 교환하고 콜백 URL로 리다이렉트합니다 (config.js 참조).
export async function GET(req) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  // 코드가 있으면 세션으로 교환.
  // 세션 토큰은 HttpOnly, Secure 플래그가 설정된 쿠키에 저장되어 보안 유지
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 로그인 프로세스가 완료된 후 리다이렉트할 URL
  return NextResponse.redirect(requestUrl.origin + config.auth.callbackUrl);
}
