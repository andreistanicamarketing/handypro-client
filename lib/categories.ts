// Categorie e città statiche: metadati puramente UI (icone lucide, descrizioni).
// Gli slug coincidono con il seed del backend (DbSeeder.cs).

export interface Category {
  slug: string;
  label: string;
  icon: string; // nome icona lucide
  description: string;
}

export const CATEGORIES: Category[] = [
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
  'Milano', 'Roma', 'Torino', 'Bologna', 'Firenze',
  'Napoli', 'Monza', 'Bergamo', 'Brescia', 'Sesto San Giovanni',
];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
