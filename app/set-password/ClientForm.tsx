'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import PasswordInput from '@/components/PasswordInput';

export default function ClientForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'invalid' | 'ready' | 'submitting' | 'error'>('verifying');
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
  // Success handled via toast + redirect

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm || password.length < 6 || !token) {
      setStatus('error');
      return;
    }
    setStatus('submitting');
    try {
      const res = await fetch('/api/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Password reset! Redirecting...');
      router.push('/profile');
    } catch {
      setStatus('error');
      toast.error('Failed to set password');
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
