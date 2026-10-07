'use client';

// "Prossimo intervento" in home — solo per il cliente loggato con un lavoro in arrivo.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useSession } from '@/lib/auth-mock';
import { getMyBookings, type UserBooking } from '@/lib/data';
import { formatDayShort, toDateKey } from '@/lib/utils';

export default function NextJobCard() {
  const { session } = useSession();
  const token = session?.role === 'privato' ? session.accessToken : null;
  const [next, setNext] = useState<UserBooking | null>(null);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    const today = toDateKey(new Date());
    getMyBookings(token)
      .then((bookings) => {
        const upcoming = bookings
          .filter((b) => (b.status === 'pending' || b.status === 'confirmed') && toDateKey(b.date) >= today)
          .sort((a, b) => `${toDateKey(a.date)} ${a.slot}`.localeCompare(`${toDateKey(b.date)} ${b.slot}`));
        if (alive) setNext(upcoming[0] ?? null);
      })
      .catch(() => {}); // la home funziona anche senza
    return () => {
      alive = false;
    };
  }, [token]);

  if (!token || !next) return null;
  const { dayName } = formatDayShort(next.date);

  return (
    <Link
      href="/dashboard/utente"
      className="pressable flex items-center gap-3.5 rounded-card bg-ink-gradient px-4 py-3.5 text-white md:hidden"
    >
      <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[14px] bg-white/10">
        <span className="text-[10px] font-bold uppercase text-[#FF8A3D]">{dayName}</span>
        <span className="text-[16px] font-extrabold leading-none">{next.date.getDate()}</span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[11px] font-bold uppercase tracking-[.08em] text-white/55">Prossimo intervento</span>
        <span className="truncate text-[14.5px] font-bold">
          {next.service} · {next.slot}
        </span>
        <span className="truncate text-[12.5px] text-white/70">
          {next.proName} · {next.status === 'pending' ? 'in attesa di conferma' : 'confermato'}
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-white/60" aria-hidden />
    </Link>
  );
}
