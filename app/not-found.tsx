// 404 — pagina non trovata.

import { Wordmark } from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 pt-14 text-center md:pt-[72px]">
      <Wordmark className="h-9 w-auto text-ink" />
      <h1 className="mt-10 text-[26px] font-extrabold tracking-tight text-ink">
        Pagina non trovata
      </h1>
      <p className="mt-2 max-w-sm text-ink-mute">
        Il link potrebbe essere sbagliato o la pagina non esiste più.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          href="/cerca"
          size="md"
        >
          Cerca un professionista
        </Button>
        <Button
          href="/"
          variant="outline"
          size="md"
        >
          Torna alla home
        </Button>
      </div>
    </div>
  );
}
