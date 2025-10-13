import { createClient } from "./supabase";

const POSTS_PER_PAGE = 10;

export async function getPosts({ page = 1, search = "" }) {
  const supabase = createClient();

  let query = supabase
    .from("posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE - 1);

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data: posts, count, error } = await query;

  if (error) throw error;

  return {
    posts,
    totalPages: Math.ceil(count / POSTS_PER_PAGE),
  };
}

export async function getPost(id) {
  const supabase = createClient();

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  // 조회수 증가
  await supabase
    .from("posts")
    .update({ views: (post.views || 0) + 1 })
    .eq("id", id);

  return post;
}

export async function createPost({ title, content }) {
  const supabase = createClient();

  // 현재 로그인한 사용자 정보 가져오기
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        title,
        content,
        user_id: user.id,
        user_email: user.email,
        user_metadata: user.user_metadata || {},
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}

export async function updatePost({ id, title, content }) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("posts")
    .update({
      title,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
}

export async function deletePost(id) {
  const supabase = createClient();

  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) throw error;
}
