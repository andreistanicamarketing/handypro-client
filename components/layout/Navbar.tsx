'use client';

// Top bar — completa su desktop; su mobile solo nelle pagine senza header proprio.
// Su /cerca (desktop) i link lasciano il posto alla ricerca compatta.

import { Suspense, useId } from 'react';
import Link from 'next/link';
import { IconButton } from '@/components/ui/Button';
import SearchBar from '@/components/search/SearchBar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useSession, logout, areaForRole, type MockSession } from '@/lib/auth-mock';
import { cn } from '@/lib/utils';

/** Link desktop adattati al ruolo */
function getNavLinks(session: MockSession | null) {
  const cerca = { href: '/cerca', label: 'Cerca' };
  if (!session) return [cerca, { href: '/come-funziona', label: 'Come funziona' }];
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

// Logo esteso "handypro" — tracciati da logo-dp/logo-esteso/handypro-colore.svg.
// "handy" segue currentColor, "pro" resta arancione.
export function Wordmark({ className }: { className?: string }) {
  // id univoco: la scritta compare più volte nella stessa pagina (navbar + footer)
  const clipId = useId().replace(/:/g, ''); // i ':' di useId non sono validi in url(#…)
  return (
    <svg viewBox="0 96 2194 416" role="img" aria-label="Handy Pro" className={className}>
      <clipPath id={clipId}>
        <rect x="1090" y="196" width="290" height="330" />
      </clipPath>
      <g fill="none" strokeWidth="52" strokeLinecap="butt" strokeLinejoin="round">
        <g stroke="currentColor">
          <path d="M26 96 V416 M26 222 H150 A64 64 0 0 1 214 286 V416" />
          <path d="M498 416 V286 A64 64 0 0 0 434 222 H366 A64 64 0 0 0 302 286 V326 A64 64 0 0 0 366 390 H498" />
          <path d="M586 416 V286 A64 64 0 0 1 650 222 H710 A64 64 0 0 1 774 286 V416" />
          <path d="M1058 96 V416 M1058 222 H926 A64 64 0 0 0 862 286 V326 A64 64 0 0 0 926 390 H1058" />
          <g clipPath={`url(#${clipId})`}>
            <path d="M1354 144 L1208 436 Q1183 486 1149 486 H1104" />
            <path d="M1107 144 L1230.5 391" />
          </g>
        </g>
        <g stroke="#FF6600">
          <path d="M1398 512 V286 A64 64 0 0 1 1462 222 H1530 A64 64 0 0 1 1594 286 V326 A64 64 0 0 1 1530 390 H1398" />
          <path d="M1682 416 V286 A64 64 0 0 1 1746 222 H1826" />
          <rect x="1876" y="222" width="292" height="168" rx="84" />
        </g>
      </g>
    </svg>
  );
}

/** Pagine che su mobile disegnano il proprio header: lì la top bar sparisce. */
const OWN_MOBILE_HEADER = ['/cerca', '/pro/'];

/** Ricerca compatta nella navbar di /cerca, sincronizzata con l'URL. */
function NavSearch() {
  const params = useSearchParams();
  const categoria = params.get('categoria') ?? '';
  const zona = params.get('zona') ?? '';
  return (
    <SearchBar key={`${categoria}|${zona}`} variant="compact" initialCategory={categoria} initialLocation={zona} />
  );
}

export default function Navbar() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const { session, ready } = useSession();

  const isCerca = pathname.startsWith('/cerca');
  const ownMobileHeader =
    pathname === '/' || OWN_MOBILE_HEADER.some((p) => pathname.startsWith(p));
  // Su /cerca la ricerca prende il centro: "Cerca" sparisce, gli altri link vanno a destra
  const navLinks = getNavLinks(ready ? session : null).filter((l) => !(isCerca && l.href === '/cerca'));

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-cream/90 backdrop-blur-md',
        ownMobileHeader && 'hidden md:block'
      )}
    >
      <div className="mx-auto flex h-14 max-w-shell items-center gap-8 px-4 md:h-[72px] md:px-8">
        <Link href="/" aria-label="Handy Pro — home" className="shrink-0">
          <Wordmark className="h-[22px] w-auto text-ink md:h-6" />
        </Link>

        {isCerca ? (
          <div className="hidden min-w-0 max-w-[460px] flex-1 md:block">
            <Suspense>
              <NavSearch />
            </Suspense>
          </div>
        ) : (
          <NavLinks links={navLinks} isActive={isActive} className="-ml-4" />
        )}

        {/* Lato destro */}
        <div className="ml-auto flex items-center gap-2">
          {isCerca && <NavLinks links={navLinks} isActive={isActive} />}
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
              <IconButton
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                aria-label="Esci"
                title="Esci"
              >
                <LogOut size={16} />
              </IconButton>
            </>
          ) : (
            <>
              <Link
                href="/registrati?tipo=professionista"
                className="pressable hidden whitespace-nowrap rounded-pill px-4 py-2 text-[14px] font-semibold text-ink-mute transition-colors hover:bg-sand/60 hover:text-ink md:inline-block"
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

/** Link di sezione — solo desktop, role-aware */
function NavLinks({
  links,
  isActive,
  className,
}: {
  links: { href: string; label: string }[];
  isActive: (href: string) => boolean;
  className?: string;
}) {
  return (
    <nav className={cn('hidden items-center gap-1 md:flex', className)} aria-label="Sezioni">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            'pressable whitespace-nowrap rounded-pill px-4 py-2 text-[14px] font-semibold transition-colors',
            isActive(l.href) ? 'bg-sand text-ink' : 'text-ink-mute hover:bg-sand/60 hover:text-ink'
          )}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
