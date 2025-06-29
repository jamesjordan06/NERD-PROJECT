"use client";

import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ClearSessionPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const clearSession = async () => {
      try {
        // Clear the session via API
        await fetch("/api/clear-session", { method: "POST" });
        
        // Sign out from NextAuth
        await signOut({ redirect: false });
        
        // Redirect to login
        router.push(`/login?callbackUrl=${pathname}`);
      } catch (error) {
        console.error("Error clearing session:", error);
        router.push(`/login?callbackUrl=${pathname}`);
      }
    };

    clearSession();
  }, [router]);

  return (
    <div className="max-w-md mx-auto py-12 text-center">
      <h1 className="text-2xl font-orbitron mb-4">Clearing Session...</h1>
      <p>Redirecting to login page...</p>
    </div>
  );
} 