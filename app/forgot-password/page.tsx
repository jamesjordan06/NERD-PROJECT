// app/forgot-password/page.tsx
"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="p-2 w-full rounded text-black"
        />
        <button type="submit" className="bg-blue-600 text-white w-full p-2 rounded">
          Send Reset Link
        </button>
      </form>

      {status === "sent" && (
        <p className="text-green-500 mt-4">Reset link sent! Check your email.</p>
      )}
      {status === "error" && (
        <p className="text-red-500 mt-4">Failed to send reset link.</p>
      )}
    </div>
  );
}
