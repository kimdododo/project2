"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import Link from "next/link";
import blogPosts from "@/data/blog-posts";

export function BlogSection() {
  const [posts] = useState(blogPosts);

  return (
    <section className="py-20 bg-base-100">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">블로그</h2>
        <div className="max-w-3xl mx-auto">
          {posts.map((post) => (
            <article key={post.id} className="prose lg:prose-xl mx-auto">
              <div className="mb-4">
                <Link href={`/blog/${post.id}`}>
                  <h3 className="text-2xl font-bold hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <time className="text-gray-500">{post.date}</time>
              </div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="markdown-body"
              >
                {post.content}
              </ReactMarkdown>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
