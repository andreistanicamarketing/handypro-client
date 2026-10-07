// Categorie e città statiche: metadati puramente UI (icone lucide, descrizioni).
// Gli slug coincidono con il seed del backend (DbSeeder.cs).

export interface Category {
  slug: string;
  label: string;
  icon: string; // nome icona lucide
  description: string;
  /** "5 idraulici" */
  plural: string;
  /** Etichetta per le tile strette (griglia home mobile) */
  short?: string;
}

export const CATEGORIES: Category[] = [
  { slug: 'idraulico', label: 'Idraulico', icon: 'Droplets', description: 'Perdite, caldaie, sanitari', plural: 'idraulici' },
  { slug: 'elettricista', label: 'Elettricista', icon: 'Zap', description: 'Impianti, guasti, domotica', plural: 'elettricisti' },
  { slug: 'muratore', label: 'Muratore', icon: 'BrickWall', description: 'Ristrutturazioni, opere murarie', plural: 'muratori' },
  { slug: 'falegname', label: 'Falegname', icon: 'Hammer', description: 'Mobili su misura, riparazioni', plural: 'falegnami' },
  { slug: 'giardiniere', label: 'Giardiniere', icon: 'Leaf', description: 'Potature, manutenzione verde', plural: 'giardinieri' },
  { slug: 'imbianchino', label: 'Imbianchino', icon: 'PaintRoller', description: 'Tinteggiature, cartongesso', plural: 'imbianchini' },
  { slug: 'climatizzazione', label: 'Climatizzazione', icon: 'Wind', description: 'Condizionatori, pompe di calore', plural: 'tecnici clima', short: 'Clima' },
  { slug: 'fabbro', label: 'Fabbro', icon: 'KeyRound', description: 'Serrature, infissi, urgenze', plural: 'fabbri' },
];

// Centro città [lat, lon]: riferimento per la distanza nelle card risultato.
export const CITY_CENTERS: Record<string, [number, number]> = {
  Milano: [45.4642, 9.19],
  Roma: [41.9028, 12.4964],
  Torino: [45.0703, 7.6869],
  Bologna: [44.4949, 11.3426],
  Firenze: [43.7696, 11.2558],
  Napoli: [40.8518, 14.2681],
  Monza: [45.5845, 9.2744],
  Bergamo: [45.6983, 9.6773],
  Brescia: [45.5416, 10.2118],
  'Sesto San Giovanni': [45.5362, 9.2359],
};

export const CITIES = Object.keys(CITY_CENTERS);

/** Centro della città cercata (match case-insensitive), se la conosciamo. */
export function cityCenter(name: string): [number, number] | null {
  const key = Object.keys(CITY_CENTERS).find((c) => c.toLowerCase() === name.trim().toLowerCase());
  return key ? CITY_CENTERS[key] : null;
}

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
