export default function PostCard({ post }: { post: any }) {
  return (
    <article className="bg-slate-800 rounded-2xl shadow p-4">
      <h3 className="font-orbitron text-xl">{post.title}</h3>
      <p className="mt-2 text-sm">{post.excerpt}</p>
    </article>
  );
}
