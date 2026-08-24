import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useUiStore } from '@/store/uiStore';
import { cx } from '@/lib/format';
import Button from '@/components/ui/Button';
import { CloseIcon } from '@/components/ui/icons';

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  const hideToast = useUiStore((s) => s.hideToast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(hideToast, 2000);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-[88px] left-1/2 z-toast w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 bg-ink-900 px-4 py-3.5 shadow-md lg:bottom-8 lg:left-auto lg:right-8 lg:translate-x-0"
    >
      <div className="flex items-center justify-between gap-5">
        <span className="text-body-sm text-ink-0">{toast.message}</span>
        {toast.action && (
          <Link
            to={toast.action.to}
            onClick={hideToast}
            className="flex-none text-body-sm font-medium text-olive-300 underline underline-offset-4"
          >
            {toast.action.label}
          </Link>
        )}
      </div>
    </div>
  );
}

interface ModalProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function Modal({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel,
  onConfirm,
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-ink-900/60" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[400px] bg-ink-0 p-6 shadow-md"
      >
        <h2 className="text-h2 text-ink-900">{title}</h2>
        {description && <div className="mt-3 text-body-sm text-ink-600">{description}</div>}
        <div className="mt-6 flex gap-2">
          {cancelLabel && (
            <Button variant="secondary" size="lg" fullWidth onClick={onClose}>
              {cancelLabel}
            </Button>
          )}
          <Button size="lg" fullWidth onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export function BottomSheet({ open, title, onClose, footer, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-drawer lg:hidden">
      <div className="absolute inset-0 bg-ink-900/60" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col bg-ink-0 shadow-lg"
      >
        <div className="flex justify-center pb-1.5 pt-2.5">
          <span className="h-1 w-9 rounded-full bg-ink-300" />
        </div>
        <div className="flex items-center justify-between border-b border-ink-200 px-4 pb-3">
          <h2 className="text-h3 text-ink-900">{title}</h2>
          <button type="button" aria-label="닫기" onClick={onClose} className="text-ink-400">
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-5">{children}</div>
        {footer && <div className="border-t border-ink-200 p-4">{footer}</div>}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="skeleton w-full aspect-product" />
      <div className="skeleton h-2.5 w-2/5" />
      <div className="skeleton h-2.5 w-4/5" />
      <div className="skeleton h-2.5 w-1/2" />
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  className?: string;
}

/** 화면정책서 §0 — 데이터 로드 실패 공통 표현 */
export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cx('flex flex-col items-center gap-4 py-12 text-center', className)}>
      <p className="text-body-sm text-ink-600">{message ?? '일시적인 오류입니다. 다시 시도해 주세요'}</p>
      <Button variant="secondary" onClick={onRetry}>
        다시 시도
      </Button>
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon, message, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cx('flex flex-col items-center gap-4 py-12 text-center', className)}>
      <span className="text-ink-300">{icon}</span>
      <p className="text-body-sm text-ink-500">{message}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
