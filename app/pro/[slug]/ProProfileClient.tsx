'use client';

// Profilo professionista — mobile-first, design system "Bottega".

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, MapPin, Star, ChevronLeft, BadgeCheck, CalendarDays, Award,
} from 'lucide-react';
import type { Pro, Review } from '@/lib/data';
import AvailabilityGrid from '@/components/search/AvailabilityGrid';
import BookingSheet from '@/components/booking/BookingSheet';
import MapView from '@/components/map/MapView';
import { ProInitialsAvatar } from '@/components/search/ProResultCard';
import { cn, timeAgo } from '@/lib/utils';

interface ProProfileClientProps {
  pro: Pro;
  reviews: Review[];
  initialDate?: string;
  initialSlot?: string;
}

const PRICE_LABEL: Record<Pro['priceRange'], string> = {
  low: '€ · Economico',
  medium: '€€ · Nella media',
  high: '€€€ · Premium',
};

export default function ProProfileClient({
  pro,
  reviews,
  initialDate,
  initialSlot,
}: ProProfileClientProps) {
  // Apri subito il flusso se arrivo da uno slot cliccato
  const [bookingOpen, setBookingOpen] = useState(Boolean(initialDate && initialSlot));

  return (
    <div className="min-h-screen pt-14 md:pt-16">
      <div className="mx-auto max-w-content px-4 pb-28 pt-4 md:px-8 md:pb-16 md:pt-8">
        {/* back */}
        <Link
          href="/cerca"
          className="pressable mb-4 inline-flex items-center gap-1 text-[13.5px] font-bold text-ink-mute hover:text-ink"
        >
          <ChevronLeft size={16} />
          Torna ai risultati
        </Link>

        <div className="md:flex md:items-start md:gap-8">
          {/* ── Colonna principale ── */}
          <div className="min-w-0 flex-1">
            {/* Header */}
            <section className="rounded-card border border-line bg-white p-5 shadow-chip md:p-6">
              <div className="flex gap-4">
                <ProInitialsAvatar name={pro.name} hue={pro.hue} size={72} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-[22px] font-extrabold tracking-tight text-ink md:text-3xl">
                      {pro.name}
                    </h1>
                    {pro.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-verde-soft px-2.5 py-1 text-[11px] font-bold text-verde">
                        <ShieldCheck size={12} />
                        Verificato
                      </span>
                    )}
                  </div>
                  <p className="text-[14.5px] font-medium text-ink-mute">
                    {pro.categoryLabel} · {pro.specialization}
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-[13.5px] text-ink-mute">
                    <MapPin size={14} className="shrink-0" />
                    {pro.address}, {pro.city} · {pro.zona}
                  </p>
                </div>
              </div>

              {/* stats */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <div className="rounded-card bg-cream p-3 text-center">
                  <p className="flex items-center justify-center gap-1 text-[17px] font-extrabold text-ink">
                    <Star size={15} className="fill-ember text-ember" />
                    {pro.rating === null ? 'Nuovo' : pro.rating.toFixed(1)}
                  </p>
                  <p className="text-[11.5px] font-medium text-ink-faint">
                    {pro.rating === null
                      ? 'Nessuna recensione'
                      : `${pro.reviewCount} ${pro.reviewCount === 1 ? 'recensione' : 'recensioni'}`}
                  </p>
                </div>
                <div className="rounded-card bg-cream p-3 text-center">
                  <p className="flex items-center justify-center gap-1 text-[17px] font-extrabold text-ink">
                    <Award size={15} className="text-ember" />
                    {pro.yearsExperience}
                  </p>
                  <p className="text-[11.5px] font-medium text-ink-faint">anni di esperienza</p>
                </div>
                <div className="rounded-card bg-cream p-3 text-center">
                  <p className="text-[17px] font-extrabold text-ink">
                    {PRICE_LABEL[pro.priceRange].split(' · ')[0]}
                  </p>
                  <p className="text-[11.5px] font-medium text-ink-faint">
                    {PRICE_LABEL[pro.priceRange].split(' · ')[1]}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[14.5px] leading-relaxed text-ink-mute">{pro.bio}</p>
            </section>

            {/* Servizi e prezzi */}
            <section className="mt-4 rounded-card border border-line bg-white p-5 shadow-chip md:p-6">
              <h2 className="mb-3 text-[17px] font-extrabold tracking-tight text-ink">
                Servizi e <em className="font-accent text-ember-deep">prezzi</em>
              </h2>
              <ul className="divide-y divide-line">
                {pro.services.map((s) => (
                  <li key={s.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="min-w-0 flex-1 text-[14.5px] font-semibold text-ink">
                      {s.name}
                    </span>
                    <span className="shrink-0 text-[14px] font-bold text-ink">{s.price}</span>
                    <button
                      type="button"
                      onClick={() => setBookingOpen(true)}
                      className="pressable shrink-0 rounded-pill border border-ink/15 px-3.5 py-1.5 text-[12.5px] font-bold text-ink hover:bg-ink hover:text-white"
                    >
                      Prenota
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[12px] leading-relaxed text-ink-faint">
                I prezzi sono indicativi: il preventivo definitivo viene confermato dal
                professionista prima dell&rsquo;intervento.
              </p>
            </section>

            {/* Recensioni */}
            <section className="mt-4 rounded-card border border-line bg-white p-5 shadow-chip md:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[17px] font-extrabold tracking-tight text-ink">
                  Recensioni <em className="font-accent text-ember-deep">verificate</em>
                </h2>
                <span className="inline-flex items-center gap-1 text-[14px] font-extrabold text-ink">
                  <Star size={14} className="fill-ember text-ember" />
                  {pro.rating === null ? 'Nuovo' : pro.rating.toFixed(1)}
                  <span className="font-medium text-ink-faint">({pro.reviewCount})</span>
                </span>
              </div>

              <p className="mb-4 flex items-start gap-2 rounded-card bg-verde-soft/60 p-3 text-[12.5px] leading-relaxed text-verde">
                <BadgeCheck size={15} className="mt-0.5 shrink-0" />
                Può recensire solo chi ha prenotato un lavoro qui, a lavoro concluso.
              </p>

              {reviews.length === 0 ? (
                <p className="text-[14px] text-ink-mute">
                  Ancora nessuna recensione.
                </p>
              ) : (
                <ul className="space-y-4">
                  {reviews.map((r) => (
                    <li key={r.id} className="border-b border-line pb-4 last:border-0 last:pb-0">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-[14px] font-bold text-ink">{r.reviewerName}</p>
                        <span className="flex gap-0.5" aria-label={`${r.rating} stelle su 5`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              className={cn(
                                i < r.rating ? 'fill-ember text-ember' : 'fill-sand text-sand'
                              )}
                            />
                          ))}
                        </span>
                      </div>
                      <p className="mb-1.5 text-[12px] font-semibold text-ink-faint">
                        {timeAgo(r.createdAt)} · <span className="text-verde">✓ lavoro confermato</span>
                      </p>
                      <p className="text-[14px] leading-relaxed text-ink-mute">{r.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Zona operativa */}
            {pro.lat !== null && pro.lon !== null && (
              <section className="mt-4 overflow-hidden rounded-card border border-line bg-white shadow-chip">
                <div className="p-5 pb-3 md:p-6 md:pb-3">
                  <h2 className="text-[17px] font-extrabold tracking-tight text-ink">
                    Zona operativa
                  </h2>
                  <p className="text-[13.5px] text-ink-mute">
                    {pro.city} e dintorni · base in {pro.zona}
                  </p>
                </div>
                <div className="h-[200px] md:h-[260px]">
                  <MapView
                    markers={[{ id: pro.id, lat: pro.lat, lon: pro.lon, label: pro.name, sublabel: pro.zona }]}
                    center={[pro.lat, pro.lon]}
                    zoom={13}
                    height="100%"
                  />
                </div>
              </section>
            )}
          </div>

          {/* ── Colonna disponibilità (sticky su desktop) ── */}
          <aside className="mt-4 md:mt-0 md:w-[360px] md:shrink-0">
            <div className="rounded-card border border-line bg-white p-5 shadow-chip md:sticky md:top-24">
              <h2 className="mb-1 flex items-center gap-2 text-[17px] font-extrabold tracking-tight text-ink">
                <CalendarDays size={17} className="text-ember-deep" />
                Disponibilità
              </h2>
              <p className="mb-3 text-[12.5px] text-ink-mute">
                Scegli un orario: il professionista confermerà la richiesta.
              </p>
              <AvailabilityGrid proSlug={pro.slug} visibleDays={4} />
              <button
                type="button"
                onClick={() => setBookingOpen(true)}
                className="pressable mt-4 hidden h-12 w-full rounded-2xl bg-ember-gradient text-[15px] font-bold text-white md:block"
              >
                Prenota un intervento
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* CTA sticky mobile (sopra la bottom nav) */}
      <div
        className="fixed inset-x-0 z-40 px-4 md:hidden"
        style={{ bottom: 'calc(72px + var(--safe-bottom))' }}
      >
        <button
          type="button"
          onClick={() => setBookingOpen(true)}
          className="pressable h-12 w-full rounded-2xl bg-ember-gradient text-[15.5px] font-bold text-white shadow-lift"
        >
          Prenota un intervento
        </button>
      </div>

      <BookingSheet
        pro={pro}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialDate={initialDate}
        initialSlot={initialSlot}
      />
    </div>
  );
}
