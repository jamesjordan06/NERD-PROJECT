// app/set-password/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SetPasswordPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    // Check if user already has a password set
    if (status === "authenticated" && session?.user?.id) {
      checkPasswordStatus();
    }
  }, [status, session, router]);

  const checkPasswordStatus = async () => {
    try {
      const res = await fetch("/api/check-password-status");
      if (res.ok) {
        const data = await res.json();
        if (data.hasPassword) {
          // User already has a password, redirect to home
          router.replace("/");
        }
      }
    } catch (error) {
      console.error("Error checking password status:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      
      // Refresh the session to update the auth state
      await update();
      
      // Redirect to home page after successful password setting
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      setError("An error occurred while setting the password.");
      setLoading(false);
    }
  };

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <h1 className="text-3xl font-orbitron text-center">Set Password</h1>

      {success ? (
        <div className="text-center">
          <p className="text-green-600">Password updated successfully!</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to home page...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="p-2 w-full rounded text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="p-2 w-full rounded text-black"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={loading}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-neon px-4 py-2 text-white rounded-2xl w-full disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Setting Password..." : "Set Password"}
          </button>
        </form>
      )}
    </div>
  );
}
