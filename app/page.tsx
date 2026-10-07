// Homepage — design system "Bottega", mobile-first.

import Link from 'next/link';
import {
  Droplets, Zap, BrickWall, Hammer, Leaf, PaintRoller, Wind, KeyRound,
  ShieldCheck, CalendarCheck, Search as SearchIcon, Star, ArrowRight,
} from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';
import { Wordmark } from '@/components/layout/Navbar';
import NextJobCard from '@/components/home/NextJobCard';
import { ProInitialsAvatar } from '@/components/search/ProResultCard';
import { CATEGORIES } from '@/lib/categories';
import { searchPros, type Pro } from '@/lib/data';
import Button from '@/components/ui/Button';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Droplets, Zap, BrickWall, Hammer, Leaf, PaintRoller, Wind, KeyRound,
};

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
    // backend giù: la home renderizza senza sezione "I più apprezzati"
  }

  return (
    <>
      <div
        className="relative mx-auto flex max-w-shell flex-col gap-7 px-5 pb-12 pt-[calc(8px+var(--safe-top))] md:gap-14 md:px-8 md:pt-[calc(72px+56px)] lg:px-24"
      >
        {/* alone caldo decorativo — clip su wrapper dedicato per non tagliare i dropdown della searchbar */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-[60px] h-[260px] w-[260px] rounded-full bg-ember/15 blur-[64px] md:-top-[120px] md:h-[520px] md:w-[520px]" />
        </div>

        {/* ── Header mobile (su desktop c'è la navbar) ── */}
        <div className="relative flex h-10 items-center md:hidden">
          <Link href="/" aria-label="Handy Pro — home">
            <Wordmark className="h-[22px] w-auto text-ink" />
          </Link>
        </div>

        {/* ── Hero ── */}
        <section className="relative flex flex-col gap-[18px] md:max-w-[820px] md:gap-[22px]">
          <h1 className="text-[30px] font-extrabold leading-[1.1] tracking-[-.025em] text-ink md:text-[58px] md:leading-[1.02] md:tracking-[-.03em]">
            L&rsquo;artigiano <em className="font-accent text-ember-deep">giusto</em>,{' '}
            <br className="hidden md:block" />a due passi da casa.
          </h1>
          <p className="hidden text-[18px] text-ink-mute md:block">
            Scegli un orario libero e prenota in pochi tap.
          </p>
          <div className="md:mt-1.5">
            <SearchBar variant="hero" />
          </div>
        </section>

        <NextJobCard />

        {/* ── Categorie: griglia 4×2 su mobile, 8 colonne su desktop ── */}
        <section className="relative flex flex-col gap-3.5">
          <h2 className="text-[20px] font-extrabold tracking-[-.02em] text-ink md:hidden">
            Tutte le <em className="font-accent text-ember-deep">categorie</em>
          </h2>
          <div className="grid grid-cols-4 gap-x-2 gap-y-3.5 md:grid-cols-8 md:gap-3">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c.icon] ?? Hammer;
              return (
                <Link
                  key={c.slug}
                  href={`/cerca?categoria=${c.slug}`}
                  className="pressable flex flex-col items-center gap-[7px] md:gap-2.5 md:rounded-card md:border md:border-line md:bg-white md:px-3 md:py-[18px] md:hover:border-ember"
                >
                  <span className="flex h-[60px] w-[60px] items-center justify-center rounded-[18px] border border-line bg-white text-ink md:h-[46px] md:w-[46px] md:rounded-2xl md:border-0 md:bg-sand">
                    <Icon size={22} aria-hidden />
                  </span>
                  <span className="text-[11.5px] font-semibold text-ink md:text-[13px] md:font-bold">
                    <span className="md:hidden">{c.short ?? c.label}</span>
                    <span className="hidden md:inline">{c.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── I più apprezzati ── */}
        {topPros.length > 0 && (
          <section className="relative flex flex-col gap-3.5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[20px] font-extrabold tracking-[-.02em] text-ink md:text-[26px]">
                I più <em className="font-accent text-ember-deep">apprezzati</em>
              </h2>
              <Link href="/cerca" className="text-[13px] font-bold text-ink-mute hover:text-ember-deep md:text-[14px]">
                Vedi tutti
              </Link>
            </div>
            <div className="-mx-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 scrollbar-hide md:mx-0 md:grid md:grid-cols-6 md:px-0">
              {topPros.map((pro) => (
                <Link
                  key={pro.id}
                  href={`/pro/${pro.slug}`}
                  className="pressable flex w-[150px] shrink-0 snap-start flex-col gap-2.5 rounded-card border border-line bg-white p-3.5 hover:border-ember md:w-auto"
                >
                  <ProInitialsAvatar name={pro.name} hue={pro.hue} size={44} className="rounded-[14px]" />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="flex items-center gap-1">
                      <span className="truncate text-[14px] font-bold text-ink">{pro.name}</span>
                      {pro.isVerified && (
                        <ShieldCheck size={13} className="shrink-0 text-verde" aria-label="Verificato" />
                      )}
                    </span>
                    <span className="truncate text-[12px] text-ink-mute">
                      {pro.categoryLabel} · {pro.zona}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-ink">
                    <Star size={12} className="fill-ember text-ember" aria-hidden />
                    {pro.rating === null ? 'Nuovo' : pro.rating.toFixed(1)}
                    {pro.rating !== null && (
                      <span className="font-medium text-ink-faint">({pro.reviewCount})</span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Banner pro — mobile (su desktop la CTA grande in fondo) ── */}
        <Link
          href="/registrati?tipo=professionista"
          className="pressable relative flex items-center gap-3.5 rounded-card border border-dashed border-ink/20 p-4 md:hidden"
        >
          <span className="flex flex-1 flex-col gap-[3px]">
            <span className="text-[11px] font-extrabold uppercase tracking-[.1em] text-ink-faint">
              Sei un professionista?
            </span>
            <span className="text-[14.5px] font-bold text-ink">Fatti trovare da chi ti sta cercando</span>
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white">
            <ArrowRight size={16} aria-hidden />
          </span>
        </Link>
      </div>

      <div className="hidden md:block">
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
            <Button
              href="/registrati?tipo=professionista"
              className="shadow-lift"
            >
              Crea il tuo profilo <ArrowRight size={17} />
            </Button>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
