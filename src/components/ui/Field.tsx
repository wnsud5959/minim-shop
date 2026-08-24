import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { cx } from '@/lib/format';
import { CheckIcon } from '@/components/ui/icons';

interface FieldWrapProps {
  label?: string;
  required?: boolean;
  error?: string;
  helper?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
}

function FieldWrap({ label, required, error, helper, htmlFor, children }: FieldWrapProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={htmlFor} className="text-caption text-ink-600">
          {label}
          {required && <span className="ml-1 text-ink-900">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-micro text-danger">{error}</p>
      ) : helper ? (
        <p className="text-micro text-ink-500">{helper}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: ReactNode;
  suffix?: ReactNode;
}

export function Input({ label, error, helper, suffix, required, className, ...rest }: InputProps) {
  const id = useId();
  return (
    <FieldWrap label={label} required={required} error={error} helper={helper} htmlFor={id}>
      <div
        className={cx(
          'flex h-[46px] items-center gap-2 border bg-ink-0 px-3.5 transition-colors duration-fast',
          error ? 'border-danger bg-danger-bg' : 'border-ink-200 focus-within:border-ink-900',
          rest.disabled && 'bg-ink-100',
        )}
      >
        <input
          id={id}
          required={required}
          className={cx(
            'w-full bg-transparent text-body-sm text-ink-800 outline-none placeholder:text-ink-400 disabled:text-ink-400',
            className,
          )}
          aria-invalid={!!error}
          {...rest}
        />
        {suffix}
      </div>
    </FieldWrap>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, required, className, ...rest }: SelectProps) {
  const id = useId();
  return (
    <FieldWrap label={label} required={required} error={error} htmlFor={id}>
      <select
        id={id}
        className={cx(
          'h-[46px] w-full appearance-none border bg-ink-0 px-3.5 text-body-sm text-ink-800 outline-none',
          error ? 'border-danger' : 'border-ink-200 focus:border-ink-900',
          className,
        )}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
}

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  strong?: boolean;
  className?: string;
  /** 텍스트 라벨이 없는 경우의 접근성 이름 */
  'aria-label'?: string;
}

export function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
  disabled,
  strong,
  className,
  'aria-label': ariaLabel,
}: CheckboxProps) {
  return (
    <label
      className={cx(
        'inline-flex min-h-touch cursor-pointer items-center gap-2.5 select-none',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        aria-label={ariaLabel}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        aria-hidden
        className={cx(
          'flex h-[18px] w-[18px] flex-none items-center justify-center border transition-colors duration-fast',
          'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-olive-500',
          checked || indeterminate ? 'border-ink-900 bg-ink-900 text-ink-0' : 'border-ink-300 bg-ink-0',
          disabled && 'border-ink-200 bg-ink-100',
        )}
      >
        {indeterminate ? <span className="h-0.5 w-2.5 bg-ink-0" /> : checked ? <CheckIcon /> : null}
      </span>
      {label && (
        <span className={cx('text-body-sm', strong ? 'font-medium text-ink-900' : 'text-ink-700')}>
          {label}
        </span>
      )}
    </label>
  );
}

interface RadioProps {
  checked: boolean;
  onChange: () => void;
  label: ReactNode;
  name: string;
  className?: string;
}

export function Radio({ checked, onChange, label, name, className }: RadioProps) {
  return (
    <label
      className={cx(
        'flex min-h-touch flex-1 cursor-pointer items-center justify-center border px-3 text-body-sm transition-colors duration-fast',
        'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-olive-500',
        checked ? 'border-ink-900 font-medium text-ink-900' : 'border-ink-200 text-ink-500',
        className,
      )}
    >
      <input type="radio" name={name} className="sr-only" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
