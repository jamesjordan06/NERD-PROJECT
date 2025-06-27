import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  published_at: string | null;
  authorName?: string | null;
  authorImage?: string | null;
}

export async function fetchPosts(start = 0, end = 5): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false })
    .range(start, end);

  if (error) {
    console.error("fetchPosts error:", error);
    return [];
  }

  return data ?? [];
}

export async function fetchLegalPage(
  slug: string
): Promise<{ title: string; description?: string; body: string } | null> {
  console.log("Fetching legal page for slug:", slug);
  const { data, error } = await supabase
    .from("legal_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("fetchLegalPage error:", error);
    return null;
  }

  console.log("Fetched legal page data:", data);
  return data;
}

export async function fetchLegalPageSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("legal_pages").select("slug");

  if (error) {
    console.error("fetchLegalPageSlugs error:", error);
    return [];
  }

  return (data ?? []).map((row) => row.slug as string);
}
