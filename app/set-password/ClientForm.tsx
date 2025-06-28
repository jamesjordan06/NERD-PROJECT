"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import { toast } from "react-hot-toast";

export default function ClientForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Invalid or expired link");
      return;
    }
    const verify = async () => {
      try {
        const res = await fetch("/api/verify-reset-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (data.valid) {
          setValid(true);
        } else {
          setError("Invalid or expired link");
        }
      } catch (err) {
        setError("Invalid or expired link");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [token]);

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
    try {
      const res = await fetch("/api/set-password-from-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set password");
      toast.success("Password successfully set!");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to set password");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Validating reset link...</p>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!valid) return null;

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <h1 className="text-3xl font-orbitron text-center">Set New Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          placeholder="New password"
          className="p-2 w-full rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordInput
          placeholder="Confirm password"
          className="p-2 w-full rounded text-black"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white w-full p-2 rounded"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
