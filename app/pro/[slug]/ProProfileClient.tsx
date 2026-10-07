'use client';

// Profilo professionista — mobile: header proprio + CTA "Prenota" sticky al posto della tab bar.
// Desktop: contenuto a sinistra, disponibilità e prenotazione in colonna sticky a destra.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Share, Heart, Check, BadgeCheck, MapPin, Star } from 'lucide-react';
import { getAvailability, parseLocalDate, type DayAvailability, type Pro, type Review } from '@/lib/data';
import { useSession } from '@/lib/auth-mock';
import BookingSheet from '@/components/booking/BookingSheet';
import SlotPicker, { slotLabel } from '@/components/booking/SlotPicker';
import MapView from '@/components/map/MapView';
import { ProInitialsAvatar } from '@/components/search/ProResultCard';
import { cn, timeAgo, toDateKey } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface ProProfileClientProps {
  pro: Pro;
  reviews: Review[];
  initialDate?: string;
  initialSlot?: string;
}

const PRICE_LABEL: Record<Pro['priceRange'], [string, string]> = {
  low: ['€', 'Economico'],
  medium: ['€€', 'Nella media'],
  high: ['€€€', 'Premium'],
};

/** Prezzo più basso tra i servizi ("40 €", "da 80 €" → 40), null se nessuno è numerico. */
function minPrice(pro: Pro): number | null {
  const prices = pro.services
    .map((s) => Number(s.price.replace(/[^\d,]/g, '').replace(',', '.')))
    .filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : null;
}

const iconButton =
  'pressable flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink hover:border-ink/30';
const h2 = 'text-[19px] font-extrabold tracking-[-.02em] text-ink';

export default function ProProfileClient({ pro, reviews, initialDate, initialSlot }: ProProfileClientProps) {
  const router = useRouter();
  const { session } = useSession();
  const isOwnProfile = session?.proSlug === pro.slug;

  // Apri subito il flusso se arrivo da uno slot cliccato
  const [bookingOpen, setBookingOpen] = useState(Boolean(initialDate && initialSlot));
  const [days, setDays] = useState<DayAvailability[] | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(initialDate ?? null);
  const [slot, setSlot] = useState<string | null>(initialSlot ?? null);
  const [shared, setShared] = useState(false);
  const [allReviews, setAllReviews] = useState(false);

  useEffect(() => {
    let alive = true;
    getAvailability(pro.slug, 14)
      .then((d) => {
        if (!alive) return;
        setDays(d);
        // senza preselezione mostra il primo giorno libero
        const first = d.find((x) => x.slots.length > 0);
        setDateKey((k) => k ?? (first ? toDateKey(first.date) : null));
      })
      .catch(() => alive && setDays([]));
    return () => {
      alive = false;
    };
  }, [pro.slug]);

  async function share() {
    const url = window.location.href.split('?')[0];
    try {
      if (navigator.share) await navigator.share({ title: `${pro.name} — Handy Pro`, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1600);
      }
    } catch {
      // condivisione annullata dall'utente
    }
  }

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/cerca');
  }

  const from = minPrice(pro);
  const picked = dateKey && slot ? slotLabel(parseLocalDate(dateKey), slot) : null;
  const [priceSymbol, priceLabel] = PRICE_LABEL[pro.priceRange];

  const ctaSummary = (
    <span className="flex min-w-0 flex-1 flex-col gap-px">
      {from !== null && <span className="text-[17px] font-extrabold text-ink">da {from} €</span>}
      <span className="truncate text-[12px] text-ink-faint">{picked ?? 'Scegli un orario'}</span>
    </span>
  );

  return (
    <div className="md:pt-[72px]">
      {/* ── Top bar ── */}
      <div
        className="mx-auto flex max-w-shell justify-between px-4 pb-1.5 md:px-8 md:pt-6"
        style={{ paddingTop: 'max(6px, calc(var(--safe-top) + 6px))' }}
      >
        <button type="button" onClick={goBack} aria-label="Indietro" className={iconButton}>
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={share} aria-label={shared ? 'Link copiato' : 'Condividi'} className={iconButton}>
            {shared ? <Check size={17} className="text-verde" /> : <Share size={17} />}
          </button>
          {/* TODO: preferiti (da implementare) */}
          <button type="button" aria-label="Salva" className={iconButton}>
            <Heart size={17} />
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-shell grid-cols-[minmax(0,1fr)] gap-[22px] px-5 pb-10 pt-2.5 md:grid-cols-[minmax(0,1fr)_360px] md:gap-x-10 md:px-8 md:pb-16 md:pt-4">
        {/* ── Header ── */}
        <div className="flex items-center gap-3.5 md:col-start-1">
          <ProInitialsAvatar name={pro.name} hue={pro.hue} size={72} className="rounded-card" />
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <h1 className="truncate text-[24px] font-extrabold tracking-[-.025em] text-ink md:text-[30px]">
                {pro.name}
              </h1>
              {pro.isVerified && <BadgeCheck size={18} className="shrink-0 text-verde" aria-label="Verificato" />}
            </div>
            <span className="text-[13.5px] font-medium text-ink-mute">
              {pro.categoryLabel} · {pro.specialization}
            </span>
            <span className="flex items-center gap-1 text-[12.5px] text-ink-faint">
              <MapPin size={12} className="shrink-0" aria-hidden />
              <span className="truncate">{[pro.address, pro.zona].filter(Boolean).join(' · ')}</span>
            </span>
          </div>
        </div>

        {/* ── Statistiche ── */}
        <div className="grid grid-cols-3 rounded-card border border-line bg-white py-3.5 md:col-start-1">
          <div className="flex flex-col items-center gap-0.5">
            <span className="flex items-center gap-1 text-[17px] font-extrabold text-ink">
              <Star size={14} className="fill-ember text-ember" aria-hidden />
              {pro.rating === null ? 'Nuovo' : pro.rating.toFixed(1)}
            </span>
            <span className="text-[11.5px] text-ink-faint">
              {pro.reviewCount === 0
                ? 'Nessuna recensione'
                : `${pro.reviewCount} ${pro.reviewCount === 1 ? 'recensione' : 'recensioni'}`}
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5 border-x border-line">
            <span className="text-[17px] font-extrabold text-ink">
              {pro.yearsExperience} {pro.yearsExperience === 1 ? 'anno' : 'anni'}
            </span>
            <span className="text-[11.5px] text-ink-faint">di esperienza</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[17px] font-extrabold text-ink">{priceSymbol}</span>
            <span className="text-[11.5px] text-ink-faint">{priceLabel}</span>
          </div>
        </div>

        {pro.bio && <p className="text-[14.5px] leading-relaxed text-ink-mute md:col-start-1">{pro.bio}</p>}

        {/* ── Disponibilità: dopo le statistiche su mobile, colonna sticky su desktop ── */}
        <section className="flex flex-col gap-3 md:sticky md:top-24 md:col-start-2 md:row-span-6 md:row-start-1 md:self-start md:overflow-hidden md:rounded-card md:border md:border-line md:bg-white md:p-5">
          <h2 className={h2}>
            Prossime <em className="font-accent text-ember-deep">disponibilità</em>
          </h2>
          <SlotPicker
            days={days}
            dateKey={dateKey}
            slot={slot}
            onDate={(k) => {
              setDateKey(k);
              setSlot(null);
            }}
            onSlot={setSlot}
            bleed="-mx-5 px-5"
          />
          {!isOwnProfile && (
            <div className="mt-2 hidden items-center gap-3.5 border-t border-line pt-4 md:flex">
              {ctaSummary}
              <Button onClick={() => setBookingOpen(true)} className="h-[52px] px-[26px]">
                Prenota
              </Button>
            </div>
          )}
        </section>

        {/* ── Servizi e prezzi ── */}
        <section className="flex flex-col gap-1 md:col-start-1">
          <h2 className={cn(h2, 'mb-1.5')}>
            Servizi e <em className="font-accent text-ember-deep">prezzi</em>
          </h2>
          <ul>
            {pro.services.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 border-b border-line py-3">
                <span className="text-[14.5px] font-semibold text-ink">{s.name}</span>
                <span className="shrink-0 text-[14.5px] font-extrabold text-ink">{s.price}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] leading-normal text-ink-faint">
            I prezzi sono indicativi: il preventivo definitivo viene confermato dal professionista prima
            dell&rsquo;intervento.
          </p>
        </section>

        {/* ── Recensioni ── */}
        <section className="flex min-w-0 flex-col gap-3 md:col-start-1">
          <div className="flex items-baseline justify-between">
            <h2 className={h2}>
              Recensioni <em className="font-accent text-ember-deep">verificate</em>
            </h2>
            {reviews.length > 1 && (
              <button
                type="button"
                onClick={() => setAllReviews(!allReviews)}
                className="text-[13px] font-bold text-ink-mute hover:text-ink"
              >
                {allReviews ? 'Meno' : `Tutte (${pro.reviewCount})`}
              </button>
            )}
          </div>
          {reviews.length === 0 ? (
            <p className="text-[14px] text-ink-mute">
              Ancora nessuna recensione. Può recensire solo chi ha prenotato un lavoro qui, a lavoro concluso.
            </p>
          ) : (
            <div
              className={cn(
                'flex gap-2.5',
                allReviews ? 'flex-col' : '-mx-5 overflow-x-auto px-5 scrollbar-hide md:mx-0 md:px-0'
              )}
            >
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className={cn(
                    'flex flex-col gap-1.5 rounded-card border border-line bg-white p-3.5',
                    !allReviews && 'w-[260px] shrink-0'
                  )}
                >
                  <div className="flex justify-between gap-2">
                    <span className="text-[14px] font-bold text-ink">{r.reviewerName}</span>
                    <span className="flex gap-px" aria-label={`${r.rating} stelle su 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          aria-hidden
                          className={i < r.rating ? 'fill-ember text-ember' : 'fill-sand text-sand'}
                        />
                      ))}
                    </span>
                  </div>
                  <span className="text-[12px] text-ink-faint">
                    {timeAgo(r.createdAt)} ·{' '}
                    {r.isVerified && <span className="font-semibold text-verde">✓ lavoro confermato</span>}
                  </span>
                  <p className="text-[13.5px] leading-[1.55] text-ink-mute">{r.text}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ── Zona operativa ── */}
        {pro.lat !== null && pro.lon !== null && (
          <section className="flex flex-col gap-2.5 md:col-start-1">
            <h2 className={h2}>Zona operativa</h2>
            <div className="h-[170px] overflow-hidden rounded-card border border-line md:h-[240px]">
              <MapView
                markers={[{ id: pro.id, lat: pro.lat, lon: pro.lon, label: pro.name }]}
                center={[pro.lat, pro.lon]}
                zoom={13}
                highlightedId={pro.id}
                interactive={false}
                height="100%"
              />
            </div>
            <span className="text-[13px] text-ink-mute">
              {pro.city} e dintorni · base in {pro.zona}
            </span>
          </section>
        )}
      </div>

      {/* ── CTA sticky mobile (prende il posto della tab bar) ── */}
      {!isOwnProfile && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3.5 border-t border-line bg-white/[.96] px-5 pt-3 backdrop-blur-md md:hidden"
          style={{ paddingBottom: 'calc(30px + var(--safe-bottom))' }}
        >
          {ctaSummary}
          <Button
            onClick={() => setBookingOpen(true)}
            className="h-[52px] px-[26px] shadow-[0_10px_22px_-10px_rgba(255,102,0,.8)]"
          >
            Prenota
          </Button>
        </div>
      )}

      <BookingSheet
        pro={pro}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        initialDate={dateKey ?? undefined}
        initialSlot={slot ?? undefined}
      />
    </div>
  );
}
