"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => {
    setError(null);
    signIn("google", { callbackUrl: "/" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    const pwd = password;

    // 1️⃣ Sign up via API
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmedEmail, password: pwd }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      setError(error ?? "Signup failed");
      return;
    }

    // 2️⃣ Auto-login via Credentials provider (no redirect)
    const result = await signIn("credentials", {
      redirect: false,
      email: trimmedEmail,
      password: pwd,
    });

    if (result?.ok) {
      router.push("/profile");
    } else {
      setError("Login failed after signup");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <h1 className="text-3xl font-orbitron text-center">Sign Up</h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      <button
        onClick={handleGoogle}
        className="flex items-center justify-center w-full border rounded px-4 py-2 hover:bg-gray-100"
      >
        <FcGoogle className="mr-2" size={24} />
        Continue with Google
      </button>

      <div className="flex items-center">
        <hr className="flex-grow" />
        <span className="px-2 text-gray-400">or</span>
        <hr className="flex-grow" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="p-2 w-full rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 w-full rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-neon px-4 py-2 text-white rounded-2xl w-full"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}
