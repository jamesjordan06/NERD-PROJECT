import Link from "next/link";

export default function PostCard({ post }: { post: any }) {
  return (
    <article className="bg-slate-800 rounded-2xl shadow p-4">
      <h3 className="font-orbitron text-xl">
        <Link href={`/insights/${post.slug}`}>{post.title}</Link>
      </h3>
      <p className="mt-2 text-sm">{post.excerpt}</p>
    </article>
  );
}
