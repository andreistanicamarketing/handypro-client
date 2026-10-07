// Homepage — design system "Bottega", mobile-first.

import Link from 'next/link';
import {
  Droplets, Zap, BrickWall, Hammer, Leaf, PaintRoller, Wind, KeyRound,
  ShieldCheck, CalendarCheck, Search as SearchIcon, Star, ArrowRight, MapPin,
} from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';
import { CATEGORIES } from '@/lib/categories';
import { searchPros, type Pro } from '@/lib/data';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Droplets, Zap, BrickWall, Hammer, Leaf, PaintRoller, Wind, KeyRound,
};

const PRICE_LABEL = { low: '€', medium: '€€', high: '€€€' } as const;

// Senza questo la home resta ferma ai dati del build: la fetch qui sotto gira
// una volta sola e il risultato viene cotto dentro la pagina statica.
// Rigenerazione ogni 5 minuti invece che a ogni richiesta, così il visitatore
// non paga mai la latenza dell'API (o il risveglio del backend su Render).
export const revalidate = 300;

export default async function HomePage() {
  let topPros: Pro[] = [];
  try {
    const { pros } = await searchPros({});
    topPros = [...pros].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6);
  } catch {
    // backend giù: la home renderizza senza sezione "I più richiesti"
  }

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative pt-24 md:pt-36">
        {/* alone caldo decorativo — clip su wrapper dedicato per non tagliare i dropdown della searchbar */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-ember/15 blur-3xl md:h-96 md:w-96" />
        </div>
        <div className="relative mx-auto max-w-content px-5 text-center md:px-8">
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-pill border border-line bg-white px-3 py-1.5 text-[12px] font-bold text-ink-mute shadow-chip">
            <ShieldCheck size={13} className="text-verde" />
            Recensioni verificate da lavori reali
          </p>

          <h1 className="mb-3 mx-auto max-w-xl text-[34px] font-extrabold leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl md:max-w-3xl md:text-[54px]">
            L&rsquo;artigiano <em className="font-accent text-ember-deep">giusto</em>,
            a due passi da casa.
          </h1>
          <p className="mb-7 mx-auto max-w-md text-[15.5px] leading-relaxed text-ink-mute md:max-w-xl md:text-lg">
            Idraulici, elettricisti, falegnami e altri professionisti vicino a
            te. Scegli un orario libero e prenota in pochi tap.
          </p>

          <div className="flex justify-center">
            <SearchBar variant="hero" />
          </div>

          {/* ricerche rapide */}
          <div className="mt-5 flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="shrink-0 text-[13px] font-medium text-ink-faint">Prova con:</span>
            {CATEGORIES.slice(0, 5).map((c) => (
              <Link
                key={c.slug}
                href={`/cerca?categoria=${c.slug}`}
                className="pressable shrink-0 rounded-pill border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-ink shadow-chip hover:border-ember"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categorie ────────────────────────────────────────────────── */}
      <section className="mx-auto mt-14 max-w-content md:mt-24 md:px-8">
        <div className="mb-5 flex items-end justify-between px-5 md:px-0">
          <div>
            <h2 className="text-[22px] font-extrabold tracking-tight text-ink md:text-3xl">
              Tutte le <em className="font-accent text-ember-deep">categorie</em>
            </h2>
            <p className="mt-1 text-[14px] text-ink-mute">Dai guasti urgenti alle ristrutturazioni.</p>
          </div>
        </div>

        {/* scroll orizzontale su mobile, griglia su desktop */}
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:px-0">
          {CATEGORIES.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon] ?? Hammer;
            return (
              <Link
                key={c.slug}
                href={`/cerca?categoria=${c.slug}`}
                className="pressable group w-[124px] shrink-0 snap-start rounded-card border border-line bg-white p-4 shadow-chip hover:border-ember hover:shadow-soft md:w-auto md:p-5"
              >
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-sand text-ink transition-colors group-hover:bg-ember group-hover:text-white md:h-12 md:w-12">
                  <Icon size={21} />
                </span>
                <span className="block text-[14px] font-bold text-ink md:text-[15px]">
                  {c.label}
                </span>
                <span className="mt-0.5 hidden text-[12.5px] leading-snug text-ink-mute md:block">
                  {c.description}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── I più richiesti ──────────────────────────────────────────── */}
      {topPros.length > 0 && (
        <section className="mx-auto mt-14 max-w-content md:mt-24 md:px-8">
          <div className="mb-5 flex items-end justify-between px-5 md:px-0">
            <div>
              <h2 className="text-[22px] font-extrabold tracking-tight text-ink md:text-3xl">
                I più <em className="font-accent text-ember-deep">apprezzati</em>
              </h2>
              <p className="mt-1 text-[14px] text-ink-mute">
                I professionisti con le recensioni migliori.
              </p>
            </div>
            <Link
              href="/cerca"
              className="hidden shrink-0 items-center gap-1 text-[14px] font-bold text-ink hover:text-ember-deep md:inline-flex"
            >
              Vedi tutti <ArrowRight size={15} />
            </Link>
          </div>

          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 scrollbar-hide md:grid md:grid-cols-3 md:gap-4 md:px-0">
            {topPros.map((pro) => {
              const initials = pro.name.split(' ').map((w) => w[0]).slice(0, 2).join('');
              return (
                <Link
                  key={pro.id}
                  href={`/pro/${pro.slug}`}
                  className="pressable w-[240px] shrink-0 snap-start rounded-card border border-line bg-white p-4 shadow-chip hover:border-ember hover:shadow-soft md:w-auto md:p-5"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      aria-hidden
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[15px] font-extrabold text-white"
                      style={{ background: `hsl(${pro.hue} 42% 42%)` }}
                    >
                      {initials}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[15px] font-bold text-ink">{pro.name}</span>
                        {pro.isVerified && (
                          <ShieldCheck size={14} className="shrink-0 text-verde" aria-label="Verificato" />
                        )}
                      </span>
                      <span className="block truncate text-[12.5px] text-ink-mute">
                        {pro.categoryLabel} · {pro.specialization}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px]">
                    <span className="inline-flex items-center gap-1 font-bold text-ink">
                      <Star size={13} className="fill-ember text-ember" />
                      {pro.rating === null ? 'Nuovo' : pro.rating.toFixed(1)}
                      {pro.rating !== null && (
                        <span className="font-medium text-ink-faint">({pro.reviewCount})</span>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1 text-ink-mute">
                      <MapPin size={13} />
                      {pro.zona}
                    </span>
                    <span className="ml-auto font-bold text-ink-mute">
                      {PRICE_LABEL[pro.priceRange]}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-4 px-5 md:hidden">
            <Link
              href="/cerca"
              className="pressable flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-line bg-white text-[14.5px] font-bold text-ink shadow-chip"
            >
              Vedi tutti i professionisti <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      )}

      {/* ── Come funziona ────────────────────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-content px-5 md:mt-28 md:px-8">
        <h2 className="mb-8 text-[22px] font-extrabold tracking-tight text-ink md:mb-12 md:text-center md:text-3xl">
          Come <em className="font-accent text-ember-deep">funziona</em>
        </h2>

        <ol className="relative space-y-8 md:grid md:grid-cols-3 md:gap-8 md:space-y-0">
          {/* linea timeline mobile */}
          <div
            aria-hidden
            className="absolute bottom-5 left-[23px] top-5 w-px bg-line md:hidden"
          />
          {[
            {
              icon: SearchIcon,
              title: 'Cerca vicino a te',
              text: 'Scegli categoria e città: vedi chi lavora nella tua zona e quanto chiede.',
            },
            {
              icon: CalendarCheck,
              title: 'Prenota in un minuto',
              text: 'Scegli un orario libero e invia la richiesta: il professionista te la conferma, senza telefonate a vuoto.',
            },
            {
              icon: ShieldCheck,
              title: 'Fidati delle recensioni',
              text: 'Può recensire solo chi ha prenotato un lavoro qui, a lavoro concluso. Niente recensioni finte.',
            },
          ].map((step, i) => (
            <li key={step.title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink text-white shadow-soft md:h-14 md:w-14">
                <step.icon size={21} />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ember text-[11px] font-extrabold text-white">
                  {i + 1}
                </span>
              </span>
              <span>
                <span className="block text-[16px] font-bold text-ink">{step.title}</span>
                <span className="mt-1 block max-w-xs text-[14px] leading-relaxed text-ink-mute">
                  {step.text}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── CTA professionisti ──────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-content px-5 pb-16 md:mt-28 md:px-8 md:pb-24">
        <div className="overflow-hidden rounded-sheet bg-ink-gradient p-7 text-white md:p-12">
          <div className="max-w-md">
            <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.12em] text-white/50">
              Sei un professionista?
            </p>
            <h2 className="mb-3 text-[26px] font-extrabold leading-tight tracking-tight md:text-4xl">
              Fatti trovare da chi ti sta <em className="font-accent text-ember">cercando</em>.
            </h2>
            <p className="mb-6 text-[14.5px] leading-relaxed text-white/70 md:text-base">
              Profilo pubblico, richieste dei clienti e recensioni verificate.
              Iscrizione gratuita, senza vincoli.
            </p>
            <Link
              href="/registrati?tipo=professionista"
              className="pressable inline-flex h-12 items-center gap-2 rounded-2xl bg-ember-gradient px-6 text-[15px] font-bold text-white shadow-lift"
            >
              Crea il tuo profilo <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
