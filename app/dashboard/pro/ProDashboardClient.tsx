'use client';

// Dashboard professionista mobile-first (dati reali dal backend).
// Richieste con accetta/rifiuta, agenda raggruppata per giorno,
// completa lavoro per sbloccare la recensione del cliente,
// statistiche di visibilità e upsell Vetrina.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, areaForRole } from '@/lib/auth-mock';
import {
  Inbox, CalendarDays, Clock, Star, Eye, TrendingUp, Search,
  Check, X, Sparkles, ChevronRight, BadgeCheck, MessageSquare,
} from 'lucide-react';
import {
  getProBookings, confirmBooking, completeBooking, cancelBooking,
  getProBySlug, getReviews, type ProRequest, type Pro, type Review,
} from '@/lib/data';
import { getUnreadCounts } from '@/lib/chat';
import ChatSheet from '@/components/chat/ChatSheet';
import { cn, formatDayLong, timeAgo, toDateKey } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

type Tab = 'richieste' | 'agenda';

/** Statistiche settimanali — dati demo: il backend non le espone ancora (Fase 3). */
const PRO_STATS = { profileViews: 86, viewsTrend: '+24%', searchAppearances: 312 };

export default function ProDashboardClient() {
  const router = useRouter();
  const { session, ready } = useSession();

  const token = session?.accessToken;
  const proSlug = session?.proSlug;

  const [pro, setPro] = useState<Pro | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [requests, setRequests] = useState<ProRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [justAccepted, setJustAccepted] = useState<string | null>(null);
  const [chatFor, setChatFor] = useState<ProRequest | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Guard: solo professionisti loggati
  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace('/registrati');
    else if (session.role !== 'professionista') router.replace(areaForRole(session.role));
  }, [ready, session, router]);

  useEffect(() => {
    if (!token || !proSlug || session?.role !== 'professionista') return;
    let alive = true;
    setError(null);
    Promise.all([
      getProBookings(token),
      getProBySlug(proSlug),
      getReviews(proSlug).catch(() => []),
      getUnreadCounts(token).catch(() => []),
    ])
      .then(([reqs, proData, revs, counts]) => {
        if (!alive) return;
        setRequests(reqs);
        setPro(proData);
        setReviews(revs.slice(0, 2));
        setUnreadCounts(Object.fromEntries(counts.map((c) => [c.bookingId, c.count])));
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Errore di rete'));
    return () => {
      alive = false;
    };
  }, [token, proSlug, session?.role, reloadKey]);

  const [tab, setTab] = useState<Tab>('richieste');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pending = useMemo(
    () => (requests ?? []).filter((r) => r.status === 'pending')
      .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [requests]
  );
  const accepted = useMemo(
    () => (requests ?? []).filter((r) => r.status === 'confirmed')
      .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [requests]
  );

  // Agenda raggruppata per giorno
  const agendaDays = useMemo(() => {
    const map = new Map<string, ProRequest[]>();
    for (const r of accepted) {
      const key = toDateKey(r.date);
      map.set(key, [...(map.get(key) ?? []), r]);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => ({
        date: new Date(`${key}T00:00:00`),
        items: items.sort((a, b) => a.slot.localeCompare(b.slot)),
      }));
  }, [accepted]);

  async function act(
    id: string,
    fn: (t: string, i: string) => Promise<void>,
    after: (r: ProRequest) => ProRequest | null
  ) {
    if (!token) return;
    try {
      await fn(token, id);
      setRequests((prev) => prev && prev
        .map((r) => (r.id === id ? after(r) : r))
        .filter((r): r is ProRequest => r !== null));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore di rete');
    }
  }

  function accept(id: string) {
    void act(id, confirmBooking, (r) => ({ ...r, status: 'confirmed' as const }));
    setJustAccepted(id);
    setTimeout(() => setJustAccepted(null), 2200);
  }
  const decline = (id: string) => act(id, cancelBooking, () => null);
  const complete = (id: string) => act(id, completeBooking, () => null);

  if (!ready || !session || session.role !== 'professionista') return null;

  return (
    <div className="min-h-screen pt-14 md:pt-16">
      <div className="mx-auto max-w-content px-4 pb-10 pt-5 md:px-8 md:pt-10">
        {/* header */}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[13px] font-semibold text-ink-faint">
              Ciao {(pro?.name ?? session.name).split(' ')[0]} 👋
            </p>
            <h1 className="text-[24px] font-extrabold tracking-tight text-ink md:text-3xl">
              La mia <em className="font-accent text-ember-deep">attività</em>
            </h1>
          </div>
          <Link
            href={`/pro/${proSlug}`}
            className="pressable inline-flex h-10 items-center gap-1 rounded-pill border border-line bg-white px-3.5 text-[13px] font-bold text-ink shadow-chip hover:border-ink/30"
          >
            Profilo pubblico
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* statistiche settimana */}
        <div className="mb-4 grid grid-cols-3 gap-2.5">
          <Card className="p-3.5">
            <p className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-faint">
              <Eye size={12} /> Profilo
            </p>
            <p className="mt-1 text-[20px] font-extrabold text-ink">{PRO_STATS.profileViews}</p>
            <p className="flex items-center gap-1 text-[11.5px] font-bold text-verde">
              <TrendingUp size={11} />
              {PRO_STATS.viewsTrend} sett.
            </p>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">dati demo</p>
          </Card>
          <Card className="p-3.5">
            <p className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-faint">
              <Search size={12} /> Ricerche
            </p>
            <p className="mt-1 text-[20px] font-extrabold text-ink">{PRO_STATS.searchAppearances}</p>
            <p className="text-[11.5px] font-medium text-ink-faint">apparizioni</p>
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint">dati demo</p>
          </Card>
          <Card className="p-3.5">
            <p className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-ink-faint">
              <Star size={12} /> Voto medio
            </p>
            <p className="mt-1 flex items-center gap-1 text-[20px] font-extrabold text-ink">
              {pro?.rating == null ? '—' : pro.rating.toFixed(1)}
              <Star size={14} className="fill-ember text-ember" />
            </p>
            <p className="text-[11.5px] font-medium text-ink-faint">{pro?.reviewCount ?? 0} {pro?.reviewCount === 1 ? 'recensione' : 'recensioni'}</p>
          </Card>
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
                Compari prima nei risultati e ottieni statistiche complete. In arrivo.
              </p>
            </div>
            <Link
              href="/abbonamenti"
              className="pressable shrink-0 rounded-pill bg-white px-4 py-2 text-[12.5px] font-bold text-ink"
            >
              Scopri di più
            </Link>
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

        {/* stato caricamento / errore */}
        {error ? (
          <Card className="p-10 text-center">
            <p className="mb-1 font-bold text-ink">Impossibile caricare le richieste</p>
            <p className="mb-4 text-[14px] text-ink-mute">{error}</p>
            <Button
              onClick={() => setReloadKey((k) => k + 1)}
              variant="dark"
              size="md"
            >
              Riprova
            </Button>
          </Card>
        ) : requests === null ? (
          <div className="space-y-3.5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[190px] animate-pulse rounded-card border border-line bg-white/70 shadow-chip" />
            ))}
          </div>
        ) : (
          <>
            {/* ── Tab richieste ── */}
            {tab === 'richieste' &&
              (pending.length === 0 ? (
                <Card className="p-10 text-center">
                  <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sand text-ink-mute">
                    <Inbox size={24} />
                  </span>
                  <p className="mb-1 font-bold text-ink">Nessuna richiesta in attesa</p>
                  <p className="mx-auto max-w-[280px] text-[14px] text-ink-mute">
                    Quando un cliente ti chiede un intervento, la richiesta compare qui.
                  </p>
                </Card>
              ) : (
                <ul className="space-y-3.5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                  {pending.map((r) => (
                    <Card as="li"
                      key={r.id}
                      className="p-4 animate-fade-up md:p-5"
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
                          {formatDayLong(r.date)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={13} className="text-ink-faint" />
                          {r.slot}
                        </span>
                      </div>
                      {r.note && (
                        <p className="mt-2.5 rounded-card bg-cream p-3 text-[13px] leading-relaxed text-ink-mute">
                          &ldquo;{r.note}&rdquo;
                        </p>
                      )}
                      <div className="mt-3 flex gap-2">
                        <Button
                          onClick={() => accept(r.id)}
                          size="sm"
                          className="flex-[1.4]"
                        >
                          <Check size={15} strokeWidth={3} />
                          Accetta
                        </Button>
                        <Button
                          onClick={() => decline(r.id)}
                          variant="danger"
                          size="sm"
                          className="flex-1"
                        >
                          <X size={15} />
                          Rifiuta
                        </Button>
                      </div>
                      <Button
                        onClick={() => setChatFor(r)}
                        variant="muted"
                        size="sm"
                        className="relative mt-2 w-full"
                      >
                        <MessageSquare size={14} />
                        Messaggi
                        {unreadCounts[r.id] > 0 && (
                          <span className="absolute right-3 flex h-5 min-w-5 items-center justify-center rounded-pill bg-ember px-1 text-[11px] font-extrabold text-white">
                            {unreadCounts[r.id]}
                          </span>
                        )}
                      </Button>
                    </Card>
                  ))}
                </ul>
              ))}

            {/* ── Tab agenda ── */}
            {tab === 'agenda' && (
              <div className="space-y-5">
                {agendaDays.length === 0 ? (
                  <Card className="p-10 text-center">
                    <p className="font-bold text-ink">Agenda vuota</p>
                    <p className="text-[14px] text-ink-mute">
                      Gli appuntamenti accettati compaiono qui.
                    </p>
                  </Card>
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
                                {r.clientName}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setChatFor(r)}
                              aria-label="Messaggi"
                              className="pressable relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-mute hover:border-ink/30 hover:text-ink"
                            >
                              <MessageSquare size={15} />
                              {unreadCounts[r.id] > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-pill bg-ember px-1 text-[9.5px] font-extrabold text-white">
                                  {unreadCounts[r.id]}
                                </span>
                              )}
                            </button>
                            {justAccepted === r.id && (
                              <span className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-bold text-verde">
                                <BadgeCheck size={14} />
                                Accettato
                              </span>
                            )}
                            {r.date.getTime() <= today.getTime() && (
                              <button
                                type="button"
                                onClick={() => complete(r.id)}
                                className="pressable inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-verde px-3 text-[12.5px] font-bold text-white"
                              >
                                <Check size={14} strokeWidth={3} />
                                Segna come completata
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* recensioni recenti */}
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-extrabold tracking-tight text-ink">
              Ultime <em className="font-accent text-ember-deep">recensioni</em>
            </h2>
            <Link
              href={`/pro/${proSlug}`}
              className="text-[13px] font-bold text-ink-mute hover:text-ink"
            >
              Vedi tutte
            </Link>
          </div>
          {reviews.length === 0 ? (
            <p className="text-[13.5px] text-ink-mute">Ancora nessuna recensione.</p>
          ) : (
            <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {reviews.map((rv) => (
                <Card as="li" key={rv.id} className="p-4">
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
                    ✓ lavoro confermato · {timeAgo(rv.createdAt)}
                  </p>
                  <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-mute">{rv.text}</p>
                </Card>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ChatSheet
        open={chatFor !== null}
        bookingId={chatFor?.id ?? ''}
        token={token ?? ''}
        myUserId={session.userId}
        otherPartyName={chatFor?.clientName ?? ''}
        onClose={() => setChatFor(null)}
        onRead={() => {
          if (chatFor) setUnreadCounts((prev) => ({ ...prev, [chatFor.id]: 0 }));
        }}
      />
    </div>
  );
}
