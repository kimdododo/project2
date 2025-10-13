"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getPosts } from "@/libs/posts";
import { createClient } from "@/libs/supabase";
import ButtonBack from "./ButtonBack";
export default function BoardList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search") || "";

  const [posts, setPosts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    loadPosts();
  }, [page, searchQuery]);

  async function loadPosts() {
    try {
      setIsLoading(true);
      const { posts, totalPages } = await getPosts({
        page,
        search: searchQuery,
      });
      setPosts(posts);
      setTotalPages(totalPages);
    } catch (error) {
      console.error("게시글 로딩 중 오류:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get("search");
    router.push(`/board?search=${search}`);
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ButtonBack />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">게시판</h2>
        {user && (
          <Link href="/board/write" className="btn btn-primary">
            글쓰기
          </Link>
        )}
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="join w-full">
          <input
            name="search"
            className="input input-bordered join-item w-full"
            placeholder="검색어를 입력하세요"
            defaultValue={searchQuery}
          />
          <button type="submit" className="btn join-item">
            검색
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="w-16 text-center">번호</th>
                  <th>제목</th>
                  <th className="w-24">작성자</th>
                  <th className="w-24">작성일</th>
                  <th className="w-20">조회수</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="hover">
                    <td className="text-center">{post.id}</td>
                    <td>
                      <Link
                        href={`/board/${post.id}`}
                        className="hover:text-primary"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td>{post.user_metadata.name || post.user_email}</td>
                    <td>{new Date(post.created_at).toLocaleDateString()}</td>
                    <td className="text-center">{post.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4">
            <div className="join">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <Link
                    key={num}
                    href={`/board?page=${num}${
                      searchQuery ? `&search=${searchQuery}` : ""
                    }`}
                    className={`join-item btn ${
                      page === num ? "btn-active" : ""
                    }`}
                  >
                    {num}
                  </Link>
                )
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
