// NO box-shadow, NO border — naked layout per brand rules
import Link from 'next/link';
import { ShieldCheck, MapPin, Star, Euro } from 'lucide-react';
import type { PriceRange } from '@/types';

interface ProCardProps {
  id: string;
  slug: string;
  name: string;
  category: string;
  specialization: string;
  zona: string;
  priceRange: PriceRange;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  avatarUrl?: string;
}

const priceRangeLabel: Record<PriceRange, string> = {
  low: '€ — Economico',
  medium: '€€ — Media',
  high: '€€€ — Premium',
};

export default function ProCard({
  slug,
  name,
  category,
  specialization,
  zona,
  priceRange,
  rating,
  reviewCount,
  isVerified,
  avatarUrl,
}: ProCardProps) {
  return (
    // Naked card — no border, no shadow, no background surface
    <Link
      href={`/pro/${slug}`}
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
    >
      <article>
        {/* Avatar */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: avatarUrl ? undefined : 'var(--gradient-warm-mid)',
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            marginBottom: '14px',
          }}
        />

        {/* Name + verified badge row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            {name}
          </span>
          {isVerified && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#EEF4FF',
                color: 'var(--color-primary)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '32px',
              }}
            >
              <ShieldCheck size={11} />
              Verificato
            </span>
          )}
        </div>

        {/* Category eyebrow */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
            marginBottom: '6px',
          }}
        >
          {category}
        </p>

        {/* Specialization */}
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            color: 'var(--color-muted)',
            lineHeight: 1.5,
            marginBottom: '12px',
          }}
        >
          {specialization}
        </p>

        {/* Zona + Price row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '10px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: 'var(--color-muted)',
            }}
          >
            <MapPin size={14} color="var(--color-muted)" />
            {zona}
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: 'var(--color-muted)',
            }}
          >
            <Euro size={14} color="var(--color-muted)" />
            {priceRangeLabel[priceRange]}
          </span>
        </div>

        {/* Rating row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Star size={14} color="var(--color-accent)" fill="var(--color-accent)" />
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            {rating.toFixed(1)}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              color: 'var(--color-muted)',
            }}
          >
            ({reviewCount} {isVerified ? 'recensioni verificate' : 'recensioni'})
          </span>
        </div>
      </article>
    </Link>
  );
}
