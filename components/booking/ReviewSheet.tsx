'use client';

// Sheet recensione verificata: stelle + testo, poi conferma.
// Disponibile solo per lavori completati (mock).

import { useEffect, useState } from 'react';
import { X, Star, BadgeCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewSheetProps {
  open: boolean;
  proName: string;
  jobLabel: string;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => void;
}

const RATING_LABELS = ['', 'Pessimo', 'Scarso', 'Nella media', 'Molto buono', 'Eccellente'];

export default function ReviewSheet({
  open,
  proName,
  jobLabel,
  onClose,
  onSubmit,
}: ReviewSheetProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setRating(0);
      setText('');
      setSent(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Lascia una recensione"
    >
      <button
        type="button"
        aria-label="Chiudi"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />

      <div className="relative z-10 flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-t-sheet bg-white shadow-lift animate-fade-up sm:max-h-[85vh] sm:w-[460px] sm:rounded-sheet">
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-pill bg-line" />
        </div>

        {/* header */}
        <div className="flex items-center gap-2 px-5 pb-2 pt-3 sm:pt-5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15.5px] font-bold text-ink">
              {sent ? 'Grazie!' : `Recensisci ${proName}`}
            </p>
            {!sent && (
              <p className="text-[12px] font-medium text-ink-faint">{jobLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="pressable flex h-9 w-9 items-center justify-center rounded-full text-ink-mute hover:bg-sand"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-5 pt-2"
          style={{ paddingBottom: 'calc(24px + var(--safe-bottom))' }}
        >
          {sent ? (
            <div className="pt-2 text-center">
              <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-verde-soft text-verde">
                <CheckCircle2 size={32} />
              </span>
              <h3 className="mb-1.5 text-[20px] font-extrabold tracking-tight text-ink">
                Recensione pubblicata
              </h3>
              <p className="mx-auto mb-6 max-w-[280px] text-[14px] leading-relaxed text-ink-mute">
                La tua recensione è contrassegnata come{' '}
                <span className="font-bold text-verde">✓ verificata</span> perché legata a un
                lavoro confermato.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="pressable h-12 w-full rounded-2xl bg-ink text-[15px] font-bold text-white"
              >
                Chiudi
              </button>
            </div>
          ) : (
            <>
              <p className="mb-3 flex items-start gap-2 rounded-card bg-verde-soft/60 p-3 text-[12.5px] leading-relaxed text-verde">
                <BadgeCheck size={15} className="mt-0.5 shrink-0" />
                Recensione verificata: solo tu, che hai completato questo lavoro, puoi lasciarla.
              </p>

              {/* stelle */}
              <div className="mb-1 flex justify-center gap-2 pt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`${n} stelle`}
                    className="pressable p-1"
                  >
                    <Star
                      size={34}
                      className={cn(
                        'transition-colors',
                        n <= rating ? 'fill-ember text-ember' : 'fill-sand text-sand'
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="mb-4 h-5 text-center text-[13px] font-bold text-ink-mute">
                {RATING_LABELS[rating]}
              </p>

              <label htmlFor="rv-text" className="mb-1 block text-[13px] font-bold text-ink">
                Racconta com&rsquo;è andata <span className="font-medium text-ink-faint">(facoltativo)</span>
              </label>
              <textarea
                id="rv-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="Puntualità, qualità del lavoro, prezzo rispetto al preventivo…"
                className="mb-4 w-full resize-none rounded-xl border border-line bg-white p-3.5 text-[15px] font-medium text-ink outline-none placeholder:text-ink-faint focus:border-ember"
              />

              <button
                type="button"
                disabled={rating === 0}
                onClick={() => {
                  onSubmit(rating, text);
                  setSent(true);
                }}
                className="pressable h-12 w-full rounded-2xl bg-ember-gradient text-[15px] font-bold text-white disabled:opacity-40"
              >
                Pubblica recensione
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
