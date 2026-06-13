'use client';

// Bottom navigation app-like — solo mobile, role-aware.
// 4 tab adattate in base allo stato di autenticazione e al ruolo.

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
          icon: CalendarDays,
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
    <nav
      aria-label="Navigazione principale"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 shadow-nav-up backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <div className="grid h-[64px] grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className="pressable flex flex-col items-center justify-center gap-0.5"
            >
              <span
                className={cn(
                  'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                  active ? 'bg-ember-soft text-ember-deep' : 'text-ink-faint'
                )}
              >
                <item.icon size={19} strokeWidth={active ? 2.4 : 2} />
              </span>
              <span
                className={cn(
                  'text-[10.5px] font-semibold',
                  active ? 'text-ink' : 'text-ink-faint'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
