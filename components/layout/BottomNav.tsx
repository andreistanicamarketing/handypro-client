'use client';

// Tab bar flottante — solo mobile, role-aware.
// Capsula ink staccata dal bordo: la tab attiva si allarga in ember con etichetta.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, CalendarDays, UserRound, Briefcase } from 'lucide-react';
import { useSession, areaForRole } from '@/lib/auth-mock';
import { cn } from '@/lib/utils';

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  match: (p: string) => boolean;
};

export default function BottomNav() {
  const pathname = usePathname() ?? '/';
  const { session } = useSession();

  // Percorso profilo pubblico del pro loggato (se applicabile)
  const proProfilePath =
    session?.role === 'professionista' && session.proSlug
      ? `/pro/${session.proSlug}`
      : null;

  const ITEMS: NavItem[] = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      match: (p) => p === '/',
    },
    {
      href: '/cerca',
      label: 'Cerca',
      icon: Search,
      // Attivo su /cerca e su profili pro altrui (non il proprio profilo se è un pro)
      match: (p) =>
        p.startsWith('/cerca') ||
        (p.startsWith('/pro/') && p !== proProfilePath),
    },
    // --- Tab 3: dipende dal ruolo ---
    session
      ? {
          href: areaForRole(session.role),
          label: session.role === 'professionista' ? 'Attività' : 'I miei lavori',
          icon: session.role === 'professionista' ? Briefcase : CalendarDays,
          match: (p) => p.startsWith('/dashboard'),
        }
      : {
          // Non autenticato: invita i professionisti a iscriversi
          href: '/registrati?tipo=professionista',
          label: 'Per i Pro',
          icon: Briefcase,
          match: () => false,
        },
    // --- Tab 4: profilo / accedi ---
    proProfilePath
      ? {
          // Professionista loggato → proprio profilo pubblico
          href: proProfilePath,
          label: 'Profilo',
          icon: UserRound,
          match: (p) => p === proProfilePath,
        }
      : {
          // Cliente loggato o non autenticato → pagina accesso/profilo
          href: '/registrati',
          label: session ? 'Profilo' : 'Accedi',
          icon: UserRound,
          match: (p) => p.startsWith('/registrati'),
        },
  ];

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3.5 md:hidden"
      style={{ paddingBottom: 'calc(24px + var(--safe-bottom))' }}
    >
      <nav
        aria-label="Navigazione principale"
        className="pointer-events-auto flex h-16 items-center gap-1 rounded-pill bg-ink px-2 shadow-[0_14px_34px_-10px_rgba(21,34,56,.55)]"
      >
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'pressable flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-pill text-[13.5px] font-bold',
                active ? 'flex-none bg-ember px-[18px] text-white' : 'flex-1 text-white/[.62]'
              )}
            >
              <item.icon size={20} strokeWidth={active ? 2.4 : 2} aria-hidden />
              {active && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
