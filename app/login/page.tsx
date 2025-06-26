"use client";

// Ensure this route is rendered on the client to avoid build-time errors
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  console.log("=== LOGIN COMPONENT RENDERED ===");
  console.log("Current error state:", error);
  console.log("Current loading state:", loading);

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
    console.log('=== GOOGLE SIGN IN CLICKED ===');
    console.log('Current URL:', window.location.href);
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
    console.log('NEXT_PUBLIC_NEXTAUTH_URL:', process.env.NEXT_PUBLIC_NEXTAUTH_URL);
    console.log('Window location origin:', window.location.origin);
    
    signIn("google", { 
      callbackUrl: "/profile",
      redirect: true
    }).then((result) => {
      console.log('=== SIGN IN RESULT ===', result);
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
    console.log("=== HANDLE SUBMIT CALLED ===");
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      console.log("=== LOGIN ATTEMPT DEBUG ===");
      console.log("Email:", email);
      
      // First check if the user exists and what type of account they have
      const checkRes = await fetch("/api/check-account-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      console.log("Check account type response status:", checkRes.status);

      if (checkRes.ok) {
        const accountData = await checkRes.json();
        console.log("Account data:", accountData);
        
        if (accountData.accountType === "oauth-only") {
          console.log("OAuth-only account detected - showing error message");
          setError("This account was created with Google. Please sign in with Google, or set a password to enable email/password sign-in.");
          setLoading(false);
          return;
        }
      } else {
        console.log("Check account type failed:", checkRes.status);
      }

      console.log("Proceeding with normal sign in");
      // Proceed with normal sign in
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      console.log("Sign in result:", res);

      if (res?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/profile");
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
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
