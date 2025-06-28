"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ClientForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing token.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to set password.");
      } else {
        router.push("/profile");
      }
    } catch {
      setError("Failed to set password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Set Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            required
            minLength={6}
            className="w-full border px-4 py-2 rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
            minLength={6}
            className="w-full border px-4 py-2 rounded pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          {loading ? "Saving..." : "Set Password"}
        </button>
      </form>
    </div>
  );
}
