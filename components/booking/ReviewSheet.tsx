'use client';

// Sheet recensione verificata: stelle + testo, poi conferma.
// Disponibile solo per lavori completati.

import { useEffect, useState } from 'react';
import { X, Star, BadgeCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button, { IconButton } from '@/components/ui/Button';
import Sheet from '@/components/ui/Sheet';

interface ReviewSheetProps {
  open: boolean;
  proName: string;
  jobLabel: string;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => Promise<string | null>;
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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRating(0);
      setText('');
      setSent(false);
      setSending(false);
      setError(null);
    }
  }, [open]);

  return (
    <Sheet open={open} onClose={onClose} label="Lascia una recensione" className="sm:w-[460px]">
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
        <IconButton onClick={onClose} aria-label="Chiudi">
          <X size={18} />
        </IconButton>
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
            <Button variant="dark" onClick={onClose} className="w-full">
              Chiudi
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-3 flex items-start gap-2 rounded-card bg-verde-soft/60 p-3 text-[12.5px] leading-relaxed text-verde">
              <BadgeCheck size={15} className="mt-0.5 shrink-0" />
              La tua recensione sarà verificata: è collegata a un lavoro prenotato e completato su Handy Pro.
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
              Racconta com&rsquo;è andata <span className="font-medium text-ink-faint">(minimo 10 caratteri)</span>
            </label>
            <textarea
              id="rv-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Puntualità, qualità del lavoro, prezzo rispetto al preventivo…"
              className="mb-4 w-full resize-none rounded-xl border border-line bg-white p-3.5 text-[15px] font-medium text-ink outline-none placeholder:text-ink-faint focus:border-ember"
            />

            {error && (
              <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-[13px] font-semibold text-red-500">
                {error}
              </p>
            )}

            <Button
              disabled={rating === 0 || text.trim().length < 10 || sending}
              onClick={async () => {
                setSending(true);
                setError(null);
                const err = await onSubmit(rating, text.trim());
                setSending(false);
                if (err) setError(err);
                else setSent(true);
              }}
              className="w-full"
            >
              {sending ? 'Invio…' : 'Pubblica recensione'}
            </Button>
          </>
        )}
      </div>
    </Sheet>
  );
}
