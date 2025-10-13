"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPost, updatePost } from "@/libs/posts";
import ButtonBackHome from "@/components/ButtonBackHome";

export default function EditPage({ params }) {
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPost();
  }, [params.id]);

  async function loadPost() {
    try {
      const post = await getPost(params.id);
      setPost(post);
      setTitle(post.title);
      setContent(post.content);
    } catch (error) {
      console.error("게시글 로딩 중 오류:", error);
      router.push("/board");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updatePost({
        id: params.id,
        title,
        content,
      });
      router.push(`/board/${params.id}`);
    } catch (error) {
      console.error("게시글 수정 중 오류:", error);
      alert("게시글 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4">
      <ButtonBackHome />

      <h1 className="text-2xl font-bold mb-6 mt-4">게시글 수정</h1>

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
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? (
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
