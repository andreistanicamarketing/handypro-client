'use client';

// Area utente mobile-first: prenotazioni in programma e completate,
// annullamento e recensione verificata (dati reali da backend).

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, areaForRole } from '@/lib/auth-mock';
import {
  CalendarDays, Clock, Star, Search, CheckCircle2, Hourglass, Plus, MessageCircle, Ellipsis,
} from 'lucide-react';
import { getMyBookings, cancelBooking as apiCancelBooking, createReview, hueFromSlug, type UserBooking } from '@/lib/data';
import { getUnreadCounts } from '@/lib/chat';
import ChatSheet from '@/components/chat/ChatSheet';
import { ProInitialsAvatar } from '@/components/search/ProResultCard';
import ReviewSheet from '@/components/booking/ReviewSheet';
import { cn, formatDayLong, formatDayShort, toDateKey } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Segmented from '@/components/ui/Segmented';

type Tab = 'prossimi' | 'completati';

/** "Ven 10 ott, 08:00" */
function whenLabel(b: UserBooking) {
  const { dayName, dayNum } = formatDayShort(b.date);
  return `${dayName.charAt(0).toUpperCase()}${dayName.slice(1)} ${dayNum}, ${b.slot}`;
}

const statusText = (b: UserBooking) => (b.status === 'pending' ? 'In attesa di conferma' : 'Confermato');

/** Badge non letti sopra un bottone messaggi */
function UnreadDot({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill border-2 border-white bg-ember px-1 text-[10.5px] font-extrabold text-white">
      {count}
    </span>
  );
}

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
  const [menuFor, setMenuFor] = useState<string | null>(null);

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

  // In programma = ancora aperte e da oggi in poi; quelle passate mai concluse vanno nello storico
  const today = toDateKey(new Date());
  const isUpcoming = (b: UserBooking) =>
    (b.status === 'pending' || b.status === 'confirmed') && toDateKey(b.date) >= today;
  const upcoming = useMemo(
    () => (bookings ?? []).filter(isUpcoming).sort((a, b) => a.date.getTime() - b.date.getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- today cambia solo a mezzanotte
    [bookings]
  );
  const completed = useMemo(
    () =>
      (bookings ?? [])
        .filter((b) => !isUpcoming(b))
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bookings]
  );

  const list = tab === 'prossimi' ? upcoming : completed;
  const [next, ...later] = upcoming;

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

  /** "…" → Vedi profilo / Annulla */
  function actionsMenu(b: UserBooking, dark?: boolean) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuFor(menuFor === b.id ? null : b.id)}
          aria-label="Altre azioni"
          aria-expanded={menuFor === b.id}
          className={cn(
            'pressable flex shrink-0 items-center justify-center',
            dark
              ? 'h-11 w-11 rounded-[14px] bg-white/[.12] text-white'
              : 'h-10 w-10 rounded-full border border-line bg-cream text-ink'
          )}
        >
          <Ellipsis size={18} />
        </button>
        {menuFor === b.id && (
          <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-line bg-white py-1 text-ink shadow-lift animate-fade-up">
            <Link href={`/pro/${b.proSlug}`} className="block px-4 py-3 text-[14px] font-semibold hover:bg-cream">
              Vedi profilo
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuFor(null);
                void handleCancel(b.id);
              }}
              className="block w-full px-4 py-3 text-left text-[14px] font-semibold text-red-500 hover:bg-cream"
            >
              Annulla prenotazione
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="md:pt-[72px]">
      <div
        className="mx-auto flex max-w-shell flex-col gap-[18px] px-5 pb-10 md:px-8 md:pt-10"
        style={{ paddingTop: 'max(14px, calc(var(--safe-top) + 14px))' }}
      >
        <div className="flex flex-col gap-[18px] md:max-w-[720px]">
          {/* header */}
          <div className="flex items-center justify-between">
            <h1 className="text-[30px] font-extrabold tracking-[-.025em] text-ink">
              I miei <em className="font-accent text-ember-deep">lavori</em>
            </h1>
            <Link
              href="/cerca"
              aria-label="Nuova prenotazione"
              className="pressable flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white hover:bg-ink-soft"
            >
              <Plus size={20} />
            </Link>
          </div>

          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'prossimi', label: `In programma (${upcoming.length})` },
              { value: 'completati', label: `Storico (${completed.length})` },
            ]}
          />

          {error ? (
            <Card className="p-10 text-center">
              <p className="mb-1 font-bold text-ink">Impossibile caricare le prenotazioni</p>
              <p className="mb-4 text-[14px] text-ink-mute">{error}</p>
              <Button onClick={() => setReloadKey((k) => k + 1)} variant="dark" size="md">
                Riprova
              </Button>
            </Card>
          ) : bookings === null ? (
            <div className="flex flex-col gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-[150px] animate-pulse rounded-card border border-line bg-white/70" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <Card className="p-10 text-center">
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
                <Button href="/cerca" size="md">
                  <Search size={15} />
                  Cerca un professionista
                </Button>
              )}
            </Card>
          ) : tab === 'prossimi' ? (
            <>
              {/* ── Prossimo ── */}
              <div className="flex flex-col gap-4 rounded-[24px] bg-ink-gradient p-[18px] text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-[.1em] text-white/55">Prossimo</span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-[5px] rounded-pill px-2.5 py-1 text-[12px] font-bold',
                      next.status === 'pending' ? 'bg-ember-soft text-ember-deep' : 'bg-verde-soft text-verde'
                    )}
                  >
                    {next.status === 'pending' ? <Hourglass size={12} /> : <CheckCircle2 size={12} />}
                    {statusText(next)}
                  </span>
                </div>
                <Link href={`/pro/${next.proSlug}`} className="flex items-center gap-3">
                  <ProInitialsAvatar name={next.proName} hue={hueFromSlug(next.proSlug)} size={48} />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[17px] font-extrabold">{next.service}</span>
                    <span className="truncate text-[13px] text-white/70">{next.proName}</span>
                  </span>
                </Link>
                <div className="flex gap-[18px] text-[14px] font-bold">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={15} className="text-[#FF8A3D]" aria-hidden />
                    {formatDayLong(next.date)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={15} className="text-[#FF8A3D]" aria-hidden />
                    {next.slot}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setChatFor(next)}
                    className="pressable relative flex h-11 flex-1 items-center justify-center gap-2 rounded-[14px] bg-white text-[14px] font-bold text-ink"
                  >
                    <MessageCircle size={16} aria-hidden />
                    Messaggi
                    <UnreadDot count={unreadCounts[next.id]} />
                  </button>
                  {actionsMenu(next, true)}
                </div>
              </div>

              {/* ── Più avanti ── */}
              {later.length > 0 && (
                <>
                  <span className="mt-1.5 text-[11.5px] font-extrabold uppercase tracking-[.08em] text-ink-faint">
                    Più avanti
                  </span>
                  <ul className="flex flex-col gap-3">
                    {later.map((b) => (
                      <li key={b.id} className="flex items-center gap-3 rounded-card border border-line bg-white p-3.5">
                        <ProInitialsAvatar name={b.proName} hue={hueFromSlug(b.proSlug)} size={44} className="rounded-[14px]" />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="truncate text-[15px] font-bold text-ink">{b.service}</span>
                          <span className="text-[12.5px] text-ink-mute">
                            {b.proName} · {whenLabel(b)}
                          </span>
                          <span
                            className={cn(
                              'mt-0.5 text-[12px] font-bold',
                              b.status === 'pending' ? 'text-ember-deep' : 'text-verde'
                            )}
                          >
                            {statusText(b)}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setChatFor(b)}
                          aria-label="Messaggi"
                          className="pressable relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-cream text-ink"
                        >
                          <MessageCircle size={17} />
                          <UnreadDot count={unreadCounts[b.id]} />
                        </button>
                        {actionsMenu(b)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          ) : (
            /* ── Storico ── */
            <ul className="flex flex-col gap-3">
              {completed.map((b) => (
                <li key={b.id} className="flex flex-col gap-3 rounded-card border border-line bg-white p-3.5">
                  <div className="flex items-center gap-3">
                    <ProInitialsAvatar name={b.proName} hue={hueFromSlug(b.proSlug)} size={44} className="rounded-[14px]" />
                    <Link href={`/pro/${b.proSlug}`} className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="truncate text-[15px] font-bold text-ink">{b.service}</span>
                      <span className="truncate text-[12.5px] text-ink-mute">
                        {b.proName} · {formatDayShort(b.date).dayNum}
                      </span>
                    </Link>
                    <span
                      className={cn(
                        'shrink-0 text-[12px] font-bold',
                        b.status === 'completed' ? 'text-verde' : 'text-ink-faint'
                      )}
                    >
                      {b.status === 'completed' ? '✓ Concluso' : b.status === 'cancelled' ? 'Annullato' : 'Scaduto'}
                    </span>
                  </div>
                  {b.status === 'completed' && !b.reviewed && (
                    <button
                      type="button"
                      onClick={() => setReviewFor(b)}
                      className="pressable flex h-10 items-center justify-center gap-1.5 rounded-xl border border-ink/15 bg-white text-[13.5px] font-bold text-ink hover:bg-ink hover:text-white"
                    >
                      <Star size={14} aria-hidden />
                      Lascia una recensione
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
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
