// app/reset-password/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClientComponentClient(), []);
  const router = useRouter();
  const pathname = usePathname();

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/login");
    });
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus("error");
    } else {
      setStatus("success");
      setTimeout(() => router.push(`/login?callbackUrl=${pathname}`), 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Set New Password</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          placeholder="New password"
          className="p-2 w-full rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white w-full p-2 rounded">
          Reset Password
        </button>
      </form>

      {status === "success" && (
        <p className="text-green-600 mt-4">Password updated! Redirecting to login...</p>
      )}
      {status === "error" && (
        <p className="text-red-600 mt-4">Something went wrong. Try again.</p>
      )}
    </div>
  );
}
