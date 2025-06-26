// app/set-password/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { signIn } from "next-auth/react";

function SetPasswordContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
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
            router.push(`/login?callbackUrl=${pathname}`);
          }, 1500);
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Loading...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Password Set Successfully!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting you...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check Your Email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password setup link to {email}. Please check your email and click the link to set your password.
            </p>
            <button
              onClick={() => {
                setEmailSent(false);
                setEmail("");
                setError("");
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-500"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {status === "authenticated" 
              ? "Set a password for your account to enable email/password login."
              : "Set a password for your OAuth account to enable email/password login."
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {status === "unauthenticated" && !showEmailForm && (
          <form onSubmit={handleEmailSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Password Setup Email"}
              </button>
            </div>
          </form>
        )}

        {(status === "authenticated" || showEmailForm) && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
              <div>
                <label htmlFor="confirm" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? "Setting Password..." : "Set Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Loading...
            </h2>
          </div>
        </div>
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  );
}
