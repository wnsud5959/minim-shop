import type { ReactNode } from 'react';
import { cx } from '@/lib/format';
import { CloseIcon, MinusIcon, PlusIcon } from '@/components/ui/icons';
import { MAX_QTY } from '@/lib/constants';

interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function Chip({ children, selected, onClick, onRemove }: ChipProps) {
  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cx(
        'inline-flex min-h-touch items-center gap-2 rounded-full border px-3 py-1.5 text-caption transition-colors duration-fast',
        onClick && 'cursor-pointer',
        selected
          ? 'border-olive-500 bg-olive-100 text-olive-700'
          : 'border-ink-300 text-ink-600 hover:border-ink-900 hover:text-ink-900',
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          aria-label="필터 해제"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-ink-400 hover:text-ink-900"
        >
          <CloseIcon size={12} />
        </button>
      )}
    </span>
  );
}

interface QuantityStepperProps {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function QuantityStepper({
  value,
  onChange,
  max = MAX_QTY,
  disabled,
  size = 'md',
}: QuantityStepperProps) {
  const box = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const mid = size === 'sm' ? 'h-7 w-[34px]' : 'h-8 w-10';
  return (
    <div className={cx('inline-flex border border-ink-200', disabled && 'opacity-40')}>
      <button
        type="button"
        aria-label="수량 감소"
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
        className={cx(
          box,
          'flex items-center justify-center text-ink-600 disabled:text-ink-300 disabled:cursor-not-allowed',
        )}
      >
        <MinusIcon />
      </button>
      <span className={cx(mid, 'flex items-center justify-center text-caption text-ink-900')}>
        {value}
      </span>
      <button
        type="button"
        aria-label="수량 증가"
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
        className={cx(
          box,
          'flex items-center justify-center text-ink-600 disabled:text-ink-300 disabled:cursor-not-allowed',
        )}
      >
        <PlusIcon />
      </button>
    </div>
  );
}

interface TabsProps<T extends string> {
  items: { code: T; name: string }[];
  value: T;
  onChange: (code: T) => void;
  className?: string;
}

export function Tabs<T extends string>({ items, value, onChange, className }: TabsProps<T>) {
  return (
    <div className={cx('flex gap-6 overflow-x-auto border-b border-ink-200', className)}>
      {items.map((it) => (
        <button
          key={it.code}
          type="button"
          onClick={() => onChange(it.code)}
          className={cx(
            '-mb-px flex-none whitespace-nowrap py-4 text-body-sm transition-colors duration-fast',
            it.code === value
              ? 'border-b-2 border-ink-900 font-medium text-ink-900'
              : 'text-ink-500 hover:text-ink-900',
          )}
        >
          {it.name}
        </button>
      ))}
    </div>
  );
}
