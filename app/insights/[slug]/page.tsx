// app/insights/[slug]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPostBySlug, fetchPosts } from "../../../lib/posts";
import { LOGO_URL } from "../../../lib/assets";


// Generate the list of slugs at build time so Next.js
// can properly type the `params` prop for this route
export async function generateStaticParams() {
  try {
    const posts = await fetchPosts(0, 100);
    return posts.map((post) => ({ slug: post.slug }));
  } catch (error) {
    console.error('Error generating static params for posts:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await fetchPostBySlug(params.slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
  };
}



export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await fetchPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const authorImage = post.authorImage || LOGO_URL;

  return (
    <article className="prose prose-invert mx-auto py-10 px-4">
      <h1>{post.title}</h1>

      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className="rounded-lg my-6 w-full h-auto object-cover"
        />
      )}

      <div dangerouslySetInnerHTML={{ __html: post.body || '' }} />

      <footer className="mt-12 flex items-center space-x-4 text-sm text-gray-400">
        {authorImage && (
          <img
            src={authorImage}
            width={50}
            height={50}
            alt={post.authorName ?? 'Author avatar'}
            className="rounded-full"
          />
        )}
        {post.authorName && <span>{post.authorName}</span>}
        {post.published_at && (
          <span className="ml-1">• {new Date(post.published_at).toLocaleDateString()}</span>
        )}
      </footer>
    </article>
  );
}
