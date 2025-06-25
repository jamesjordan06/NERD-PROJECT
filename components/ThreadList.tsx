import Link from "next/link";

export default function ThreadList({ threads }: { threads: any[] }) {
  if (!threads.length) return <p>No threads yet.</p>;

  return (
    <ul className="space-y-2">
      {threads.map((t) => (
        <li key={t.id} className="border-b border-slate-700 pb-2">
          <Link href={`/forum/${t.categorySlug}/${t.id}`} className="text-neon">
            {t.title}
          </Link>
          <span className="text-sm ml-2 text-gray-400">
            {t.postsCount} posts
          </span>
        </li>
      ))}
    </ul>
  );
}
