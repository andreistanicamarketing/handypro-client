'use client';

// Scelta giorno (strip scorrevole) + orario (griglia). Usato da profilo pro e prenotazione.
// Mostra solo i giorni con almeno uno slot libero.

import type { DayAvailability } from '@/lib/data';
import { cn, formatDayShort, toDateKey } from '@/lib/utils';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Gio 9 ott · 09:00" */
export function slotLabel(date: Date, slot: string): string {
  const { dayName, dayNum } = formatDayShort(date);
  return `${capitalize(dayName)} ${dayNum} · ${slot}`;
}

interface SlotPickerProps {
  /** null = in caricamento */
  days: DayAvailability[] | null;
  dateKey: string | null;
  slot: string | null;
  onDate: (key: string) => void;
  onSlot: (slot: string) => void;
  /** compact = profilo (4 colonne), large = sheet di prenotazione (3 colonne) */
  size?: 'compact' | 'large';
  /** Eyebrow sopra le due righe (solo large) */
  labels?: { days: string; slots: string };
  /** Margine negativo per far scorrere la strip fino al bordo (es. "-mx-5 px-5") */
  bleed?: string;
}

const eyebrow = 'text-[11.5px] font-extrabold uppercase tracking-[.08em] text-ink-faint';

export default function SlotPicker({
  days,
  dateKey,
  slot,
  onDate,
  onSlot,
  size = 'compact',
  labels,
  bleed,
}: SlotPickerProps) {
  const large = size === 'large';
  const free = days?.filter((d) => d.slots.length > 0);
  const selected = free?.find((d) => toDateKey(d.date) === dateKey);

  const strip = cn('flex gap-1.5 overflow-x-auto scrollbar-hide', bleed);
  const grid = cn('grid', large ? 'grid-cols-3 gap-2' : 'grid-cols-4 gap-1.5');

  if (!free) {
    return (
      <div className="flex flex-col gap-3" aria-label="Caricamento disponibilità">
        <div className={strip}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className={cn('w-[52px] shrink-0 animate-pulse rounded-2xl bg-sand/60', large ? 'h-16' : 'h-[60px]')} />
          ))}
        </div>
        <div className={grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className={cn('animate-pulse bg-sand/60', large ? 'h-12 rounded-[14px]' : 'h-10 rounded-xl')} />
          ))}
        </div>
      </div>
    );
  }

  if (free.length === 0) {
    return (
      <p className="rounded-card bg-sand/60 p-4 text-center text-[13.5px] font-medium text-ink-mute">
        Nessun orario libero nelle prossime due settimane.
      </p>
    );
  }

  return (
    <div className={cn('flex flex-col', large ? 'gap-[18px]' : 'gap-3')}>
      <div className="flex flex-col gap-2.5">
        {labels && <span className={eyebrow}>{labels.days}</span>}
        <div className={strip} role="listbox" aria-label="Giorno">
          {free.map((d) => {
            const key = toDateKey(d.date);
            const active = key === dateKey;
            return (
              <button
                key={key}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onDate(key)}
                className={cn(
                  'pressable flex w-[52px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border',
                  large ? 'h-16' : 'h-[60px]',
                  active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink'
                )}
              >
                <span className="text-[11px] font-semibold opacity-70">{capitalize(formatDayShort(d.date).dayName)}</span>
                <span className={cn('font-extrabold leading-none', large ? 'text-[18px]' : 'text-[17px]')}>
                  {d.date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {labels && <span className={eyebrow}>{labels.slots}</span>}
        {selected ? (
          <div className={grid} role="listbox" aria-label="Orario">
            {selected.slots.map((s) => (
              <button
                key={s}
                type="button"
                role="option"
                aria-selected={s === slot}
                onClick={() => onSlot(s)}
                className={cn(
                  'pressable font-bold',
                  large ? 'h-12 rounded-[14px] text-[15px]' : 'h-10 rounded-xl text-[13.5px]',
                  s === slot ? 'bg-ember text-white' : 'bg-sand text-ink hover:bg-sand-deep'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-ink-mute">Scegli un giorno per vedere gli orari.</p>
        )}
      </div>
    </div>
  );
}
