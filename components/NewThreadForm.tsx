// components/NewThreadForm.tsx
"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function NewThreadForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const supabase = createClientComponentClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const {
      data,
      error: insertError,
    } = await supabase.from("threads").insert([{ title, body }]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setTitle("");
      setBody("");
      onSuccess();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-midnight-light rounded"
    >
      {error && <p className="text-red-500">{error}</p>}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Thread title"
        required
        className="w-full p-2 rounded text-black"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What’s on your mind?"
        required
        className="w-full p-2 rounded text-black"
        rows={4}
      />
      <button type="submit" className="bg-neon text-white px-4 py-2 rounded">
        Post Thread
      </button>
    </form>
  );
}
