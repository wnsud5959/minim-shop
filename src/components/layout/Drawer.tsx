import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUiStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { CATEGORIES } from '@/lib/constants';
import { ChevronRightIcon, CloseIcon } from '@/components/ui/icons';

export default function Drawer() {
  const open = useUiStore((s) => s.drawerOpen);
  const setDrawer = useUiStore((s) => s.setDrawer);
  const { user, isLoggedIn, signOut } = useAuthStore();
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setDrawer]);

  if (!open) return null;
  const close = () => setDrawer(false);

  return (
    <div className="fixed inset-0 z-drawer lg:hidden">
      <div className="absolute inset-0 bg-ink-900/60" onClick={close} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        className="absolute inset-y-0 left-0 flex w-[280px] flex-col bg-ink-0 shadow-lg"
      >
        <div className="flex h-header items-center justify-between border-b border-ink-200 px-4">
          <span className="text-brand text-ink-900">MINIM.</span>
          <button type="button" aria-label="닫기" onClick={close} className="text-ink-500">
            <CloseIcon />
          </button>
        </div>

        <div className="border-b border-ink-200 px-4 py-5">
          {isLoggedIn ? (
            <div className="flex flex-col gap-3">
              <p className="text-body-sm text-ink-800">
                <span className="font-medium text-ink-900">{user?.name}</span>님, 안녕하세요
              </p>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  close();
                }}
                className="self-start text-caption text-ink-500 underline underline-offset-4"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              state={{ from: `${pathname}${search}` }}
              onClick={close}
              className="flex items-center justify-between text-body-sm text-ink-800"
            >
              로그인 / 회원가입
              <ChevronRightIcon />
            </Link>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.code}
              to={c.code === 'all' ? '/products' : `/products?cat=${c.code}`}
              onClick={close}
              className="flex items-center justify-between px-4 py-3.5 text-body text-ink-700 hover:bg-ink-50"
            >
              {c.name}
              <ChevronRightIcon />
            </Link>
          ))}
        </nav>

        <div className="border-t border-ink-200 px-4 py-5 text-micro leading-relaxed text-ink-500">
          고객센터 1600-0000
          <br />
          평일 10:00–18:00
        </div>
      </aside>
    </div>
  );
}
