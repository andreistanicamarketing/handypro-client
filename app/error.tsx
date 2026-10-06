'use client';

// Errore di rendering (es. backend non raggiungibile).

import Link from 'next/link';
import { Wordmark } from '@/components/layout/Navbar';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 pt-14 text-center md:pt-16">
      <Wordmark className="h-9 w-auto text-ink" />
      <h1 className="mt-10 text-[26px] font-extrabold tracking-tight text-ink">
        Qualcosa è andato storto
      </h1>
      <p className="mt-2 max-w-sm text-ink-mute">
        Non siamo riusciti a caricare la pagina. Riprova tra qualche istante.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="pressable inline-flex h-11 items-center rounded-2xl bg-ember-gradient px-5 text-[14px] font-bold text-white"
        >
          Riprova
        </button>
        <Link
          href="/"
          className="pressable inline-flex h-11 items-center rounded-2xl border border-line px-5 text-[14px] font-bold text-ink"
        >
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
