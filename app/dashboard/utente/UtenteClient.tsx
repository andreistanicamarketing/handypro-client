'use client';

// Area utente mobile-first: prenotazioni in programma e completate,
// annullamento e recensione verificata (dati reali da backend).

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, areaForRole } from '@/lib/auth-mock';
import {
  CalendarDays, Clock, Star, ChevronRight, Search,
  CheckCircle2, Hourglass, BadgeCheck, Plus, X, MessageSquare,
} from 'lucide-react';
import { getMyBookings, cancelBooking as apiCancelBooking, createReview, hueFromSlug, type UserBooking } from '@/lib/data';
import { getUnreadCounts } from '@/lib/chat';
import ChatSheet from '@/components/chat/ChatSheet';
import { ProInitialsAvatar } from '@/components/search/ProResultCard';
import ReviewSheet from '@/components/booking/ReviewSheet';
import { cn, formatDayLong } from '@/lib/utils';

type Tab = 'prossimi' | 'completati';

const STATUS_META = {
  pending: { label: 'In attesa di conferma', icon: Hourglass, cls: 'bg-ember-soft text-ember-deep' },
  confirmed: { label: 'Confermata', icon: CheckCircle2, cls: 'bg-verde-soft text-verde' },
  completed: { label: 'Completata', icon: CheckCircle2, cls: 'bg-sand text-ink-mute' },
  cancelled: { label: 'Annullata', icon: X, cls: 'bg-sand text-ink-faint' },
} as const;

export default function UtenteClient() {
  const router = useRouter();
  const { session, ready } = useSession();
  const [tab, setTab] = useState<Tab>('prossimi');
  const [bookings, setBookings] = useState<UserBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [reviewFor, setReviewFor] = useState<UserBooking | null>(null);
  const [chatFor, setChatFor] = useState<UserBooking | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const token = session?.accessToken;

  // Guard: solo clienti loggati
  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace('/registrati');
    else if (session.role !== 'privato') router.replace(areaForRole(session.role));
  }, [ready, session, router]);

  useEffect(() => {
    if (!token || session?.role !== 'privato') return;
    let alive = true;
    setBookings(null);
    setError(null);
    Promise.all([getMyBookings(token), getUnreadCounts(token).catch(() => [])])
      .then(([b, counts]) => {
        if (!alive) return;
        setBookings(b);
        setUnreadCounts(Object.fromEntries(counts.map((c) => [c.bookingId, c.count])));
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Errore di rete'));
    return () => {
      alive = false;
    };
  }, [token, session?.role, reloadKey]);

  const upcoming = useMemo(
    () =>
      (bookings ?? [])
        .filter((b) => b.status === 'pending' || b.status === 'confirmed')
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [bookings]
  );
  const completed = useMemo(
    () =>
      (bookings ?? [])
        .filter((b) => b.status === 'completed' || b.status === 'cancelled')
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    [bookings]
  );

  const list = tab === 'prossimi' ? upcoming : completed;

  if (!ready || !session || session.role !== 'privato') return null;

  async function handleCancel(id: string) {
    if (!token) return;
    try {
      await apiCancelBooking(token, id);
      setBookings((prev) => prev && prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Errore di rete');
    }
  }

  return (
    <div className="min-h-screen pt-14 md:pt-16">
      <div className="mx-auto max-w-content px-4 pb-10 pt-5 md:px-8 md:pt-10">
        {/* header */}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[13px] font-semibold text-ink-faint">
              Ciao {session.name.split(' ')[0]} 👋
            </p>
            <h1 className="text-[24px] font-extrabold tracking-tight text-ink md:text-3xl">
              I miei <em className="font-accent text-ember-deep">lavori</em>
            </h1>
          </div>
          <Link
            href="/cerca"
            className="pressable hidden h-11 items-center gap-1.5 rounded-pill bg-ink px-4 text-[13.5px] font-bold text-white md:inline-flex"
          >
            <Plus size={15} />
            Nuova prenotazione
          </Link>
        </div>

        {/* tabs */}
        <div className="mb-4 flex rounded-pill border border-line bg-white p-1 shadow-chip md:max-w-sm">
          {(
            [
              { id: 'prossimi', label: `In programma (${upcoming.length})` },
              { id: 'completati', label: `Storico (${completed.length})` },
            ] as { id: Tab; label: string }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={cn(
                'pressable h-10 flex-1 rounded-pill text-[13.5px] font-bold transition-colors',
                tab === t.id ? 'bg-ink text-white' : 'text-ink-mute hover:text-ink'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* lista */}
        {error ? (
          <div className="rounded-card border border-line bg-white p-10 text-center shadow-chip">
            <p className="mb-1 font-bold text-ink">Impossibile caricare le prenotazioni</p>
            <p className="mb-4 text-[14px] text-ink-mute">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="pressable h-11 rounded-2xl bg-ink px-5 text-[14px] font-bold text-white"
            >
              Riprova
            </button>
          </div>
        ) : bookings === null ? (
          <div className="space-y-3.5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[190px] animate-pulse rounded-card border border-line bg-white/70 shadow-chip" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-card border border-line bg-white p-10 text-center shadow-chip">
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sand text-ink-mute">
              <CalendarDays size={24} />
            </span>
            <p className="mb-1 font-bold text-ink">
              {tab === 'prossimi' ? 'Nessun lavoro in programma' : 'Nessun lavoro nello storico'}
            </p>
            <p className="mx-auto mb-5 max-w-[260px] text-[14px] text-ink-mute">
              {tab === 'prossimi'
                ? 'Trova un professionista e prenota il tuo primo intervento.'
                : 'Qui trovi i lavori conclusi e quelli annullati. Quelli conclusi puoi recensirli.'}
            </p>
            {tab === 'prossimi' && (
              <Link
                href="/cerca"
                className="pressable inline-flex h-11 items-center gap-2 rounded-2xl bg-ember-gradient px-5 text-[14px] font-bold text-white"
              >
                <Search size={15} />
                Cerca un professionista
              </Link>
            )}
          </div>
        ) : (
          <ul className="space-y-3.5 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {list.map((b) => {
              const status = STATUS_META[b.status];
              const canAct = b.status === 'pending' || b.status === 'confirmed';
              return (
                <li
                  key={b.id}
                  className="rounded-card border border-line bg-white p-4 shadow-chip md:p-5"
                >
                  {/* stato */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[11.5px] font-bold',
                        status.cls
                      )}
                    >
                      <status.icon size={12} />
                      {status.label}
                    </span>
                    {b.status === 'completed' && b.reviewed && (
                      <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-verde">
                        <BadgeCheck size={13} />
                        Recensione lasciata
                      </span>
                    )}
                  </div>

                  {/* pro + servizio */}
                  <Link href={`/pro/${b.proSlug}`} className="group flex items-center gap-3">
                    <ProInitialsAvatar name={b.proName} hue={hueFromSlug(b.proSlug)} size={48} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-ink group-hover:text-ember-deep">
                        {b.service}
                      </span>
                      <span className="block truncate text-[13px] text-ink-mute">
                        {b.proName}
                      </span>
                    </span>
                    <ChevronRight size={17} className="shrink-0 text-ink-faint" />
                  </Link>

                  {/* dettagli */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-card bg-cream p-3 text-[13px] font-semibold text-ink">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <CalendarDays size={14} className="text-ink-faint" />
                      {formatDayLong(b.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} className="text-ink-faint" />
                      {b.slot}
                    </span>
                  </div>

                  {/* azioni */}
                  <div className="mt-3 flex gap-2">
                    {canAct && (
                      <>
                        <Link
                          href={`/pro/${b.proSlug}`}
                          className="pressable flex h-10 flex-1 items-center justify-center rounded-xl border border-ink/15 text-[13px] font-bold text-ink hover:bg-ink hover:text-white"
                        >
                          Vedi profilo
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCancel(b.id)}
                          className="pressable flex h-10 flex-1 items-center justify-center rounded-xl border border-line text-[13px] font-bold text-ink-mute hover:border-red-300 hover:text-red-500"
                        >
                          Annulla
                        </button>
                      </>
                    )}
                    {b.status === 'completed' && !b.reviewed && (
                      <button
                        type="button"
                        onClick={() => setReviewFor(b)}
                        className="pressable flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-ember-gradient text-[13px] font-bold text-white"
                      >
                        <Star size={14} />
                        Lascia una recensione verificata
                      </button>
                    )}
                    {b.status === 'completed' && b.reviewed && (
                      <Link
                        href={`/pro/${b.proSlug}`}
                        className="pressable flex h-10 flex-1 items-center justify-center rounded-xl border border-ink/15 text-[13px] font-bold text-ink hover:bg-ink hover:text-white"
                      >
                        Prenota di nuovo
                      </Link>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setChatFor(b)}
                    className="pressable relative mt-2 flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-line text-[13px] font-bold text-ink-mute hover:border-ink/30 hover:text-ink"
                  >
                    <MessageSquare size={14} />
                    Messaggi
                    {unreadCounts[b.id] > 0 && (
                      <span className="absolute right-3 flex h-5 min-w-5 items-center justify-center rounded-pill bg-ember px-1 text-[11px] font-extrabold text-white">
                        {unreadCounts[b.id]}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* CTA mobile nuova richiesta */}
        <Link
          href="/cerca"
          className="pressable mt-5 flex h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-white text-[14.5px] font-bold text-ink shadow-chip md:hidden"
        >
          <Plus size={16} />
          Nuova prenotazione
        </Link>
      </div>

      {/* sheet recensione */}
      <ReviewSheet
        open={reviewFor !== null}
        proName={reviewFor?.proName ?? ''}
        jobLabel={reviewFor?.service ?? ''}
        onClose={() => setReviewFor(null)}
        onSubmit={async (rating, text) => {
          if (!reviewFor || !token) return 'Sessione scaduta: accedi di nuovo.';
          try {
            await createReview(token, { bookingId: reviewFor.id, rating, text });
            setBookings((prev) => prev && prev.map((b) => (b.id === reviewFor.id ? { ...b, reviewed: true } : b)));
            return null;
          } catch (e) {
            return e instanceof Error ? e.message : 'Errore di rete';
          }
        }}
      />
      <ChatSheet
        open={chatFor !== null}
        bookingId={chatFor?.id ?? ''}
        token={token ?? ''}
        myUserId={session.userId}
        otherPartyName={chatFor?.proName ?? ''}
        onClose={() => setChatFor(null)}
        onRead={() => {
          if (chatFor) setUnreadCounts((prev) => ({ ...prev, [chatFor.id]: 0 }));
        }}
      />
    </div>
  );
}
