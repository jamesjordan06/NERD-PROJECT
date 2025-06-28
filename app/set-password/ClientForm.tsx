// pages/set-password/page.tsx (Client Component for Next.js App Router)
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/set-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const result = await res.json();

    if (res.ok && result.success) {
      // Auto-login with email and new password
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: result.email,
        password,
      });

      if (signInResult?.ok) {
        router.push('/profile');
      } else {
        setError('Password set but failed to log in.');
      }
    } else {
      setError(result.error || 'Failed to reset password.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Set a New Password</h1>
      <input
        type="password"
        placeholder="New password"
        className="w-full border px-4 py-2 mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Setting password...' : 'Set Password'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}