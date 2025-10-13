"use client";

import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import blogPosts from "@/data/blog-posts";
import ButtonBackHome from "@/components/ButtonBackHome";

export default function BlogPost() {
  const params = useParams();
  const post = blogPosts.find((post) => post.id === parseInt(params.id));

  if (!post) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            포스트를 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-8">
            요청하신 ID {params.id}에 해당하는 블로그 포스트가 존재하지 않습니다
          </p>
          <ButtonBackHome />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <ButtonBackHome />

      <article className="prose lg:prose-xl mx-auto mt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <time className="text-gray-500">{post.date}</time>
        </div>

        <ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown-body">
          {post.content}
        </ReactMarkdown>
      </article>
    </main>
  );
}
