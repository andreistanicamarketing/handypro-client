'use client';

// Flusso di prenotazione in 3 passi + conferma.
// Bottom sheet su mobile, dialog centrato su desktop.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X, ChevronLeft, Check, CalendarDays, Wrench, UserRound, CheckCircle2,
} from 'lucide-react';
import { getAvailability, createBooking, type Pro, type Service, type DayAvailability } from '@/lib/data';
import { useSession } from '@/lib/auth-mock';
import { cn, formatDayLong, formatDayShort, toDateKey } from '@/lib/utils';

interface BookingSheetProps {
  pro: Pro;
  open: boolean;
  onClose: () => void;
  /** Preselezione da query param (?data=YYYY-MM-DD&ora=HH:MM) */
  initialDate?: string;
  initialSlot?: string;
}

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ['Servizio', 'Data e ora', 'Riepilogo'];

export default function BookingSheet({
  pro,
  open,
  onClose,
  initialDate,
  initialSlot,
}: BookingSheetProps) {
  const router = useRouter();
  const { session } = useSession();
  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<Service | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(initialDate ?? null);
  const [slot, setSlot] = useState<string | null>(initialSlot ?? null);
  const [days, setDays] = useState<DayAvailability[] | null>(null);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setDays(null);
    getAvailability(pro.slug, 14)
      .then((d) => alive && setDays(d.filter((x) => x.slots.length > 0)))
      .catch(() => alive && setDays([]));
    return () => {
      alive = false;
    };
  }, [open, pro.slug]);

  // Blocca lo scroll del body quando il foglio è aperto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Reset quando si riapre
  useEffect(() => {
    if (open) {
      setStep(1);
      setService(null);
      setDateKey(initialDate ?? null);
      setSlot(initialSlot ?? null);
      setNote('');
      setError(null);
      setSending(false);
    }
  }, [open, initialDate, initialSlot]);

  if (!open) return null;

  const selectedDay = days?.find((d) => toDateKey(d.date) === dateKey);

  async function next() {
    if (step < 3) {
      setStep((s) => (s + 1) as Step);
      return;
    }
    // step 3 → invio
    if (!session) {
      onClose();
      router.push('/registrati');
      return;
    }
    if (session.role !== 'privato') {
      setError('Gli account professionista non possono prenotare.');
      return;
    }
    if (!service || !dateKey || !slot) return;
    setSending(true);
    setError(null);
    try {
      await createBooking(session.accessToken, {
        professionalId: pro.id,
        serviceItemId: service.id,
        date: dateKey,
        slot,
        note: note.trim() || undefined,
      });
      setStep(4);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Errore di rete, riprova.';
      setError(message);
      // slot probabilmente occupato: ricarica la disponibilità e torna alla scelta orario
      const fresh = await getAvailability(pro.slug, 14).catch(() => null);
      if (fresh) {
        setDays(fresh.filter((x) => x.slots.length > 0));
        setSlot(null);
        setStep(2);
      }
    } finally {
      setSending(false);
    }
  }

  const canProceed =
    (step === 1 && service !== null) ||
    (step === 2 && dateKey !== null && slot !== null) ||
    step === 3;

  // Overlay: flex items-end mobile (bottom sheet) → flex items-center justify-center sm+ (dialog centrato)
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Prenota un intervento"
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="Chiudi"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />

      {/* dialog — figlio flex, naturalmente centrato dall'overlay */}
      <div className="relative z-10 flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-t-sheet bg-white shadow-lift animate-fade-up sm:max-h-[88vh] sm:w-[560px] sm:rounded-sheet md:w-[740px]">
        {/* maniglia mobile */}
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-pill bg-line" />
        </div>

        {/* header */}
        <div className="flex items-center gap-2 px-5 pb-3 pt-3 sm:pt-5">
          {step > 1 && step < 4 && (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
              aria-label="Indietro"
              className="pressable -ml-1.5 flex h-9 w-9 items-center justify-center rounded-full text-ink-mute hover:bg-sand"
            >
              <ChevronLeft size={19} />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15.5px] font-bold text-ink">
              {step === 4 ? pro.name : `Prenota con ${pro.name}`}
            </p>
            {step < 4 && (
              <p className="text-[12px] font-medium text-ink-faint">
                Passo {step} di 3 · {STEP_LABELS[step - 1]}
              </p>
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

        {/* progress */}
        {step < 4 && (
          <div className="mx-5 mb-1 flex gap-1.5" aria-hidden>
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={cn(
                  'h-1 flex-1 rounded-pill transition-colors',
                  s <= step ? 'bg-ember' : 'bg-sand'
                )}
              />
            ))}
          </div>
        )}

        {/* contenuto */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-4">
          {/* ── Step 1: servizio ── */}
          {step === 1 && (
            <div className="space-y-2.5">
              {pro.services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setService(s)}
                  className={cn(
                    'pressable flex w-full items-center gap-3 rounded-card border p-4 text-left',
                    service?.id === s.id
                      ? 'border-ember bg-ember-soft/60'
                      : 'border-line bg-white hover:border-ink/25'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      service?.id === s.id ? 'bg-ember text-white' : 'bg-sand text-ink'
                    )}
                  >
                    <Wrench size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-bold text-ink">{s.name}</span>
                    <span className="block text-[13px] text-ink-mute">{s.price}</span>
                  </span>
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                      service?.id === s.id ? 'border-ember bg-ember text-white' : 'border-line'
                    )}
                  >
                    {service?.id === s.id && <Check size={13} strokeWidth={3} />}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ── Step 2: data e ora ── */}
          {step === 2 && (
            <div className="md:grid md:grid-cols-[1fr_1.4fr] md:gap-6">
              {/* colonna sinistra: giorni */}
              <div>
                <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                  Scegli il giorno
                </p>
                {days === null ? (
                  <div className="flex gap-2 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-[62px] w-[64px] shrink-0 animate-pulse rounded-card bg-sand/50 md:w-auto"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
                    {days.map((d) => {
                      const key = toDateKey(d.date);
                      const { dayName, dayNum } = formatDayShort(d.date);
                      const active = key === dateKey;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setDateKey(key);
                            setSlot(null);
                          }}
                          className={cn(
                            'pressable w-[64px] shrink-0 rounded-card border py-2.5 text-center md:w-auto',
                            active ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink'
                          )}
                        >
                          <span className="block text-[12px] font-bold capitalize">{dayName}</span>
                          <span className={cn('block text-[11px]', active ? 'text-white/70' : 'text-ink-faint')}>
                            {dayNum}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* colonna destra: orari */}
              <div className="mt-4 md:mt-0">
                {days === null ? (
                  <div className="grid grid-cols-4 gap-2 md:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-10 animate-pulse rounded-xl bg-sand/50" />
                    ))}
                  </div>
                ) : selectedDay ? (
                  <>
                    <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                      Orari per {formatDayLong(selectedDay.date).toLowerCase()}
                    </p>
                    <div className="grid grid-cols-4 gap-2 md:grid-cols-3">
                      {selectedDay.slots.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSlot(s)}
                          className={cn(
                            'pressable h-10 rounded-xl text-[13.5px] font-bold',
                            slot === s ? 'bg-ember text-white' : 'bg-sand text-ink hover:bg-sand-deep'
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-card bg-sand/40 p-6 text-center">
                    <p className="text-[13.5px] text-ink-mute">
                      Seleziona un giorno per vedere gli orari disponibili.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: riepilogo ── */}
          {step === 3 && (
            <div className="md:grid md:grid-cols-[1.2fr_1fr] md:gap-6">
              {/* Colonna sinistra: nota */}
              <div className="space-y-3.5">
                <div>
                  <label htmlFor="bk-note" className="mb-1 block text-[13px] font-bold text-ink">
                    Descrivi il problema <span className="font-medium text-ink-faint">(facoltativo)</span>
                  </label>
                  <textarea
                    id="bk-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Es. la caldaia perde acqua dal tubo di scarico…"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-line bg-white p-3.5 text-[15px] font-medium text-ink outline-none placeholder:text-ink-faint focus:border-ember"
                  />
                </div>
              </div>

              {/* Colonna destra (desktop) / sotto il form (mobile): riepilogo */}
              <div className="mt-3.5 md:mt-0">
                <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-faint">
                  Riepilogo prenotazione
                </p>
                <div className="rounded-card bg-cream p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-chip">
                      <Wrench size={14} className="text-ink-faint" />
                    </span>
                    <span>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Servizio</p>
                      <p className="text-[13.5px] font-semibold text-ink">{service?.name}</p>
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-chip">
                      <CalendarDays size={14} className="text-ink-faint" />
                    </span>
                    <span>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Data e ora</p>
                      <p className="text-[13.5px] font-semibold text-ink capitalize">
                        {selectedDay ? formatDayLong(selectedDay.date) : ''} · {slot}
                      </p>
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-chip">
                      <UserRound size={14} className="text-ink-faint" />
                    </span>
                    <span>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-faint">Professionista</p>
                      <p className="text-[13.5px] font-semibold text-ink">{pro.name}</p>
                      <p className="text-[12px] text-ink-mute">{pro.zona}</p>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: conferma ── */}
          {step === 4 && (
            <div className="pb-4 pt-2 text-center">
              <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-verde-soft text-verde">
                <CheckCircle2 size={32} />
              </span>
              <h3 className="mb-1.5 text-[20px] font-extrabold tracking-tight text-ink">
                Richiesta inviata!
              </h3>
              <p className="mx-auto mb-5 max-w-[280px] text-[14px] leading-relaxed text-ink-mute">
                {pro.name} riceverà la tua richiesta per{' '}
                <strong className="text-ink">{service?.name}</strong>{' '}
                {selectedDay ? formatDayLong(selectedDay.date).toLowerCase() : ''} alle{' '}
                <strong className="text-ink">{slot}</strong> e ti confermerà al più presto.
              </p>
              <p className="mx-auto mb-6 max-w-[280px] rounded-card bg-cream p-3 text-[12.5px] leading-relaxed text-ink-mute">
                Al termine del lavoro confermato potrai lasciare una recensione verificata.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="pressable h-12 w-full rounded-2xl bg-ink text-[15px] font-bold text-white"
              >
                Chiudi
              </button>
            </div>
          )}
        </div>

        {/* footer CTA — in flusso, mai sopra il contenuto */}
        {step < 4 && (
          <div
            className="shrink-0 border-t border-line bg-white px-5 pt-3"
            style={{ paddingBottom: 'calc(12px + var(--safe-bottom))' }}
          >
            {error && (
              <p role="alert" className="mb-2 rounded-xl bg-red-50 p-3 text-[13px] font-semibold text-red-500">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={next}
              disabled={!canProceed || sending}
              className="pressable h-12 w-full rounded-2xl bg-ember-gradient text-[15px] font-bold text-white disabled:opacity-40"
            >
              {sending ? 'Invio…' : step === 3 ? (session ? 'Invia richiesta' : 'Accedi per prenotare') : 'Continua'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
