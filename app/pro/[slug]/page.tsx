// Profilo professionista + flusso prenotazione.
// Server component: risolve il pro dallo slug via API e passa i dati al client.

import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProBySlug, getReviews } from '@/lib/data';
import ProProfileClient from './ProProfileClient';

interface ProProfilePageProps {
  params: { slug: string };
  searchParams: { data?: string; ora?: string };
}

// Rendering dinamico: il flusso di prenotazione legge ?data e ?ora.
export const dynamic = 'force-dynamic';

const loadPro = cache((slug: string) => getProBySlug(slug));

export async function generateMetadata({ params }: ProProfilePageProps): Promise<Metadata> {
  const pro = await loadPro(params.slug).catch(() => null);
  if (!pro) return { title: 'Professionista non trovato — Handy Pro' };
  return {
    title: `${pro.name} — ${pro.categoryLabel} a ${pro.city} | Handy Pro`,
    description: `${pro.specialization}. ${pro.reviewCount} recensioni verificate. Prenota online.`,
  };
}

export default async function ProProfilePage({ params, searchParams }: ProProfilePageProps) {
  const pro = await loadPro(params.slug);
  if (!pro) notFound();

  const reviews = await getReviews(params.slug).catch(() => []);

  return (
    <ProProfileClient
      pro={pro}
      reviews={reviews}
      initialDate={searchParams.data}
      initialSlot={searchParams.ora}
    />
  );
}
