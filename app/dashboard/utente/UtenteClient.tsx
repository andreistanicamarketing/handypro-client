'use client';

// Area utente mobile-first: prenotazioni in programma e completate,
// annullamento e recensione verificata (tutto mock lato client).

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, areaForRole } from '@/lib/auth-mock';
import {
  CalendarDays, Clock, MapPin, Star, ChevronRight, Search,
  CheckCircle2, Hourglass, BadgeCheck, Plus,
} from 'lucide-react';
import {
  USER_BOOKINGS, getBookingDate, getProBySlug, PROS, formatDayLong,
  type MockBooking, type MockPro,
} from '@/lib/mock-data';
import { ProInitialsAvatar } from '@/components/search/ProResultCard';
import ReviewSheet from '@/components/booking/ReviewSheet';
import { cn } from '@/lib/utils';

type Tab = 'prossimi' | 'completati';

function getPro(proId: string): MockPro {
  return PROS.find((p) => p.id === proId)!;
}

const STATUS_META = {
  pending: { label: 'In attesa di conferma', icon: Hourglass, cls: 'bg-ember-soft text-ember-deep' },
  confirmed: { label: 'Confermato', icon: CheckCircle2, cls: 'bg-verde-soft text-verde' },
  completed: { label: 'Completato', icon: CheckCircle2, cls: 'bg-sand text-ink-mute' },
} as const;

export default function UtenteClient() {
  const router = useRouter();
  const { session, ready } = useSession();
  const [tab, setTab] = useState<Tab>('prossimi');
  const [bookings, setBookings] = useState<MockBooking[]>(USER_BOOKINGS);
  const [reviewFor, setReviewFor] = useState<MockBooking | null>(null);

  // Guard: solo clienti loggati
  useEffect(() => {
    if (!ready) return;
    if (!session) router.replace('/registrati');
    else if (session.role !== 'privato') router.replace(areaForRole(session.role));
  }, [ready, session, router]);

  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => b.status !== 'completed')
        .sort((a, b) => a.dayOffset - b.dayOffset),
    [bookings]
  );
  const completed = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'completed')
        .sort((a, b) => b.dayOffset - a.dayOffset),
    [bookings]
  );

  const list = tab === 'prossimi' ? upcoming : completed;

  if (!ready || !session || session.role !== 'privato') return null;

  function cancelBooking(id: string) {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }

  function markReviewed(id: string) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, reviewed: true } : b)));
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
            Nuova richiesta
          </Link>
        </div>

        {/* tabs */}
        <div className="mb-4 flex rounded-pill border border-line bg-white p-1 shadow-chip md:max-w-sm">
          {(
            [
              { id: 'prossimi', label: `In programma (${upcoming.length})` },
              { id: 'completati', label: `Completati (${completed.length})` },
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
        {list.length === 0 ? (
          <div className="rounded-card border border-line bg-white p-10 text-center shadow-chip">
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sand text-ink-mute">
              <CalendarDays size={24} />
            </span>
            <p className="mb-1 font-bold text-ink">
              {tab === 'prossimi' ? 'Nessun lavoro in programma' : 'Nessun lavoro completato'}
            </p>
            <p className="mx-auto mb-5 max-w-[260px] text-[14px] text-ink-mute">
              {tab === 'prossimi'
                ? 'Trova un professionista e prenota il tuo primo intervento.'
                : 'I lavori conclusi compariranno qui, pronti da recensire.'}
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
              const pro = getPro(b.proId);
              const date = getBookingDate(b);
              const status = STATUS_META[b.status];
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
                        Recensito
                      </span>
                    )}
                  </div>

                  {/* pro + servizio */}
                  <Link href={`/pro/${pro.slug}`} className="group flex items-center gap-3">
                    <ProInitialsAvatar pro={pro} size={48} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold text-ink group-hover:text-ember-deep">
                        {b.service}
                      </span>
                      <span className="block truncate text-[13px] text-ink-mute">
                        {pro.name} · {pro.categoryLabel}
                      </span>
                    </span>
                    <ChevronRight size={17} className="shrink-0 text-ink-faint" />
                  </Link>

                  {/* dettagli */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-card bg-cream p-3 text-[13px] font-semibold text-ink">
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <CalendarDays size={14} className="text-ink-faint" />
                      {formatDayLong(date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} className="text-ink-faint" />
                      {b.slot}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-ink-mute">
                      <MapPin size={14} className="text-ink-faint" />
                      {pro.zona}
                    </span>
                  </div>

                  {/* azioni */}
                  <div className="mt-3 flex gap-2">
                    {b.status !== 'completed' && (
                      <>
                        <Link
                          href={`/pro/${pro.slug}`}
                          className="pressable flex h-10 flex-1 items-center justify-center rounded-xl border border-ink/15 text-[13px] font-bold text-ink hover:bg-ink hover:text-white"
                        >
                          Vedi profilo
                        </Link>
                        <button
                          type="button"
                          onClick={() => cancelBooking(b.id)}
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
                        href={`/pro/${pro.slug}`}
                        className="pressable flex h-10 flex-1 items-center justify-center rounded-xl border border-ink/15 text-[13px] font-bold text-ink hover:bg-ink hover:text-white"
                      >
                        Prenota di nuovo
                      </Link>
                    )}
                  </div>
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
          Nuova richiesta
        </Link>
      </div>

      {/* sheet recensione */}
      <ReviewSheet
        open={reviewFor !== null}
        proName={reviewFor ? getPro(reviewFor.proId).name : ''}
        jobLabel={reviewFor?.service ?? ''}
        onClose={() => setReviewFor(null)}
        onSubmit={() => {
          if (reviewFor) markReviewed(reviewFor.id);
        }}
      />
    </div>
  );
}
