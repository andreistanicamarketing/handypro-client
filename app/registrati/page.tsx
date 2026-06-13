// Autenticazione: accesso e registrazione (mock).

import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthClient from './AuthClient';

export const metadata: Metadata = {
  title: 'Accedi o registrati — Handy Pro',
};

export default function RegistratiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-16 text-ink-mute">
          Caricamento…
        </div>
      }
    >
      <AuthClient />
    </Suspense>
  );
}
