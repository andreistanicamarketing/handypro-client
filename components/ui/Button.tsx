import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps } from 'react';
import { cn } from '@/lib/utils';

// Bottone del design system "Bottega".
// Con `href` diventa un <Link> con lo stesso aspetto.

const VARIANTS = {
  /** CTA principale — gradiente ember, una per schermata */
  primary: 'bg-ember-gradient text-white',
  /** Azione forte ma secondaria — inchiostro pieno */
  dark: 'bg-ink text-white',
  /** Alternativa neutra accanto a una primary */
  outline: 'border border-line bg-white text-ink',
  /** Azione su card (es. "Vedi profilo") — si riempie d'inchiostro all'hover */
  subtle: 'border border-ink/15 text-ink hover:bg-ink hover:text-white',
  /** Azione di servizio poco enfatizzata */
  muted: 'border border-line text-ink-mute hover:border-ink/30 hover:text-ink',
  /** Azione distruttiva (annulla, esci) — rossa solo all'hover */
  danger: 'border border-line text-ink-mute hover:border-red-300 hover:text-red-500',
} as const;

const SIZES = {
  lg: 'h-12 rounded-2xl px-6 text-[15px]',
  md: 'h-11 rounded-2xl px-5 text-[14px]',
  sm: 'h-10 rounded-xl px-4 text-[13px]',
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

type ButtonProps = StyleProps &
  (
    | ({ href: string } & Omit<ComponentProps<typeof Link>, 'href' | 'className'>)
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>)
  );

export function buttonClass({ variant = 'primary', size = 'lg', className }: StyleProps = {}) {
  return cn(
    'pressable inline-flex items-center justify-center gap-2 font-bold disabled:opacity-40',
    SIZES[size],
    VARIANTS[variant],
    className
  );
}

export default function Button({ variant, size, className, ...props }: ButtonProps) {
  const cls = buttonClass({ variant, size, className });
  if (props.href !== undefined) return <Link {...props} className={cls} />;
  const { type = 'button', ...rest } = props;
  return <button type={type} {...rest} className={cls} />;
}

/** Bottone tondo solo-icona (chiudi, indietro). `aria-label` obbligatorio. */
export function IconButton({
  className,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & { 'aria-label': string }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'pressable flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-mute hover:bg-sand hover:text-ink',
        className
      )}
    />
  );
}
