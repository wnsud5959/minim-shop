import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calcAmount, useCartStore } from '@/store/cartStore';
import { getProduct } from '@/api/products';
import type { Product } from '@/types';
import { toneStyle, won } from '@/lib/format';
import { FREE_SHIPPING_THRESHOLD, MAX_QTY } from '@/lib/constants';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Field';
import { QuantityStepper } from '@/components/ui/Controls';
import { EmptyState, Modal } from '@/components/ui/Feedback';
import { BagIcon, CloseIcon } from '@/components/ui/icons';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, remove, removeSelected, setQuantity, toggleSelect, toggleSelectAll, setDirectOrder } =
    useCartStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const syncStock = useCartStore((s) => s.syncStock);

  /**
   * 담은 뒤 재고·판매 상태가 바뀌었을 수 있으므로 진입 시 카탈로그와 대조한다.
   * 삭제된 상품과 재고 0인 옵션은 품절로 표시되어 주문에서 자동 제외된다.
   */
  useEffect(() => {
    let alive = true;
    const ids: string[] = Array.from(new Set(useCartStore.getState().items.map((i) => i.productId)));
    if (ids.length === 0) return;

    Promise.all(ids.map((pid) => getProduct(pid).catch(() => null)))
      .then((products) => {
        if (!alive) return;
        const found = new Map<string, Product>();
        products.forEach((p) => {
          if (p) found.set(p.id, p);
        });
        syncStock((item) => {
          const p = found.get(item.productId);
          if (!p) return { stock: 0, soldOut: true };
          return { stock: p.stock[`${item.color}-${item.size}`] ?? 0 };
        });
      })
      .catch(() => undefined);

    return () => {
      alive = false;
    };
  }, [syncStock]);

  const selectable = items.filter((i) => !i.soldOut);
  const selected = selectable.filter((i) => i.selected);
  const allSelected = selectable.length > 0 && selected.length === selectable.length;
  const amount = calcAmount(selected);

  const sorted = [...items].sort((a, b) => Number(b.soldOut) - Number(a.soldOut));

  const goOrder = () => {
    setDirectOrder(null);
    navigate('/order');
  };

  if (items.length === 0) {
    return (
      <Layout title="장바구니">
        <div className="container-page">
          <EmptyState
            icon={<BagIcon />}
            message="장바구니가 비어 있습니다"
            actionLabel="쇼핑 계속하기"
            onAction={() => navigate('/products')}
            className="py-20"
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="장바구니">
      <div className="container-page pb-28 lg:pb-0 lg:pt-10">
        <h1 className="hidden text-h1-lg text-ink-900 lg:block">장바구니</h1>

        <div className="lg:mt-7 lg:flex lg:items-start lg:gap-8">
          <div className="lg:flex-1 lg:border-t lg:border-ink-900">
            <div className="flex items-center justify-between border-b border-ink-200 py-3.5 lg:px-5">
              <Checkbox
                checked={allSelected}
                indeterminate={!allSelected && selected.length > 0}
                onChange={(v) => toggleSelectAll(v)}
                label={`전체선택 (${selected.length}/${selectable.length})`}
              />
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={selected.length === 0}
                className="text-caption text-ink-500 underline underline-offset-4 disabled:text-ink-300 disabled:no-underline"
              >
                선택삭제
              </button>
            </div>

            {sorted.map((item) => (
              <div
                key={item.cartId}
                className={`flex gap-3 border-b border-ink-200 py-4 lg:gap-5 lg:px-5 ${
                  item.soldOut ? 'bg-ink-50' : ''
                }`}
              >
                <div className="pt-0.5">
                  <Checkbox
                    checked={item.selected && !item.soldOut}
                    disabled={item.soldOut}
                    onChange={() => toggleSelect(item.cartId)}
                    aria-label={`${item.name} ${item.colorName} / ${item.size} 선택`}
                  />
                </div>
                <div
                  className="tone h-[101px] w-[76px] flex-none lg:h-[117px] lg:w-[88px]"
                  style={toneStyle(item.tone)}
                  role="img"
                  aria-label={item.name}
                />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`text-body-sm ${item.soldOut ? 'text-ink-500' : 'text-ink-800'}`}>
                      {item.name}
                    </span>
                    <button
                      type="button"
                      aria-label="삭제"
                      onClick={() => remove(item.cartId)}
                      className="flex-none text-ink-400 hover:text-ink-900"
                    >
                      <CloseIcon size={16} />
                    </button>
                  </div>
                  <span className="flex items-center gap-1.5 text-micro text-ink-500">
                    {item.colorName} / {item.size}
                    {item.soldOut && (
                      <span className="border border-ink-300 px-1.5 py-px text-ink-500">품절</span>
                    )}
                  </span>
                  <div className="mt-1.5 flex items-center justify-between">
                    <QuantityStepper
                      value={item.quantity}
                      max={Math.min(item.stock || MAX_QTY, MAX_QTY)}
                      disabled={item.soldOut}
                      size="sm"
                      onChange={(v) => setQuantity(item.cartId, v)}
                    />
                    <span
                      className={`text-price-sm font-bold ${item.soldOut ? 'text-ink-400' : 'text-ink-900'}`}
                    >
                      {won(item.salePrice * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="mt-8 lg:sticky lg:top-24 lg:mt-0 lg:w-[360px] lg:flex-none lg:border lg:border-ink-200 lg:p-6">
            <h2 className="hidden border-b border-ink-200 pb-3 text-h2-lg text-ink-900 lg:block">
              주문 요약
            </h2>
            <div className="flex flex-col gap-3 lg:pt-4">
              <div className="flex justify-between text-body-sm text-ink-600">
                <span>상품금액</span>
                <span>{won(amount.productTotal)}</span>
              </div>
              <div className="flex justify-between text-body-sm text-ink-600">
                <span>할인금액</span>
                <span>-{won(amount.discountTotal)}</span>
              </div>
              <div className="flex justify-between text-body-sm text-ink-600">
                <span>배송비</span>
                <span>{won(amount.shippingFee)}</span>
              </div>
              <div className="my-2 h-px bg-ink-200" />
              <div className="flex items-baseline justify-between">
                <span className="text-body font-medium text-ink-900">총 결제금액</span>
                <span className="text-[22px] font-bold tracking-tight text-ink-900">
                  {won(amount.finalTotal)}
                </span>
              </div>
              <p className="mt-1.5 bg-olive-50 px-3.5 py-3 text-micro text-olive-700">
                {selected.length > 0 && amount.shippingFee === 0
                  ? `${won(FREE_SHIPPING_THRESHOLD)} 이상 구매하여 배송비가 무료입니다`
                  : `${won(FREE_SHIPPING_THRESHOLD)} 이상 구매 시 배송비가 무료입니다`}
              </p>
              {items.some((i) => i.soldOut) && (
                <p className="text-micro text-ink-500">품절 상품은 주문 시 자동으로 제외됩니다</p>
              )}
              <Button
                size="xl"
                fullWidth
                disabled={selected.length === 0}
                onClick={goOrder}
                className="mt-3 hidden lg:flex"
              >
                {selected.length === 0 ? '주문하기' : `${won(amount.finalTotal)} 주문하기`}
              </Button>
            </div>
          </aside>
        </div>
      </div>

      {/* 모바일 하단 고정 결제 바 */}
      <div className="fixed inset-x-0 bottom-0 z-sticky border-t border-ink-200 bg-ink-0 px-4 pb-5 pt-3 shadow-sm lg:hidden">
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-caption text-ink-500">총 결제금액</span>
          <span className="text-price font-bold text-ink-900">{won(amount.finalTotal)}</span>
        </div>
        <Button size="xl" fullWidth disabled={selected.length === 0} onClick={goOrder}>
          {selected.length === 0 ? '주문하기' : `${won(amount.finalTotal)} 주문하기`}
        </Button>
      </div>

      <Modal
        open={confirmOpen}
        title="선택한 상품을 삭제할까요?"
        description={`${selected.length}개 상품이 장바구니에서 삭제됩니다.`}
        cancelLabel="취소"
        confirmLabel="삭제"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          removeSelected();
          setConfirmOpen(false);
        }}
      />
    </Layout>
  );
}
