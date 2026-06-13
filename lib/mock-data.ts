// ────────────────────────────────────────────────────────────────
// Handy Pro — Mock data (stile Doctolib)
// Professionisti, categorie, città e disponibilità deterministiche.
// Da sostituire con le chiamate API reali (lib/api.ts) in fase 2.
// ────────────────────────────────────────────────────────────────

import type { PriceRange } from '@/types';

export interface MockService {
  name: string;
  price: string;
}

export interface MockPro {
  id: string;
  slug: string;
  name: string;
  category: string; // slug categoria
  categoryLabel: string;
  specialization: string;
  address: string;
  city: string;
  zona: string;
  lat: number;
  lon: number;
  priceRange: PriceRange;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  yearsExperience: number;
  bio: string;
  services: MockService[];
  /** Colore avatar (iniziali su sfondo) */
  hue: number;
}

export interface MockCategory {
  slug: string;
  label: string;
  icon: string; // nome icona lucide
  description: string;
}

export const CATEGORIES: MockCategory[] = [
  { slug: 'idraulico', label: 'Idraulico', icon: 'Droplets', description: 'Perdite, caldaie, sanitari' },
  { slug: 'elettricista', label: 'Elettricista', icon: 'Zap', description: 'Impianti, guasti, domotica' },
  { slug: 'muratore', label: 'Muratore', icon: 'BrickWall', description: 'Ristrutturazioni, opere murarie' },
  { slug: 'falegname', label: 'Falegname', icon: 'Hammer', description: 'Mobili su misura, riparazioni' },
  { slug: 'giardiniere', label: 'Giardiniere', icon: 'Leaf', description: 'Potature, manutenzione verde' },
  { slug: 'imbianchino', label: 'Imbianchino', icon: 'PaintRoller', description: 'Tinteggiature, cartongesso' },
  { slug: 'climatizzazione', label: 'Climatizzazione', icon: 'Wind', description: 'Condizionatori, pompe di calore' },
  { slug: 'fabbro', label: 'Fabbro', icon: 'KeyRound', description: 'Serrature, infissi, urgenze' },
];

export const CITIES = [
  'Milano',
  'Roma',
  'Torino',
  'Bologna',
  'Firenze',
  'Napoli',
  'Monza',
  'Bergamo',
  'Brescia',
  'Sesto San Giovanni',
];

export const PROS: MockPro[] = [
  {
    id: 'p1', slug: 'mario-rossi-idraulico', name: 'Mario Rossi',
    category: 'idraulico', categoryLabel: 'Idraulico', specialization: 'Riparazioni caldaie e perdite',
    address: 'Via Vigevano 9', city: 'Milano', zona: 'Navigli',
    lat: 45.4522, lon: 9.1768, priceRange: 'medium', rating: 4.8, reviewCount: 127,
    isVerified: true, yearsExperience: 15,
    bio: 'Idraulico con 15 anni di esperienza, specializzato in caldaie e impianti di riscaldamento.',
    services: [
      { name: 'Uscita + diagnosi', price: '40 €' },
      { name: 'Riparazione perdita', price: 'da 80 €' },
      { name: 'Manutenzione caldaia', price: '90 €' },
    ],
    hue: 210,
  },
  {
    id: 'p2', slug: 'giovanni-ferrari-elettricista', name: 'Giovanni Ferrari',
    category: 'elettricista', categoryLabel: 'Elettricista', specialization: 'Impianti civili e domotica',
    address: 'Via Fiori Chiari 12', city: 'Milano', zona: 'Brera',
    lat: 45.4716, lon: 9.1874, priceRange: 'high', rating: 4.9, reviewCount: 89,
    isVerified: true, yearsExperience: 12,
    bio: 'Elettricista certificato, impianti civili, quadri elettrici e soluzioni domotiche.',
    services: [
      { name: 'Sopralluogo', price: 'Gratuito' },
      { name: 'Ricerca guasto', price: 'da 60 €' },
      { name: 'Punto luce nuovo', price: 'da 45 €' },
    ],
    hue: 30,
  },
  {
    id: 'p3', slug: 'lucia-bianchi-imbianchino', name: 'Lucia Bianchi',
    category: 'imbianchino', categoryLabel: 'Imbianchino', specialization: 'Tinteggiature e cartongesso',
    address: 'Viale Monza 55', city: 'Milano', zona: 'NoLo',
    lat: 45.4951, lon: 9.2266, priceRange: 'low', rating: 4.7, reviewCount: 64,
    isVerified: true, yearsExperience: 8,
    bio: 'Tinteggiature interne ed esterne, controsoffitti e pareti in cartongesso. Preventivi rapidi.',
    services: [
      { name: 'Preventivo a domicilio', price: 'Gratuito' },
      { name: 'Tinteggiatura (a mq)', price: 'da 6 €' },
      { name: 'Parete cartongesso', price: 'da 35 €/mq' },
    ],
    hue: 280,
  },
  {
    id: 'p4', slug: 'antonio-greco-muratore', name: 'Antonio Greco',
    category: 'muratore', categoryLabel: 'Muratore', specialization: 'Ristrutturazioni complete',
    address: 'Via Padova 120', city: 'Milano', zona: 'Loreto',
    lat: 45.4933, lon: 9.2231, priceRange: 'medium', rating: 4.6, reviewCount: 41,
    isVerified: false, yearsExperience: 20,
    bio: 'Impresa familiare specializzata in ristrutturazioni di appartamenti e bagni.',
    services: [
      { name: 'Sopralluogo + preventivo', price: 'Gratuito' },
      { name: 'Rifacimento bagno', price: 'da 3.500 €' },
      { name: 'Demolizione tramezzo', price: 'da 250 €' },
    ],
    hue: 15,
  },
  {
    id: 'p5', slug: 'elena-conti-giardiniere', name: 'Elena Conti',
    category: 'giardiniere', categoryLabel: 'Giardiniere', specialization: 'Potature e progettazione verde',
    address: 'Via Washington 70', city: 'Milano', zona: 'Wagner',
    lat: 45.4623, lon: 9.1498, priceRange: 'medium', rating: 5.0, reviewCount: 38,
    isVerified: true, yearsExperience: 10,
    bio: 'Manutenzione giardini e terrazzi, potature in tree climbing, impianti di irrigazione.',
    services: [
      { name: 'Sopralluogo', price: 'Gratuito' },
      { name: 'Manutenzione giardino', price: 'da 35 €/h' },
      { name: 'Potatura siepe', price: 'da 80 €' },
    ],
    hue: 130,
  },
  {
    id: 'p6', slug: 'franco-moretti-falegname', name: 'Franco Moretti',
    category: 'falegname', categoryLabel: 'Falegname', specialization: 'Mobili su misura',
    address: 'Via Savona 33', city: 'Milano', zona: 'Tortona',
    lat: 45.4513, lon: 9.1622, priceRange: 'high', rating: 4.9, reviewCount: 52,
    isVerified: true, yearsExperience: 25,
    bio: 'Falegnameria artigianale: armadi su misura, librerie, restauro mobili antichi.',
    services: [
      { name: 'Consulenza + misure', price: 'Gratuito' },
      { name: 'Riparazione mobile', price: 'da 70 €' },
      { name: 'Armadio su misura', price: 'su preventivo' },
    ],
    hue: 35,
  },
  {
    id: 'p7', slug: 'salvatore-russo-climatizzazione', name: 'Salvatore Russo',
    category: 'climatizzazione', categoryLabel: 'Climatizzazione', specialization: 'Installazione condizionatori',
    address: 'Corso Lodi 14', city: 'Milano', zona: 'Porta Romana',
    lat: 45.4445, lon: 9.2042, priceRange: 'medium', rating: 4.7, reviewCount: 93,
    isVerified: true, yearsExperience: 14,
    bio: 'Installazione e manutenzione climatizzatori, pompe di calore, certificazione F-Gas.',
    services: [
      { name: 'Sopralluogo', price: 'Gratuito' },
      { name: 'Installazione mono-split', price: 'da 180 €' },
      { name: 'Ricarica gas + sanificazione', price: 'da 100 €' },
    ],
    hue: 195,
  },
  {
    id: 'p8', slug: 'davide-colombo-fabbro', name: 'Davide Colombo',
    category: 'fabbro', categoryLabel: 'Fabbro', specialization: 'Aperture porte e serrature',
    address: 'Via Cenisio 21', city: 'Milano', zona: 'Sempione',
    lat: 45.4862, lon: 9.1657, priceRange: 'medium', rating: 4.5, reviewCount: 156,
    isVerified: true, yearsExperience: 9,
    bio: 'Pronto intervento 7/7 per aperture porte, sostituzione serrature e messa in sicurezza.',
    services: [
      { name: 'Apertura porta (no scasso)', price: 'da 80 €' },
      { name: 'Sostituzione serratura', price: 'da 120 €' },
      { name: 'Cilindro europeo', price: 'da 90 €' },
    ],
    hue: 0,
  },
  {
    id: 'p9', slug: 'paolo-esposito-idraulico', name: 'Paolo Esposito',
    category: 'idraulico', categoryLabel: 'Idraulico', specialization: 'Bagni e sanitari',
    address: 'Via Ripamonti 88', city: 'Milano', zona: 'Vigentino',
    lat: 45.4338, lon: 9.2003, priceRange: 'low', rating: 4.4, reviewCount: 73,
    isVerified: false, yearsExperience: 7,
    bio: 'Installazione sanitari, sostituzione rubinetterie, piccole riparazioni a prezzi onesti.',
    services: [
      { name: 'Uscita', price: '30 €' },
      { name: 'Sostituzione miscelatore', price: 'da 60 €' },
      { name: 'Installazione sanitari', price: 'da 120 €' },
    ],
    hue: 250,
  },
  {
    id: 'p10', slug: 'marta-villa-elettricista', name: 'Marta Villa',
    category: 'elettricista', categoryLabel: 'Elettricista', specialization: 'Guasti e messa a norma',
    address: 'Via Solari 40', city: 'Milano', zona: 'Solari',
    lat: 45.4541, lon: 9.1633, priceRange: 'medium', rating: 4.8, reviewCount: 47,
    isVerified: true, yearsExperience: 11,
    bio: 'Interventi rapidi su guasti elettrici, certificazioni di conformità, salvavita e quadri.',
    services: [
      { name: 'Ricerca guasto', price: 'da 50 €' },
      { name: 'Sostituzione salvavita', price: 'da 70 €' },
      { name: 'Dichiarazione conformità', price: 'da 150 €' },
    ],
    hue: 320,
  },
  {
    id: 'p11', slug: 'luca-fontana-giardiniere', name: 'Luca Fontana',
    category: 'giardiniere', categoryLabel: 'Giardiniere', specialization: 'Manutenzione condomini',
    address: 'Viale Fulvio Testi 2', city: 'Sesto San Giovanni', zona: 'Sesto Marelli',
    lat: 45.5339, lon: 9.2238, priceRange: 'low', rating: 4.3, reviewCount: 29,
    isVerified: false, yearsExperience: 6,
    bio: 'Manutenzione aree verdi condominiali e private, taglio prato, smaltimento residui incluso.',
    services: [
      { name: 'Taglio prato', price: 'da 40 €' },
      { name: 'Manutenzione mensile', price: 'su preventivo' },
    ],
    hue: 100,
  },
  {
    id: 'p12', slug: 'roberta-galli-imbianchino', name: 'Roberta Galli',
    category: 'imbianchino', categoryLabel: 'Imbianchino', specialization: 'Decorazioni e finiture di pregio',
    address: 'Via Carlo Farini 60', city: 'Milano', zona: 'Isola',
    lat: 45.4905, lon: 9.1818, priceRange: 'high', rating: 4.9, reviewCount: 58,
    isVerified: true, yearsExperience: 13,
    bio: 'Finiture decorative, velature, resine e microcemento. Portfolio disponibile su richiesta.',
    services: [
      { name: 'Consulenza colore', price: '50 €' },
      { name: 'Tinteggiatura premium (a mq)', price: 'da 12 €' },
      { name: 'Parete in resina', price: 'su preventivo' },
    ],
    hue: 340,
  },
];

// ── Recensioni verificate ────────────────────────────────────────

export interface MockReview {
  id: string;
  proId: string;
  reviewerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  jobLabel: string; // tipo di lavoro confermato
  monthsAgo: number;
}

export const REVIEWS: MockReview[] = [
  { id: 'r1', proId: 'p1', reviewerName: 'Federica M.', rating: 5, jobLabel: 'Manutenzione caldaia', monthsAgo: 1, text: 'Puntualissimo e molto chiaro nello spiegare il problema. La caldaia ora funziona perfettamente. Prezzo onesto, come da preventivo.' },
  { id: 'r2', proId: 'p1', reviewerName: 'Luca T.', rating: 5, jobLabel: 'Riparazione perdita', monthsAgo: 2, text: 'Trovata e riparata una perdita che altri due idraulici non erano riusciti a individuare. Consigliatissimo.' },
  { id: 'r3', proId: 'p1', reviewerName: 'Anna R.', rating: 4, jobLabel: 'Sostituzione miscelatore', monthsAgo: 4, text: 'Lavoro pulito e veloce. Unico appunto: è arrivato con 20 minuti di ritardo, ma ha avvisato per tempo.' },
  { id: 'r4', proId: 'p2', reviewerName: 'Marco B.', rating: 5, jobLabel: 'Ricerca guasto', monthsAgo: 1, text: 'Guasto trovato in mezz\'ora dopo un weekend senza corrente in cucina. Professionale e ordinato.' },
  { id: 'r5', proId: 'p2', reviewerName: 'Silvia P.', rating: 5, jobLabel: 'Punto luce nuovo', monthsAgo: 3, text: 'Ha installato tre punti luce e sistemato il quadro. Preciso, pulito, prezzi chiari fin da subito.' },
  { id: 'r6', proId: 'p3', reviewerName: 'Giorgio V.', rating: 5, jobLabel: 'Tinteggiatura appartamento', monthsAgo: 1, text: 'Appartamento di 80mq tinteggiato in due giorni, angoli perfetti e zero schizzi. Bravissima.' },
  { id: 'r7', proId: 'p3', reviewerName: 'Elisa C.', rating: 4, jobLabel: 'Parete cartongesso', monthsAgo: 5, text: 'Buon lavoro sulla parete divisoria. Qualche giorno di attesa in più rispetto al previsto.' },
  { id: 'r8', proId: 'p5', reviewerName: 'Roberto N.', rating: 5, jobLabel: 'Potatura siepe', monthsAgo: 2, text: 'Giardino rimesso a nuovo, ha portato via tutti i residui. Tornerà ogni stagione.' },
  { id: 'r9', proId: 'p6', reviewerName: 'Chiara D.', rating: 5, jobLabel: 'Armadio su misura', monthsAgo: 3, text: 'Armadio a muro stupendo, incastrato al millimetro in una nicchia difficile. Artigiano vero.' },
  { id: 'r10', proId: 'p7', reviewerName: 'Paolo G.', rating: 5, jobLabel: 'Installazione mono-split', monthsAgo: 1, text: 'Installazione rapida e pulita, ha spiegato tutto sul mantenimento. Molto disponibile.' },
  { id: 'r11', proId: 'p8', reviewerName: 'Martina L.', rating: 4, jobLabel: 'Sostituzione serratura', monthsAgo: 1, text: 'Intervento in giornata dopo un tentativo di effrazione. Rapido e rassicurante.' },
  { id: 'r12', proId: 'p10', reviewerName: 'Davide F.', rating: 5, jobLabel: 'Sostituzione salvavita', monthsAgo: 2, text: 'Arrivata in poche ore, problema risolto e certificazione rilasciata. Super.' },
];

export function getReviewsByProId(proId: string): MockReview[] {
  return REVIEWS.filter((r) => r.proId === proId);
}

// ── Disponibilità (slot stile Doctolib) ─────────────────────────

export interface DayAvailability {
  date: Date;
  slots: string[];
}

const ALL_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
];

/** Hash deterministico — evita Math.random per non rompere l'hydration SSR. */
function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
}

/**
 * Genera la disponibilità per i prossimi `days` giorni.
 * Deterministica per (proId, data) — stabile tra server e client.
 */
export function getAvailability(proId: string, days = 14): DayAvailability[] {
  const result: DayAvailability[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = 0; d < days; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dayKey = `${proId}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const seed = hash(dayKey);

    // Domenica: chiuso. Sabato: pochi slot.
    const dow = date.getDay();
    if (dow === 0) {
      result.push({ date, slots: [] });
      continue;
    }

    const maxSlots = dow === 6 ? 3 : 6;
    const slotCount = seed % (maxSlots + 1); // 0..maxSlots
    const slots: string[] = [];
    for (let i = 0; i < slotCount; i++) {
      const idx = (seed + i * 7) % ALL_SLOTS.length;
      if (!slots.includes(ALL_SLOTS[idx])) slots.push(ALL_SLOTS[idx]);
    }
    slots.sort();
    result.push({ date, slots });
  }
  return result;
}

/** Prima disponibilità utile di un professionista (per ordinamento/etichetta). */
export function getNextAvailability(proId: string): { date: Date; slot: string } | null {
  const days = getAvailability(proId, 21);
  for (const day of days) {
    if (day.slots.length > 0) {
      return { date: day.date, slot: day.slots[0] };
    }
  }
  return null;
}

// ── Prenotazioni utente (mock) ───────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'completed';

export interface MockBooking {
  id: string;
  proId: string;
  service: string;
  /** Giorni rispetto a oggi: negativi = passato */
  dayOffset: number;
  slot: string;
  status: BookingStatus;
  reviewed: boolean;
}

export const USER_BOOKINGS: MockBooking[] = [
  { id: 'b1', proId: 'p1', service: 'Manutenzione caldaia', dayOffset: 3, slot: '09:30', status: 'confirmed', reviewed: false },
  { id: 'b2', proId: 'p7', service: 'Sopralluogo', dayOffset: 6, slot: '15:00', status: 'pending', reviewed: false },
  { id: 'b3', proId: 'p3', service: 'Preventivo a domicilio', dayOffset: -4, slot: '10:00', status: 'completed', reviewed: false },
  { id: 'b4', proId: 'p8', service: 'Sostituzione serratura', dayOffset: -21, slot: '17:30', status: 'completed', reviewed: true },
];

export function getBookingDate(b: MockBooking): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + b.dayOffset);
  return d;
}

// ── Dashboard professionista (mock — pro loggato: p1 Mario Rossi) ─

export type RequestStatus = 'pending' | 'accepted';

export interface MockProRequest {
  id: string;
  clientName: string;
  service: string;
  /** Giorni rispetto a oggi */
  dayOffset: number;
  slot: string;
  note?: string;
  zona: string;
  status: RequestStatus;
}

export const PRO_REQUESTS: MockProRequest[] = [
  { id: 'q1', clientName: 'Giulia Ferri', service: 'Riparazione perdita', dayOffset: 1, slot: '09:00', zona: 'Navigli', status: 'pending', note: 'Perdita sotto il lavello della cucina, si è allagato il mobile.' },
  { id: 'q2', clientName: 'Stefano Riva', service: 'Manutenzione caldaia', dayOffset: 2, slot: '14:30', zona: 'Tortona', status: 'pending', note: 'Caldaia Vaillant, ultima revisione due anni fa.' },
  { id: 'q3', clientName: 'Carla Negri', service: 'Uscita + diagnosi', dayOffset: 4, slot: '11:00', zona: 'Porta Genova', status: 'pending' },
  { id: 'q4', clientName: 'Andrea Sala', service: 'Manutenzione caldaia', dayOffset: 3, slot: '09:30', zona: 'Navigli', status: 'accepted' },
  { id: 'q5', clientName: 'Paola Marchetti', service: 'Riparazione perdita', dayOffset: 5, slot: '16:00', zona: 'Solari', status: 'accepted', note: 'Termosifone del bagno che gocciola dalla valvola.' },
  { id: 'q6', clientName: 'Luca Barone', service: 'Uscita + diagnosi', dayOffset: 8, slot: '08:30', zona: 'Navigli', status: 'accepted' },
];

export function getRequestDate(r: MockProRequest): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + r.dayOffset);
  return d;
}

/** Statistiche settimanali mock per la dashboard pro */
export const PRO_STATS = {
  profileViews: 86,
  viewsTrend: '+24%',
  searchAppearances: 312,
  newRequests: 3,
};

// ── Ricerca mock ─────────────────────────────────────────────────

export interface MockSearchFilters {
  category?: string;
  city?: string;
  priceRange?: PriceRange;
  verifiedOnly?: boolean;
}

export function searchPros(filters: MockSearchFilters): MockPro[] {
  return PROS.filter((p) => {
    if (filters.category && p.category !== filters.category) return false;
    if (
      filters.city &&
      !p.city.toLowerCase().includes(filters.city.toLowerCase()) &&
      !p.zona.toLowerCase().includes(filters.city.toLowerCase())
    )
      return false;
    if (filters.priceRange && p.priceRange !== filters.priceRange) return false;
    if (filters.verifiedOnly && !p.isVerified) return false;
    return true;
  }).sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
}

export function getProBySlug(slug: string): MockPro | undefined {
  return PROS.find((p) => p.slug === slug);
}

// ── Formattazione date (it-IT) ───────────────────────────────────

const DAY_NAMES = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
const MONTH_NAMES = [
  'gen', 'feb', 'mar', 'apr', 'mag', 'giu',
  'lug', 'ago', 'set', 'ott', 'nov', 'dic',
];

export function formatDayShort(date: Date): { dayName: string; dayNum: string } {
  return {
    dayName: DAY_NAMES[date.getDay()],
    dayNum: `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`,
  };
}

export function formatDayLong(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Oggi';
  if (diff === 1) return 'Domani';
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}
