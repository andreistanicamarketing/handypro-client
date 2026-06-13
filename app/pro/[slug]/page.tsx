// Profilo professionista + flusso prenotazione.
// Server component: risolve il pro dallo slug e passa i dati al client.

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProBySlug, getReviewsByProId } from '@/lib/mock-data';
import ProProfileClient from './ProProfileClient';

interface ProProfilePageProps {
  params: { slug: string };
  searchParams: { data?: string; ora?: string };
}

// Rendering dinamico: il flusso di prenotazione legge ?data e ?ora.
export const dynamic = 'force-dynamic';

export function generateMetadata({ params }: ProProfilePageProps): Metadata {
  const pro = getProBySlug(params.slug);
  if (!pro) return { title: 'Professionista non trovato — Handy Pro' };
  return {
    title: `${pro.name} — ${pro.categoryLabel} a ${pro.city} | Handy Pro`,
    description: `${pro.specialization}. ${pro.reviewCount} recensioni verificate, ${pro.rating.toFixed(1)}/5. Prenota online.`,
  };
}

export default function ProProfilePage({ params, searchParams }: ProProfilePageProps) {
  const pro = getProBySlug(params.slug);
  if (!pro) notFound();

  const reviews = getReviewsByProId(pro.id);

  return (
    <ProProfileClient
      pro={pro}
      reviews={reviews}
      initialDate={searchParams.data}
      initialSlot={searchParams.ora}
    />
  );
}
