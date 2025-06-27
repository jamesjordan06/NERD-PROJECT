"use client";

import { motion } from "framer-motion";

interface Post {
  id: string;
  title: string;
  excerpt?: string | null;
  image_url?: string | null;
  slug: string;
  published_at?: string | null;
}

interface FeaturesProps {
  posts: Post[];
}

export default function Features({ posts }: FeaturesProps) {
  // Get the first 3 posts for featured section
  const featuredPosts = posts.slice(0, 3);

  return (
    <section className="py-16 bg-spacex">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-orbitron text-white mb-8 text-center">
          Latest from the Cosmos
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map((post, i) => (
            <motion.div
              key={post.id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-spacex border border-white/10 p-6 rounded-xl shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div>
                {post.image_url && (
                  <div className="h-32 w-full overflow-hidden rounded-lg mb-4">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white mb-2 hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-spacex-gray text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                {post.published_at && (
                  <span className="text-xs text-gray-500 mt-2 block">
                    {new Date(post.published_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
