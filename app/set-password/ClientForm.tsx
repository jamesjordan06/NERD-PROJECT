// app/set-password/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import PasswordInput from "@/components/PasswordInput";

export default function SetPasswordPage() {
  const { data: session } = useSession();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/set-password", {
      method: "POST",
      body: JSON.stringify({ password }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
    } else {
      setSuccess("Password updated. Redirecting...");
      await signIn("credentials", {
        redirect: false,
        email: session?.user.email!,
        password,
      });
      router.push("/profile");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Set a New Password</h1>
      <p className="text-sm text-gray-600 mb-4">
        This will allow you to log in using your email and password in the future.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">New Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Confirm Password</label>
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border px-4 py-2 rounded"
            required
            minLength={6}
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Set Password"}
        </button>
      </form>
    </div>
  );
}