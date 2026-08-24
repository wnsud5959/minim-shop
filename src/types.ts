export type CategoryCode = 'outer' | 'top' | 'bottom' | 'dress' | 'acc';
export type SortCode = 'new' | 'popular' | 'low' | 'high';
export type PayMethod = 'card' | 'bank' | 'easy';

export interface ColorOption {
  code: string;
  name: string;
  hex: string;
}

export interface SizeOption {
  code: string;
  name: string;
}

export interface SizeGuideRow {
  label: string;
  values: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryCode;
  price: number;
  discountRate: number;
  salePrice: number;
  /** 이미지 자산 확보 전 톤 플레이스홀더 (from, to) */
  tones: [string, string][];
  colors: ColorOption[];
  sizes: SizeOption[];
  /** key: `${colorCode}-${sizeCode}` */
  stock: Record<string, number>;
  soldOut: boolean;
  badges: ('new' | 'best' | 'sale')[];
  salesCount: number;
  createdAt: string;
  description: string;
  sizeGuide: SizeGuideRow[];
}

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  tone: [string, string];
  color: string;
  colorName: string;
  size: string;
  salePrice: number;
  price: number;
  quantity: number;
  /** 담을 시점의 해당 옵션 재고 — 수량 상한 판정에 사용 */
  stock: number;
  selected: boolean;
  soldOut: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface ProductQuery {
  cat?: CategoryCode | 'all';
  sizes?: string[];
  colors?: string[];
  price?: string;
  sort?: SortCode;
  page?: number;
  perPage?: number;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  hasMore: boolean;
}

export interface Orderer {
  name: string;
  phone: string;
  email: string;
}

export interface Shipping {
  receiver: string;
  phone: string;
  zipcode: string;
  address1: string;
  address2: string;
  memo: string;
}

export interface OrderAmount {
  productTotal: number;
  discountTotal: number;
  shippingFee: number;
  finalTotal: number;
}

export interface Order {
  orderId: string;
  items: CartItem[];
  orderer: Orderer;
  shipping: Shipping;
  payMethod: PayMethod;
  amount: OrderAmount;
  createdAt: string;
}
