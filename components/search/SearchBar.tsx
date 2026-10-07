'use client';

// Ricerca "capsula": cosa + dove in un'unica superficie bianca.
// hero → due righe impilate + bottone quadrato su mobile, pill alta su desktop.
// compact → pill divisa a metà, senza bottone (invio da tastiera).
// Autocomplete per categorie e città.

import { useEffect, useId, useRef, useState } from 'react';
import { Search, MapPin, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CITIES } from '@/lib/categories';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  initialCategory?: string;
  initialLocation?: string;
}

interface Suggestion {
  type: 'categoria';
  label: string;
  sublabel?: string;
  value: string;
}

export default function SearchBar({
  variant = 'hero',
  initialCategory = '',
  initialLocation = '',
}: SearchBarProps) {
  const router = useRouter();
  const initialCatLabel =
    CATEGORIES.find((c) => c.slug === initialCategory)?.label ?? initialCategory;

  const [query, setQuery] = useState(initialCatLabel);
  const [location, setLocation] = useState(initialLocation);
  const [openPanel, setOpenPanel] = useState<'query' | 'location' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const containerRef = useRef<HTMLFormElement>(null);
  const id = useId();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const q = query.trim().toLowerCase();
  const categorySuggestions: Suggestion[] = CATEGORIES.filter(
    (c) => !q || c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  ).map((c) => ({
    type: 'categoria' as const,
    label: c.label,
    sublabel: c.description,
    value: c.slug,
  }));
  const suggestions = categorySuggestions.slice(0, 6);

  const loc = location.trim().toLowerCase();
  const citySuggestions = CITIES.filter((c) => !loc || c.toLowerCase().includes(loc)).slice(0, 6);

  function submit(categorySlug?: string, locationValue?: string) {
    const params = new URLSearchParams();
    const cat = categorySlug ?? selectedCategory;
    const where = locationValue ?? location;
    if (cat) params.set('categoria', cat);
    else if (query.trim()) params.set('q', query.trim());
    if (where.trim()) params.set('zona', where.trim());
    setOpenPanel(null);
    router.push(`/cerca?${params.toString()}`);
  }

  function pickSuggestion(s: Suggestion) {
    setQuery(s.label);
    setSelectedCategory(s.value);
    setOpenPanel('location');
  }

  const isHero = variant === 'hero';

  /* Pannello suggerimenti riutilizzabile */
  function Panel({ children }: { children: React.ReactNode }) {
    return (
      <ul
        role="listbox"
        className="absolute left-0 right-0 top-full z-50 mt-2 max-h-72 overflow-auto rounded-card border border-line bg-white py-1.5 shadow-lift animate-fade-up"
      >
        {children}
      </ul>
    );
  }

  const inputClass = cn(
    'w-full min-w-0 bg-transparent text-ink outline-none focus-visible:outline-none placeholder:font-medium placeholder:text-ink-faint',
    isHero ? 'text-[15px] font-semibold sm:text-[15.5px]' : 'text-[14px]',
    'leading-[1.2]' // dopo text-[…]: tailwind-merge altrimenti lo scarta
  );
  const labelClass = 'text-[11px] font-semibold leading-tight text-ink-faint sm:text-[11.5px]';

  return (
    <form
      ref={containerRef}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      role="search"
      className={cn(
        'relative flex w-full items-center border border-line bg-white text-left',
        isHero
          ? 'max-w-[760px] gap-1.5 rounded-[22px] py-1 pl-1 pr-2 shadow-[0_12px_30px_-20px_rgba(21,34,56,.4)] sm:h-[68px] sm:gap-0 sm:rounded-pill sm:py-0 sm:pl-0 sm:shadow-[0_18px_40px_-22px_rgba(21,34,56,.45)]'
          : 'h-[46px] max-w-2xl rounded-pill shadow-[0_6px_18px_-12px_rgba(21,34,56,.35)]'
      )}
    >
      <div className={cn('flex min-w-0 flex-1', isHero ? 'flex-col sm:h-full sm:flex-row sm:items-center' : 'h-full items-center')}>
        {/* ── Campo "cosa" ── */}
        <div
          className={cn(
            'relative flex min-w-0 items-center',
            isHero
              ? 'gap-3 px-3 py-2.5 sm:h-full sm:flex-[1.2] sm:py-0 sm:pl-7 sm:pr-5'
              : 'h-full flex-[1.2] gap-2 pl-4 pr-2.5'
          )}
        >
          <Search
            size={isHero ? 18 : 16}
            strokeWidth={isHero ? 2 : 2.4}
            className={cn('shrink-0', isHero ? 'text-ink-faint' : 'text-ink')}
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 flex-col gap-px">
            {isHero && (
              <label htmlFor={`${id}-cosa`} className={labelClass}>
                Cosa
              </label>
            )}
            <input
              id={`${id}-cosa`}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedCategory('');
                setOpenPanel('query');
              }}
              onFocus={() => setOpenPanel('query')}
              placeholder="Di cosa hai bisogno?"
              aria-label={isHero ? undefined : 'Categoria o nome del professionista'}
              autoComplete="off"
              enterKeyHint="search"
              className={cn(inputClass, !isHero && 'font-bold')}
            />
          </div>
          {openPanel === 'query' && suggestions.length > 0 && (
            <Panel>
              {suggestions.map((s) => (
                <li key={`${s.type}-${s.value}`}>
                  <button
                    type="button"
                    onClick={() => pickSuggestion(s)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-cream active:bg-sand"
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                        s.type === 'categoria' ? 'bg-sand text-ink' : 'bg-ember-soft text-ember-deep'
                      )}
                    >
                      {s.type === 'categoria' ? <Wrench size={15} /> : <Search size={15} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[14.5px] font-semibold text-ink">
                        {s.label}
                      </span>
                      {s.sublabel && (
                        <span className="block truncate text-[12.5px] text-ink-mute">
                          {s.sublabel}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </Panel>
          )}
        </div>

        <span
          aria-hidden
          className={cn('shrink-0 bg-line', isHero ? 'ml-[42px] mr-2 h-px sm:mx-0 sm:h-8 sm:w-px' : 'h-[22px] w-px')}
        />

        {/* ── Campo "dove" ── */}
        <div
          className={cn(
            'relative flex min-w-0 items-center',
            isHero ? 'gap-3 px-3 py-2.5 sm:h-full sm:flex-1 sm:px-5 sm:py-0' : 'h-full flex-1 gap-2 pl-3 pr-4'
          )}
        >
          <MapPin
            size={isHero ? 18 : 16}
            className={cn('shrink-0', isHero ? 'text-ink-faint' : 'text-ink-mute')}
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 flex-col gap-px">
            {isHero && (
              <label htmlFor={`${id}-dove`} className={labelClass}>
                Dove
              </label>
            )}
            <input
              id={`${id}-dove`}
              type="text"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setOpenPanel('location');
              }}
              onFocus={() => setOpenPanel('location')}
              placeholder="Dove? Città o zona"
              aria-label={isHero ? undefined : 'Città o zona'}
              autoComplete="off"
              enterKeyHint="search"
              className={cn(inputClass, !isHero && 'font-medium text-ink-mute')}
            />
          </div>
          {openPanel === 'location' && citySuggestions.length > 0 && (
            <Panel>
              {citySuggestions.map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onClick={() => {
                      setLocation(c);
                      submit(undefined, c);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-cream active:bg-sand"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sand text-ink">
                      <MapPin size={15} />
                    </span>
                    <span className="text-[14.5px] font-semibold text-ink">{c}</span>
                  </button>
                </li>
              ))}
            </Panel>
          )}
        </div>
      </div>

      {/* ── Bottone — compact: invisibile, serve solo all'invio da tastiera ── */}
      {isHero ? (
        <button
          type="submit"
          aria-label="Cerca"
          className="pressable flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[18px] bg-ember-gradient text-white shadow-[0_8px_18px_-8px_rgba(255,102,0,.7)] sm:w-auto sm:gap-2 sm:rounded-pill sm:px-6 sm:shadow-none"
        >
          <Search strokeWidth={2.5} className="h-5 w-5 sm:h-[17px] sm:w-[17px]" aria-hidden />
          <span className="hidden text-[15px] font-bold sm:inline">Cerca</span>
        </button>
      ) : (
        <button type="submit" tabIndex={-1} aria-hidden className="sr-only">
          Cerca
        </button>
      )}
    </form>
  );
}
