"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/libs/posts";
import { createClient } from "@/libs/supabase";
import ButtonBackHome from "@/components/ButtonBackHome";

export default function WritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 페이지 로드시 로그인 체크
    checkAuth();
  }, []);

  async function checkAuth() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
      router.push("/signin?redirect=/board/write");
      return;
    }

    setUser(user);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      alert("로그인이 필요합니다.");
      router.push("/signin?redirect=/board/write");
      return;
    }

    setIsLoading(true);

    try {
      const post = await createPost({ title, content });
      router.push(`/board/${post.id}`);
    } catch (error) {
      console.error("게시글 작성 중 오류:", error);
      if (error.message === "로그인이 필요합니다.") {
        router.push("/signin?redirect=/board/write");
      } else {
        alert("게시글 작성에 실패했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // 로딩 중이거나 사용자 체크 중일 때 로딩 표시
  if (!user) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <ButtonBackHome />

      <h1 className="text-2xl font-bold mb-6 mt-4">게시글 작성</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="제목을 입력하세요"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <textarea
            placeholder="내용을 입력하세요"
            className="textarea textarea-bordered w-full h-64"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => router.back()}
          >
            취소
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "저장"
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
