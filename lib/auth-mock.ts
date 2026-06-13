'use client';

// ────────────────────────────────────────────────────────────────
// Sessione mock lato client (localStorage + evento custom).
// Da sostituire con NextAuth (lib/auth.ts) quando il backend è pronto.
// ────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import type { UserRole } from '@/types';

export interface MockSession {
  name: string;
  email: string;
  role: UserRole;
  /** Solo per professionisti: slug del profilo pubblico */
  proSlug?: string;
}

interface MockUser extends MockSession {
  password: string;
}

/** Utenti demo — credenziali mostrate nella pagina di accesso */
export const MOCK_USERS: MockUser[] = [
  {
    name: 'Andrei Stanica',
    email: 'cliente@demo.it',
    password: 'demo123',
    role: 'privato',
  },
  {
    name: 'Mario Rossi',
    email: 'pro@demo.it',
    password: 'demo123',
    role: 'professionista',
    proSlug: 'mario-rossi-idraulico',
  },
];

const STORAGE_KEY = 'hp_session';
const AUTH_EVENT = 'hp-auth-change';

function emit() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

export function getSession(): MockSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockSession) : null;
  } catch {
    return null;
  }
}

export function login(email: string, password: string): MockSession | null {
  const user = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  if (!user) return null;
  const session: MockSession = {
    name: user.name,
    email: user.email,
    role: user.role,
    proSlug: user.proSlug,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  emit();
  return session;
}

/** Registrazione mock: crea direttamente la sessione */
export function register(session: MockSession): MockSession {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  emit();
  return session;
}

export function logout() {
  window.localStorage.removeItem(STORAGE_KEY);
  emit();
}

/** Percorso dell'area riservata in base al ruolo */
export function areaForRole(role: UserRole): string {
  return role === 'professionista' ? '/dashboard/pro' : '/dashboard/utente';
}

/**
 * Hook di sessione reattivo.
 * `ready` è false finché non è stato letto localStorage (evita flash SSR).
 */
export function useSession(): { session: MockSession | null; ready: boolean } {
  const [session, setSession] = useState<MockSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => setSession(getSession());
    read();
    setReady(true);
    window.addEventListener(AUTH_EVENT, read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener(AUTH_EVENT, read);
      window.removeEventListener('storage', read);
    };
  }, []);

  return { session, ready };
}
