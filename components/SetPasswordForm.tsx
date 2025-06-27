"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

export default function SetPasswordForm({
  email,
  unauth = false,
  token,
}: {
  email: string;
  unauth?: boolean;
  token?: string;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = unauth
        ? "/api/set-password-unauth"
        : "/api/set-password";
      const body = unauth ? { token, password } : { password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set password");
      if (unauth) {
        await signIn("credentials", { redirect: false, email, password });
      } else {
        await update();
      }
      toast.success("Password successfully set!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-300">
        It looks like you signed up using Google. Set a password below so you
        can log in with your email and password.
      </p>
      <div>
        <label htmlFor="email" className="text-sm block mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          disabled
          className="w-full p-2 rounded text-black bg-gray-200"
        />
      </div>
      <div>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Password"
          className="w-full p-2 rounded text-black"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="sr-only">
          Confirm Password
        </label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="Confirm Password"
          className="w-full p-2 rounded text-black"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-neon text-white w-full p-2 rounded disabled:opacity-50"
      >
        {loading ? "Setting..." : "Set Password"}
      </button>
    </form>
  );
}
