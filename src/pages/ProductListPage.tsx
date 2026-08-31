import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CategoryCode, Product, SortCode } from '@/types';
import { getProducts } from '@/api/products';
import {
  APPAREL_SIZES,
  CATEGORIES,
  COLORS,
  FREE_SIZE,
  PER_PAGE,
  PRICE_RANGES,
  SORT_OPTIONS,
} from '@/lib/constants';
import { cx } from '@/lib/format';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';
import { Chip, Tabs } from '@/components/ui/Controls';
import { Checkbox } from '@/components/ui/Field';
import { BottomSheet, EmptyState, ErrorState, ProductCardSkeleton } from '@/components/ui/Feedback';
import { ChevronDownIcon, SearchEmptyIcon } from '@/components/ui/icons';

const ALL_SIZES = [...APPAREL_SIZES, ...FREE_SIZE];

function useListQuery() {
  const [params, setParams] = useSearchParams();

  const rawCat = params.get('cat') ?? 'all';
  const cat = (CATEGORIES.some((c) => c.code === rawCat) ? rawCat : 'all') as CategoryCode | 'all';
  const rawSort = params.get('sort') ?? 'new';
  const sort = (SORT_OPTIONS.some((o) => o.code === rawSort) ? rawSort : 'new') as SortCode;
  const page = Math.max(1, Number(params.get('page') ?? 1) || 1);
  const sizes =
    params.get('size')?.split(',').filter((v) => ALL_SIZES.some((s) => s.code === v)) ?? [];
  const colors =
    params.get('color')?.split(',').filter((v) => COLORS.some((c) => c.code === v)) ?? [];
  const rawPrice = params.get('price') ?? '';
  const price = PRICE_RANGES.some((r) => r.code === rawPrice) ? rawPrice : '';

  const patch = useCallback(
    (next: Record<string, string | undefined>) => {
      const merged = new URLSearchParams(params);
      Object.entries(next).forEach(([k, v]) => {
        if (!v) merged.delete(k);
        else merged.set(k, v);
      });
      // 조건이 바뀌면 누적 페이지는 1로 되돌린다 (더보기 자체는 예외)
      const onlyPage = Object.keys(next).length === 1 && 'page' in next;
      if (!onlyPage) merged.delete('page');
      // 더보기는 뒤로가기 스택을 오염시키지 않도록 replace
      setParams(merged, { replace: onlyPage });
    },
    [params, setParams],
  );

  return { params, cat, sort, sizes, colors, price, page, patch, setParams };
}

interface FilterBodyProps {
  sizes: string[];
  colors: string[];
  price: string;
  onToggle: (key: 'size' | 'color', code: string) => void;
  onPrice: (code: string) => void;
}

function FilterBody({ sizes, colors, price, onToggle, onPrice }: FilterBodyProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-3.5 text-caption text-ink-600">사이즈</p>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((s) => (
            <button
              key={s.code}
              type="button"
              onClick={() => onToggle('size', s.code)}
              className={cx(
                'flex h-touch min-w-[56px] items-center justify-center border px-3 text-caption transition-colors duration-fast',
                sizes.includes(s.code)
                  ? 'border-ink-900 font-medium text-ink-900'
                  : 'border-ink-300 text-ink-600 hover:border-ink-900',
              )}
            >
              {s.code}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3.5 text-caption text-ink-600">컬러</p>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((c) => (
            <button
              key={c.code}
              type="button"
              aria-label={c.name}
              aria-pressed={colors.includes(c.code)}
              onClick={() => onToggle('color', c.code)}
              className="flex h-touch w-touch items-center justify-center"
            >
              <span
                className={cx(
                  'h-8 w-8 rounded-full border border-ink-300',
                  colors.includes(c.code) && 'outline outline-1 outline-offset-[3px] outline-ink-900',
                )}
                style={{ backgroundColor: c.hex }}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3.5 text-caption text-ink-600">가격</p>
        <div className="flex flex-col gap-1">
          {PRICE_RANGES.map((r) => (
            <Checkbox
              key={r.code}
              checked={price === r.code}
              onChange={() => onPrice(price === r.code ? '' : r.code)}
              label={r.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductListPage() {
  const { cat, sort, sizes, colors, price, page, patch, setParams } = useListQuery();
  const [data, setData] = useState<{ items: Product[]; total: number; hasMore: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState({ sizes, colors, price });

  const queryKey = `${cat}|${sort}|${sizes.join()}|${colors.join()}|${price}`;

  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError(false);
    getProducts({ cat, sort, sizes, colors, price: price || undefined, page })
      .then((res) => {
        if (!alive) return;
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setLoading(false);
        setLoadError(true);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, page, reloadKey]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    sizes.forEach((s) =>
      chips.push({
        key: `size-${s}`,
        label: s,
        onRemove: () => patch({ size: sizes.filter((v) => v !== s).join(',') || undefined }),
      }),
    );
    colors.forEach((c) =>
      chips.push({
        key: `color-${c}`,
        label: COLORS.find((x) => x.code === c)?.name ?? c,
        onRemove: () => patch({ color: colors.filter((v) => v !== c).join(',') || undefined }),
      }),
    );
    if (price) {
      chips.push({
        key: 'price',
        label: PRICE_RANGES.find((r) => r.code === price)?.name ?? price,
        onRemove: () => patch({ price: undefined }),
      });
    }
    return chips;
  }, [sizes, colors, price, patch]);

  const resetAll = () => {
    const next: Record<string, string> = {};
    if (cat !== 'all') next.cat = cat;
    if (sort !== 'new') next.sort = sort;
    setParams(next, { replace: false });
  };

  const toggleDesktop = (key: 'size' | 'color', code: string) => {
    const current = key === 'size' ? sizes : colors;
    const next = current.includes(code) ? current.filter((v) => v !== code) : [...current, code];
    patch({ [key]: next.join(',') || undefined });
  };

  const toggleDraft = (key: 'size' | 'color', code: string) => {
    setDraft((d) => {
      const list = key === 'size' ? d.sizes : d.colors;
      const next = list.includes(code) ? list.filter((v) => v !== code) : [...list, code];
      return key === 'size' ? { ...d, sizes: next } : { ...d, colors: next };
    });
  };

  const openSheet = () => {
    setDraft({ sizes, colors, price });
    setSheetOpen(true);
  };

  const applyDraft = () => {
    patch({
      size: draft.sizes.join(',') || undefined,
      color: draft.colors.join(',') || undefined,
      price: draft.price || undefined,
    });
    setSheetOpen(false);
  };

  const catName = CATEGORIES.find((c) => c.code === cat)?.name ?? '전체';

  return (
    <Layout>
      <div className="container-page pt-0 lg:pt-8">
        <p className="hidden text-caption text-ink-500 lg:block">홈 › 상품 › {catName}</p>
        <div className="hidden items-baseline justify-between pt-4 lg:flex">
          <h1 className="text-h1-lg text-ink-900">{catName}</h1>
          <span className="text-body-sm text-ink-500">총 {data?.total ?? 0}개</span>
        </div>
        <Tabs
          items={CATEGORIES}
          value={cat}
          onChange={(code) => patch({ cat: code === 'all' ? undefined : code })}
          className="mt-0 lg:mt-6"
        />
      </div>

      <div className="container-page mt-6 flex gap-12 lg:items-start">
        {/* Desktop filter */}
        <aside className="hidden w-[220px] flex-none flex-col gap-8 lg:flex">
          <p className="border-b border-ink-900 pb-3.5 text-h3-lg font-bold text-ink-900">필터</p>
          <FilterBody
            sizes={sizes}
            colors={colors}
            price={price}
            onToggle={toggleDesktop}
            onPrice={(code) => patch({ price: code || undefined })}
          />
          <Button variant="secondary" size="sm" onClick={resetAll}>
            필터 초기화
          </Button>
        </aside>

        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between pb-4 lg:pb-6">
            <button
              type="button"
              onClick={openSheet}
              className="inline-flex min-h-touch items-center gap-1.5 rounded-full border border-ink-300 px-4 text-caption text-ink-700 lg:hidden"
            >
              필터 <ChevronDownIcon size={14} />
            </button>
            <span className="text-caption text-ink-500 lg:hidden">총 {data?.total ?? 0}개</span>

            <div className="hidden flex-wrap gap-2 lg:flex">
              {activeChips.map((c) => (
                <Chip key={c.key} selected onRemove={c.onRemove}>
                  {c.label}
                </Chip>
              ))}
            </div>

            <label className="inline-flex items-center gap-1.5 text-caption text-ink-700 lg:text-body-sm">
              <select
                value={sort}
                onChange={(e) => patch({ sort: e.target.value === 'new' ? undefined : e.target.value })}
                className="appearance-none bg-transparent pr-1 text-right outline-none"
                aria-label="정렬 기준"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.code} value={o.code}>
                    {o.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon size={14} />
            </label>
          </div>

          {/* Mobile chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-4 lg:hidden">
              {activeChips.map((c) => (
                <Chip key={c.key} selected onRemove={c.onRemove}>
                  {c.label}
                </Chip>
              ))}
              <button
                type="button"
                onClick={resetAll}
                className="text-micro text-ink-500 underline underline-offset-4"
              >
                전체 초기화
              </button>
            </div>
          )}

          {/* Grid */}
          {loadError && !data ? (
            <ErrorState onRetry={() => setReloadKey((v) => v + 1)} className="py-16" />
          ) : loading && !data ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6 lg:gap-y-9">
              {/* QA-057: 스켈레톤 개수를 실제 렌더 개수(PER_PAGE)에 맞춰 레이아웃 시프트를 없앤다 */}
              {Array.from({ length: PER_PAGE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : data && data.items.length === 0 ? (
            <EmptyState
              icon={<SearchEmptyIcon />}
              message="조건에 맞는 상품이 없습니다"
              actionLabel="필터 초기화"
              onAction={resetAll}
              className="py-16"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6 lg:gap-y-9">
                {data?.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {data?.hasMore && (
                <div className="flex flex-col items-center gap-3 pt-10 lg:pt-14">
                  {loadError && (
                    <p className="text-micro text-danger">일시적인 오류입니다. 다시 시도해 주세요</p>
                  )}
                  <Button
                    variant="secondary"
                    size="lg"
                    loading={loading}
                    onClick={() =>
                      loadError ? setReloadKey((v) => v + 1) : patch({ page: String(page + 1) })
                    }
                    className="w-full lg:w-[340px]"
                  >
                    {loadError ? '다시 시도' : `더보기 (${data.total - data.items.length})`}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomSheet
        open={sheetOpen}
        title="필터"
        onClose={() => setSheetOpen(false)}
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="lg"
              className="w-24 flex-none"
              onClick={() => setDraft({ sizes: [], colors: [], price: '' })}
            >
              초기화
            </Button>
            <Button size="lg" fullWidth onClick={applyDraft}>
              적용하기
            </Button>
          </div>
        }
      >
        <FilterBody
          sizes={draft.sizes}
          colors={draft.colors}
          price={draft.price}
          onToggle={toggleDraft}
          onPrice={(code) => setDraft((d) => ({ ...d, price: code }))}
        />
      </BottomSheet>
    </Layout>
  );
}
