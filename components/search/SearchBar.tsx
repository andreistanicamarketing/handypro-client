'use client';

// Search card mobile-first: campi impilati su mobile, in linea su desktop.
// Autocomplete per categorie/professionisti e città.

import { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, CITIES, PROS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  initialCategory?: string;
  initialLocation?: string;
}

interface Suggestion {
  type: 'categoria' | 'professionista';
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
  const proSuggestions: Suggestion[] =
    q.length >= 2
      ? PROS.filter((p) => p.name.toLowerCase().includes(q))
          .slice(0, 3)
          .map((p) => ({
            type: 'professionista' as const,
            label: p.name,
            sublabel: `${p.categoryLabel} · ${p.city}`,
            value: p.slug,
          }))
      : [];
  const suggestions = [...categorySuggestions.slice(0, 6), ...proSuggestions];

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
    if (s.type === 'professionista') {
      setOpenPanel(null);
      router.push(`/pro/${s.value}`);
      return;
    }
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

  return (
    <form
      ref={containerRef}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      role="search"
      className={cn(
        'relative w-full bg-white',
        isHero
          ? 'max-w-2xl rounded-sheet p-2 shadow-lift sm:rounded-pill'
          : 'max-w-2xl rounded-pill border border-line p-1 shadow-soft'
      )}
    >
      <div className={cn('flex', isHero ? 'flex-col sm:flex-row sm:items-center' : 'flex-row items-center')}>
        {/* ── Campo "cosa" ── */}
        <div
          className={cn(
            'relative flex min-w-0 items-center gap-2.5',
            isHero
              ? 'flex-[1.2] border-b border-line px-3 py-3 sm:border-b-0 sm:border-r sm:py-2'
              : 'flex-[1.2] border-r border-line px-3 py-1.5'
          )}
        >
          <Wrench size={17} className="shrink-0 text-ink-faint" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedCategory('');
              setOpenPanel('query');
            }}
            onFocus={() => setOpenPanel('query')}
            placeholder="Di cosa hai bisogno?"
            aria-label="Categoria o nome del professionista"
            autoComplete="off"
            enterKeyHint="search"
            className={cn(
              'w-full min-w-0 bg-transparent font-semibold text-ink outline-none placeholder:font-medium placeholder:text-ink-faint',
              isHero ? 'text-[16px]' : 'text-[14px]'
            )}
          />
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

        {/* ── Campo "dove" ── */}
        <div
          className={cn(
            'relative flex min-w-0 flex-1 items-center gap-2.5',
            isHero ? 'px-3 py-3 sm:py-2' : 'px-3 py-1.5'
          )}
        >
          <MapPin size={17} className="shrink-0 text-ink-faint" aria-hidden />
          <input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setOpenPanel('location');
            }}
            onFocus={() => setOpenPanel('location')}
            placeholder="Dove? Città o zona"
            aria-label="Città o zona"
            autoComplete="off"
            enterKeyHint="search"
            className={cn(
              'w-full min-w-0 bg-transparent font-semibold text-ink outline-none placeholder:font-medium placeholder:text-ink-faint',
              isHero ? 'text-[16px]' : 'text-[14px]'
            )}
          />
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

        {/* ── Bottone ── */}
        <button
          type="submit"
          className={cn(
            'pressable flex shrink-0 items-center justify-center gap-2 bg-ember-gradient font-bold text-white',
            isHero
              ? 'mt-2 h-12 w-full rounded-2xl text-[15px] sm:mt-0 sm:h-11 sm:w-11 sm:rounded-pill'
              : 'h-9 w-9 rounded-pill'
          )}
          aria-label="Cerca"
        >
          <Search size={isHero ? 18 : 15} strokeWidth={2.5} />
          {isHero && <span className="sm:hidden">Cerca</span>}
        </button>
      </div>
    </form>
  );
}
