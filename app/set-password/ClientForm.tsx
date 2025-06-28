'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PasswordInput from '@/components/PasswordInput';

export default function ClientForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'invalid' | 'ready' | 'submitting' | 'success' | 'error'>('verifying');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }
    fetch('/api/verify-reset-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => setStatus(data.valid ? 'ready' : 'invalid'))
      .catch(() => setStatus('invalid'));
  }, [token]);

  if (status === 'verifying') return <p>Validating token...</p>;
  if (status === 'invalid') return <p>Invalid or expired token.</p>;
  if (status === 'success') return <p>Password updated! You can now log in.</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm || password.length < 6 || !token) {
      setStatus('error');
      return;
    }
    setStatus('submitting');
    try {
      const res = await fetch('/api/set-password-from-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full p-2 rounded text-black"
      />
      <PasswordInput
        placeholder="Confirm password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        className="w-full p-2 rounded text-black"
      />
      <button type="submit" className="bg-neon text-white w-full p-2 rounded disabled:opacity-50" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Setting...' : 'Set Password'}
      </button>
      {status === 'error' && <p className="text-red-500">Something went wrong.</p>}
    </form>
  );
}
