import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Abbonamenti — Handy Pro',
  description: 'Iscriviti gratis come professionista. Vetrina, il piano per avere più visibilità, è in arrivo.',
};

const BASE = [
  'Profilo pubblico con servizi e prezzi',
  'Richieste di prenotazione dai clienti della tua zona',
  'Agenda degli appuntamenti',
  'Chat con i clienti',
  'Recensioni verificate',
];

const VETRINA = [
  'Tutto quello che c’è nel piano Base',
  'Priorità nei risultati di ricerca',
  'Badge in evidenza sul profilo',
  'Statistiche complete su visite e ricerche',
];

export default function AbbonamentiPage() {
  return (
    <div className="min-h-screen pt-14 md:pt-16">
      <div className="mx-auto max-w-content px-5 pb-16 pt-8 md:px-8 md:pt-14">
        <h1 className="text-[26px] font-extrabold tracking-tight text-ink md:text-4xl">
          Abbonamenti per <em className="font-accent text-ember-deep">professionisti</em>
        </h1>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-mute">
          Iscriversi è gratis. Per i clienti Handy Pro è gratis, sempre.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <section className="rounded-card border border-line bg-white p-6 shadow-chip">
            <h2 className="text-[19px] font-extrabold tracking-tight text-ink">Base</h2>
            <p className="mb-4 text-[24px] font-extrabold text-ink">Gratis</p>
            <ul className="mb-6 space-y-2.5">
              {BASE.map((f) => (
                <li key={f} className="flex gap-2 text-[14px] text-ink-mute">
                  <Check size={16} className="mt-0.5 shrink-0 text-verde" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/registrati?tipo=professionista"
              className="pressable flex h-12 items-center justify-center rounded-2xl border border-line text-[15px] font-bold text-ink"
            >
              Crea il tuo profilo gratis
            </Link>
          </section>

          <section className="rounded-card bg-ink-gradient p-6 text-white">
            <h2 className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight">
              <Sparkles size={18} className="text-ember" />
              <em className="font-accent text-ember">Vetrina</em>
            </h2>
            <p className="mb-4 text-[24px] font-extrabold">In arrivo</p>
            <ul className="mb-6 space-y-2.5">
              {VETRINA.map((f) => (
                <li key={f} className="flex gap-2 text-[14px] text-white/75">
                  <Check size={16} className="mt-0.5 shrink-0 text-ember" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="mailto:info@handypro.it?subject=Lista%20d'attesa%20Vetrina"
              className="pressable flex h-12 items-center justify-center rounded-2xl bg-ember-gradient text-[15px] font-bold text-white"
            >
              Entra in lista d&rsquo;attesa
            </a>
            <p className="mt-3 text-center text-[12.5px] text-white/55">
              Ti scriviamo noi quando sarà disponibile.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
