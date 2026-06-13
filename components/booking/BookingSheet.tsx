'use client';

// Flusso di prenotazione in 3 passi + conferma.
// Bottom sheet su mobile, dialog centrato su desktop. Tutto mock lato client.

import { useEffect, useMemo, useState } from 'react';
import {
  X, ChevronLeft, Check, CalendarDays, Wrench, UserRound, CheckCircle2,
} from 'lucide-react';
import type { MockPro } from '@/lib/mock-data';
import { getAvailability, formatDayLong, formatDayShort } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface BookingSheetProps {
  pro: MockPro;
  open: boolean;
  onClose: () => void;
  /** Preselezione da query param (?data=YYYY-MM-DD&ora=HH:MM) */
  initialDate?: string;
  initialSlot?: string;
}

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ['Servizio', 'Data e ora', 'I tuoi dati'];

export default function BookingSheet({
  pro,
  open,
  onClose,
  initialDate,
  initialSlot,
}: BookingSheetProps) {
  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<string | null>(null);
  const [dateKey, setDateKey] = useState<string | null>(initialDate ?? null);
  const [slot, setSlot] = useState<string | null>(initialSlot ?? null);
  const [form, setForm] = useState({ nome: '', telefono: '', note: '' });
  const [touched, setTouched] = useState(false);

  const days = useMemo(
    () => getAvailability(pro.id, 14).filter((d) => d.slots.length > 0),
    [pro.id]
  );

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
      setTouched(false);
    }
  }, [open, initialDate, initialSlot]);

  if (!open) return null;

  const selectedDay = days.find((d) => d.date.toISOString().slice(0, 10) === dateKey);
  const formValid = form.nome.trim().length >= 2 && form.telefono.trim().length >= 6;

  function next() {
    if (step === 3) {
      setTouched(true);
      if (!formValid) return;
    }
    setStep((s) => Math.min(4, s + 1) as Step);
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
                  key={s.name}
                  type="button"
                  onClick={() => setService(s.name)}
                  className={cn(
                    'pressable flex w-full items-center gap-3 rounded-card border p-4 text-left',
                    service === s.name
                      ? 'border-ember bg-ember-soft/60'
                      : 'border-line bg-white hover:border-ink/25'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      service === s.name ? 'bg-ember text-white' : 'bg-sand text-ink'
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
                      service === s.name ? 'border-ember bg-ember text-white' : 'border-line'
                    )}
                  >
                    {service === s.name && <Check size={13} strokeWidth={3} />}
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
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible md:pb-0">
                  {days.map((d) => {
                    const key = d.date.toISOString().slice(0, 10);
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
              </div>

              {/* colonna destra: orari */}
              <div className="mt-4 md:mt-0">
                {selectedDay ? (
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

          {/* ── Step 3: dati ── */}
          {step === 3 && (
            <div className="md:grid md:grid-cols-[1.2fr_1fr] md:gap-6">
              {/* Colonna sinistra: campi */}
              <div className="space-y-3.5">
                <div>
                  <label htmlFor="bk-nome" className="mb-1 block text-[13px] font-bold text-ink">
                    Nome e cognome
                  </label>
                  <input
                    id="bk-nome"
                    type="text"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Mario Bianchi"
                    autoComplete="name"
                    className={cn(
                      'h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] font-medium text-ink outline-none placeholder:text-ink-faint focus:border-ember',
                      touched && form.nome.trim().length < 2 ? 'border-red-400' : 'border-line'
                    )}
                  />
                </div>
                <div>
                  <label htmlFor="bk-tel" className="mb-1 block text-[13px] font-bold text-ink">
                    Telefono
                  </label>
                  <input
                    id="bk-tel"
                    type="tel"
                    inputMode="tel"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="+39 333 123 4567"
                    autoComplete="tel"
                    className={cn(
                      'h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] font-medium text-ink outline-none placeholder:text-ink-faint focus:border-ember',
                      touched && form.telefono.trim().length < 6 ? 'border-red-400' : 'border-line'
                    )}
                  />
                </div>
                <div>
                  <label htmlFor="bk-note" className="mb-1 block text-[13px] font-bold text-ink">
                    Descrivi il problema <span className="font-medium text-ink-faint">(facoltativo)</span>
                  </label>
                  <textarea
                    id="bk-note"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
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
                      <p className="text-[13.5px] font-semibold text-ink">{service}</p>
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
                <strong className="text-ink">{service}</strong>{' '}
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
            <button
              type="button"
              onClick={next}
              disabled={!canProceed}
              className="pressable h-12 w-full rounded-2xl bg-ember-gradient text-[15px] font-bold text-white disabled:opacity-40"
            >
              {step === 3 ? 'Invia richiesta' : 'Continua'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
