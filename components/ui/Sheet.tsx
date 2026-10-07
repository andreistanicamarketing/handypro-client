'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Bottom sheet su mobile → dialog centrato da sm in su.
// Gestisce backdrop, maniglia, blocco dello scroll e chiusura con Esc.
// Header e contenuto li decide chi lo usa; la larghezza desktop via className (es. sm:w-[460px]).

interface SheetProps {
  open: boolean;
  onClose: () => void;
  /** aria-label del dialog */
  label: string;
  className?: string;
  children: ReactNode;
}

export default function Sheet({ open, onClose, label, className, children }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        aria-label="Chiudi"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />
      <div
        className={cn(
          'relative z-10 flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-t-sheet bg-white shadow-lift animate-fade-up sm:max-h-[85vh] sm:rounded-sheet',
          className
        )}
      >
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-pill bg-line" />
        </div>
        {children}
      </div>
    </div>
  );
}
