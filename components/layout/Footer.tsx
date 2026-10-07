import Link from 'next/link';
import { Wordmark } from './Navbar';

const COLUMNS = [
  {
    title: 'Handy Pro',
    links: [
      { label: 'Come funziona', href: '/come-funziona' },
      { label: 'Chi siamo', href: '/chi-siamo' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Termini di servizio', href: '/termini' },
    ],
  },
  {
    title: 'Esplora',
    links: [
      { label: 'Cerca professionisti', href: '/cerca' },
      { label: 'Registrati come cliente', href: '/registrati?tipo=privato' },
      { label: 'Registrati come professionista', href: '/registrati?tipo=professionista' },
      { label: 'Abbonamenti', href: '/abbonamenti' },
    ],
  },
  {
    title: 'Contatti',
    links: [
      { label: 'info@handypro.it', href: 'mailto:info@handypro.it' },
      { label: 'Instagram', href: 'https://instagram.com/handypro_it' },
      { label: 'TikTok', href: 'https://tiktok.com/@handypro_it' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink-gradient text-white">
      <div className="mx-auto max-w-content px-5 pb-10 pt-14 md:px-8">
        <div className="mb-10">
          <Wordmark className="h-7 w-auto text-white" />
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/55">
            Il tuo professionista, a portata di mano.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-[13px] font-bold uppercase tracking-wide text-white/45">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-[13px] text-white/45">
            © {new Date().getFullYear()} Handy Pro. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
}
