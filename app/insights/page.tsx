import Link from "next/link";
import { fetchPosts } from "@/lib/posts";

export default async function InsightsPage() {
  const posts = await fetchPosts(0, 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6 text-center">Insights</h1>
      <div className="grid gap-8">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/insights/${post.slug}`}
            className="block bg-gray-900 hover:bg-gray-800 transition rounded-lg p-6 border border-gray-800"
          >
            <h2 className="text-2xl font-semibold">{post.title}</h2>
            {post.excerpt && (
              <p className="mt-2 text-gray-400 line-clamp-3">{post.excerpt}</p>
            )}
            <span className="text-sm text-gray-500 mt-4 block">
              {post.published_at &&
                new Date(post.published_at).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
