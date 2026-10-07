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
import { cn, formatDayLong, toDateKey } from '@/lib/utils';
import Sheet from '@/components/ui/Sheet';
import SlotPicker, { slotLabel } from '@/components/booking/SlotPicker';
import Button, { IconButton } from '@/components/ui/Button';

interface BookingSheetProps {
  pro: Pro;
  open: boolean;
  onClose: () => void;
  /** Preselezione da query param (?data=YYYY-MM-DD&ora=HH:MM) */
  initialDate?: string;
  initialSlot?: string;
}

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ['Servizio', 'Orario', 'Riepilogo'];
const STEP_TITLES = ['Cosa ti serve?', 'Quando ti serve?', 'Tutto giusto?'];

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
    <Sheet open={open} onClose={onClose} label="Prenota un intervento" className="h-[650px] sm:h-auto sm:max-h-[88vh] sm:w-[560px]">
      {/* header */}
      <div className="flex items-start gap-2 px-5 pb-3.5 pt-3.5 sm:pt-5">
        {step === 3 && (
          <IconButton
            onClick={() => setStep(2)}
            aria-label="Indietro"
            className="-ml-1.5"
          >
            <ChevronLeft size={19} />
          </IconButton>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <p className="truncate text-[18px] font-extrabold tracking-[-.015em] text-ink">
            {step === 4 ? pro.name : STEP_TITLES[step - 1]}
          </p>
          {step < 4 && (
            <p className="text-[13px] text-ink-faint">
              Passo {step} di 3 · {STEP_LABELS[step - 1]}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi"
          className="pressable flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand text-ink hover:bg-sand-deep"
        >
          <X size={17} />
        </button>
      </div>

      {/* progress */}
      {step < 4 && (
        <div className="mx-5 mb-1 grid grid-cols-3 gap-1.5" aria-hidden>
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={cn(
                'h-1 rounded transition-colors',
                s <= step ? 'bg-ember' : 'bg-sand'
              )}
            />
          ))}
        </div>
      )}

      {/* contenuto */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-[18px]">
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
          <div className="flex flex-col gap-[18px]">
            {service && (
              <div className="flex items-center gap-3 rounded-2xl bg-cream px-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ember text-white">
                  <Wrench size={16} aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-bold text-ink">{service.name}</span>
                  <span className="truncate text-[12.5px] text-ink-mute">
                    {service.price} · {pro.name}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[13px] font-bold text-ember-deep hover:text-ink"
                >
                  Modifica
                </button>
              </div>
            )}
            <SlotPicker
              size="large"
              days={days}
              dateKey={dateKey}
              slot={slot}
              onDate={(k) => {
                setDateKey(k);
                setSlot(null);
              }}
              onSlot={setSlot}
              labels={{
                days: (selectedDay?.date ?? days?.[0]?.date ?? new Date()).toLocaleDateString('it-IT', { month: 'long' }),
                slots: 'Orari liberi',
              }}
              bleed="-mx-5 px-5"
            />
          </div>
        )}

        {/* ── Step 3: riepilogo ── */}
        {step === 3 && (
          <div>
            {/* nota */}
            <div className="space-y-3.5">
              <div>
                <label htmlFor="bk-note" className="mb-1 block text-[13px] font-bold text-ink">
                  Descrivi il problema <span className="font-medium text-ink-faint">(facoltativo)</span>
                </label>
                <textarea
                  id="bk-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Es. cosa non funziona, da quando, se è urgente…"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-line bg-white p-3.5 text-[15px] font-medium text-ink outline-none placeholder:text-ink-faint focus:border-ember"
                />
              </div>
            </div>

            {/* riepilogo */}
            <div className="mt-3.5">
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
              Hai chiesto a {pro.name} un intervento per{' '}
              <strong className="text-ink">{service?.name}</strong>,{' '}
              {selectedDay ? formatDayLong(selectedDay.date).toLowerCase() : ''} alle{' '}
              <strong className="text-ink">{slot}</strong>. Trovi la conferma in{' '}
              <em>I miei lavori</em>.
            </p>
            <p className="mx-auto mb-6 max-w-[280px] rounded-card bg-cream p-3 text-[12.5px] leading-relaxed text-ink-mute">
              Al termine del lavoro confermato potrai lasciare una recensione verificata.
            </p>
            <Button
              onClick={onClose}
              variant="dark"
              className="w-full"
            >
              Chiudi
            </Button>
          </div>
        )}
      </div>

      {/* footer CTA — in flusso, mai sopra il contenuto */}
      {step < 4 && (
        <div
          className="shrink-0 border-t border-line bg-white px-5 pt-3"
          style={{ paddingBottom: 'max(20px, calc(12px + var(--safe-bottom)))' }}
        >
          {error && (
            <p role="alert" className="mb-2 rounded-xl bg-red-50 p-3 text-[13px] font-semibold text-red-500">
              {error}
            </p>
          )}
          <Button
            onClick={next}
            disabled={!canProceed || sending}
            className="h-[54px] w-full text-[16px]"
          >
            {sending ? 'Invio…' : step === 3 ? (session ? 'Invia richiesta' : 'Accedi per prenotare') : 'Continua'}
          </Button>
          {step === 2 && selectedDay && slot && (
            <p className="mt-2 text-center text-[12px] text-ink-faint">
              {slotLabel(selectedDay.date, slot)} · confermerà il professionista
            </p>
          )}
        </div>
      )}
    </Sheet>
  );
}
