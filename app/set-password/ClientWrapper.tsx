'use client';
import { Suspense } from 'react';
import ClientForm from './ClientForm';

export default function ClientWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientForm />
    </Suspense>
  );
}
