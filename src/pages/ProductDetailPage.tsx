import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { CartItem, Product } from '@/types';
import { getProduct, getRelatedProducts } from '@/api/products';
import { useCartStore } from '@/store/cartStore';
import { useUiStore } from '@/store/uiStore';
import { cx, toneStyle, won } from '@/lib/format';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';
import { QuantityStepper } from '@/components/ui/Controls';
import { MAX_QTY } from '@/lib/constants';
import { CloseIcon, SearchEmptyIcon } from '@/components/ui/icons';
import { EmptyState, ErrorState } from '@/components/ui/Feedback';

type TabCode = 'info' | 'size' | 'delivery';

const TABS: { code: TabCode; name: string }[] = [
  { code: 'info', name: '상품정보' },
  { code: 'size', name: '사이즈표' },
  { code: 'delivery', name: '배송·반품' },
];

interface Selection {
  color: string;
  size: string;
  quantity: number;
}

export default function ProductDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const addMany = useCartStore((s) => s.addMany);
  const setDirectOrder = useCartStore((s) => s.setDirectOrder);
  const showToast = useUiStore((s) => s.showToast);

  const [product, setProduct] = useState<Product | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [related, setRelated] = useState<Product[]>([]);
  const [imageIdx, setImageIdx] = useState(0);
  const [color, setColor] = useState<string | null>(null);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [tab, setTab] = useState<TabCode>('info');
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollFrame = useRef(0);

  /** 스와이프 위치를 인덱스로 역산해 인디케이터에 반영 (rAF로 프레임당 1회) */
  const handleScroll = () => {
    if (scrollFrame.current) return;
    scrollFrame.current = requestAnimationFrame(() => {
      scrollFrame.current = 0;
      const el = scrollerRef.current;
      if (!el || el.clientWidth === 0) return;
      const next = Math.round(el.scrollLeft / el.clientWidth);
      setImageIdx((prev) => (prev === next ? prev : next));
    });
  };

  /** 인디케이터 탭 → 해당 이미지로 이동 */
  const scrollToIndex = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    setImageIdx(i);
  };

  useEffect(() => {
    let alive = true;
    setProduct(null);
    setColor(null);
    setSelections([]);
    setImageIdx(0);
    setNotFound(false);
    setLoadError(false);
    scrollerRef.current?.scrollTo({ left: 0 });
    getProduct(id)
      .then((p) => {
        if (!alive) return;
        if (p) setProduct(p);
        else setNotFound(true);
      })
      .catch(() => {
        if (alive) setLoadError(true);
      });
    getRelatedProducts(id)
      .then((r) => alive && setRelated(r))
      .catch(() => alive && setRelated([]));
    return () => {
      alive = false;
    };
  }, [id, reloadKey]);

  const total = useMemo(
    () => selections.reduce((sum, s) => sum + (product?.salePrice ?? 0) * s.quantity, 0),
    [selections, product],
  );

  if (loadError) {
    return (
      <Layout title="상품 상세">
        <div className="container-page">
          <ErrorState onRetry={() => setReloadKey((v) => v + 1)} className="py-24" />
        </div>
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout title="상품 상세">
        <div className="container-page">
          <EmptyState
            icon={<SearchEmptyIcon />}
            message="상품을 찾을 수 없습니다"
            actionLabel="상품 목록으로"
            onAction={() => navigate('/products', { replace: true })}
            className="py-24"
          />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout title="상품 상세">
        <div className="container-page py-8">
          <div className="skeleton aspect-product w-full" />
          <div className="skeleton mt-6 h-4 w-1/3" />
          <div className="skeleton mt-3 h-6 w-2/3" />
        </div>
      </Layout>
    );
  }

  const stockOf = (c: string, s: string) => product.stock[`${c}-${s}`] ?? 0;

  const pickSize = (sizeCode: string) => {
    if (!color) return;
    if (stockOf(color, sizeCode) === 0) return;
    const key = `${color}-${sizeCode}`;
    const cap = Math.min(stockOf(color, sizeCode), MAX_QTY);
    setSelections((prev) => {
      const found = prev.findIndex((s) => `${s.color}-${s.size}` === key);
      if (found >= 0) {
        if (prev[found].quantity >= cap) {
          const stock = stockOf(color, sizeCode);
          showToast(stock < MAX_QTY ? `재고가 ${stock}개 남았습니다` : `1회 최대 ${MAX_QTY}개까지 구매할 수 있습니다`);
          return prev;
        }
        const next = [...prev];
        next[found] = { ...next[found], quantity: Math.min(next[found].quantity + 1, cap) };
        return next;
      }
      return [...prev, { color, size: sizeCode, quantity: 1 }];
    });
  };

  const toCartItems = (): Omit<CartItem, 'selected'>[] =>
    selections.map((s) => ({
      cartId: `${product.id}-${s.color}-${s.size}`,
      productId: product.id,
      name: product.name,
      tone: product.tones[0],
      color: s.color,
      colorName: product.colors.find((c) => c.code === s.color)?.name ?? s.color,
      size: s.size,
      salePrice: product.salePrice,
      price: product.price,
      quantity: s.quantity,
      stock: stockOf(s.color, s.size),
      soldOut: stockOf(s.color, s.size) === 0,
    }));

  const guardEmpty = () => {
    if (selections.length === 0) {
      showToast('옵션을 선택해 주세요');
      document.getElementById('option-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }
    return false;
  };

  const handleAddToCart = () => {
    if (submitting || guardEmpty()) return;
    setSubmitting(true);
    const clamped = addMany(toCartItems());
    showToast(clamped ? '수량 상한까지 담았습니다' : '장바구니에 담았습니다', {
      label: '장바구니 보기',
      to: '/cart',
    });
    window.setTimeout(() => setSubmitting(false), 400);
  };

  const handleBuyNow = () => {
    if (submitting || guardEmpty()) return;
    setSubmitting(true);
    setDirectOrder(toCartItems());
    navigate('/order');
  };

  const colorName = product.colors.find((c) => c.code === color)?.name;
  const colorSoldOut = !!color && product.sizes.every((s) => stockOf(color, s.code) === 0);

  return (
    <Layout title="상품 상세" hideFooter>
      <div className="lg:container-page lg:pt-7">
        <p className="hidden text-caption text-ink-500 lg:block">홈 › 상품 › {product.name}</p>

        <div className="lg:mt-7 lg:flex lg:items-start lg:gap-16">
          {/* Gallery */}
          <div className="lg:flex-1">
            {/* 모바일 — 스와이프 캐러셀 (CSS scroll-snap, 네이티브 스크롤) */}
            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              role="group"
              aria-roledescription="캐러셀"
              aria-label={`${product.name} 이미지 ${product.tones.length}장`}
              className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain lg:hidden"
            >
              {product.tones.map((t, i) => (
                <div
                  key={i}
                  className="tone aspect-product w-full flex-none snap-center"
                  style={toneStyle(t)}
                  role="img"
                  aria-label={`${product.name} 이미지 ${i + 1} / ${product.tones.length}`}
                />
              ))}
            </div>

            {/* 데스크탑 — 대표 이미지 */}
            <div
              className="tone aspect-product hidden w-full lg:block"
              style={toneStyle(product.tones[imageIdx])}
              role="img"
              aria-label={`${product.name} 이미지 ${imageIdx + 1}`}
            />

            {/* 모바일 인디케이터 — 탭 이동도 가능 */}
            <div className="flex justify-center lg:hidden">
              {product.tones.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${i + 1}번째 이미지 보기`}
                  aria-current={i === imageIdx}
                  onClick={() => scrollToIndex(i)}
                  className="flex h-touch w-6 items-center justify-center"
                >
                  <span
                    className={cx(
                      'block h-0.5 transition-all duration-fast',
                      i === imageIdx ? 'w-[18px] bg-ink-900' : 'w-1.5 bg-ink-300',
                    )}
                  />
                </button>
              ))}
            </div>

            {/* 데스크탑 썸네일 */}
            <div className="mt-3.5 hidden grid-cols-4 gap-3.5 lg:grid">
              {product.tones.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImageIdx(i)}
                  aria-label={`이미지 ${i + 1} 보기`}
                  className={cx('tone aspect-product', i === imageIdx && 'outline outline-1 -outline-offset-1 outline-ink-900')}
                  style={toneStyle(t)}
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="lg:w-[440px] lg:flex-none">
            <div className="border-b border-ink-200 px-4 py-6 lg:border-0 lg:px-0 lg:py-0">
              <p className="text-micro text-ink-500">{product.brand}</p>
              <h1 className="mt-2 text-h1 text-ink-900 lg:mt-2.5 lg:text-[26px] lg:font-medium">
                {product.name}
              </h1>
              <div className="mt-3.5 flex items-baseline gap-2.5 lg:mt-5">
                {product.discountRate > 0 && (
                  <>
                    <span className="text-body-sm text-ink-400 line-through lg:text-h3-lg">
                      {product.price.toLocaleString('ko-KR')}
                    </span>
                    <span className="text-h2 font-bold text-ink-600 lg:text-h2-lg">{product.discountRate}%</span>
                  </>
                )}
                <span className="text-price-lg font-bold tracking-tight text-ink-900 lg:text-[28px]">
                  {won(product.salePrice)}
                </span>
              </div>
            </div>

            <div className="hidden h-px bg-ink-200 lg:my-6 lg:block" />

            {/* Options */}
            <div id="option-area" className="flex flex-col gap-5 border-b border-ink-200 px-4 py-6 lg:border-0 lg:px-0 lg:py-0">
              <div>
                <p className="mb-3 text-caption text-ink-600">
                  컬러 {colorName && <span className="font-medium text-ink-900">{colorName}</span>}
                </p>
                <div className="flex gap-3.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      aria-label={c.name}
                      aria-pressed={color === c.code}
                      onClick={() => setColor(c.code)}
                      className="flex h-touch w-touch items-center justify-center"
                    >
                      <span
                        className={cx(
                          'h-8 w-8 rounded-full border border-ink-300',
                          color === c.code && 'outline outline-1 outline-offset-[3px] outline-ink-900',
                        )}
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-caption text-ink-600">사이즈</p>
                <div className="flex gap-2.5">
                  {product.sizes.map((s) => {
                    const outOfStock = !!color && stockOf(color, s.code) === 0;
                    const disabled = !color || outOfStock;
                    return (
                      <button
                        key={s.code}
                        type="button"
                        disabled={disabled}
                        onClick={() => pickSize(s.code)}
                        className={cx(
                          'flex h-touch min-w-[68px] items-center justify-center border px-3 text-body-sm transition-colors duration-fast lg:min-w-[80px] lg:h-[46px]',
                          outOfStock
                            ? 'cursor-not-allowed border-ink-200 text-ink-400 line-through'
                            : disabled
                              ? 'cursor-not-allowed border-ink-200 text-ink-400'
                              : 'border-ink-300 text-ink-600 hover:border-ink-900 hover:text-ink-900',
                        )}
                      >
                        {s.code}
                      </button>
                    );
                  })}
                </div>
                <p className={cx('mt-2.5 text-micro', colorSoldOut ? 'text-danger' : 'text-ink-500')}>
                  {!color
                    ? '컬러를 먼저 선택해 주세요'
                    : colorSoldOut
                      ? '선택하신 컬러는 전 사이즈 품절입니다. 다른 컬러를 선택해 주세요'
                      : '품절 사이즈는 선택할 수 없습니다'}
                </p>
              </div>
            </div>

            {/* Selected options */}
            {selections.length > 0 && (
              <div className="bg-ink-50 px-4 py-5 lg:mt-6 lg:px-4">
                <p className="mb-3 text-caption text-ink-600">선택 옵션</p>
                <div className="flex flex-col gap-2">
                  {selections.map((s, i) => (
                    <div key={`${s.color}-${s.size}`} className="border border-ink-200 bg-ink-0 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-body-sm text-ink-800">
                          {product.colors.find((c) => c.code === s.color)?.name} / {s.size}
                        </span>
                        <button
                          type="button"
                          aria-label="옵션 삭제"
                          onClick={() => setSelections((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-ink-400 hover:text-ink-900"
                        >
                          <CloseIcon size={16} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <QuantityStepper
                          value={s.quantity}
                          max={Math.min(MAX_QTY, stockOf(s.color, s.size))}
                          onChange={(v) =>
                            setSelections((prev) =>
                              prev.map((it, idx) => (idx === i ? { ...it, quantity: v } : it)),
                            )
                          }
                        />
                        <span className="text-body font-medium text-ink-900">
                          {won(product.salePrice * s.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-body-sm text-ink-600">총 상품금액</span>
                  <span className="text-price font-bold text-ink-900">{won(total)}</span>
                </div>
              </div>
            )}

            {/* Desktop CTA */}
            <div className="mt-6 hidden gap-3 lg:flex">
              <Button variant="secondary" size="xl" fullWidth disabled={submitting} onClick={handleAddToCart}>
                장바구니
              </Button>
              <Button size="xl" fullWidth disabled={submitting} onClick={handleBuyNow}>
                바로구매
              </Button>
            </div>
            <p className="mt-4 hidden text-caption leading-relaxed text-ink-500 lg:block">
              50,000원 이상 무료배송 · 오늘 17:00까지 결제 시 당일 출고
              <br />
              수령 후 7일 이내 교환·반품 가능
            </p>
          </div>
        </div>
      </div>

      <div className="h-2 bg-ink-100 lg:hidden" />

      {/* Tabs */}
      <div className="container-page lg:mt-16">
        <div className="flex border-b border-ink-200">
          {TABS.map((t) => (
            <button
              key={t.code}
              type="button"
              onClick={() => setTab(t.code)}
              className={cx(
                '-mb-px flex-1 py-4 text-body-sm transition-colors duration-fast lg:py-[18px] lg:text-body',
                t.code === tab
                  ? 'border-b-2 border-ink-900 font-medium text-ink-900'
                  : 'text-ink-500 hover:text-ink-900',
              )}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="py-7 lg:py-11">
          {tab === 'info' && (
            <div className="flex flex-col items-center gap-8">
              <p className="max-w-[680px] text-body leading-loose text-ink-600 lg:text-center">
                {product.description}
              </p>
              <div
                className="tone h-[340px] w-full max-w-[900px] lg:h-[520px]"
                style={toneStyle(product.tones[1])}
                role="img"
                aria-label="상세 이미지"
              />
            </div>
          )}

          {tab === 'size' && (
            <table className="w-full max-w-[680px] border-collapse text-body-sm lg:mx-auto">
              <thead>
                <tr className="border-y border-ink-200 bg-ink-50">
                  <th className="p-3 text-left font-medium text-ink-700">부위</th>
                  {product.sizes.map((s) => (
                    <th key={s.code} className="p-3 text-center font-medium text-ink-700">
                      {s.code}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.sizeGuide.map((row) => (
                  <tr key={row.label} className="border-b border-ink-200">
                    <td className="p-3 text-ink-600">{row.label}</td>
                    {product.sizes.map((s) => (
                      <td key={s.code} className="p-3 text-center text-ink-800">
                        {row.values[s.code] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'delivery' && (
            <div className="mx-auto max-w-[680px] text-body-sm leading-loose text-ink-600">
              · 배송비 3,000원 (50,000원 이상 구매 시 무료)
              <br />· 평일 17:00 이전 결제 건은 당일 출고
              <br />· 수령 후 7일 이내 교환·반품 신청 가능
              <br />· 착용 흔적이 있거나 택이 제거된 상품은 교환·반품이 어렵습니다
            </div>
          )}
        </div>
      </div>

      <div className="h-2 bg-ink-100 lg:hidden" />

      {/* Related */}
      <section className="container-page pb-32 lg:pb-16">
        <h2 className="py-6 text-h2 text-ink-900 lg:py-8 lg:text-h2-lg">함께 보면 좋은 상품</h2>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-0">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} fixedWidth={148} />
          ))}
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-sticky border-t border-ink-200 bg-ink-0 px-4 pb-5 pt-3 shadow-sm lg:hidden">
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-caption text-ink-500">총 상품금액</span>
          <span className="text-price font-bold text-ink-900">{won(total)}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="lg" fullWidth disabled={submitting} onClick={handleAddToCart}>
            장바구니
          </Button>
          <Button size="lg" fullWidth disabled={submitting} onClick={handleBuyNow}>
            바로구매
          </Button>
        </div>
      </div>
    </Layout>
  );
}
