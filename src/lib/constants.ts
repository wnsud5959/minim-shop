import type { CategoryCode, ColorOption, SizeOption, SortCode } from '@/types';

export const CATEGORIES: { code: CategoryCode | 'all'; name: string }[] = [
  { code: 'all', name: '전체' },
  { code: 'outer', name: '아우터' },
  { code: 'top', name: '상의' },
  { code: 'bottom', name: '하의' },
  { code: 'dress', name: '원피스' },
  { code: 'acc', name: '액세서리' },
];

export const COLORS: ColorOption[] = [
  { code: 'black', name: '블랙', hex: '#1A1917' },
  { code: 'white', name: '화이트', hex: '#EFE9DD' },
  { code: 'beige', name: '베이지', hex: '#DED6C9' },
  { code: 'olive', name: '올리브', hex: '#6E7455' },
  { code: 'navy', name: '네이비', hex: '#3A4258' },
];

export const APPAREL_SIZES: SizeOption[] = [
  { code: 'S', name: 'S (44)' },
  { code: 'M', name: 'M (55)' },
  { code: 'L', name: 'L (66)' },
];

export const FREE_SIZE: SizeOption[] = [{ code: 'FREE', name: 'FREE' }];

export const SORT_OPTIONS: { code: SortCode; name: string }[] = [
  { code: 'new', name: '신상품순' },
  { code: 'popular', name: '인기순' },
  { code: 'low', name: '낮은가격순' },
  { code: 'high', name: '높은가격순' },
];

export const PRICE_RANGES = [
  { code: '0-50000', name: '5만원 이하' },
  { code: '50000-100000', name: '5–10만원' },
  { code: '100000-', name: '10만원 이상' },
];

export const SHIPPING_FEE = 3000;
export const FREE_SHIPPING_THRESHOLD = 50000;
export const PER_PAGE = 20;
export const MAX_QTY = 10;

export const DELIVERY_MEMOS = [
  '배송 전 연락 바랍니다',
  '부재 시 문 앞에 놓아주세요',
  '부재 시 경비실에 맡겨주세요',
  '직접 입력',
];

/**
 * 이미지 자산 확보 전 사용하는 톤 플레이스홀더.
 * 디자인 토큰이 아니라 임시 자산이므로 실 이미지 적용 시 함께 제거한다.
 */
export const PLACEHOLDER_TONES: [string, string][] = [
  ['#DED6C9', '#C4B9A8'],
  ['#C9CCC0', '#AEB2A2'],
  ['#BCC0C7', '#9EA4AE'],
  ['#E6E1D9', '#CFC7BB'],
  ['#CFC6BA', '#B2A697'],
  ['#A9AEA0', '#8C9282'],
  ['#D9D3CD', '#BEB5AC'],
  ['#B8BCC2', '#9AA0A8'],
];
