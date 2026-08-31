import { describe, it, expect } from 'vitest';
import { PRODUCTS } from '@/mock/products';

describe('목업 상품 데이터', () => {
  it('5개 카테고리 × 12건 = 60건이 생성된다', () => {
    expect(PRODUCTS).toHaveLength(60);
  });

  it('상품 id가 중복되지 않는다', () => {
    expect(new Set(PRODUCTS.map((p) => p.id)).size).toBe(PRODUCTS.length);
  });

  // QA-061: 전량 품절 상품이 한 건도 없으면 품절 배지·장바구니 품절 처리를
  // 화면에서 확인할 방법이 없다. 데이터 결함이 QA 항목 자체를 무력화한다.
  it('전량 품절 상품이 최소 1건 존재한다', () => {
    expect(PRODUCTS.filter((p) => p.soldOut).length).toBeGreaterThanOrEqual(1);
  });

  it('품절 상품은 모든 옵션 재고가 0이다', () => {
    PRODUCTS.filter((p) => p.soldOut).forEach((p) => {
      expect(Object.values(p.stock).every((v) => v === 0)).toBe(true);
    });
  });

  it('품절이 아닌 상품은 재고가 있는 옵션을 하나 이상 갖는다', () => {
    PRODUCTS.filter((p) => !p.soldOut).forEach((p) => {
      expect(Object.values(p.stock).some((v) => v > 0)).toBe(true);
    });
  });

  it('판매가는 정가를 넘지 않는다', () => {
    PRODUCTS.forEach((p) => {
      expect(p.salePrice).toBeLessThanOrEqual(p.price);
    });
  });

  it('모든 상품이 컬러·사이즈 옵션을 갖는다', () => {
    PRODUCTS.forEach((p) => {
      expect(p.colors.length).toBeGreaterThan(0);
      expect(p.sizes.length).toBeGreaterThan(0);
    });
  });
});
