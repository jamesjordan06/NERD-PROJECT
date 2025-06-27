import PostCard from "../../../../components/PostCard";
import { fetchPosts } from "../../../../lib/posts";
import { notFound } from "next/navigation";
import type { RouteProps } from "@/types/route-props";

// Explicitly export an empty `generateStaticParams` to signal that this
// route is fully dynamic. This keeps Next.js from typing the `params`
// argument as a Promise and allows us to use the `RouteProps` helper type
// without build errors.

export async function generateStaticParams(): Promise<{ page: string }[]> {
  return [];
}

export const revalidate = 60;

export default async function InsightsPage({
  params,
}: RouteProps<{ page: string }>) {
  const pageNum = Number(params.page);
  if (!Number.isInteger(pageNum) || pageNum < 1) {
    notFound();
  }
  const page = pageNum;
  const POSTS_PER_PAGE = 6;
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE - 1;
  const posts = await fetchPosts(start, end);

  if (!posts.length && page !== 1) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-orbitron">Orbital Insights - Page {page}</h1>
      {posts.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-spacex-gray">No posts found.</p>
      )}
    </section>
  );
}
