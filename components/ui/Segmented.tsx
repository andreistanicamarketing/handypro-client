'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Segmented control a tutta larghezza: fondo sabbia, segmento attivo bianco.

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
}

export default function Segmented<T extends string>({ value, onChange, options, className }: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      className={cn('grid rounded-pill bg-sand p-1', className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            'pressable flex h-[38px] items-center justify-center gap-1.5 rounded-pill text-[13.5px] font-bold',
            o.value === value ? 'bg-white text-ink shadow-[0_1px_3px_rgba(21,34,56,.12)]' : 'text-ink-mute hover:text-ink'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
