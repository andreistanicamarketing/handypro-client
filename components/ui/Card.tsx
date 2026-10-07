import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Superficie base del design system: bianco su cream, bordo `line`, ombra `chip`.
// Il padding si passa via className (tipicamente p-4 / p-5 md:p-6).

export const cardClass = 'rounded-card border border-line bg-white shadow-chip';

export default function Card({
  as: Tag = 'div',
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { as?: 'div' | 'section' | 'li' | 'aside' }) {
  return <Tag {...props} className={cn(cardClass, className)} />;
}
