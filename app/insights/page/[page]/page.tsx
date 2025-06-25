import PostCard from "../../../../components/PostCard";
import { fetchPosts } from "../../../../lib/posts";

export const revalidate = 60;

export default async function InsightsPage({ params }: { params: { page: string } }) {
  const page = parseInt(params.page, 10) || 1;
  const POSTS_PER_PAGE = 6;
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE - 1;
  const posts = await fetchPosts(start, end);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-orbitron">Orbital Insights - Page {page}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
