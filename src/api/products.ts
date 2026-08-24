import type { Product, ProductListResult, ProductQuery } from '@/types';
import { PRODUCTS } from '@/mock/products';
import { PER_PAGE } from '@/lib/constants';

/**
 * Mock API 레이어.
 * 실 API 전환 시 이 파일의 구현만 fetch로 교체하면 UI는 변경 없이 동작한다.
 */
const LATENCY = 250;

function delay<T>(data: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function inPriceRange(p: Product, range?: string): boolean {
  if (!range) return true;
  const [minRaw, maxRaw] = range.split('-');
  const min = Number(minRaw || 0);
  const max = maxRaw ? Number(maxRaw) : Infinity;
  return p.salePrice >= min && p.salePrice < max;
}

function hasSize(p: Product, sizes?: string[]): boolean {
  if (!sizes?.length) return true;
  return p.sizes.some((s) => sizes.includes(s.code));
}

function hasColor(p: Product, colors?: string[]): boolean {
  if (!colors?.length) return true;
  return p.colors.some((c) => colors.includes(c.code));
}

function sortProducts(list: Product[], sort: ProductQuery['sort']): Product[] {
  const arr = [...list];
  switch (sort) {
    case 'popular':
      return arr.sort((a, b) => b.salesCount - a.salesCount);
    case 'low':
      return arr.sort((a, b) => a.salePrice - b.salePrice);
    case 'high':
      return arr.sort((a, b) => b.salePrice - a.salePrice);
    case 'new':
    default:
      return arr.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductListResult> {
  const { cat = 'all', sizes, colors, price, sort = 'new', page = 1, perPage = PER_PAGE } = query;

  const filtered = PRODUCTS.filter(
    (p) =>
      (cat === 'all' || p.category === cat) &&
      hasSize(p, sizes) &&
      hasColor(p, colors) &&
      inPriceRange(p, price),
  );

  const sorted = sortProducts(filtered, sort);
  const items = sorted.slice(0, page * perPage);

  return delay({
    items,
    total: sorted.length,
    hasMore: items.length < sorted.length,
  });
}

export async function getProduct(id: string): Promise<Product | null> {
  return delay(PRODUCTS.find((p) => p.id === id) ?? null);
}

export async function getRelatedProducts(id: string, limit = 4): Promise<Product[]> {
  const base = PRODUCTS.find((p) => p.id === id);
  if (!base) return delay([]);
  const related = PRODUCTS.filter((p) => p.category === base.category && p.id !== id).slice(0, limit);
  return delay(related);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  return delay(sortProducts(PRODUCTS, 'new').slice(0, limit));
}

export async function getBestSellers(limit = 8): Promise<Product[]> {
  return delay(sortProducts(PRODUCTS, 'popular').slice(0, limit));
}
