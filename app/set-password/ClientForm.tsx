'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [valid, setValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch('/api/validate-reset-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => setValid(data.valid))
      .catch(() => setValid(false));
  }, [token]);

  if (valid === null) return <p>Validating token...</p>;
  if (!valid) return <p>Invalid or expired token.</p>;

  return (
    <form>
      <input type="password" name="password" placeholder="New password" />
      <button type="submit">Set Password</button>
    </form>
  );
}
