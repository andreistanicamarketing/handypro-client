'use client';

// Sheet chat legata a una prenotazione: caricamento iniziale + polling
// ogni 3.5s mentre il pannello è aperto, invio, segna-come-letto.

import { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';
import { getMessages, sendMessage, markRead, type Message } from '@/lib/chat';
import { cn, timeAgo } from '@/lib/utils';

const POLL_INTERVAL_MS = 3500;

interface ChatSheetProps {
  open: boolean;
  bookingId: string;
  token: string;
  myUserId: string;
  otherPartyName: string;
  onClose: () => void;
  /** Chiamato dopo un markRead riuscito, per azzerare il badge nel genitore. */
  onRead?: () => void;
}

export default function ChatSheet({
  open, bookingId, token, myUserId, otherPartyName, onClose, onRead,
}: ChatSheetProps) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const lastCreatedAt = useRef<Date | undefined>(undefined);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setMessages(null);
    setError(null);
    setDraft('');
    setSendError(null);
    lastCreatedAt.current = undefined;

    async function loadInitial() {
      try {
        const initial = await getMessages(token, bookingId);
        if (!alive) return;
        setMessages(initial);
        if (initial.length > 0) lastCreatedAt.current = initial[initial.length - 1].createdAt;
        if (initial.some((m) => m.senderId !== myUserId)) {
          await markRead(token, bookingId);
          onRead?.();
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Errore di rete');
      }
    }
    void loadInitial();

    const interval = setInterval(async () => {
      try {
        const fresh = await getMessages(token, bookingId, lastCreatedAt.current);
        if (!alive || fresh.length === 0) return;
        setMessages((prev) => [...(prev ?? []), ...fresh]);
        lastCreatedAt.current = fresh[fresh.length - 1].createdAt;
        if (fresh.some((m) => m.senderId !== myUserId)) {
          await markRead(token, bookingId);
          onRead?.();
        }
      } catch {
        // errore silenzioso sul poll: non interrompe la chat, riprova al giro successivo
      }
    }, POLL_INTERVAL_MS);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [open, bookingId, token, myUserId, onRead]);

  if (!open) return null;

  async function handleSend() {
    const testo = draft.trim();
    if (!testo || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const sent = await sendMessage(token, bookingId, testo);
      setMessages((prev) => [...(prev ?? []), sent]);
      lastCreatedAt.current = sent.createdAt;
      setDraft('');
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Errore di rete');
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center sm:px-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Chat con ${otherPartyName}`}
    >
      <button
        type="button"
        aria-label="Chiudi"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />

      <div className="relative z-10 flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-t-sheet bg-white shadow-lift animate-fade-up sm:h-[600px] sm:max-h-[85vh] sm:w-[420px] sm:rounded-sheet">
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden>
          <span className="h-1 w-10 rounded-pill bg-line" />
        </div>

        <div className="flex items-center gap-2 border-b border-line px-5 pb-3 pt-3 sm:pt-5">
          <p className="min-w-0 flex-1 truncate text-[15.5px] font-bold text-ink">
            {otherPartyName}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="pressable flex h-9 w-9 items-center justify-center rounded-full text-ink-mute hover:bg-sand"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {error ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-[13.5px] font-semibold text-ink-mute">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="pressable h-10 rounded-xl bg-ink px-4 text-[13px] font-bold text-white"
              >
                Riprova
              </button>
            </div>
          ) : messages === null ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 w-2/3 animate-pulse rounded-2xl bg-sand" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <p className="pt-8 text-center text-[13.5px] text-ink-faint">
              Nessun messaggio ancora. Scrivi il primo!
            </p>
          ) : (
            <ul className="space-y-2.5">
              {messages.map((m) => {
                const mine = m.senderId === myUserId;
                return (
                  <li key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[78%] rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed',
                        mine ? 'bg-ember-gradient text-white' : 'bg-sand text-ink'
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p
                        className={cn(
                          'mt-1 text-[10.5px] font-semibold',
                          mine ? 'text-white/70' : 'text-ink-faint'
                        )}
                      >
                        {timeAgo(m.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div
          className="border-t border-line px-4 pt-3"
          style={{ paddingBottom: 'calc(12px + var(--safe-bottom))' }}
        >
          {sendError && (
            <p role="alert" className="mb-2 text-[12.5px] font-semibold text-red-500">
              {sendError}
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              rows={1}
              placeholder="Scrivi un messaggio…"
              disabled={sending}
              className="min-h-11 flex-1 resize-none rounded-2xl border border-line bg-white px-3.5 py-2.5 text-[14.5px] font-medium text-ink outline-none placeholder:text-ink-faint focus:border-ember disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || draft.trim().length === 0}
              aria-label="Invia"
              className="pressable flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ember-gradient text-white disabled:opacity-40"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
