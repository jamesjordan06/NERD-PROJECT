import PostCard from "../../../../components/PostCard";
import { fetchPosts } from "../../../../lib/posts";
import { notFound } from "next/navigation";
// Using the generic PageProps type here results in Next.js inferring that
// `params` is a Promise because this route does not export
// `generateStaticParams`. Explicitly typing the params object keeps the
// function signature simple and avoids type errors during the build.

export const revalidate = 60;

export default async function InsightsPage({
  params,
}: {
  params: { page: string };
}) {
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
