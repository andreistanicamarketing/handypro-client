'use client';

// Cerca — mobile: lista con header proprio, oppure mappa a tutto schermo con
// bottom sheet trascinabile (?vista=mappa, così "indietro" torna alla lista).
// Desktop: lista a sinistra, mappa in card a destra, hover sincronizzato.

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronDown, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';
import ProResultCard from '@/components/search/ProResultCard';
import MapView from '@/components/map/MapView';
import { CATEGORIES, cityCenter } from '@/lib/categories';
import { getAvailability, searchPros, type DayAvailability, type Pro } from '@/lib/data';
import type { PriceRange } from '@/types';
import { cn, distanceKm, toDateKey } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const PRICE_LABEL: Record<PriceRange, string> = { low: '€', medium: '€€', high: '€€€' };

/** Altezze di aggancio del bottom sheet sulla mappa (px). */
const SNAPS = [210, 430, 700];

export default function CercaClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoria = searchParams.get('categoria') ?? '';
  const zona = searchParams.get('zona') ?? '';
  const q = searchParams.get('q') ?? '';
  const mapOpen = searchParams.get('vista') === 'mappa';

  // Filtri lato server
  const [priceFilter, setPriceFilter] = useState<PriceRange | ''>('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  // Filtri lato client
  const [freeToday, setFreeToday] = useState(true);
  const [topRated, setTopRated] = useState(false);
  const [weekend, setWeekend] = useState(false);
  const [sort, setSort] = useState<'vicini' | 'voto'>('vicini');

  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [sheetH, setSheetH] = useState(SNAPS[0]);

  const resolvedCategory = useMemo(() => {
    if (categoria) return categoria;
    if (!q) return '';
    const match = CATEGORIES.find((c) => c.label.toLowerCase().includes(q.toLowerCase()));
    return match?.slug ?? '';
  }, [categoria, q]);

  const [results, setResults] = useState<Pro[] | null>(null); // null = loading
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Disponibilità per slug (assente = in caricamento): serve alle card e ai filtri orari
  const [availability, setAvailability] = useState<Record<string, DayAvailability[]>>({});

  useEffect(() => {
    let alive = true;
    setResults(null);
    setError(null);
    searchPros({
      category: resolvedCategory || undefined,
      city: zona || undefined,
      priceRange: priceFilter || undefined,
      verifiedOnly: verifiedOnly || undefined,
    })
      .then((r) => alive && setResults(r.pros))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Errore di rete'));
    return () => {
      alive = false;
    };
  }, [resolvedCategory, zona, priceFilter, verifiedOnly, reloadKey]);

  useEffect(() => {
    if (!results) return;
    let alive = true;
    for (const p of results) {
      if (availability[p.slug]) continue;
      getAvailability(p.slug, 14)
        .catch(() => [] as DayAvailability[])
        .then((days) => alive && setAvailability((a) => ({ ...a, [p.slug]: days })));
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- availability è una cache, non un trigger
  }, [results]);

  const center = cityCenter(zona);
  const distanceOf = (p: Pro) =>
    center && p.lat !== null && p.lon !== null ? distanceKm(center, [p.lat, p.lon]) : null;

  const today = toDateKey(new Date());
  const hasSlot = (slug: string, test: (d: Date) => boolean) =>
    availability[slug]?.some((d) => d.slots.length > 0 && test(d.date));

  const visible = (results ?? [])
    .filter((p) => {
      if (topRated && (p.rating ?? 0) < 4.5) return false;
      // finché le disponibilità caricano il pro resta visibile
      if (!availability[p.slug]) return true;
      if (freeToday && !hasSlot(p.slug, (d) => toDateKey(d) === today)) return false;
      if (weekend && !hasSlot(p.slug, (d) => d.getDay() === 0 || d.getDay() === 6)) return false;
      return true;
    })
    .sort((a, b) =>
      sort === 'voto'
        ? (b.rating ?? 0) - (a.rating ?? 0)
        : (distanceOf(a) ?? Infinity) - (distanceOf(b) ?? Infinity)
    );

  const category = CATEGORIES.find((c) => c.slug === resolvedCategory);
  const countLabel = `${visible.length} ${
    visible.length === 1 ? (category?.label.toLowerCase() ?? 'professionista') : (category?.plural ?? 'professionisti')
  }`;

  const markers = visible
    .filter((p) => p.lat !== null && p.lon !== null)
    .map((p) => ({ id: p.id, lat: p.lat!, lon: p.lon!, label: p.name }));

  function setMapOpen(open: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    if (open) params.set('vista', 'mappa');
    else params.delete('vista');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

  const chipClass = (active: boolean) =>
    cn(
      'pressable h-[34px] shrink-0 whitespace-nowrap rounded-pill border px-3.5 text-[13px] font-semibold',
      active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink'
    );

  const chips = (extra?: string) => (
    <>
      {(
        [
          ['Libero oggi', freeToday, () => setFreeToday(!freeToday)],
          ['Verificati', verifiedOnly, () => setVerifiedOnly(!verifiedOnly)],
          ['Voto 4.5+', topRated, () => setTopRated(!topRated)],
          ['Weekend', weekend, () => setWeekend(!weekend)],
        ] as const
      ).map(([label, active, toggle]) => (
        <button key={label} type="button" onClick={toggle} aria-pressed={active} className={cn(chipClass(active), extra)}>
          {label}
        </button>
      ))}
      {(['low', 'medium', 'high'] as PriceRange[]).map((pr) => (
        <button
          key={pr}
          type="button"
          onClick={() => setPriceFilter(priceFilter === pr ? '' : pr)}
          aria-pressed={priceFilter === pr}
          aria-label={`Fascia di prezzo ${PRICE_LABEL[pr]}`}
          className={cn(chipClass(priceFilter === pr), extra)}
        >
          {PRICE_LABEL[pr]}
        </button>
      ))}
    </>
  );

  const sortSelect = (
    <label className="relative flex shrink-0 items-center gap-1 text-[13px] font-semibold text-ink-mute md:text-[13.5px]">
      <span className="sr-only">Ordina per</span>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value as 'vicini' | 'voto')}
        className="cursor-pointer appearance-none bg-transparent pr-[18px] outline-none [field-sizing:content]"
      >
        <option value="vicini">Più vicini</option>
        <option value="voto">Voto più alto</option>
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-0" aria-hidden />
    </label>
  );

  function cardFor(pro: Pro, highlighted: boolean) {
    return (
      <ProResultCard
        pro={pro}
        days={availability[pro.slug]}
        distanceKm={distanceOf(pro)}
        isHighlighted={highlighted}
        onHover={setHighlightedId}
      />
    );
  }

  const list = error ? (
    <Card className="p-10 text-center">
      <p className="mb-1 font-bold text-ink">Impossibile caricare i risultati</p>
      <p className="mb-4 text-[14px] text-ink-mute">{error}</p>
      <Button onClick={() => setReloadKey((k) => k + 1)} variant="dark" size="md">
        Riprova
      </Button>
    </Card>
  ) : results === null ? (
    <div className="flex flex-col gap-3" aria-label="Caricamento risultati">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[130px] animate-pulse rounded-card border border-line bg-white/70 shadow-chip" />
      ))}
    </div>
  ) : visible.length === 0 ? (
    <Card className="p-10 text-center">
      <p className="mb-1 font-bold text-ink">
        {freeToday && results.length > 0 ? 'Nessuno è libero oggi' : 'Nessun risultato'}
      </p>
      <p className="mb-4 text-[14px] text-ink-mute">Prova ad allargare la zona o a rimuovere qualche filtro.</p>
      {freeToday && results.length > 0 && (
        <Button onClick={() => setFreeToday(false)} variant="dark" size="md">
          Mostra i prossimi giorni
        </Button>
      )}
    </Card>
  ) : (
    <div className="flex flex-col gap-3">
      {visible.map((pro, i) => (
        <div key={pro.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
          {cardFor(pro, highlightedId === pro.id)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="md:pt-[72px]">
      {/* ── Header mobile (la navbar desktop contiene già la ricerca) ── */}
      <div
        className="sticky top-0 z-30 flex flex-col gap-3 border-b border-line bg-cream px-4 pb-3 md:hidden"
        style={{ paddingTop: 'calc(8px + var(--safe-top))' }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            aria-label="Indietro"
            className="pressable flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <SearchBar variant="compact" initialCategory={resolvedCategory} initialLocation={zona} />
          </div>
        </div>
        <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-hide">
          {/* TODO: apre il pannello filtri (da implementare) */}
          <button
            type="button"
            className="pressable flex h-[34px] shrink-0 items-center gap-1.5 rounded-pill border border-ink/15 bg-white px-3 text-[13px] font-semibold text-ink"
          >
            <SlidersHorizontal size={14} aria-hidden />
            Filtri
          </button>
          {chips()}
        </div>
      </div>

      <div className="md:grid md:h-[calc(100dvh-72px)] md:grid-cols-2 lg:grid-cols-[640px_minmax(0,1fr)]">
        {/* ── Lista ── */}
        <div className="flex min-h-[100dvh] flex-col gap-3 px-4 pb-10 pt-3.5 md:min-h-0 md:overflow-y-auto md:pb-10 md:pl-8 md:pr-7 md:pt-5">
          <div className="hidden items-center justify-between md:mb-1 md:flex">
            <h1 className="text-[22px] font-extrabold tracking-[-.02em] text-ink">
              {visible.length} {visible.length === 1 ? (category?.label.toLowerCase() ?? 'professionista') : (category?.plural ?? 'professionisti')}
              {zona && (
                <>
                  {' '}a <em className="font-accent text-ember-deep">{zona}</em>
                </>
              )}
            </h1>
            {sortSelect}
          </div>
          <div className="mb-1.5 hidden flex-wrap gap-1.5 md:flex">{chips()}</div>

          <div className="flex items-center justify-between text-[13px] md:hidden">
            <span className="font-bold text-ink">
              {results === null ? 'Ricerca in corso…' : countLabel}
              {results !== null && freeToday && <span className="font-medium text-ink-faint"> · liberi oggi</span>}
            </span>
            {sortSelect}
          </div>

          {list}
        </div>

        {/* ── Mappa desktop ── */}
        <div className="hidden md:block md:py-4 md:pr-4">
          <div className="h-full overflow-hidden rounded-[24px] border border-line">
            <MapView markers={markers} highlightedId={highlightedId} onSelect={setHighlightedId} height="100%" />
          </div>
        </div>
      </div>

      {/* ── FAB mappa — mobile ── */}
      {!mapOpen && (
        <button
          type="button"
          onClick={() => setMapOpen(true)}
          className="pressable fixed left-1/2 z-40 inline-flex h-11 -translate-x-1/2 items-center gap-2 rounded-pill bg-ink px-[18px] text-[14px] font-bold text-white shadow-[0_12px_26px_-10px_rgba(21,34,56,.6)] md:hidden"
          style={{ bottom: 'calc(104px + var(--safe-bottom))' }}
        >
          <MapIcon size={16} /> Mappa
        </button>
      )}

      {/* ── Vista mappa — mobile ── */}
      {mapOpen && (
        <div className="fixed inset-0 z-40 bg-[#F3EDE3] md:hidden">
          <div className="absolute inset-0">
            <MapView
              markers={markers}
              highlightedId={highlightedId}
              onSelect={(id) => {
                setHighlightedId(id);
                // la lista si allarga per mostrare il pro scelto (in cima, evidenziato)
                setSheetH((h) => Math.max(h, SNAPS[1]));
              }}
              keepVisible={{ top: 140, bottom: sheetH + 24 }}
              height="100%"
            />
          </div>
          <div
            className="absolute inset-x-0 top-0 z-10 flex flex-col gap-2.5 bg-[linear-gradient(180deg,rgba(250,246,240,.95)_0%,rgba(250,246,240,.85)_70%,rgba(250,246,240,0)_100%)] px-4 pb-[18px]"
            style={{ paddingTop: 'calc(8px + var(--safe-top))' }}
          >
            <SearchBar variant="compact" initialCategory={resolvedCategory} initialLocation={zona} />
            <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 scrollbar-hide">
              {chips('shadow-[0_2px_6px_-2px_rgba(21,34,56,.15)]')}
            </div>
          </div>
          <ResultsSheet
            title={`${countLabel} in zona`}
            height={sheetH}
            onHeight={setSheetH}
            scrollKey={highlightedId}
          >
            {visible.length === 0 ? (
              list
            ) : (
              // il pro selezionato sul pin sale in cima, evidenziato
              [...visible]
                .sort((a, b) => Number(b.id === highlightedId) - Number(a.id === highlightedId))
                .map((pro) => <div key={pro.id}>{cardFor(pro, pro.id === highlightedId)}</div>)
            )}
          </ResultsSheet>
        </div>
      )}
    </div>
  );
}

/** Bottom sheet trascinabile sopra la mappa: drag sull'header, rilascio → snap più vicino,
 *  tap senza drag → snap successivo. */
function ResultsSheet({
  title,
  height,
  onHeight,
  scrollKey,
  children,
}: {
  title: string;
  height: number;
  onHeight: (h: number) => void;
  /** Al cambio, la lista torna in cima (es. nuovo pin selezionato) */
  scrollKey: unknown;
  children: React.ReactNode;
}) {
  const drag = useRef<{ y: number; h: number; last: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [scrollKey]);

  // Lo snap più alto non supera lo schermo (es. iPhone SE)
  const snaps = () => [SNAPS[0], SNAPS[1], Math.min(SNAPS[2], window.innerHeight - 112)];
  const nextSnap = (h: number) => {
    const s = snaps();
    const i = s.findIndex((v) => v >= h - 5);
    return s[(i + 1) % s.length];
  };

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-[28px] bg-cream shadow-[0_-14px_36px_-16px_rgba(21,34,56,.4)]"
      style={{ height, transition: dragging ? 'none' : 'height .32s cubic-bezier(.34,1.15,.64,1)' }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-label={height > 600 ? 'Riduci elenco' : 'Espandi elenco'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onHeight(nextSnap(height));
          }
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { y: e.clientY, h: height, last: height, moved: false };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const dy = drag.current.y - e.clientY;
          if (Math.abs(dy) > 3) drag.current.moved = true;
          drag.current.last = Math.max(170, Math.min(snaps()[2] + 40, drag.current.h + dy));
          onHeight(drag.current.last);
        }}
        onPointerUp={() => {
          if (!drag.current) return;
          const { h, last, moved } = drag.current;
          drag.current = null;
          setDragging(false);
          onHeight(
            moved
              ? snaps().reduce((a, b) => (Math.abs(b - last) < Math.abs(a - last) ? b : a))
              : nextSnap(h)
          );
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        className="flex shrink-0 cursor-grab touch-none flex-col gap-3 px-5 pb-3 pt-2.5"
      >
        <span aria-hidden className="h-[5px] w-10 self-center rounded-pill bg-[#D9CFC0]" />
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-extrabold tracking-[-.01em] text-ink">{title}</span>
          <span className="text-[12.5px] font-semibold text-ink-faint">
            {height > 600 ? 'Trascina giù per la mappa' : 'Trascina su per la lista'}
          </span>
        </div>
      </div>
      <div ref={listRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 pb-[120px]">
        {children}
      </div>
    </div>
  );
}
