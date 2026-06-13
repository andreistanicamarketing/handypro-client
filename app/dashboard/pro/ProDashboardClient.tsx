'use client';

// Dashboard professionista mobile-first (pro mock loggato: Mario Rossi).
// Richieste con accetta/rifiuta, agenda raggruppata per giorno,
// statistiche di visibilità e upsell Vetrina.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, areaForRole } from '@/lib/auth-mock';
import {
  Inbox, CalendarDays, Clock, MapPin, Star, Eye, TrendingUp, Search,
  Check, X, Sparkles, ChevronRight, BadgeCheck,
} from 'lucide-react';
import {
  PRO_REQUESTS, PRO_STATS, getRequestDate, getProBySlug, getReviewsByProId,
  formatDayLong, type MockProRequest,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type Tab = 'richieste' | 'agenda';

const LOGGED_PRO_SLUG = 'mario-rossi-idraulico';

export default function ProDashboardClient() {
  const router = useRouter();
  const { session, ready } = useSession();
  const pro = getProBySlug(LOGGED_PRO_SLUG)!;
  const reviews = getReviewsByProId(pro.id).slice(0, 2);

  // Guard: solo professionisti loggati
  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace('/registrati');
    else if (session.role !== 'professionista') router.replace(areaForRole(session.role));
  }, [ready, session, router]);

  const [tab, setTab] = useState<Tab>('richieste');
  const [requests, setRequests] = useState<MockProRequest[]>(PRO_REQUESTS);
  const [justAccepted, setJustAccepted] = useState<string | null>(null);

  const pending = useMemo(
    () => requests.filter((r) => r.status === 'pending').sort((a, b) => a.dayOffset - b.dayOffset),
    [requests]
  );
  const accepted = useMemo(
    () => requests.filter((r) => r.status === 'accepted').sort((a, b) => a.dayOffset - b.dayOffset),
    [requests]
  );

  // Agenda raggruppata per giorno
  const agendaDays = useMemo(() => {
    const map = new Map<string, MockProRequest[]>();
    for (const r of accepted) {
      const key = getRequestDate(r).toISOString().slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), r]);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => ({
        date: new Date(`${key}T00:00:00`),
        items: items.sort((a, b) => a.slot.localeCompare(b.slot)),
      }));
  }, [accepted]);

  function accept(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'accepted' as const } : r))
    );
    setJustAccepted(id);
    setTimeout(() => setJustAccepted(null), 2200);
  }

  function decline(id: string) {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }

  if (!ready || !session || session.role !== 'professionista') return null;

  return (
    <div className="min-h-screen pt-14 md:pt-16">
      <div className="mx-auto max-w-content px-4 pb-10 pt-5 md:px-8 md:pt-10">
        {/* header */}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[13px] font-semibold text-ink-faint">Ciao {pro.name.split(' ')[0]} 👋</p>
            <h1 className="text-[24px] font-extrabold tracking-tight text-ink md:text-3xl">
              La mia <em className="font-accent text-ember-deep">attività</em>
            </h1>
          </div>
          <Link
            href={`/pro/${pro.slug}`}
            className="pressable inline-flex h-10 items-center gap-1 rounded-pill border border-line bg-white px-3.5 text-[13px] font-bold text-ink shadow-chip hover:border-ink/30"
          >
            Profilo pubblico
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* statistiche settimana */}
        <div className="mb-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-card border border-line bg-white p-3.5 shadow-chip">
            <p className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-faint">
              <Eye size={12} /> Profilo
            </p>
            <p className="mt-1 text-[20px] font-extrabold text-ink">{PRO_STATS.profileViews}</p>
            <p className="flex items-center gap-1 text-[11.5px] font-bold text-verde">
              <TrendingUp size={11} />
              {PRO_STATS.viewsTrend} sett.
            </p>
          </div>
          <div className="rounded-card border border-line bg-white p-3.5 shadow-chip">
            <p className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-faint">
              <Search size={12} /> Ricerche
            </p>
            <p className="mt-1 text-[20px] font-extrabold text-ink">{PRO_STATS.searchAppearances}</p>
            <p className="text-[11.5px] font-medium text-ink-faint">apparizioni</p>
          </div>
          <div className="rounded-card border border-line bg-white p-3.5 shadow-chip">
            <p className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-faint">
              <Star size={12} /> Rating
            </p>
            <p className="mt-1 flex items-center gap-1 text-[20px] font-extrabold text-ink">
              {pro.rating.toFixed(1)}
              <Star size={14} className="fill-ember text-ember" />
            </p>
            <p className="text-[11.5px] font-medium text-ink-faint">{pro.reviewCount} recensioni</p>
          </div>
        </div>

        {/* upsell Vetrina */}
        <div className="mb-5 overflow-hidden rounded-card bg-ink-gradient p-5 text-white">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ember-gradient">
              <Sparkles size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-extrabold">
                Passa a <em className="font-accent text-ember">Vetrina</em>
              </p>
              <p className="text-[12.5px] leading-snug text-white/65">
                Priorità nei risultati, badge in evidenza e statistiche complete. Da 7€/mese.
              </p>
            </div>
            <button
              type="button"
              className="pressable shrink-0 rounded-pill bg-white px-4 py-2 text-[12.5px] font-bold text-ink"
            >
              Scopri
            </button>
          </div>
        </div>

        {/* tabs */}
        <div className="mb-4 flex rounded-pill border border-line bg-white p-1 shadow-chip md:max-w-sm">
          {(
            [
              { id: 'richieste', label: 'Richieste', count: pending.length, icon: Inbox },
              { id: 'agenda', label: 'Agenda', count: accepted.length, icon: CalendarDays },
            ] as { id: Tab; label: string; count: number; icon: React.ElementType }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={cn(
                'pressable flex h-10 flex-1 items-center justify-center gap-1.5 rounded-pill text-[13.5px] font-bold transition-colors',
                tab === t.id ? 'bg-ink text-white' : 'text-ink-mute hover:text-ink'
              )}
            >
              <t.icon size={15} />
              {t.label}
              <span
                className={cn(
                  'flex h-5 min-w-5 items-center justify-center rounded-pill px-1 text-[11px] font-extrabold',
                  tab === t.id ? 'bg-ember text-white' : 'bg-sand text-ink-mute'
                )}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Tab richieste ── */}
        {tab === 'richieste' &&
          (pending.length === 0 ? (
            <div className="rounded-card border border-line bg-white p-10 text-center shadow-chip">
              <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sand text-ink-mute">
                <Inbox size={24} />
              </span>
              <p className="mb-1 font-bold text-ink">Nessuna richiesta in attesa</p>
              <p className="mx-auto max-w-[280px] text-[14px] text-ink-mute">
                Le nuove richieste dei clienti arrivano qui. Rispondere in fretta migliora la tua
                visibilità.
              </p>
            </div>
          ) : (
            <ul className="space-y-3.5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {pending.map((r) => {
                const date = getRequestDate(r);
                return (
                  <li
                    key={r.id}
                    className="rounded-card border border-line bg-white p-4 shadow-chip animate-fade-up md:p-5"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-[15px] font-bold text-ink">{r.clientName}</p>
                      <span className="rounded-pill bg-ember-soft px-2.5 py-1 text-[11px] font-bold text-ember-deep">
                        Nuova richiesta
                      </span>
                    </div>
                    <p className="text-[13.5px] font-semibold text-ink">{r.service}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12.5px] font-medium text-ink-mute">
                      <span className="inline-flex items-center gap-1 capitalize">
                        <CalendarDays size={13} className="text-ink-faint" />
                        {formatDayLong(date)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} className="text-ink-faint" />
                        {r.slot}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} className="text-ink-faint" />
                        {r.zona}
                      </span>
                    </div>
                    {r.note && (
                      <p className="mt-2.5 rounded-card bg-cream p-3 text-[13px] leading-relaxed text-ink-mute">
                        &ldquo;{r.note}&rdquo;
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => accept(r.id)}
                        className="pressable flex h-10 flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-ember-gradient text-[13.5px] font-bold text-white"
                      >
                        <Check size={15} strokeWidth={3} />
                        Accetta
                      </button>
                      <button
                        type="button"
                        onClick={() => decline(r.id)}
                        className="pressable flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-line text-[13.5px] font-bold text-ink-mute hover:border-red-300 hover:text-red-500"
                      >
                        <X size={15} />
                        Rifiuta
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ))}

        {/* ── Tab agenda ── */}
        {tab === 'agenda' && (
          <div className="space-y-5">
            {agendaDays.length === 0 ? (
              <div className="rounded-card border border-line bg-white p-10 text-center shadow-chip">
                <p className="font-bold text-ink">Agenda vuota</p>
                <p className="text-[14px] text-ink-mute">
                  Gli appuntamenti accettati compaiono qui.
                </p>
              </div>
            ) : (
              agendaDays.map(({ date, items }) => (
                <div key={date.toISOString()}>
                  <p className="mb-2 text-[12.5px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                    <span className="capitalize">{formatDayLong(date)}</span> ·{' '}
                    {items.length} {items.length === 1 ? 'appuntamento' : 'appuntamenti'}
                  </p>
                  <ul className="space-y-2">
                    {items.map((r) => (
                      <li
                        key={r.id}
                        className={cn(
                          'flex items-center gap-3.5 rounded-card border bg-white p-3.5 shadow-chip transition-colors',
                          justAccepted === r.id ? 'border-verde' : 'border-line'
                        )}
                      >
                        <span className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-ink text-white">
                          <span className="text-[14px] font-extrabold leading-none">{r.slot}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14.5px] font-bold text-ink">
                            {r.service}
                          </span>
                          <span className="block truncate text-[12.5px] text-ink-mute">
                            {r.clientName} · {r.zona}
                          </span>
                        </span>
                        {justAccepted === r.id && (
                          <span className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-bold text-verde">
                            <BadgeCheck size={14} />
                            Accettato
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        )}

        {/* recensioni recenti */}
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-extrabold tracking-tight text-ink">
              Ultime <em className="font-accent text-ember-deep">recensioni</em>
            </h2>
            <Link
              href={`/pro/${pro.slug}`}
              className="text-[13px] font-bold text-ink-mute hover:text-ink"
            >
              Vedi tutte
            </Link>
          </div>
          <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {reviews.map((rv) => (
              <li key={rv.id} className="rounded-card border border-line bg-white p-4 shadow-chip">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-[13.5px] font-bold text-ink">{rv.reviewerName}</p>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={cn(i < rv.rating ? 'fill-ember text-ember' : 'fill-sand text-sand')}
                      />
                    ))}
                  </span>
                </div>
                <p className="mb-1 text-[11.5px] font-semibold text-verde">
                  ✓ {rv.jobLabel} · lavoro confermato
                </p>
                <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-mute">{rv.text}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
