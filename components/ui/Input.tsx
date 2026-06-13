import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export default function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'var(--color-muted)',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn('handy-input', className)}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          fontWeight: 400,
          color: 'var(--color-text)',
          background: '#ffffff',
          border: error ? '1.5px solid #EF4444' : '1px solid var(--color-hairline)',
          borderRadius: '8px',
          padding: '12px 16px',
          width: '100%',
          outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary)';
          e.currentTarget.style.borderWidth = '2px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--color-hairline)';
          e.currentTarget.style.borderWidth = error ? '1.5px' : '1px';
        }}
        {...props}
      />
      {error && (
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            color: '#EF4444',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
