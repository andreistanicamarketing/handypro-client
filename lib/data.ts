// ────────────────────────────────────────────────────────────────
// Data layer reale: chiama il backend (lib/api.ts) e mappa i DTO
// nelle forme usate dalla UI (sostituisce il vecchio layer mock).
// ────────────────────────────────────────────────────────────────

import { ApiError, apiFetch, apiFetchAuth } from '@/lib/api';
import { categoryLabel } from '@/lib/categories';
import type { PriceRange } from '@/types';

// ── Tipi UI ──────────────────────────────────────────────────────

export interface Service {
  id: string;
  name: string;
  price: string;
}

export interface Pro {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  specialization: string;
  bio?: string;
  address?: string;
  city: string;
  zona: string;
  lat: number | null;
  lon: number | null;
  priceRange: PriceRange;
  isVerified: boolean;
  /** null = nessuna recensione ("Nuovo") */
  rating: number | null;
  reviewCount: number;
  yearsExperience: number;
  services: Service[];
  hue: number;
}

export interface DayAvailability {
  date: Date;
  slots: string[];
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  text: string;
  isVerified: boolean;
  createdAt: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface UserBooking {
  id: string;
  professionalId: string;
  proName: string;
  proSlug: string;
  service: string;
  date: Date;
  slot: string;
  note?: string;
  status: BookingStatus;
  reviewed: boolean;
}

export interface ProRequest {
  id: string;
  clientName: string;
  service: string;
  date: Date;
  slot: string;
  note?: string;
  status: BookingStatus;
}

// ── DTO backend (forma dei JSON) ─────────────────────────────────

interface ProfessionalDto {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  category: string;
  specialization: string;
  bio?: string;
  priceRange: PriceRange;
  operativeZoneLabel: string;
  city: string;
  address?: string;
  yearsExperience: number;
  lat?: number | null;
  lon?: number | null;
  isVerified: boolean;
  rating?: number | null;
  reviewCount: number;
  services: { id: string; name: string; priceLabel: string; sortOrder: number }[];
}

interface BookingDto {
  id: string;
  professionalId: string;
  professionalName: string;
  professionalSlug: string;
  clientName: string;
  serviceName?: string | null;
  date: string; // yyyy-MM-dd
  slot: string; // HH:mm
  note?: string | null;
  status: BookingStatus;
  reviewed: boolean;
}

interface ReviewDto {
  id: string;
  reviewerName: string;
  rating: number;
  text: string;
  isVerified: boolean;
  createdAt: string;
}

// ── Helper puri ──────────────────────────────────────────────────

/** Hash deterministico (come il vecchio mock) → hue stabile per slug. */
export function hueFromSlug(slug: string): number {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) h = (h * 33) ^ slug.charCodeAt(i);
  return Math.abs(h) % 360;
}

/** "yyyy-MM-dd" → Date locale (mai UTC: evita slittamenti di giorno). */
export function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Primo giorno con slot, dai dati già caricati. */
export function nextAvailability(days: DayAvailability[]): { date: Date; slot: string } | null {
  const day = days.find((d) => d.slots.length > 0);
  return day ? { date: day.date, slot: day.slots[0] } : null;
}

function toPro(dto: ProfessionalDto): Pro {
  return {
    id: dto.id,
    slug: dto.slug,
    name: `${dto.firstName} ${dto.lastName}`.trim(),
    category: dto.category,
    categoryLabel: categoryLabel(dto.category),
    specialization: dto.specialization,
    bio: dto.bio ?? undefined,
    address: dto.address ?? undefined,
    city: dto.city,
    zona: dto.operativeZoneLabel.split(',')[0]?.trim() ?? dto.operativeZoneLabel,
    lat: dto.lat ?? null,
    lon: dto.lon ?? null,
    priceRange: dto.priceRange,
    isVerified: dto.isVerified,
    rating: dto.rating ?? null,
    reviewCount: dto.reviewCount,
    yearsExperience: dto.yearsExperience,
    services: [...dto.services]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({ id: s.id, name: s.name, price: s.priceLabel })),
    hue: hueFromSlug(dto.slug),
  };
}

function toUserBooking(dto: BookingDto): UserBooking {
  return {
    id: dto.id,
    professionalId: dto.professionalId,
    proName: dto.professionalName,
    proSlug: dto.professionalSlug,
    service: dto.serviceName ?? 'Intervento',
    date: parseLocalDate(dto.date),
    slot: dto.slot,
    note: dto.note ?? undefined,
    status: dto.status,
    reviewed: dto.reviewed,
  };
}

function toProRequest(dto: BookingDto): ProRequest {
  return {
    id: dto.id,
    clientName: dto.clientName,
    service: dto.serviceName ?? 'Intervento',
    date: parseLocalDate(dto.date),
    slot: dto.slot,
    note: dto.note ?? undefined,
    status: dto.status,
  };
}

// ── Catalogo pubblico ────────────────────────────────────────────

export interface SearchFilters {
  city?: string;
  category?: string;
  priceRange?: PriceRange;
  verifiedOnly?: boolean;
}

export async function searchPros(filters: SearchFilters = {}): Promise<{ pros: Pro[]; total: number }> {
  const params = new URLSearchParams({ pageSize: '50' });
  if (filters.city) params.set('city', filters.city);
  if (filters.category) params.set('category', filters.category);
  if (filters.priceRange) params.set('priceRange', filters.priceRange);
  if (filters.verifiedOnly) params.set('verifiedOnly', 'true');
  const res = await apiFetch<{ professionals: ProfessionalDto[]; total: number }>(
    `/ricerca?${params.toString()}`
  );
  return { pros: res.professionals.map(toPro), total: res.total };
}

export async function getProBySlug(slug: string): Promise<Pro | null> {
  try {
    return toPro(await apiFetch<ProfessionalDto>(`/professionisti/${slug}`));
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function getReviews(slug: string): Promise<Review[]> {
  const res = await apiFetch<{ items: ReviewDto[] }>(
    `/professionisti/${slug}/recensioni?pageSize=20`
  );
  return res.items.map((r) => ({
    id: r.id,
    reviewerName: r.reviewerName,
    rating: r.rating,
    text: r.text,
    isVerified: r.isVerified,
    createdAt: new Date(r.createdAt),
  }));
}

export async function getAvailability(slug: string, days = 14): Promise<DayAvailability[]> {
  const res = await apiFetch<{ date: string; slots: string[] }[]>(
    `/professionisti/${slug}/disponibilita?days=${days}`
  );
  return res.map((d) => ({ date: parseLocalDate(d.date), slots: d.slots }));
}

// ── Prenotazioni e recensioni (autenticate) ──────────────────────

export interface CreateBookingInput {
  professionalId: string;
  serviceItemId?: string;
  date: string; // yyyy-MM-dd
  slot: string; // HH:mm
  note?: string;
}

export async function createBooking(token: string, input: CreateBookingInput): Promise<void> {
  await apiFetchAuth('/prenotazioni', token, { method: 'POST', body: JSON.stringify(input) });
}

export async function getMyBookings(token: string): Promise<UserBooking[]> {
  return (await apiFetchAuth<BookingDto[]>('/prenotazioni/mie', token)).map(toUserBooking);
}

export async function getProBookings(token: string): Promise<ProRequest[]> {
  return (await apiFetchAuth<BookingDto[]>('/prenotazioni/pro', token)).map(toProRequest);
}

export async function confirmBooking(token: string, id: string): Promise<void> {
  await apiFetchAuth(`/prenotazioni/${id}/conferma`, token, { method: 'PATCH' });
}

export async function completeBooking(token: string, id: string): Promise<void> {
  await apiFetchAuth(`/prenotazioni/${id}/completa`, token, { method: 'PATCH' });
}

export async function cancelBooking(token: string, id: string): Promise<void> {
  await apiFetchAuth(`/prenotazioni/${id}/annulla`, token, { method: 'PATCH' });
}

export async function createReview(
  token: string,
  input: { bookingId: string; rating: number; text: string }
): Promise<void> {
  await apiFetchAuth('/recensioni', token, { method: 'POST', body: JSON.stringify(input) });
}
