// Area utente — i miei lavori (prenotazioni mock).
// TODO fase 2: auth guard con next-auth e dati da GET /api/prenotazioni.

import type { Metadata } from 'next';
import UtenteClient from './UtenteClient';

export const metadata: Metadata = {
  title: 'I miei lavori — Handy Pro',
};

export default function DashboardUtentePage() {
  return <UtenteClient />;
}
