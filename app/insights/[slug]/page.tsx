// app/insights/[slug]/page.tsx

import { Metadata } from "next";
import { fetchPostBySlug, fetchPosts } from "../../../lib/posts";

interface Post {
  title: string;
  excerpt?: string | null;
  image_url?: string | null;
  body?: string | null;
  published_at?: string | null;
  authorName?: string | null;
  authorImage?: string | null;
}

// Generate the list of slugs at build time so Next.js
// can properly type the `params` prop for this route
export async function generateStaticParams() {
  const posts = await fetchPosts(0, 100);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
  };
}



export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return <p className="text-center py-20">Post not found.</p>;
  }

  return (
    <article className="prose prose-invert mx-auto py-10 px-4">
      <h1>{post.title}</h1>

      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className="rounded-lg my-6 w-full"
        />
      )}

      <div dangerouslySetInnerHTML={{ __html: post.body || '' }} />

      <footer className="mt-12 flex items-center space-x-4 text-sm text-gray-400">
        {post.authorImage && (
          <img
            src={post.authorImage}
            width={50}
            height={50}
            alt={post.authorName ?? ''}
            className="rounded-full"
          />
        )}
        <span>
          {post.authorName}
          {post.published_at && ` • ${new Date(post.published_at).toLocaleDateString()}`}
        </span>
      </footer>
    </article>
  );
}
