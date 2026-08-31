import { describe, it, expect, beforeEach } from 'vitest';
import type { CartItem } from '@/types';
import { useCartStore, calcAmount, selectOrderItems } from '@/store/cartStore';

type NewItem = Omit<CartItem, 'selected'>;

/** 테스트용 장바구니 항목. 필요한 값만 덮어쓴다. */
function item(over: Partial<NewItem> = {}): NewItem {
  return {
    cartId: 'p-0001-black-M',
    productId: 'p-0001',
    name: '오버핏 울 블렌드 코트',
    tone: ['#E7E6E3', '#D6D4D0'],
    color: 'black',
    colorName: '블랙',
    size: 'M',
    price: 20000,
    salePrice: 18000,
    quantity: 1,
    stock: 10,
    soldOut: false,
    ...over,
  };
}

beforeEach(() => {
  useCartStore.setState({ items: [], directOrder: null });
  window.localStorage.clear();
});

describe('addMany — 수량 상한', () => {
  it('재고보다 많이 담으면 재고까지만 담기고 true를 돌려준다', () => {
    const clamped = useCartStore.getState().addMany([item({ stock: 3, quantity: 5 })]);

    expect(clamped).toBe(true);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('재고가 넉넉해도 최대 수량 10을 넘지 못한다', () => {
    const clamped = useCartStore.getState().addMany([item({ stock: 20, quantity: 12 })]);

    expect(clamped).toBe(true);
    expect(useCartStore.getState().items[0].quantity).toBe(10);
  });

  it('상한 안에서 담으면 false를 돌려준다', () => {
    const clamped = useCartStore.getState().addMany([item({ stock: 5, quantity: 2 })]);

    expect(clamped).toBe(false);
    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('같은 옵션을 다시 담으면 새 행이 아니라 수량이 합쳐진다', () => {
    const store = useCartStore.getState();
    store.addMany([item({ quantity: 2 })]);
    store.addMany([item({ quantity: 3 })]);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(5);
  });

  it('합쳐진 수량이 상한을 넘으면 잘리고 true를 돌려준다', () => {
    const store = useCartStore.getState();
    store.addMany([item({ stock: 4, quantity: 3 })]);
    const clamped = store.addMany([item({ stock: 4, quantity: 3 })]);

    expect(clamped).toBe(true);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
  });

  it('품절 항목은 선택 해제 상태로 담긴다', () => {
    useCartStore.getState().addMany([item({ soldOut: true })]);

    expect(useCartStore.getState().items[0].selected).toBe(false);
  });

  // stock이 0인데 soldOut이 false인 항목이 들어오면
  // `next.stock || MAX_QTY` 폴백 때문에 상한이 10으로 열린다.
  it.todo('재고 0을 "재고 정보 없음"과 구분해야 한다');
});

describe('setQuantity — 범위 보정', () => {
  beforeEach(() => {
    useCartStore.getState().addMany([item({ stock: 4, quantity: 2 })]);
  });

  it('1보다 작게 내릴 수 없다', () => {
    useCartStore.getState().setQuantity('p-0001-black-M', 0);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('재고를 넘길 수 없다', () => {
    useCartStore.getState().setQuantity('p-0001-black-M', 99);
    expect(useCartStore.getState().items[0].quantity).toBe(4);
  });

  it('다른 항목은 건드리지 않는다', () => {
    useCartStore.getState().addMany([item({ cartId: 'p-0002-white-L', quantity: 1 })]);
    useCartStore.getState().setQuantity('p-0001-black-M', 3);

    const other = useCartStore.getState().items.find((i) => i.cartId === 'p-0002-white-L');
    expect(other?.quantity).toBe(1);
  });
});

describe('syncStock — 카탈로그 대조', () => {
  it('재고가 0이 되면 품절 처리하고 선택을 해제한다', () => {
    useCartStore.getState().addMany([item({ stock: 5, quantity: 3 })]);
    useCartStore.getState().syncStock(() => ({ stock: 0 }));

    const found = useCartStore.getState().items[0];
    expect(found.soldOut).toBe(true);
    expect(found.selected).toBe(false);
  });

  it('재고가 줄면 수량도 함께 줄인다', () => {
    useCartStore.getState().addMany([item({ stock: 5, quantity: 5 })]);
    useCartStore.getState().syncStock(() => ({ stock: 2 }));

    expect(useCartStore.getState().items[0].quantity).toBe(2);
  });

  it('재고가 늘어도 담긴 수량을 임의로 늘리지 않는다', () => {
    useCartStore.getState().addMany([item({ stock: 3, quantity: 3 })]);
    useCartStore.getState().syncStock(() => ({ stock: 9 }));

    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });
});

describe('선택 상태', () => {
  it('품절 항목은 선택할 수 없다', () => {
    useCartStore.getState().addMany([item({ soldOut: true })]);
    useCartStore.getState().toggleSelect('p-0001-black-M');

    expect(useCartStore.getState().items[0].selected).toBe(false);
  });

  it('전체 선택도 품절 항목은 건너뛴다', () => {
    useCartStore.getState().addMany([
      item({ cartId: 'a', soldOut: true }),
      item({ cartId: 'b', soldOut: false }),
    ]);
    useCartStore.getState().toggleSelectAll(true);

    const items = useCartStore.getState().items;
    expect(items.find((i) => i.cartId === 'a')?.selected).toBe(false);
    expect(items.find((i) => i.cartId === 'b')?.selected).toBe(true);
  });
});

describe('clearOrdered — 주문 후 정리', () => {
  it('바로구매였다면 임시 주문만 비우고 장바구니는 남긴다', () => {
    useCartStore.getState().addMany([item({ cartId: 'in-cart' })]);
    useCartStore.getState().setDirectOrder([item({ cartId: 'direct' })]);
    useCartStore.getState().clearOrdered();

    const state = useCartStore.getState();
    expect(state.directOrder).toBeNull();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].cartId).toBe('in-cart');
  });

  it('장바구니 주문이었다면 선택한 항목만 제거한다', () => {
    useCartStore.getState().addMany([item({ cartId: 'a' }), item({ cartId: 'b' })]);
    useCartStore.getState().toggleSelect('a');
    useCartStore.getState().clearOrdered();

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].cartId).toBe('a');
  });
});

describe('selectOrderItems — 주문 대상 결정', () => {
  it('바로구매 항목이 있으면 장바구니보다 우선한다', () => {
    useCartStore.getState().addMany([item({ cartId: 'in-cart' })]);
    useCartStore.getState().setDirectOrder([item({ cartId: 'direct' })]);

    const target = selectOrderItems(useCartStore.getState());
    expect(target).toHaveLength(1);
    expect(target[0].cartId).toBe('direct');
  });

  it('품절 항목은 주문 대상에서 빠진다', () => {
    useCartStore.getState().addMany([
      item({ cartId: 'ok', soldOut: false }),
      item({ cartId: 'gone', soldOut: true }),
    ]);

    const target = selectOrderItems(useCartStore.getState());
    expect(target.map((i) => i.cartId)).toEqual(['ok']);
  });
});

describe('calcAmount — 결제 금액', () => {
  const line = (over: Partial<CartItem>): CartItem => ({ ...item(), selected: true, ...over });

  it('빈 목록이면 모두 0원', () => {
    expect(calcAmount([])).toEqual({
      productTotal: 0,
      discountTotal: 0,
      shippingFee: 0,
      finalTotal: 0,
    });
  });

  it('할인액은 정가 합계에서 판매가 합계를 뺀 값', () => {
    const amount = calcAmount([line({ price: 20000, salePrice: 18000, quantity: 2 })]);

    expect(amount.productTotal).toBe(40000);
    expect(amount.discountTotal).toBe(4000);
  });

  it('판매가 합계가 무료배송 기준 미만이면 배송비가 붙는다', () => {
    const amount = calcAmount([line({ price: 50000, salePrice: 49999, quantity: 1 })]);

    expect(amount.shippingFee).toBe(3000);
    expect(amount.finalTotal).toBe(52999);
  });

  it('배송비 판정은 정가가 아니라 판매가 합계 기준이다', () => {
    // 정가는 5만원을 넘지만 할인 후 49,000원이므로 무료배송이 아니다
    const amount = calcAmount([line({ price: 60000, salePrice: 49000, quantity: 1 })]);

    expect(amount.shippingFee).toBe(3000);
  });

  it('판매가 합계가 기준 이상이면 배송비가 0원', () => {
    const amount = calcAmount([line({ price: 50000, salePrice: 50000, quantity: 1 })]);

    expect(amount.shippingFee).toBe(0);
    expect(amount.finalTotal).toBe(50000);
  });

  it('여러 항목의 수량을 모두 반영한다', () => {
    const amount = calcAmount([
      line({ cartId: 'a', price: 10000, salePrice: 9000, quantity: 3 }),
      line({ cartId: 'b', price: 30000, salePrice: 25000, quantity: 1 }),
    ]);

    expect(amount.productTotal).toBe(60000);
    expect(amount.discountTotal).toBe(8000);
    expect(amount.shippingFee).toBe(0);
    expect(amount.finalTotal).toBe(52000);
  });
});

describe('count', () => {
  it('담긴 수량의 합을 돌려준다', () => {
    useCartStore.getState().addMany([
      item({ cartId: 'a', quantity: 2 }),
      item({ cartId: 'b', quantity: 3 }),
    ]);

    expect(useCartStore.getState().count()).toBe(5);
  });
});
