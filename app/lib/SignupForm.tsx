"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (pw1 !== pw2) {
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pw1 }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      setError(error || "Signup failed");
      return;
    }

    const result = await signIn("credentials", {
      email,
      password: pw1,
      redirect: false,
    });

    if (result?.ok) router.push("/");
    else setError("Auto-login failed");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} placeholder="Password" required />
      <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="Confirm Password" required />
      <button type="submit">Sign Up</button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
