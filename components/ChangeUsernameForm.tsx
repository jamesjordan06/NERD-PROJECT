"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function ChangeUsernameForm({ current }: { current: string | null }) {
  const { update } = useSession();
  const [username, setUsername] = useState(current ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/change-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername: username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update username");
      toast.success("Username updated");
      await update();
    } catch (err: any) {
      toast.error(err.message || "Failed to update username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6 max-w-md">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="New username"
        className="w-full p-2 rounded text-black"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-neon text-white w-full p-2 rounded disabled:opacity-50"
      >
        {loading ? "Updating..." : "Change Username"}
      </button>
    </form>
  );
}
