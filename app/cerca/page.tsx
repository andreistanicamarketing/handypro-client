// Pagina di ricerca stile Doctolib: lista risultati con slot a sinistra,
// mappa sticky a destra, filtri in alto, toggle lista/mappa su mobile.

import { Suspense } from 'react';
import CercaClient from './CercaClient';

export const metadata = {
  title: 'Cerca professionisti — Handy Pro',
};

export default function CercaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center pt-16 text-ink-mute">
          Caricamento…
        </div>
      }
    >
      <CercaClient />
    </Suspense>
  );
}
