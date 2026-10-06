import Link from 'next/link';
import { cn } from '@/lib/utils';

type ButtonVariant = 'outline-dark' | 'outline-white' | 'solid-orange';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  arrow?: boolean;
  href?: string;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  'outline-dark': {
    border: '1.5px solid #0D0D0D',
    background: 'transparent',
    color: '#0D0D0D',
  },
  'outline-white': {
    border: '1.5px solid rgba(255,255,255,0.5)',
    background: 'transparent',
    color: '#ffffff',
  },
  'solid-orange': {
    border: 'none',
    background: '#FF6600',
    color: '#ffffff',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '8px 20px', fontSize: '13px' },
  md: { padding: '12px 28px', fontSize: '15px' },
  lg: { padding: '14px 32px', fontSize: '16px' },
};

export default function Button({
  variant = 'outline-dark',
  size = 'md',
  arrow = false,
  href,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '32px',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    lineHeight: 1,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'opacity 0.15s ease, background 0.15s ease',
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  const content = (
    <>
      {children}
      {arrow && <span aria-hidden>→</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} style={baseStyle} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button style={baseStyle} className={className} {...props}>
      {content}
    </button>
  );
}
