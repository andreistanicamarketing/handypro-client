'use client';

// Card risultato "riga compatta" (~130px): tutta la card porta al profilo,
// le pill orario portano direttamente alla prenotazione di quello slot.

import Link from 'next/link';
import { BadgeCheck, Star } from 'lucide-react';
import type { DayAvailability, Pro } from '@/lib/data';
import { cn, formatDayLong, formatKm, toDateKey } from '@/lib/utils';

interface ProResultCardProps {
  pro: Pro;
  /** Disponibilità del pro (undefined = in caricamento) */
  days?: DayAvailability[];
  /** Distanza dalla zona cercata; omessa se non nota */
  distanceKm?: number | null;
  isHighlighted?: boolean;
  onHover?: (proId: string | null) => void;
}

const PRICE_LABEL: Record<Pro['priceRange'], string> = {
  low: '€',
  medium: '€€',
  high: '€€€',
};

export function ProInitialsAvatar({
  name,
  hue,
  size = 56,
  className,
}: {
  name: string;
  hue: number;
  size?: number;
  className?: string;
}) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <div
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center rounded-2xl font-extrabold text-white', className)}
      style={{ width: size, height: size, fontSize: Math.round(size / 3), background: `hsl(${hue} 42% 42%)` }}
    >
      {initials}
    </div>
  );
}

/** "Oggi" / "Domani" / "Sab" */
function dayLabel(date: Date): string {
  const long = formatDayLong(date);
  const short = long.split(' ')[0];
  return short.charAt(0).toUpperCase() + short.slice(1);
}

export default function ProResultCard({ pro, days, distanceKm, isHighlighted, onHover }: ProResultCardProps) {
  const slots = days
    ?.flatMap((d) => d.slots.map((time) => ({ date: d.date, time })))
    .slice(0, 3);
  const meta = [pro.categoryLabel, pro.zona, distanceKm != null ? formatKm(distanceKm) : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      onMouseEnter={() => onHover?.(pro.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        'relative flex flex-col gap-3 rounded-card border bg-white px-4 pb-4 pt-3.5 transition-[border-color,box-shadow] duration-200',
        isHighlighted
          ? 'border-ember shadow-[0_16px_36px_-14px_rgba(21,34,56,.32)]'
          : 'border-line shadow-chip'
      )}
    >
      <div className="flex items-center gap-3">
        <ProInitialsAvatar name={pro.name} hue={pro.hue} size={44} className="rounded-[14px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-center gap-[5px]">
            {/* Link "stirato" su tutta la card (after:inset-0): niente link annidati */}
            <Link
              href={`/pro/${pro.slug}`}
              className="truncate text-[15.5px] font-bold tracking-[-.01em] text-ink after:absolute after:inset-0 after:rounded-card"
            >
              {pro.name}
            </Link>
            {pro.isVerified && (
              <BadgeCheck size={15} className="shrink-0 text-verde" aria-label="Verificato" />
            )}
          </div>
          <span className="truncate text-[12.5px] font-medium text-ink-mute">{meta}</span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="inline-flex items-center gap-1 text-[14px] font-extrabold text-ink">
            <Star size={13} className="fill-ember text-ember" aria-hidden />
            {pro.rating === null ? 'Nuovo' : pro.rating.toFixed(1)}
          </span>
          <span className="text-[12px] font-semibold text-ink-faint">{PRICE_LABEL[pro.priceRange]}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {slots === undefined ? (
          <span className="h-[34px] w-full animate-pulse rounded-pill bg-sand/60" aria-label="Caricamento disponibilità" />
        ) : slots.length === 0 ? (
          <span className="text-[12.5px] font-medium text-ink-faint">Nessun orario libero nei prossimi giorni</span>
        ) : (
          <>
            <span className="mr-0.5 inline-flex shrink-0 items-center gap-[5px] text-[11px] font-extrabold uppercase tracking-[.06em] text-ember-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-ember" aria-hidden />
              Libero
            </span>
            {slots.map((s) => (
              <Link
                key={`${toDateKey(s.date)}-${s.time}`}
                href={`/pro/${pro.slug}?data=${toDateKey(s.date)}&ora=${s.time}`}
                className="pressable relative z-10 flex shrink-0 gap-1 rounded-pill border border-line bg-cream px-3 py-[7px] text-[13px] text-ink hover:border-ink hover:bg-ink hover:text-white active:border-ink active:bg-ink active:text-white"
              >
                <span className="font-medium opacity-60">{dayLabel(s.date)}</span>
                <span className="font-bold">{s.time}</span>
              </Link>
            ))}
          </>
        )}
      </div>
    </article>
  );
}
