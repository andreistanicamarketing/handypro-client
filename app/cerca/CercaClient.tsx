'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { List, Map as MapIcon, X, BadgeCheck } from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';
import ProResultCard from '@/components/search/ProResultCard';
import MapView from '@/components/map/MapView';
import { CATEGORIES, cityCenter } from '@/lib/categories';
import { searchPros, type Pro } from '@/lib/data';
import type { PriceRange } from '@/types';
import { cn, distanceKm } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function CercaClient() {
  const searchParams = useSearchParams();
  const categoria = searchParams.get('categoria') ?? '';
  const zona = searchParams.get('zona') ?? '';
  const q = searchParams.get('q') ?? '';

  const [priceFilter, setPriceFilter] = useState<PriceRange | ''>('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mobileView, setMobileView] = useState<'lista' | 'mappa'>('lista');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const resolvedCategory = useMemo(() => {
    if (categoria) return categoria;
    if (!q) return '';
    const match = CATEGORIES.find((c) => c.label.toLowerCase().includes(q.toLowerCase()));
    return match?.slug ?? '';
  }, [categoria, q]);

  const [results, setResults] = useState<Pro[] | null>(null); // null = loading
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

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

  const center = cityCenter(zona);
  const categoryLabel = CATEGORIES.find((c) => c.slug === resolvedCategory)?.label;
  const hasActiveFilters = Boolean(priceFilter) || verifiedOnly;

  const markers = (results ?? [])
    .filter((p) => p.lat !== null && p.lon !== null)
    .map((p) => ({
      id: p.id,
      lat: p.lat!,
      lon: p.lon!,
      label: p.name,
    }));

  const filterChip = (active: boolean) =>
    cn(
      'pressable h-9 shrink-0 rounded-pill border px-3.5 text-[13px] font-bold',
      active
        ? 'border-ink bg-ink text-white'
        : 'border-line bg-white text-ink shadow-chip hover:border-ink/30'
    );

  return (
    <div className="min-h-screen pt-14 md:pt-16">
      {/* ── Header ricerca + filtri (sticky) ── */}
      {/* backdrop su figlio assoluto: evita che backdrop-filter sul contenitore
          crei uno stacking/clipping context che taglia i dropdown della searchbar */}
      <div className="sticky top-14 z-30 border-b border-line md:top-16">
        <div className="pointer-events-none absolute inset-0 bg-cream/95 backdrop-blur-md" aria-hidden />
        <div className="relative mx-auto max-w-shell px-4 pb-2.5 pt-3 md:px-6">
          <div className="md:flex md:items-center md:gap-4">
            <SearchBar
              variant="compact"
              initialCategory={resolvedCategory}
              initialLocation={zona}
            />

            {/* Filtri — chips a scorrimento orizzontale su mobile */}
            <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide md:mt-0 md:overflow-visible">
              {(['low', 'medium', 'high'] as PriceRange[]).map((pr) => (
                <button
                  key={pr}
                  type="button"
                  onClick={() => setPriceFilter(priceFilter === pr ? '' : pr)}
                  className={filterChip(priceFilter === pr)}
                >
                  {pr === 'low' ? '€' : pr === 'medium' ? '€€' : '€€€'}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={cn(filterChip(verifiedOnly), 'inline-flex items-center gap-1.5')}
              >
                <BadgeCheck size={14} />
                Verificati
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setPriceFilter('');
                    setVerifiedOnly(false);
                  }}
                  className="pressable inline-flex h-9 shrink-0 items-center gap-1 px-2 text-[13px] font-semibold text-ink-mute hover:text-ink"
                >
                  <X size={13} />
                  Azzera
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lista + mappa ── */}
      <div className="mx-auto flex max-w-shell">
        {/* Lista */}
        <div
          className={cn(
            'w-full flex-1 px-4 py-5 md:px-6 lg:max-w-[720px]',
            mobileView === 'mappa' && 'hidden lg:block'
          )}
        >
          <h1 className="text-[17px] font-extrabold tracking-tight text-ink md:text-xl">
            {categoryLabel ?? 'Tutti i professionisti'}
            {zona ? (
              <>
                {' '}a <em className="font-accent text-ember-deep">{zona}</em>
              </>
            ) : null}
          </h1>
          <p className="mb-4 text-[13px] font-medium text-ink-mute">
            {results === null
              ? !error && 'Ricerca in corso…'
              : `${results.length} ${results.length === 1 ? 'professionista' : 'professionisti'}`}
          </p>

          {error ? (
            <Card className="p-10 text-center">
              <p className="mb-1 font-bold text-ink">Impossibile caricare i risultati</p>
              <p className="mb-4 text-[14px] text-ink-mute">{error}</p>
              <Button
                onClick={() => setReloadKey((k) => k + 1)}
                variant="dark"
                size="md"
              >
                Riprova
              </Button>
            </Card>
          ) : results === null ? (
            <div className="flex flex-col gap-3.5" aria-label="Caricamento risultati">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[130px] animate-pulse rounded-card border border-line bg-white/70 shadow-chip" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="mb-1 font-bold text-ink">Nessun risultato</p>
              <p className="text-[14px] text-ink-mute">
                Prova ad allargare la zona o a rimuovere qualche filtro.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-3.5">
              {results.map((pro, i) => (
                <div key={pro.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
                  <ProResultCard
                    pro={pro}
                    distanceKm={
                      center && pro.lat !== null && pro.lon !== null
                        ? distanceKm(center, [pro.lat, pro.lon])
                        : null
                    }
                    isHighlighted={highlightedId === pro.id}
                    onHover={setHighlightedId}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mappa — sticky su desktop, overlay su mobile */}
        <div
          className={cn(
            'lg:sticky lg:top-[128px] lg:block lg:h-[calc(100vh-128px)] lg:flex-1 lg:overflow-hidden lg:rounded-tl-sheet lg:border-l lg:border-line',
            mobileView === 'mappa' ? 'fixed inset-x-0 z-20 block' : 'hidden'
          )}
          style={
            mobileView === 'mappa'
              ? { top: '118px', bottom: 'calc(64px + var(--safe-bottom))' }
              : undefined
          }
        >
          <MapView
            markers={markers}
            highlightedId={highlightedId}
            onSelect={setHighlightedId}
            height="100%"
            forceResize={mobileView === 'mappa'}
          />
        </div>
      </div>

      {/* ── Toggle lista/mappa — mobile, sopra la bottom nav ── */}
      <button
        type="button"
        onClick={() => setMobileView(mobileView === 'lista' ? 'mappa' : 'lista')}
        className="pressable fixed left-1/2 z-40 inline-flex h-11 -translate-x-1/2 items-center gap-2 rounded-pill bg-ink px-5 text-[13.5px] font-bold text-white shadow-lift lg:hidden"
        style={{ bottom: 'calc(104px + var(--safe-bottom))' }}
      >
        {mobileView === 'lista' ? (
          <>
            <MapIcon size={15} /> Mappa
          </>
        ) : (
          <>
            <List size={15} /> Lista
          </>
        )}
      </button>
    </div>
  );
}
