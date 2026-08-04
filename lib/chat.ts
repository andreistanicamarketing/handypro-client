// ────────────────────────────────────────────────────────────────
// Chat per prenotazione: un thread = una Booking. Stesso adapter
// pattern di lib/data.ts.
// ────────────────────────────────────────────────────────────────

import { apiFetchAuth } from '@/lib/api';

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  body: string;
  createdAt: Date;
  readAt: Date | null;
}

export interface UnreadCount {
  bookingId: string;
  count: number;
}

interface MessageDto {
  id: string;
  bookingId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt?: string | null;
}

interface UnreadCountDto {
  bookingId: string;
  count: number;
}

function toMessage(dto: MessageDto): Message {
  return {
    id: dto.id,
    bookingId: dto.bookingId,
    senderId: dto.senderId,
    body: dto.body,
    createdAt: new Date(dto.createdAt),
    readAt: dto.readAt ? new Date(dto.readAt) : null,
  };
}

export async function getMessages(token: string, bookingId: string, since?: Date): Promise<Message[]> {
  const query = since ? `?since=${encodeURIComponent(since.toISOString())}` : '';
  const dtos = await apiFetchAuth<MessageDto[]>(`/prenotazioni/${bookingId}/messaggi${query}`, token);
  return dtos.map(toMessage);
}

export async function sendMessage(token: string, bookingId: string, testo: string): Promise<Message> {
  const dto = await apiFetchAuth<MessageDto>(`/prenotazioni/${bookingId}/messaggi`, token, {
    method: 'POST',
    body: JSON.stringify({ testo }),
  });
  return toMessage(dto);
}

export async function markRead(token: string, bookingId: string): Promise<void> {
  await apiFetchAuth(`/prenotazioni/${bookingId}/messaggi/letti`, token, { method: 'POST' });
}

export async function getUnreadCounts(token: string): Promise<UnreadCount[]> {
  const dtos = await apiFetchAuth<UnreadCountDto[]>('/messaggi/non-letti', token);
  return dtos.map((d) => ({ bookingId: d.bookingId, count: d.count }));
}
