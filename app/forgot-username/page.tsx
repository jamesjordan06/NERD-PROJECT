"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ForgotUsernamePage() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsername(null);
    setError(null);

    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("email", email)
      .maybeSingle();

    if (error || !data?.username) {
      setError("No user found with that email.");
      return;
    }

    setUsername(data.username);
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <h1 className="text-3xl font-orbitron text-center">Forgot Username</h1>

      <form onSubmit={handleLookup} className="space-y-4">
        <input
          type="email"
          className="w-full p-2 rounded text-black"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-neon text-white px-4 py-2 rounded-2xl"
        >
          Lookup Username
        </button>
      </form>

      {username && (
        <div className="bg-green-100 text-green-800 p-3 rounded">
          Your username is: <strong>{username}</strong>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded">{error}</div>
      )}
    </div>
  );
}
