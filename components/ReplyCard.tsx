// components/ReplyCard.tsx
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState, useMemo } from "react";

type Reply = {
  id: string;
  body: string;
  user_id: string;
  created_at: string;
};

export default function ReplyCard({ reply }: { reply: Reply }) {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const [isOwn, setIsOwn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsOwn(session?.user.id === reply.user_id);
    });
  }, [supabase, reply.user_id]);

  const handleDelete = async () => {
    if (!confirm("Delete this reply?")) return;
    await supabase.from("replies").delete().eq("id", reply.id);
    // you might want to call onSuccess here if you pass it in
    window.location.reload(); 
  };

  return (
    <div className="p-4 bg-midnight-light rounded space-y-1">
      <p>{reply.body}</p>
      <p className="text-xs text-gray-400">
        {new Date(reply.created_at).toLocaleString()}
      </p>
      {isOwn && (
        <button onClick={handleDelete} className="text-red-500 text-sm">
          Delete
        </button>
      )}
    </div>
  );
}
