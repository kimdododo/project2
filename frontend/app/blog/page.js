import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import blogPosts from "@/data/blog-posts";
import ButtonBack from "@/components/ButtonBack";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

export const metadata = getSEOTags({
  title: `블로그 | ${config.appName}`,
  canonicalUrlRelative: "/blog",
});

export default function BlogList() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <ButtonBack />

      <div className="text-center mb-8 mt-4">
        <h1 className="text-4xl font-bold mb-4">블로그</h1>
        <p className="text-gray-600">
          개발과 관련된 유용한 정보들을 공유합니다
        </p>
      </div>

      <div className="grid gap-8">
        {blogPosts.map((post) => (
          <Link key={post.id} href={`/blog/${post.id}`} className="block">
            <article className="p-6 bg-white rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.08)] hover:shadow-[0_0_25px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out hover:scale-[1.02] group">
              <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <time className="text-gray-500 text-sm mb-4 block">
                {post.date}
              </time>
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="markdown-body"
                >
                  {post.content.split("\n\n")[0] + " ..."}
                </ReactMarkdown>
              </div>
              <span className="inline-block mt-4 text-primary group-hover:text-primary-focus">
                더 읽기 →
              </span>
            </article>
          </Link>
        ))}
      </div>
    </main>
  );
}
