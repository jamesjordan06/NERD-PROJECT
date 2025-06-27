"use client";

// Ensure this route is rendered on the client to avoid build-time errors
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      if (err === "AccessDenied") {
        setError("Google sign-in was cancelled. Please try again or use email/password login.");
      } else {
        setError(err);
      }
    }
  }, [searchParams]);
  
  const handleGoogle = () => {
    setLoading(true);
    
    signIn("google", { 
      callbackUrl: "/profile",
      redirect: true
    }).then((result) => {
      if (result?.error) {
        console.error('Sign in error:', result.error);
        if (result.error === "OAuthAccountNotLinked") {
          setError("This email is already registered with a password. Please sign in with your email and password, or use a different Google account.");
        } else {
          setError(result.error);
        }
        setLoading(false);
      }
    }).catch((error) => {
      console.error('=== SIGN IN ERROR ===', error);
      setError(error.message || 'Sign in failed');
      setLoading(false);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1️⃣  Check the account type
      const checkRes = await fetch("/api/check-account-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!checkRes.ok) {
        setError("Unable to verify account.");
        return;
      }

      const { accountType } = await checkRes.json();

      // 2️⃣  OAuth-only user → send password setup email
      if (accountType === "oauth-only") {
        const sendRes = await fetch("/api/send-set-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (sendRes.ok) {
          toast.success("Check your email for a link to set your password");
          router.push("/");
        } else {
          const data = await sendRes.json();
          setError(data.error || "Failed to send email");
        }
        return; // ⛔️ do NOT call signIn()
      }

      // 3️⃣  Optionally handle "none" (no account)
      if (accountType === "none") {
        setError("No account found with that email.");
        return;
      }

      // 4️⃣  Password-enabled account → proceed with credential sign-in
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/profile");
    } catch (err) {
      console.error("Login error:", err);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <h1 className="text-3xl font-orbitron text-center">Login</h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">
          {error}
          {error.includes("Google") && (
            <div className="mt-2">
              <a 
                href={`/set-password?email=${encodeURIComponent(email)}`} 
                className="text-blue-600 underline hover:text-blue-800"
              >
                Set password for this account
              </a>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleGoogle}
        className="flex items-center justify-center w-full border rounded px-4 py-2 hover:bg-gray-100"
        aria-label="Sign in with Google"
        disabled={loading}
      >
        <FcGoogle className="mr-2" size={24} />
        {loading ? "Redirecting..." : "Continue with Google"}
      </button>

      <div className="flex items-center">
        <hr className="flex-grow" />
        <span className="px-2 text-gray-400">or</span>
        <hr className="flex-grow" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="email" className="sr-only">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          className="p-2 w-full rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          required
          autoComplete="email"
        />
        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          className="p-2 w-full rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <button
          type="submit"
          className="bg-neon px-4 py-2 text-white rounded-2xl w-full"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      {/* 🔗 Forgot Links */}
      <div className="flex justify-between text-sm text-gray-400 mt-4">
        <a href="/forgot-password" className="hover:underline">
          Forgot Password?
        </a>
        <a href="/forgot-username" className="hover:underline">
          Forgot Username?
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
