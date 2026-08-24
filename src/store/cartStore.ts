import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Order, Orderer, PayMethod, Shipping } from '@/types';
import { calcShippingFee } from '@/lib/format';
import { MAX_QTY } from '@/lib/constants';
import { createSafeStorage } from '@/lib/storage';

const cartStorage = createSafeStorage(() => window.localStorage);

interface CartState {
  items: CartItem[];
  /** 바로구매로 넘어온 임시 주문 (장바구니 미경유) */
  directOrder: CartItem[] | null;
  add: (item: Omit<CartItem, 'selected'>) => boolean;
  /** @returns 수량 상한에 걸려 일부가 잘렸으면 true */
  addMany: (items: Omit<CartItem, 'selected'>[]) => boolean;
  remove: (cartId: string) => void;
  removeSelected: () => void;
  setQuantity: (cartId: string, qty: number) => void;
  toggleSelect: (cartId: string) => void;
  toggleSelectAll: (selected: boolean) => void;
  setDirectOrder: (items: Omit<CartItem, 'selected'>[] | null) => void;
  clearOrdered: () => void;
  /** 카탈로그와 대조해 재고·품절 상태를 갱신 */
  syncStock: (resolve: (item: CartItem) => { stock: number; soldOut?: boolean }) => void;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      directOrder: null,

      add: (item) => get().addMany([item]),

      addMany: (incoming) => {
        let clamped = false;
        set((state) => {
          const items = [...state.items];
          incoming.forEach((next) => {
            const cap = Math.min(next.stock || MAX_QTY, MAX_QTY);
            const found = items.findIndex((i) => i.cartId === next.cartId);
            if (found >= 0) {
              const merged = items[found].quantity + next.quantity;
              if (merged > cap) clamped = true;
              items[found] = { ...items[found], quantity: Math.min(merged, cap) };
            } else {
              if (next.quantity > cap) clamped = true;
              items.unshift({ ...next, quantity: Math.min(next.quantity, cap), selected: !next.soldOut });
            }
          });
          return { items };
        });
        return clamped;
      },

      remove: (cartId) => set((s) => ({ items: s.items.filter((i) => i.cartId !== cartId) })),

      removeSelected: () => set((s) => ({ items: s.items.filter((i) => !i.selected) })),

      setQuantity: (cartId, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.cartId === cartId
              ? { ...i, quantity: Math.min(Math.max(qty, 1), Math.min(i.stock || MAX_QTY, MAX_QTY)) }
              : i,
          ),
        })),

      toggleSelect: (cartId) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.cartId === cartId && !i.soldOut ? { ...i, selected: !i.selected } : i,
          ),
        })),

      toggleSelectAll: (selected) =>
        set((s) => ({
          items: s.items.map((i) => (i.soldOut ? i : { ...i, selected })),
        })),

      setDirectOrder: (items) =>
        set({ directOrder: items ? items.map((i) => ({ ...i, selected: true })) : null }),

      clearOrdered: () =>
        set((s) => (s.directOrder ? { directOrder: null } : { items: s.items.filter((i) => !i.selected) })),

      syncStock: (resolve) =>
        set((s) => ({
          items: s.items.map((i) => {
            const { stock, soldOut } = resolve(i);
            const isSoldOut = soldOut ?? stock === 0;
            return {
              ...i,
              stock,
              soldOut: isSoldOut,
              selected: isSoldOut ? false : i.selected,
              quantity: isSoldOut ? i.quantity : Math.min(i.quantity, Math.min(stock || MAX_QTY, MAX_QTY)),
            };
          }),
        })),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'minim-cart',
      version: 1,
      storage: createJSONStorage(() => cartStorage),
      // 바로구매 주문도 새로고침 후 유지되어야 함
      partialize: (state) => ({ items: state.items, directOrder: state.directOrder }) as CartState,
      /** v0 → v1: 컬러 코드 규격 통일 (ivory → white) */
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as { items?: CartItem[]; directOrder?: CartItem[] | null };
        if (version >= 1 || !state) return state as CartState;
        const rename = (list?: CartItem[] | null) =>
          list?.map((i) =>
            i.color === 'ivory'
              ? {
                  ...i,
                  color: 'white',
                  colorName: '화이트',
                  cartId: i.cartId.replace('-ivory-', '-white-'),
                }
              : i,
          ) ?? null;
        return { ...state, items: rename(state.items) ?? [], directOrder: rename(state.directOrder) } as CartState;
      },
    },
  ),
);

/** 주문 대상 = 바로구매 항목이 있으면 그것, 없으면 장바구니 선택 항목 */
export function selectOrderItems(state: CartState): CartItem[] {
  if (state.directOrder?.length) return state.directOrder;
  return state.items.filter((i) => i.selected && !i.soldOut);
}

export function calcAmount(items: CartItem[]) {
  const productTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const saleTotal = items.reduce((s, i) => s + i.salePrice * i.quantity, 0);
  const discountTotal = productTotal - saleTotal;
  const shippingFee = calcShippingFee(saleTotal);
  return {
    productTotal,
    discountTotal,
    shippingFee,
    finalTotal: saleTotal + shippingFee,
  };
}

export function buildOrder(
  items: CartItem[],
  orderer: Orderer,
  shipping: Shipping,
  payMethod: PayMethod,
): Order {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  return {
    orderId: `ORD-${stamp}-${String(now.getTime()).slice(-4)}`,
    items,
    orderer,
    shipping,
    payMethod,
    amount: calcAmount(items),
    createdAt: now.toISOString(),
  };
}
