import { logger } from "@/logger";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function getSupabaseClient() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return supabase;
}

// 서버, 롤 권한
export async function getSupabaseClientServiceRole() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  return supabase;
}

// 서버, 세션
export async function getSupabaseSession() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data } = await supabase.auth.getSession();
  const { session } = data;

  if (!session) {
    throw new Error("Not signed in");
  }

  return { supabase, session };
}

// 필수 파라미터
export function validateParams(body, requiredFields) {
  for (const field of requiredFields) {
    if (!body[field]) {
      throw new Error(`${field} is missing`);
    }
  }
}

export function checkAdminUser(userId) {
  if (
    userId !== "e31b743c-81bf-4924-a70c-0374afc6e8b6" &&
    userId !== "88b9a32b-3604-4b66-ae10-6d244f8023a8"
  ) {
    throw new Error("Not admin user");
  }
}

// 중복 체크 함수
export async function checkExistData(supabase, table, userId) {
  const { data: checkData } = await supabase
    .from(table)
    .select("id")
    .eq("user_id", userId);
  if (checkData.length !== 0) {
    throw new Error("Already exist data in table");
  }
}

// 중복 체크 함수, 이벤트 타입 추가
export async function checkExistDataEventType(
  supabase,
  table,
  userId,
  eventType
) {
  const { data: checkData } = await supabase
    .from(table)
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", eventType);

  if (checkData.length !== 0) {
    return false;
  }
  return true;
}

export async function checkExistDataEventTeamType(
  supabase,
  table,
  userId,
  eventType,
  TeamType
) {
  const { data: checkData } = await supabase
    .from(table)
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", eventType)
    .eq("team_type", TeamType);

  if (checkData.length !== 0) {
    return false;
  }
  return true;
}

// 에러 핸들링 함수
export function handleErrors(error, table, logger) {
  let status = 500;
  let errorMessage = "Supabase Network Error";

  if (error.message === "Not signed in") {
    status = 401;
    errorMessage = error.message;
  } else if (error.message === "Missing Parameter") {
    status = 400;
    errorMessage = error.message;
  } else if (error.message === "Not admin user") {
    status = 400;
    errorMessage = "관리자 유저가 아닙니다.";
  } else if (error.message === "Already exist data in table") {
    status = 409;
    errorMessage = "이미 신청 내역이 존재합니다.";
  } else if (error.message === "Invalid verification code") {
    status = 400;
    errorMessage = "인증 코드가 올바르지 않습니다.";
  } else if (error.message === "Email already exists") {
    status = 409;
    errorMessage = "이미 가입된 이메일입니다.";
  }

  logger.error(`API /api/${table} error: ${error}`);
  return { status, errorMessage };
}

export const parseBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const lowercased = value.toLowerCase().trim();
    if (lowercased === "true" || lowercased === "yes" || lowercased === "1")
      return true;
    if (lowercased === "false" || lowercased === "no" || lowercased === "0")
      return false;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  return null;
};

export const handleNullValue = (col, type) => {
  return `CASE 
    WHEN c.${col} IS NULL OR c.${col} = 'null' THEN NULL 
    ELSE c.${col}::${type} 
  END`;
};

export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    process?.env?.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000/";
  url = url.includes("http") ? url : `https://${url}`;
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};

// 이미 배포한 상태에서 로그를 확인하기 위해 supabase 테이블에 로그를 저장하는 함수
export async function saveLogToSupabase(table, message) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const log = {
    table: table,
    message: message,
  };
  const { data, error } = await supabase.from("logs").insert([log]);
  if (error) {
    logger.error(`Error saving log to supabase: ${error}`);
  }
}
