import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { CATEGORIES } from '@/lib/constants';
import { cx } from '@/lib/format';
import { BackIcon, CartIcon, MenuIcon, SearchIcon, UserIcon } from '@/components/ui/icons';

function CartButton({ count }: { count: number }) {
  return (
    <Link
      to="/cart"
      aria-label={`장바구니 ${count}개`}
      className="relative flex h-touch w-touch items-center justify-center text-ink-900"
    >
      <CartIcon />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink-900 text-[10px] text-ink-0">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

interface HeaderProps {
  /** 지정 시 모바일에서 뒤로가기 + 타이틀 형태로 렌더 */
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const setDrawer = useUiStore((s) => s.setDrawer);

  return (
    <header className="sticky top-0 z-sticky border-b border-ink-200 bg-ink-0">
      {/* Mobile */}
      <div className="flex h-header items-center justify-between px-4 lg:hidden">
        {title ? (
          <>
            <button
              type="button"
              aria-label="뒤로 가기"
              onClick={() => navigate(-1)}
              className="-ml-3 flex h-touch w-touch items-center justify-center text-ink-900"
            >
              <BackIcon />
            </button>
            <h1 className="text-h3 text-ink-900">{title}</h1>
            <CartButton count={count} />
          </>
        ) : (
          <>
            <button
              type="button"
              aria-label="메뉴 열기"
              onClick={() => setDrawer(true)}
              className="-ml-3 flex h-touch w-touch items-center justify-center text-ink-900"
            >
              <MenuIcon />
            </button>
            <Link to="/" className="text-brand text-ink-900">
              MINIM.
            </Link>
            <div className="-mr-3 flex items-center">
              <button
                type="button"
                aria-label="검색"
                className="flex h-touch w-touch items-center justify-center text-ink-900"
              >
                <SearchIcon />
              </button>
              <CartButton count={count} />
            </div>
          </>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="container-page flex h-header-lg items-center justify-between">
          <div className="flex items-center gap-14">
            <Link to="/" className="text-brand-lg text-ink-900">
              MINIM.
            </Link>
            <nav className="flex gap-8">
              {CATEGORIES.filter((c) => c.code !== 'all').map((c) => (
                <NavLink
                  key={c.code}
                  to={`/products?cat=${c.code}`}
                  className={({ isActive }) =>
                    cx('text-body-sm transition-colors duration-fast', isActive ? 'text-ink-900' : 'text-ink-700 hover:text-ink-900')
                  }
                >
                  {c.name}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="-mr-2.5 flex items-center gap-1">
            <button
              type="button"
              aria-label="검색"
              className="flex h-touch w-touch items-center justify-center text-ink-900"
            >
              <SearchIcon />
            </button>
            <CartButton count={count} />
            <Link
              to="/login"
              state={{ from: `${pathname}${search}` }}
              aria-label="마이페이지"
              className="flex h-touch w-touch items-center justify-center text-ink-900"
            >
              <UserIcon />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
