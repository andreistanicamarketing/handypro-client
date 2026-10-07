'use client';

// Card risultato — mobile-first: info compatta in alto,
// disponibilità sotto. Su desktop le due zone vanno affiancate.

import Link from 'next/link';
import { ShieldCheck, MapPin, Star } from 'lucide-react';
import type { Pro } from '@/lib/data';
import AvailabilityGrid from './AvailabilityGrid';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface ProResultCardProps {
  pro: Pro;
  isHighlighted?: boolean;
  onHover?: (proId: string | null) => void;
}

const PRICE_LABEL: Record<Pro['priceRange'], string> = {
  low: '€',
  medium: '€€',
  high: '€€€',
};

export function ProInitialsAvatar({ name, hue, size = 56 }: { name: string; hue: number; size?: number }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <div
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-2xl font-extrabold text-white"
      style={{ width: size, height: size, fontSize: size * 0.32, background: `hsl(${hue} 42% 42%)` }}
    >
      {initials}
    </div>
  );
}

export default function ProResultCard({ pro, isHighlighted, onHover }: ProResultCardProps) {
  return (
    <article
      onMouseEnter={() => onHover?.(pro.id)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        'rounded-card border bg-white p-4 transition-shadow md:p-5',
        isHighlighted
          ? 'border-ember shadow-lift'
          : 'border-line shadow-chip hover:shadow-soft'
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* ── Info ── */}
        <div className="min-w-0 flex-1">
          <div className="flex gap-3">
            <Link href={`/pro/${pro.slug}`} className="pressable shrink-0">
              <ProInitialsAvatar name={pro.name} hue={pro.hue} />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/pro/${pro.slug}`}
                  className="truncate text-[16.5px] font-bold text-ink hover:text-ember-deep"
                >
                  {pro.name}
                </Link>
                <span className="shrink-0 rounded-lg bg-sand px-2 py-0.5 text-[12px] font-bold text-ink-mute">
                  {PRICE_LABEL[pro.priceRange]}
                </span>
              </div>
              <p className="truncate text-[13.5px] font-medium text-ink-mute">
                {pro.categoryLabel} · {pro.specialization}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px]">
                <span className="inline-flex items-center gap-1 font-bold text-ink">
                  <Star size={13} className="fill-ember text-ember" />
                  {pro.rating === null ? 'Nuovo' : pro.rating.toFixed(1)}
                  {pro.rating !== null && (
                    <span className="font-medium text-ink-faint">({pro.reviewCount})</span>
                  )}
                </span>
                {pro.isVerified && (
                  <span className="inline-flex items-center gap-1 font-semibold text-verde">
                    <ShieldCheck size={13} />
                    Verificato
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="mt-2.5 flex items-center gap-1.5 text-[13px] text-ink-mute">
            <MapPin size={13} className="shrink-0" />
            <span className="truncate">
              {pro.address}, {pro.city}
              {pro.zona ? ` · ${pro.zona}` : ''}
            </span>
          </p>

          {/* Servizi — chips scorrevoli su mobile */}
          <ul className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide lg:flex-wrap lg:overflow-visible">
            {pro.services.slice(0, 3).map((s) => (
              <li
                key={s.name}
                className="shrink-0 rounded-pill border border-line bg-cream px-3 py-1.5 text-[12px] font-medium text-ink-mute"
              >
                {s.name} · <span className="font-bold text-ink">{s.price}</span>
              </li>
            ))}
          </ul>

          <Button
            href={`/pro/${pro.slug}`}
            variant="subtle"
            size="sm"
            className="mt-3.5 hidden lg:inline-flex"
          >
            Vedi profilo
          </Button>
        </div>

        {/* ── Disponibilità ── */}
        <div className="border-t border-line pt-3.5 lg:w-[330px] lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-faint">
            Prossime disponibilità
          </p>
          <AvailabilityGrid proSlug={pro.slug} visibleDays={4} />
        </div>

        {/* CTA profilo — solo mobile, a tutta larghezza */}
        <Button
          href={`/pro/${pro.slug}`}
          variant="subtle"
          size="md"
          className="flex active:bg-ink active:text-white lg:hidden"
        >
          Vedi profilo completo
        </Button>
      </div>
    </article>
  );
}
