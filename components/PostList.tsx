import type { Post } from "../lib/posts";

export default function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => {
        const imageUrl = post.image_url || "";

        const formattedDate = post.published_at
          ? new Date(post.published_at).toLocaleDateString()
          : "";

        return (
          <div
            key={post.slug}
            className="block group bg-spacex border border-white/10 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-primary/30"
          >
            {imageUrl ? (
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : null}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-spacex-gray mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              {formattedDate && (
                <span className="text-sm text-gray-500">{formattedDate}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
