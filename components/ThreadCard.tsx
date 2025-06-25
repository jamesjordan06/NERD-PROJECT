// components/ThreadCard.tsx
"use client";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState, useMemo } from "react";

type Thread = { id: string; title: string; body: string; user_id: string; created_at: string; };

export default function ThreadCard({
  thread,
  onDeleted
}: {
  thread: Thread;
  onDeleted?: () => void;
}) {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [own, setOwn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setOwn(session?.user.id === thread.user_id);
    });
  }, [supabase, thread.user_id]);

  const handleDelete = async () => {
    if (confirm("Delete this thread?")) {
      await supabase.from("threads").delete().eq("id", thread.id);
      onDeleted?.();
    }
  };

  return (
    <div className="p-4 mb-4 border rounded bg-midnight-light">
      <Link href={`/forum/${thread.id}`}>
        <h2 className="text-xl font-semibold hover:underline">{thread.title}</h2>
      </Link>
      <p className="text-gray-300 mt-1 line-clamp-2">{thread.body}</p>
      <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
        <span>{new Date(thread.created_at).toLocaleString()}</span>
        {own && <button onClick={handleDelete} className="text-red-500">Delete</button>}
      </div>
    </div>
  );
}
