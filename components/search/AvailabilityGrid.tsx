'use client';

// Disponibilità: colonne giorno con slot prenotabili.
// Mobile: scroll orizzontale con snap. Desktop: 4 colonne con frecce.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAvailability, nextAvailability, type DayAvailability } from '@/lib/data';
import { cn, formatDayShort, formatDayLong, toDateKey } from '@/lib/utils';

interface AvailabilityGridProps {
  proSlug: string;
  visibleDays?: number;
}

const COLLAPSED_ROWS = 4;

export default function AvailabilityGrid({
  proSlug,
  visibleDays = 4,
}: AvailabilityGridProps) {
  const [allDays, setAllDays] = useState<DayAvailability[] | null>(null); // null = loading
  const [offset, setOffset] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let alive = true;
    getAvailability(proSlug, 14)
      .then((days) => {
        if (!alive) return;
        setAllDays(days);
        const firstIdx = days.findIndex((d) => d.slots.length > 0);
        if (firstIdx > 0) {
          const windowStart = Math.floor(firstIdx / visibleDays) * visibleDays;
          setOffset(Math.min(windowStart, Math.max(0, days.length - visibleDays)));
        }
      })
      .catch(() => alive && setAllDays([]));
    return () => {
      alive = false;
    };
  }, [proSlug, visibleDays]);

  if (allDays === null) {
    return <div className="min-h-[110px] animate-pulse rounded-card bg-sand/50" aria-label="Caricamento disponibilità" />;
  }

  const maxOffset = Math.max(0, allDays.length - visibleDays);
  const days = allDays.slice(offset, offset + visibleDays);

  const maxSlots = Math.max(...days.map((d) => d.slots.length), 0);
  const visibleRows = expanded ? maxSlots : Math.min(maxSlots, COLLAPSED_ROWS);
  const hasMore = maxSlots > COLLAPSED_ROWS;

  if (maxSlots === 0) {
    const next = nextAvailability(allDays);
    return (
      <div className="flex min-h-[110px] flex-col items-center justify-center rounded-card bg-sand/60 p-4 text-center">
        <p className="text-[13.5px] font-medium text-ink-mute">
          Nessuna disponibilità in questi giorni
        </p>
        {next ? (
          <button
            type="button"
            onClick={() => {
              const idx = allDays.findIndex((d) => d.date.getTime() === next.date.getTime());
              if (idx >= 0) setOffset(Math.min(Math.max(idx, 0), maxOffset));
            }}
            className="pressable mt-2 rounded-pill bg-ink px-4 py-2 text-[13px] font-bold text-white"
          >
            Prossima: {formatDayLong(next.date)} · {next.slot}
          </button>
        ) : (
          <p className="mt-1 text-[12px] text-ink-faint">Contatta il professionista</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-start gap-1">
        {/* Freccia indietro — solo desktop */}
        <button
          type="button"
          onClick={() => setOffset(Math.max(0, offset - visibleDays))}
          disabled={offset === 0}
          aria-label="Giorni precedenti"
          className="pressable mt-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-mute hover:bg-sand disabled:opacity-25 sm:flex"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Colonne giorni — scroll con snap su mobile, griglia su desktop */}
        <div
          className="flex flex-1 snap-x gap-2 overflow-x-auto pb-1 scrollbar-hide sm:grid sm:gap-1.5 sm:overflow-visible sm:pb-0"
          style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}
        >
          {days.map((day) => {
            const { dayName, dayNum } = formatDayShort(day.date);
            const slots = day.slots.slice(0, visibleRows);
            return (
              <div
                key={toDateKey(day.date)}
                className="w-[76px] shrink-0 snap-start text-center sm:w-auto sm:min-w-0 sm:shrink"
              >
                <p className="text-[12px] font-bold capitalize text-ink">{dayName}</p>
                <p className="mb-2 text-[11px] font-medium text-ink-faint">{dayNum}</p>
                <div className="flex flex-col gap-1.5">
                  {slots.map((slot) => (
                    <Link
                      key={slot}
                      href={`/pro/${proSlug}?data=${toDateKey(day.date)}&ora=${slot}`}
                      className="pressable flex h-9 items-center justify-center rounded-xl bg-sand text-[13px] font-bold text-ink hover:bg-ink hover:text-white"
                    >
                      {slot}
                    </Link>
                  ))}
                  {Array.from({ length: Math.max(0, visibleRows - slots.length) }).map((_, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className="flex h-9 select-none items-center justify-center text-[13px] text-line"
                    >
                      —
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Freccia avanti — solo desktop */}
        <button
          type="button"
          onClick={() => setOffset(Math.min(maxOffset, offset + visibleDays))}
          disabled={offset >= maxOffset}
          aria-label="Giorni successivi"
          className="pressable mt-0.5 hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-mute hover:bg-sand disabled:opacity-25 sm:flex"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {/* Navigazione giorni su mobile */}
        <button
          type="button"
          onClick={() => setOffset(Math.max(0, offset - visibleDays))}
          disabled={offset === 0}
          aria-label="Giorni precedenti"
          className="pressable flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink-mute disabled:opacity-25 sm:hidden"
        >
          <ChevronLeft size={15} />
        </button>
        {hasMore ? (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="pressable h-9 flex-1 rounded-xl text-[13.5px] font-bold text-ink-soft hover:bg-sand/70"
          >
            {expanded ? 'Mostra meno orari' : 'Mostra più orari'}
          </button>
        ) : (
          <span className="flex-1" />
        )}
        <button
          type="button"
          onClick={() => setOffset(Math.min(maxOffset, offset + visibleDays))}
          disabled={offset >= maxOffset}
          aria-label="Giorni successivi"
          className="pressable flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-ink-mute disabled:opacity-25 sm:hidden"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
