// Dashboard professionista — richieste, agenda, vetrina.
// TODO fase 2: auth guard (role professionista) e dati da API.

import type { Metadata } from 'next';
import ProDashboardClient from './ProDashboardClient';

export const metadata: Metadata = {
  title: 'La mia attività — Handy Pro',
};

export default function DashboardProPage() {
  return <ProDashboardClient />;
}
