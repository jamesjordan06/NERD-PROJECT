// app/forum/[threadId]/page.tsx
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import ThreadCard from "../../../components/ThreadCard";
import ReplyForm from "../../../components/ReplyForm";
import ReplyCard from "../../../components/ReplyCard";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";

type Thread = {
  id: string;
  title: string;
  body: string;
  user_id: string;
  created_at: string;
};

type Reply = {
  id: string;
  body: string;
  user_id: string;
  created_at: string;
};

export default function ThreadDetail() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const { threadId } = useParams<{ threadId: string }>();

  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    // 1) Fetch the thread itself
    const { data: t, error: threadErr } = await supabase
      .from("threads")
      .select("*")
      .eq("id", threadId)
      .maybeSingle();
    if (threadErr) throw threadErr;
    setThread(t ?? null);

    // 2) Fetch its replies
    const { data: reps, error: replyErr } = await supabase
      .from("replies")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    if (replyErr) throw replyErr;
    setReplies(reps || []);

    setLoading(false);
  }, [supabase, threadId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <p className="p-6">Loading…</p>;
  if (!thread) return <p className="p-6">Thread not found.</p>;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <ThreadCard thread={thread} onDeleted={() => history.back()} />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Replies</h2>
        {replies.length === 0 ? (
          <p>No replies yet. Be the first to reply!</p>
        ) : (
          replies.map((r) => <ReplyCard key={r.id} reply={r} />)
        )}
      </section>
      <ReplyForm threadId={threadId} onSuccess={fetchData} />
    </div>
  );
}
