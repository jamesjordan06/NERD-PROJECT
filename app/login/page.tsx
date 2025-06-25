"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      setError(err);
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
      callbackUrl: "/",
      redirect: true
    }).then((result) => {
      console.log('=== SIGN IN RESULT ===', result);
      if (result?.error) {
        console.error('Sign in error:', result.error);
        setError(result.error);
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

    const res = await signIn("credentials", {
      redirect: false,
      login,
      password,
    });

    setLoading(false);

    if (res?.error) {
      if (res.error === "PasswordNotSet") {
        setError(
          "You signed up with Google. Please set your password to log in directly."
        );
      } else {
        setError("Username or password is incorrect.");
      }
      return;
    }

    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <h1 className="text-3xl font-orbitron text-center">Login</h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded">
          {error}
          {error.includes("Google") && (
            <a href="/set-password" className="underline ml-1">
              Set password
            </a>
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
        <label htmlFor="login" className="sr-only">Username or Email</label>
        <input
          id="login"
          type="text"
          name="login"
          placeholder="Username or Email"
          className="p-2 w-full rounded text-black"
          value={login}
          onChange={(e) => setLogin(e.target.value.trim())}
          required
          autoComplete="username"
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
