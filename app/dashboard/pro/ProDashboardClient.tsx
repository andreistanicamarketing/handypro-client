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
  Inbox, CalendarDays, Clock, Star, Eye, Check, Sparkles, ChevronRight, BadgeCheck, MessageCircle,
} from 'lucide-react';
import {
  getProBookings, confirmBooking, completeBooking, cancelBooking,
  getProBySlug, getReviews, hueFromSlug, type ProRequest, type Pro, type Review,
} from '@/lib/data';
import { getUnreadCounts } from '@/lib/chat';
import ChatSheet from '@/components/chat/ChatSheet';
import { cn, formatDayLong, timeAgo, toDateKey } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Segmented from '@/components/ui/Segmented';
import { ProInitialsAvatar } from '@/components/search/ProResultCard';

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
        setReviews(revs.slice(0, 1));
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

  const priceOf = (service: string) => pro?.services.find((s) => s.name === service)?.price;

  return (
    <div className="md:pt-[72px]">
      <div
        className="mx-auto max-w-shell px-5 pb-10 md:px-8 md:pt-10"
        style={{ paddingTop: 'max(14px, calc(var(--safe-top) + 14px))' }}
      >
        <div className="flex flex-col gap-[18px] md:max-w-[720px]">
          {/* header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] text-ink-faint">Ciao {(pro?.name ?? session.name).split(' ')[0]}</span>
              <h1 className="text-[30px] font-extrabold tracking-[-.025em] text-ink">
                La mia <em className="font-accent text-ember-deep">attività</em>
              </h1>
            </div>
            <Link
              href={`/pro/${proSlug}`}
              aria-label="Profilo pubblico"
              title="Profilo pubblico"
              className="pressable flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink hover:border-ink/30"
            >
              <Eye size={18} />
            </Link>
          </div>

          {/* statistiche */}
          <div>
            <div className="grid grid-cols-3 rounded-card border border-line bg-white px-1 py-3.5">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[19px] font-extrabold text-ink">{PRO_STATS.profileViews}</span>
                <span className="text-[11.5px] text-ink-faint">visite profilo</span>
                <span className="text-[11.5px] font-bold text-verde">{PRO_STATS.viewsTrend} sett.</span>
              </div>
              <div className="flex flex-col items-center gap-0.5 border-x border-line">
                <span className="text-[19px] font-extrabold text-ink">{PRO_STATS.searchAppearances}</span>
                <span className="text-[11.5px] text-ink-faint">apparizioni</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="flex items-center gap-[3px] text-[19px] font-extrabold text-ink">
                  {pro?.rating == null ? '—' : pro.rating.toFixed(1)}
                  <Star size={14} className="fill-ember text-ember" aria-hidden />
                </span>
                <span className="text-[11.5px] text-ink-faint">
                  {pro?.reviewCount ?? 0} {pro?.reviewCount === 1 ? 'recensione' : 'recensioni'}
                </span>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-ink-faint">Visite e apparizioni: dati demo, in arrivo con Vetrina.</p>
          </div>

          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              {
                value: 'richieste',
                label: (
                  <>
                    Richieste
                    {pending.length > 0 && (
                      <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-ember px-1 text-[11px] text-white">
                        {pending.length}
                      </span>
                    )}
                  </>
                ),
              },
              { value: 'agenda', label: 'Agenda' },
            ]}
          />

          {/* stato caricamento / errore */}
          {error ? (
            <Card className="p-10 text-center">
              <p className="mb-1 font-bold text-ink">Impossibile caricare le richieste</p>
              <p className="mb-4 text-[14px] text-ink-mute">{error}</p>
              <Button onClick={() => setReloadKey((k) => k + 1)} variant="dark" size="md">
                Riprova
              </Button>
            </Card>
          ) : requests === null ? (
            <div className="h-[190px] animate-pulse rounded-card border border-line bg-white/70" />
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
                  <ul className="flex flex-col gap-3">
                    {pending.map((r) => (
                      <li key={r.id} className="flex flex-col gap-3.5 rounded-card border border-line bg-white p-4 animate-fade-up">
                        <div className="flex items-center gap-3">
                          <ProInitialsAvatar name={r.clientName} hue={hueFromSlug(r.clientName)} size={44} className="rounded-[14px]" />
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="truncate text-[15px] font-bold text-ink">{r.clientName}</span>
                            <span className="truncate text-[12.5px] text-ink-mute">
                              {[r.service, priceOf(r.service)].filter(Boolean).join(' · ')}
                            </span>
                          </span>
                          <span className="shrink-0 rounded-pill bg-ember-soft px-[9px] py-1 text-[11.5px] font-bold text-ember-deep">
                            Nuova
                          </span>
                        </div>
                        <div className="flex gap-4 rounded-[14px] bg-cream px-3 py-2.5 text-[13.5px] font-bold text-ink">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={15} className="text-ink-faint" aria-hidden />
                            {formatDayLong(r.date)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={15} className="text-ink-faint" aria-hidden />
                            {r.slot}
                          </span>
                        </div>
                        {r.note && (
                          <p className="text-[13px] leading-relaxed text-ink-mute">&ldquo;{r.note}&rdquo;</p>
                        )}
                        <div className="flex gap-2">
                          <Button onClick={() => accept(r.id)} className="h-[46px] flex-1 rounded-[14px] text-[14.5px]">
                            <Check size={16} strokeWidth={2.6} />
                            Accetta
                          </Button>
                          <button
                            type="button"
                            onClick={() => decline(r.id)}
                            className="pressable h-[46px] rounded-[14px] border border-ink/15 bg-white px-4 text-[14px] font-bold text-ink hover:border-red-300 hover:text-red-500"
                          >
                            Rifiuta
                          </button>
                          <button
                            type="button"
                            onClick={() => setChatFor(r)}
                            aria-label="Messaggi"
                            className="pressable relative flex h-[46px] w-[46px] items-center justify-center rounded-[14px] border border-ink/15 bg-white text-ink"
                          >
                            <MessageCircle size={17} />
                            {unreadCounts[r.id] > 0 && (
                              <span className="absolute -right-[5px] -top-[5px] flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-ember px-1 text-[11px] font-bold text-white">
                                {unreadCounts[r.id]}
                              </span>
                            )}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ))}

              {/* ── Tab agenda ── */}
              {tab === 'agenda' && (
                <div className="flex flex-col gap-5">
                  {agendaDays.length === 0 ? (
                    <Card className="p-10 text-center">
                      <p className="font-bold text-ink">Agenda vuota</p>
                      <p className="text-[14px] text-ink-mute">Gli appuntamenti accettati compaiono qui.</p>
                    </Card>
                  ) : (
                    agendaDays.map(({ date, items }) => (
                      <div key={date.toISOString()} className="flex flex-col gap-2">
                        <p className="text-[11.5px] font-extrabold uppercase tracking-[.08em] text-ink-faint">
                          {formatDayLong(date)} · {items.length} {items.length === 1 ? 'appuntamento' : 'appuntamenti'}
                        </p>
                        <ul className="flex flex-col gap-2">
                          {items.map((r) => (
                            <li
                              key={r.id}
                              className={cn(
                                'flex flex-wrap items-center gap-3 rounded-card border bg-white p-3.5 transition-colors',
                                justAccepted === r.id ? 'border-verde' : 'border-line'
                              )}
                            >
                              <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-[14px] bg-ink text-[14px] font-extrabold text-white">
                                {r.slot}
                              </span>
                              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="truncate text-[14.5px] font-bold text-ink">{r.service}</span>
                                <span className="truncate text-[12.5px] text-ink-mute">{r.clientName}</span>
                              </span>
                              {justAccepted === r.id && (
                                <span className="inline-flex shrink-0 items-center gap-1 text-[11.5px] font-bold text-verde">
                                  <BadgeCheck size={14} />
                                  Accettato
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => setChatFor(r)}
                                aria-label="Messaggi"
                                className="pressable relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-cream text-ink"
                              >
                                <MessageCircle size={17} />
                                {unreadCounts[r.id] > 0 && (
                                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-ember px-1 text-[10.5px] font-bold text-white">
                                    {unreadCounts[r.id]}
                                  </span>
                                )}
                              </button>
                              {r.date.getTime() <= today.getTime() && (
                                <button
                                  type="button"
                                  onClick={() => complete(r.id)}
                                  className="pressable inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-verde text-[13px] font-bold text-white"
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

          {/* Vetrina */}
          <Link
            href="/abbonamenti"
            className="pressable flex items-center gap-3 rounded-card bg-ink-gradient px-4 py-3.5 text-white"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ember">
              <Sparkles size={18} aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-[14.5px] font-bold">
                Passa a <em className="font-accent text-[#FF8A3D]">Vetrina</em>
              </span>
              <span className="text-[12.5px] text-white/70">Compari prima nei risultati. In arrivo.</span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-white/60" aria-hidden />
          </Link>

          {/* recensioni recenti */}
          <section className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between">
              <h2 className="text-[19px] font-extrabold tracking-[-.02em] text-ink">
                Ultime <em className="font-accent text-ember-deep">recensioni</em>
              </h2>
              <Link href={`/pro/${proSlug}`} className="text-[13px] font-bold text-ink-mute hover:text-ink">
                Vedi tutte
              </Link>
            </div>
            {reviews.length === 0 ? (
              <p className="text-[13.5px] text-ink-mute">Ancora nessuna recensione.</p>
            ) : (
              reviews.map((rv) => (
                <div key={rv.id} className="flex flex-col gap-1.5 rounded-card border border-line bg-white p-3.5">
                  <div className="flex justify-between">
                    <span className="text-[14px] font-bold text-ink">{rv.reviewerName}</span>
                    <span className="flex gap-px" aria-label={`${rv.rating} stelle su 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          aria-hidden
                          className={i < rv.rating ? 'fill-ember text-ember' : 'fill-sand text-sand'}
                        />
                      ))}
                    </span>
                  </div>
                  <span className="text-[12px] font-semibold text-verde">
                    ✓ lavoro confermato · {timeAgo(rv.createdAt)}
                  </span>
                  <p className="text-[13.5px] leading-[1.55] text-ink-mute">{rv.text}</p>
                </div>
              ))
            )}
          </section>
        </div>
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
