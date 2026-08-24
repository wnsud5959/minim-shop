import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/format';

type Variant = 'primary' | 'secondary' | 'accent' | 'text';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-ink-800 text-ink-0 hover:bg-ink-900 disabled:bg-ink-200 disabled:text-ink-400',
  secondary:
    'bg-ink-0 text-ink-800 border border-ink-300 hover:border-ink-900 disabled:border-ink-200 disabled:text-ink-400',
  accent: 'bg-olive-500 text-ink-0 hover:bg-olive-600 disabled:bg-ink-200 disabled:text-ink-400',
  text: 'text-ink-600 underline underline-offset-4 hover:text-ink-900 disabled:text-ink-400',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-4 text-caption',
  md: 'h-touch px-5 text-body-sm',
  lg: 'h-[52px] px-6 text-body',
  xl: 'h-14 px-6 text-h3',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-fast ease-standard disabled:cursor-not-allowed',
        VARIANT[variant],
        SIZE[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
