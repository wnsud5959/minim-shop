import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { getBestSellers, getNewArrivals } from '@/api/products';
import { CATEGORIES, PLACEHOLDER_TONES } from '@/lib/constants';
import { cx, toneStyle } from '@/lib/format';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/ui/ProductCard';
import { ErrorState, ProductCardSkeleton } from '@/components/ui/Feedback';
import { BackIcon } from '@/components/ui/icons';

const CATEGORY_TONES = PLACEHOLDER_TONES;

const HERO_SLIDES = [
  {
    kicker: '2026 AUTUMN',
    title: ['덜어낼수록', '선명해지는 것'],
    sub: '군더더기 없는 실루엣으로 완성한 가을 아우터 컬렉션',
    cta: 'SHOP NOW',
    to: '/products?cat=outer',
  },
  {
    kicker: 'KNIT EXHIBITION',
    title: ['겨울 준비,', '니트 기획전'],
    sub: '캐시미어 혼방 니트 최대 30% · 8.23 – 9.10',
    cta: 'VIEW ALL',
    to: '/products?cat=top',
  },
  {
    kicker: 'NEW MEMBER',
    title: ['첫 구매', '15% 쿠폰'],
    sub: '회원가입 즉시 발급, 전 품목 사용 가능',
    cta: 'JOIN NOW',
    to: '/signup',
  },
];

function SectionHead({ title, to }: { title: string; to: string }) {
  return (
    <div className="flex items-baseline justify-between pb-4 pt-8 lg:pb-6">
      <h2 className="text-h2 lg:text-h2-lg text-ink-900">{title}</h2>
      <Link to={to} className="text-micro text-ink-500 hover:text-ink-900">
        더보기
      </Link>
    </div>
  );
}

export default function HomePage() {
  const [newItems, setNewItems] = useState<Product[] | null>(null);
  const [bestItems, setBestItems] = useState<Product[] | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  const [paused, setPaused] = useState(false);
  const heroFrame = useRef(0);

  /** 스크롤 프레임마다 setState 하지 않도록 rAF로 묶는다 */
  const handleHeroScroll = () => {
    if (heroFrame.current) return;
    heroFrame.current = requestAnimationFrame(() => {
      heroFrame.current = 0;
      const el = heroRef.current;
      if (!el || el.clientWidth === 0) return;
      const next = Math.round(el.scrollLeft / el.clientWidth);
      setHeroIdx((prev) => (prev === next ? prev : next));
    });
  };

  const scrollHeroTo = (i: number) => {
    const el = heroRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    setHeroIdx(i);
  };

  /**
   * 5초 자동 전환.
   * 사용자가 조작 중이거나(포인터·포커스) 탭이 비활성일 때는 멈춘다.
   * 모션 최소화 설정에서는 자동 전환하지 않는다 (WCAG 2.2.2).
   */
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const timer = setInterval(() => {
      const el = heroRef.current;
      if (!el || el.clientWidth === 0 || document.hidden) return;
      const next = (Math.round(el.scrollLeft / el.clientWidth) + 1) % HERO_SLIDES.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoadError(false);
    Promise.all([getNewArrivals(8), getBestSellers(8)])
      .then(([n, b]) => {
        if (!alive) return;
        setNewItems(n);
        setBestItems(b);
      })
      .catch(() => {
        if (alive) setLoadError(true);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const retry = () => {
    setNewItems(null);
    setBestItems(null);
    setReloadKey((v) => v + 1);
  };

  return (
    <Layout>
      {/* Hero — 3장 슬라이드 (스와이프 + 자동 전환 + 인디케이터) */}
      <section className="relative">
        <div
          ref={heroRef}
          onScroll={handleHeroScroll}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          role="group"
          aria-roledescription="캐러셀"
          aria-label={`메인 배너 ${HERO_SLIDES.length}장`}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
        >
          {HERO_SLIDES.map((slide) => (
            <div
              key={slide.kicker}
              className="aspect-hero-m flex w-full flex-none snap-center flex-col justify-end bg-gradient-to-br from-ink-800 to-ink-900 px-6 pb-12 lg:aspect-hero-d lg:justify-center lg:px-0"
            >
              <div className="lg:container-page">
                <p className="mb-3.5 text-micro tracking-[.22em] text-olive-300 lg:mb-5">{slide.kicker}</p>
                <h2 className="text-[30px] font-bold leading-[1.25] tracking-tight text-ink-0 lg:text-[52px] lg:leading-[1.15]">
                  {slide.title.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h2>
                <p className="mt-3.5 text-body-sm leading-relaxed text-ink-0/70 lg:mt-5 lg:text-h3-lg">
                  {slide.sub}
                </p>
                <Link
                  to={slide.to}
                  className="mt-6 inline-flex h-12 w-[150px] items-center justify-center border border-ink-0/50 text-body-sm tracking-[.08em] text-ink-0 transition-colors duration-fast hover:bg-ink-0/10 lg:mt-9 lg:h-[52px] lg:w-[180px]"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 인디케이터 */}
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1 lg:bottom-6 lg:justify-end lg:pr-[max(24px,calc((100%-1280px)/2+24px))]">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.kicker}
              type="button"
              aria-label={`${i + 1}번째 배너 보기`}
              aria-current={i === heroIdx}
              onClick={() => scrollHeroTo(i)}
              className="flex h-touch w-7 items-center justify-center"
            >
              <span
                className={cx(
                  'block h-0.5 transition-all duration-fast',
                  i === heroIdx ? 'w-5 bg-ink-0' : 'w-2 bg-ink-0/40',
                )}
              />
            </button>
          ))}
        </div>

        {/* 데스크탑 좌우 이동 */}
        <button
          type="button"
          aria-label="이전 배너"
          onClick={() => scrollHeroTo((heroIdx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-6 top-1/2 hidden h-touch w-touch -translate-y-1/2 items-center justify-center text-ink-0/70 transition-colors duration-fast hover:text-ink-0 lg:flex"
        >
          <BackIcon size={24} />
        </button>
        <button
          type="button"
          aria-label="다음 배너"
          onClick={() => scrollHeroTo((heroIdx + 1) % HERO_SLIDES.length)}
          className="absolute right-6 top-1/2 hidden h-touch w-touch -translate-y-1/2 rotate-180 items-center justify-center text-ink-0/70 transition-colors duration-fast hover:text-ink-0 lg:flex"
        >
          <BackIcon size={24} />
        </button>
      </section>

      {/* Category */}
      <section className="container-page grid grid-cols-3 gap-x-2 gap-y-5 py-8 lg:grid-cols-6 lg:gap-7 lg:py-16">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.code}
            to={c.code === 'all' ? '/products' : `/products?cat=${c.code}`}
            className="flex flex-col items-center gap-2.5 lg:gap-3.5"
          >
            <span
              className="tone h-[58px] w-[58px] rounded-full lg:h-24 lg:w-24"
              style={toneStyle(CATEGORY_TONES[i])}
            />
            <span className="text-caption text-ink-700 lg:text-body-sm">{c.name}</span>
          </Link>
        ))}
      </section>

      <div className="h-2 bg-ink-100 lg:hidden" />

      {/* New arrivals */}
      <section className="container-page">
        <SectionHead title="NEW ARRIVAL" to="/products?sort=new" />
        {loadError ? (
          <ErrorState onRetry={retry} className="pb-9" />
        ) : !newItems ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 pb-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-9 sm:-mx-6 sm:px-6 lg:hidden">
              {newItems.map((p) => (
                <ProductCard key={p.id} product={p} fixedWidth={148} />
              ))}
            </div>
            <div className="hidden gap-6 pb-9 lg:grid lg:grid-cols-4 lg:gap-y-9">
              {newItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Promotion */}
      <section className="container-page grid gap-6 pb-9 lg:grid-cols-2 lg:py-16">
        {[
          { kicker: 'EXHIBITION', title: '겨울 준비, 니트 기획전', sub: '최대 30% · 8.23 – 9.10', tone: CATEGORY_TONES[3] },
          { kicker: 'NEW MEMBER', title: '첫 구매 15% 쿠폰', sub: '회원가입 즉시 발급', tone: CATEGORY_TONES[5] },
        ].map((b) => (
          <Link
            key={b.kicker}
            to="/products"
            className="tone flex h-[200px] flex-col justify-center px-7 lg:h-[340px] lg:px-11"
            style={toneStyle(b.tone)}
          >
            <span className="text-micro tracking-[.2em] text-ink-600">{b.kicker}</span>
            <span className="mt-2.5 text-h1 text-ink-900 lg:mt-3.5 lg:text-[26px] lg:font-bold">
              {b.title}
            </span>
            <span className="mt-2.5 text-caption text-ink-600 lg:mt-3 lg:text-body-sm">{b.sub}</span>
          </Link>
        ))}
      </section>

      <div className="h-2 bg-ink-100 lg:hidden" />

      {/* Best */}
      <section className="container-page pb-4">
        <SectionHead title="BEST" to="/products?sort=popular" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {!bestItems
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestItems.map((p, i) => (
                <ProductCard key={p.id} product={p} rank={i < 3 ? i + 1 : undefined} />
              ))}
        </div>
      </section>
    </Layout>
  );
}
