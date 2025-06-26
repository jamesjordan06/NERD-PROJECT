// app/set-password/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

export default function SetPasswordPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    // If user is authenticated, check if they need to set password
    if (status === "authenticated" && session?.user?.id) {
      checkPasswordStatus();
    } else if (status === "unauthenticated") {
      // For unauthenticated users, show password form directly
      setShowEmailForm(false);
      
      // Check if email is provided in URL parameters
      const emailParam = searchParams.get("email");
      if (emailParam) {
        setEmail(emailParam);
      }
    }
  }, [status, session, router, searchParams]);

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check if this email exists and is an OAuth-only account
      const checkRes = await fetch("/api/check-account-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (checkRes.ok) {
        const accountData = await checkRes.json();
        
        if (accountData.accountType === "oauth-only") {
          // Send password setup email
          const res = await fetch("/api/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (res.ok) {
            setEmailSent(true);
          } else {
            setError("Failed to send password setup email. Please try again.");
          }
        } else if (accountData.accountType === "password-enabled") {
          setError("This account already has a password. Please use the login form.");
        } else {
          setError("No account found with this email address.");
        }
      } else {
        setError("Failed to check account status. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmitWithEmail = async (emailAddress: string) => {
    setError("");
    setLoading(true);

    try {
      // Check if this email exists and is an OAuth-only account
      const checkRes = await fetch("/api/check-account-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailAddress }),
      });

      if (checkRes.ok) {
        const accountData = await checkRes.json();
        
        if (accountData.accountType === "oauth-only") {
          // Send password setup email
          const res = await fetch("/api/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailAddress }),
          });

          if (res.ok) {
            setEmailSent(true);
          } else {
            setError("Failed to send password setup email. Please try again.");
          }
        } else if (accountData.accountType === "password-enabled") {
          setError("This account already has a password. Please use the login form.");
        } else {
          setError("No account found with this email address.");
        }
      } else {
        setError("Failed to check account status. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
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
      let res;
      
      if (status === "authenticated") {
        // For authenticated users, use the existing set-password API
        res = await fetch("/api/set-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
      } else {
        // For unauthenticated users, use the signup API to set password
        res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      
      if (status === "authenticated") {
        // Refresh the session to update the auth state
        await update();
        // Redirect to home page after successful password setting
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        // For unauthenticated users, automatically log them in after setting password
        const signInResult = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (signInResult?.ok) {
          // Redirect to profile page after successful login
          setTimeout(() => {
            router.push("/profile");
          }, 1500);
        } else {
          // If auto-login fails, redirect to login page
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        }
      }
    } catch (error) {
      setError("An error occurred while setting the password.");
      setLoading(false);
    }
  };

  if (status === "loading") return <p>Loading...</p>;

  // Show password form for unauthenticated users
  if (showEmailForm === false && status === "unauthenticated") {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <h1 className="text-3xl font-orbitron text-center">Set Password</h1>
        {email && (
          <p className="text-center text-gray-600">
            Setting password for: <strong>{email}</strong>
          </p>
        )}
        
        {success ? (
          <div className="text-center">
            <p className="text-green-600">Password set successfully!</p>
            <p className="text-sm text-gray-500 mt-2">
              Logging you in and redirecting to profile...
            </p>
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
        
        <div className="text-center">
          <a href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  // Show email form for unauthenticated users (fallback)
  if (showEmailForm && !emailSent) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <h1 className="text-3xl font-orbitron text-center">Set Password</h1>
        <p className="text-center text-gray-600">
          Enter your email address to set a password for your OAuth account.
        </p>
        
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="p-2 w-full rounded text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-neon px-4 py-2 text-white rounded-2xl w-full disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Password Setup Email"}
          </button>
        </form>
        
        <div className="text-center">
          <a href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  // Show success message for email sent
  if (emailSent) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <h1 className="text-3xl font-orbitron text-center">Check Your Email</h1>
        <div className="text-center">
          <p className="text-green-600">Password setup email sent!</p>
          <p className="text-sm text-gray-500 mt-2">
            We've sent a password setup link to {email}. Click the link in your email to set your password.
          </p>
        </div>
        <div className="text-center">
          <a href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  // Show password form for authenticated users
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
