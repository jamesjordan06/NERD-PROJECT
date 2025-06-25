// components/ReplyForm.tsx
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function ReplyForm({ threadId, onSuccess }: { threadId: string; onSuccess: () => void; }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Grab current user ID from the client
    const {
      data: { session },
      error: sessErr
    } = await supabase.auth.getSession();

    if (sessErr || !session) {
      setError("You must be signed in to reply.");
      return;
    }

    const userId = session.user.id;

    // Insert into your `replies` table
    const { error: insertErr } = await supabase
      .from("replies")
      .insert([
        {
          thread_id: threadId,
          user_id: userId,      // ← your newly‐added column
          body,
        },
      ]);

    if (insertErr) {
      setError(insertErr.message);
    } else {
      setBody("");
      onSuccess();  // refresh the replies list
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-500">{error}</p>}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        placeholder="Write your reply…"
        className="w-full p-2 rounded text-black"
        rows={3}
      />
      <button type="submit" className="bg-neon text-white px-4 py-2 rounded">
        Post Reply
      </button>
    </form>
  );
}
