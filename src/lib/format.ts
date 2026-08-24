import type { CSSProperties } from 'react';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/constants';

/** 1234000 -> "1,234,000" */
export function comma(n: number): string {
  return n.toLocaleString('ko-KR');
}

/** 1234000 -> "1,234,000원" */
export function won(n: number): string {
  return `${comma(n)}원`;
}

/** 정가와 할인율로 판매가 계산 (10원 절사) */
export function calcSalePrice(price: number, discountRate: number): number {
  return Math.floor((price * (100 - discountRate)) / 100 / 10) * 10;
}

export function calcShippingFee(productTotal: number): number {
  if (productTotal <= 0) return 0;
  return productTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

/** 01012345678 -> 010-1234-5678 */
export function formatPhone(value: string): string {
  const d = normalizePhoneDigits(value);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** +82 10-1234-5678 형태를 01012345678로 정규화 */
export function normalizePhoneDigits(value: string): string {
  let d = onlyDigits(value);
  if (d.startsWith('82')) d = `0${d.slice(2)}`;
  return d.slice(0, 11);
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isPhone = (v: string) => /^0\d{9,10}$/.test(normalizePhoneDigits(v));
export const isPassword = (v: string) => v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v);
export const isName = (v: string) => v.trim().length >= 2;

export function passwordStrength(v: string): 0 | 1 | 2 | 3 {
  if (!v) return 0;
  let score = 0;
  if (v.length >= 8) score += 1;
  if (/[A-Za-z]/.test(v) && /\d/.test(v)) score += 1;
  if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) score += 1;
  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** 톤 플레이스홀더용 CSS 변수 */
export function toneStyle(tone?: [string, string]): CSSProperties {
  if (!tone) return {} as CSSProperties;
  return { '--tone-a': tone[0], '--tone-b': tone[1] } as CSSProperties;
}
