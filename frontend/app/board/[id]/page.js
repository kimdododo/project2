"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPost, deletePost } from "@/libs/posts";
import { createClient } from "@/libs/supabase";
import ButtonBackHome from "@/components/ButtonBackHome";

export default function PostPage({ params }) {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    loadPost();
  }, [params.id]);

  async function loadPost() {
    try {
      const post = await getPost(params.id);
      if (!post) {
        setError("게시글을 찾을 수 없습니다");
        return;
      }
      setPost(post);
    } catch (error) {
      console.error("게시글 로딩 중 오류:", error);
      setError("게시글을 불러오는 중 오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      await deletePost(params.id);
      router.push("/board");
    } catch (error) {
      console.error("게시글 삭제 중 오류:", error);
      alert("게시글 삭제에 실패했습니다.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <ButtonBackHome />
        <div className="text-center">id에 해당하는 게시글이 없습니다.</div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <ButtonBackHome />

      <article className="mt-6">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="flex justify-between items-center text-sm text-gray-600 mb-8">
          <div className="flex items-center gap-2">
            <span>작성자: {post.user_metadata.name || post.user_email}</span>
            {post.user_metadata.avatar_url && (
              <img
                src={post.user_metadata.avatar_url}
                alt="프로필 이미지"
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="mx-2">|</span>
            <span>
              작성일: {new Date(post.created_at).toLocaleDateString()}
            </span>
            <span className="mx-2">|</span>
            <span>조회수: {post.views}</span>
          </div>

          {user?.id === post.user_id && (
            <div className="space-x-2">
              <button
                onClick={() => router.push(`/board/${params.id}/edit`)}
                className="btn btn-sm"
              >
                수정
              </button>
              <button onClick={handleDelete} className="btn btn-sm btn-error">
                삭제
              </button>
            </div>
          )}
        </div>

        <div className="prose max-w-none">
          {post.content.split("\n").map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
