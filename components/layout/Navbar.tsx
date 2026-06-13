'use client';

// Top bar — minimale su mobile (logo + accedi), completa su desktop.
// Link di navigazione centrali adattati al ruolo dell'utente.

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useSession, logout, areaForRole, type MockSession } from '@/lib/auth-mock';
import { cn } from '@/lib/utils';

/** Link desktop adattati al ruolo */
function getNavLinks(session: MockSession | null) {
  const cerca = { href: '/cerca', label: 'Cerca' };
  if (!session) return [cerca];
  if (session.role === 'privato') {
    return [cerca, { href: '/dashboard/utente', label: 'I miei lavori' }];
  }
  // professionista
  return [
    cerca,
    { href: '/dashboard/pro', label: 'La mia attività' },
    ...(session.proSlug ? [{ href: `/pro/${session.proSlug}`, label: 'Il mio profilo' }] : []),
  ];
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span
      className={cn(
        'text-[19px] font-extrabold tracking-tight',
        light ? 'text-white' : 'text-ink'
      )}
    >
      Handy<span className={light ? 'text-white/70' : 'text-ink-soft'}>Pro</span>
      <span
        aria-hidden
        className="mb-1 ml-[3px] inline-block h-[5px] w-[5px] rounded-full bg-ember align-middle"
      />
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const { session, ready } = useSession();

  const navLinks = getNavLinks(ready ? session : null);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-shell items-center justify-between px-4 md:h-16 md:px-8">
        <Link href="/" aria-label="Handy Pro — home">
          <Logo />
        </Link>

        {/* Link centrali — solo desktop, role-aware */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Sezioni">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'pressable rounded-pill px-4 py-2 text-[14px] font-semibold transition-colors',
                isActive(l.href)
                  ? 'bg-sand text-ink'
                  : 'text-ink-mute hover:bg-sand/60 hover:text-ink'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Lato destro */}
        <div className="flex items-center gap-2">
          {ready && session ? (
            <>
              <Link
                href={areaForRole(session.role)}
                className="pressable flex items-center gap-2 rounded-pill bg-ink py-1.5 pl-1.5 pr-4 text-[13px] font-semibold text-white hover:bg-ink-soft md:text-[14px]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ember text-[11px] font-extrabold">
                  {session.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <span className="max-w-[110px] truncate">{session.name.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                aria-label="Esci"
                title="Esci"
                className="pressable flex h-9 w-9 items-center justify-center rounded-full text-ink-mute hover:bg-sand hover:text-ink"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/registrati?tipo=professionista"
                className="pressable hidden rounded-pill px-4 py-2 text-[14px] font-semibold text-ink-mute transition-colors hover:bg-sand/60 hover:text-ink md:inline-block"
              >
                Sei un professionista?
              </Link>
              <Link
                href="/registrati"
                className="pressable rounded-pill bg-ink px-4 py-2 text-[13px] font-semibold text-white hover:bg-ink-soft md:px-5 md:text-[14px]"
              >
                Accedi
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
