// ────────────────────────────────────────────────────────────────
// Handy Pro — Shared TypeScript types
// These mirror the backend DB schema and API response shapes.
// ────────────────────────────────────────────────────────────────

// ── Enums ────────────────────────────────────────────────────────

export type UserRole = 'privato' | 'professionista';

export type PriceRange = 'low' | 'medium' | 'high';

export type SubscriptionPlan = 'free' | 'vetrina' | 'boost';

// ── Core entities ────────────────────────────────────────────────

export interface User {
  id: string; // UUID
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO 8601
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  specializations: string[];
}

export interface Professional {
  id: string; // UUID
  userId: string;
  slug: string;
  firstName: string;
  lastName: string;
  category: string; // matches Category.slug
  specialization: string;
  bio?: string;
  priceRange: PriceRange;
  /** GeoJSON point or WKT string from PostGIS — use only in backend types */
  operativeZoneGeoJson?: unknown;
  /** Human-readable zone label for display */
  operativeZoneLabel: string;
  isVerified: boolean;
  subscriptionPlan: SubscriptionPlan;
  rating?: number;
  reviewCount?: number;
  avatarUrl?: string;
}

export interface Review {
  id: string; // UUID
  professionalId: string;
  userId: string;
  jobId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  isVerified: boolean; // only true if linked to a confirmed Job
  createdAt: string; // ISO 8601
  /** Populated from join — reviewer display name */
  reviewerName?: string;
}

export interface Job {
  id: string; // UUID
  professionalId: string;
  userId: string;
  completedAt: string; // ISO 8601
  isConfirmed: boolean; // both parties confirmed — unlocks review creation
}

export interface Subscription {
  id: string; // UUID
  professionalId: string;
  plan: SubscriptionPlan;
  expiresAt: string | null; // null for free plan
  isActive: boolean;
  createdAt: string;
}

// ── API request / response shapes ────────────────────────────────

export interface SearchParams {
  lat?: number;
  lon?: number;
  radius?: number; // km
  category?: string;
  specialization?: string;
  priceRange?: PriceRange;
}

export interface SearchResult {
  professionals: Professional[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  token: string;
  user: Pick<User, 'id' | 'email' | 'role' | 'firstName' | 'lastName'> & {
    location?: string;
    proSlug?: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  location?: string;
  // Fields for professionista only:
  category?: string;
  specialization?: string;
  priceRange?: PriceRange;
  operativeZone?: string;
}
