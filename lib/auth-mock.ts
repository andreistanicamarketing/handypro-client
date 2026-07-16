'use client';

// ────────────────────────────────────────────────────────────────
// Adapter di sessione: stessa interfaccia del vecchio mock,
// ora basato su NextAuth (lib/auth.ts) e sul backend reale.
// ────────────────────────────────────────────────────────────────

import { getSession, signIn, signOut, useSession as useNextAuthSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import type { UserRole } from '@/types';

export interface MockSession {
  name: string;
  email: string;
  role: UserRole;
  /** Solo per professionisti: slug del profilo pubblico */
  proSlug?: string;
  /** JWT del backend, per le chiamate autenticate a lib/data.ts */
  accessToken: string;
}

/** Account demo creati dal seeder del backend — credenziali mostrate nella pagina di accesso */
export const MOCK_USERS = [
  {
    name: 'Andrei Stanica',
    email: 'cliente@demo.it',
    password: 'demo123',
    role: 'privato' as UserRole,
  },
  {
    name: 'Mario Rossi',
    email: 'pro@demo.it',
    password: 'demo123',
    role: 'professionista' as UserRole,
    proSlug: 'mario-rossi-idraulico',
  },
];

/** Login reale via NextAuth CredentialsProvider. null su credenziali errate. */
export async function login(email: string, password: string): Promise<MockSession | null> {
  const res = await signIn('credentials', { email, password, redirect: false });
  if (!res?.ok) return null;
  const session = await getSession();
  if (!session?.user) return null;
  return {
    name: session.user.name ?? '',
    email: session.user.email ?? '',
    role: session.user.role,
    proSlug: session.user.proSlug,
    accessToken: session.accessToken,
  };
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  location?: string;
  category?: string;
}

/** Registrazione reale: crea l'account sul backend e apre subito la sessione. */
export async function register(payload: RegisterPayload): Promise<MockSession | null> {
  await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  return login(payload.email, payload.password);
}

export function logout() {
  void signOut({ redirect: false });
}

/** Percorso dell'area riservata in base al ruolo */
export function areaForRole(role: UserRole): string {
  return role === 'professionista' ? '/dashboard/pro' : '/dashboard/utente';
}

/**
 * Hook di sessione reattivo, stessa forma del vecchio mock.
 * `ready` è false finché NextAuth sta caricando (evita flash SSR).
 */
export function useSession(): { session: MockSession | null; ready: boolean } {
  const { data, status } = useNextAuthSession();
  const session: MockSession | null = data?.user
    ? {
        name: data.user.name ?? '',
        email: data.user.email ?? '',
        role: data.user.role,
        proSlug: data.user.proSlug,
        accessToken: data.accessToken,
      }
    : null;
  return { session, ready: status !== 'loading' };
}
