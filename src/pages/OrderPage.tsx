import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order, PayMethod } from '@/types';
import { buildOrder, calcAmount, useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { DELIVERY_MEMOS } from '@/lib/constants';
import { formatPhone, isEmail, isName, isPhone, onlyDigits, toneStyle, won } from '@/lib/format';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import { Checkbox, Input, Radio, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Feedback';
import { ChevronDownIcon } from '@/components/ui/icons';

const PAY_METHODS: { code: PayMethod; name: string }[] = [
  { code: 'card', name: '신용카드' },
  { code: 'bank', name: '무통장입금' },
  { code: 'easy', name: '간편결제' },
];

const CUSTOM_MEMO = '직접 입력';

type Errors = Partial<Record<string, string>>;

export default function OrderPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearOrdered = useCartStore((s) => s.clearOrdered);
  const cartItems = useCartStore((s) => s.items);
  const directOrder = useCartStore((s) => s.directOrder);
  const items = useMemo(
    () => (directOrder?.length ? directOrder : cartItems.filter((i) => i.selected && !i.soldOut)),
    [directOrder, cartItems],
  );

  const [expanded, setExpanded] = useState(false);
  const [sameAsOrderer, setSameAsOrderer] = useState(true);
  const [payMethod, setPayMethod] = useState<PayMethod>('card');
  const [agree, setAgree] = useState({ terms: false, privacy: false, marketing: false });
  const [errors, setErrors] = useState<Errors>({});
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  const [orderer, setOrderer] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
  });
  const [memoPreset, setMemoPreset] = useState(DELIVERY_MEMOS[1]);
  const [shipping, setShipping] = useState({
    receiver: '',
    phone: '',
    zipcode: '',
    address1: '',
    address2: '',
    memo: DELIVERY_MEMOS[1],
  });

  const formRef = useRef<HTMLDivElement>(null);
  const amount = useMemo(() => calcAmount(items), [items]);

  useEffect(() => {
    if (items.length === 0 && !placedOrder) navigate('/cart', { replace: true });
  }, [items.length, placedOrder, navigate]);

  /** 제출 중 이탈하면 타이머를 정리해 장바구니가 임의로 비워지지 않게 한다 */
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  /** 페이지를 벗어나면 바로구매 임시 주문을 정리한다 (다음 방문 시 재사용 방지) */
  const setDirectOrder = useCartStore((s) => s.setDirectOrder);
  useEffect(
    () => () => {
      if (useCartStore.getState().directOrder) setDirectOrder(null);
    },
    [setDirectOrder],
  );

  /** 제출 후에는 값이 고쳐지는 즉시 해당 오류를 해제 */
  const clearError = (key: string) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const validate = (): Errors => {
    const e: Errors = {};
    if (!isName(orderer.name.trim())) e.name = '이름을 정확히 입력해 주세요';
    if (!isPhone(orderer.phone)) e.phone = '휴대폰 번호를 정확히 입력해 주세요';
    if (!isEmail(orderer.email.trim())) e.email = '이메일 형식이 올바르지 않습니다';
    if (!sameAsOrderer && !isName(shipping.receiver)) e.receiver = '받는 분을 입력해 주세요';
    if (!sameAsOrderer && !isPhone(shipping.phone)) e.shippingPhone = '휴대폰 번호를 정확히 입력해 주세요';
    if (onlyDigits(shipping.zipcode).length !== 5) e.zipcode = '우편번호를 입력해 주세요';
    if (!shipping.address1.trim()) e.address1 = '주소를 입력해 주세요';
    if (!shipping.address2.trim()) e.address2 = '상세주소를 입력해 주세요';
    if (!agree.terms || !agree.privacy) e.agree = '필수 약관에 동의해 주세요';
    return e;
  };

  const submit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // 오류 상태가 DOM에 반영된 뒤 첫 오류 필드로 이동
      requestAnimationFrame(() => {
        const visibleAgree = Array.from(
          document.querySelectorAll<HTMLElement>('[data-agree-block]'),
        ).find((el) => el.offsetParent !== null);
        const target =
          (formRef.current?.querySelector('[aria-invalid="true"]') as HTMLElement | null) ??
          (e.agree ? visibleAgree ?? null : null);
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target?.focus?.();
      });
      return;
    }
    setSubmitting(true);
    const order = buildOrder(
      items,
      { ...orderer, name: orderer.name.trim(), email: orderer.email.trim() },
      sameAsOrderer ? { ...shipping, receiver: orderer.name, phone: orderer.phone } : shipping,
      payMethod,
    );
    timerRef.current = window.setTimeout(() => {
      setSubmitting(false);
      // 완료 화면은 스냅샷으로 고정 — 장바구니 상태 변화에 영향받지 않는다
      setPlacedOrder(order);
      clearOrdered();
    }, 400);
  };

  const allAgreed = agree.terms && agree.privacy && agree.marketing;
  const viewItems = placedOrder?.items ?? items;
  const viewAmount = placedOrder?.amount ?? amount;
  const visibleItems = expanded ? viewItems : viewItems.slice(0, 3);

  const Summary = (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between text-body-sm text-ink-600">
        <span>상품금액</span>
        <span>{won(viewAmount.productTotal)}</span>
      </div>
      <div className="flex justify-between text-body-sm text-ink-600">
        <span>할인금액</span>
        <span>-{won(viewAmount.discountTotal)}</span>
      </div>
      <div className="flex justify-between text-body-sm text-ink-600">
        <span>배송비</span>
        <span>{won(viewAmount.shippingFee)}</span>
      </div>
      <div className="my-1.5 h-px bg-ink-200" />
      <div className="flex items-baseline justify-between">
        <span className="text-body font-medium text-ink-900">총 결제금액</span>
        <span className="text-[22px] font-bold tracking-tight text-ink-900">{won(viewAmount.finalTotal)}</span>
      </div>
    </div>
  );

  const Agreements = (
    <div data-agree-block tabIndex={-1} className="flex flex-col gap-3 outline-none">
      <Checkbox
        checked={allAgreed}
        onChange={(v) => setAgree({ terms: v, privacy: v, marketing: v })}
        label="전체 동의"
        strong
      />
      <div className="h-px bg-ink-200" />
      <Checkbox
        checked={agree.terms}
        onChange={(v) => {
          setAgree((a) => ({ ...a, terms: v }));
          clearError('agree');
        }}
        label="[필수] 구매조건 확인 및 결제 진행 동의"
      />
      <Checkbox
        checked={agree.privacy}
        onChange={(v) => {
          setAgree((a) => ({ ...a, privacy: v }));
          clearError('agree');
        }}
        label="[필수] 개인정보 제3자 제공 동의"
      />
      <Checkbox
        checked={agree.marketing}
        onChange={(v) => setAgree((a) => ({ ...a, marketing: v }))}
        label="[선택] 마케팅 정보 수신 동의"
      />
      {errors.agree && <p className="text-micro text-danger">{errors.agree}</p>}
    </div>
  );

  return (
    <Layout title="주문 / 결제" hideFooter>
      <div className="container-page pb-28 lg:pb-0 lg:pt-10">
        <h1 className="hidden text-h1-lg text-ink-900 lg:block">주문 / 결제</h1>

        <div className="lg:mt-7 lg:flex lg:items-start lg:gap-8">
          <div ref={formRef} className="flex flex-col lg:flex-1">
            {/* Items */}
            <section className="border-b border-ink-200 py-6 lg:border-0">
              <div className="mb-4 flex items-center justify-between lg:border-b lg:border-ink-900 lg:pb-3.5">
                <h2 className="text-h3 text-ink-900 lg:text-h2-lg">주문 상품 {viewItems.length}건</h2>
                {viewItems.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="flex items-center gap-1 text-caption text-ink-500"
                  >
                    {expanded ? '접기' : `외 ${viewItems.length - 3}건 펼치기`}
                    <ChevronDownIcon size={14} />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-3.5">
                {visibleItems.map((item) => (
                  <div key={item.cartId} className="flex gap-3 lg:gap-4">
                    <div
                      className="tone h-20 w-[60px] flex-none lg:h-24 lg:w-[72px]"
                      style={toneStyle(item.tone)}
                      role="img"
                      aria-label={item.name}
                    />
                    <div className="flex flex-col justify-center gap-1.5">
                      <span className="text-body-sm text-ink-800">{item.name}</span>
                      <span className="text-micro text-ink-500">
                        {item.colorName} / {item.size} / {item.quantity}개
                      </span>
                      <span className="text-price-sm font-bold text-ink-900">
                        {won(item.salePrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Orderer */}
            <section className="border-b border-ink-200 py-6 lg:mt-10 lg:border-0">
              <h2 className="mb-4 text-h3 text-ink-900 lg:border-b lg:border-ink-900 lg:pb-3.5 lg:text-h2-lg">
                주문자 정보
              </h2>
              <div className="flex flex-col gap-4 lg:grid lg:grid-cols-3 lg:gap-4">
                <Input
                  label="이름"
                  required
                  maxLength={30}
                  value={orderer.name}
                  error={errors.name}
                  placeholder="홍길동"
                  onChange={(e) => {
                    setOrderer((o) => ({ ...o, name: e.target.value }));
                    clearError('name');
                  }}
                />
                <Input
                  label="연락처"
                  required
                  inputMode="numeric"
                  value={orderer.phone}
                  error={errors.phone}
                  placeholder="010-0000-0000"
                  onChange={(e) => {
                    setOrderer((o) => ({ ...o, phone: formatPhone(e.target.value) }));
                    clearError('phone');
                  }}
                />
                <Input
                  label="이메일"
                  required
                  type="email"
                  value={orderer.email}
                  error={errors.email}
                  placeholder="example@minim.com"
                  onChange={(e) => {
                    setOrderer((o) => ({ ...o, email: e.target.value }));
                    clearError('email');
                  }}
                />
              </div>
            </section>

            {/* Shipping */}
            <section className="border-b border-ink-200 py-6 lg:mt-10 lg:border-0">
              <div className="mb-4 flex items-center justify-between lg:border-b lg:border-ink-900 lg:pb-3.5">
                <h2 className="text-h3 text-ink-900 lg:text-h2-lg">배송지</h2>
                <Checkbox
                  checked={sameAsOrderer}
                  onChange={setSameAsOrderer}
                  label="주문자 정보와 동일"
                />
              </div>
              <div className="flex flex-col gap-4">
                {!sameAsOrderer && (
                  <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
                    <Input
                      label="받는 분"
                      required
                      value={shipping.receiver}
                      error={errors.receiver}
                      onChange={(e) => {
                        setShipping((s) => ({ ...s, receiver: e.target.value }));
                        clearError('receiver');
                      }}
                    />
                    <Input
                      label="연락처"
                      required
                      inputMode="numeric"
                      value={shipping.phone}
                      error={errors.shippingPhone}
                      onChange={(e) => {
                        setShipping((s) => ({ ...s, phone: formatPhone(e.target.value) }));
                        clearError('shippingPhone');
                      }}
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <span className="text-caption text-ink-600">
                    주소 <span className="text-ink-900">*</span>
                  </span>
                  <div className="flex gap-2">
                    <div className="flex-1 lg:max-w-[200px]">
                      <Input
                        inputMode="numeric"
                        aria-label="우편번호"
                        placeholder="우편번호"
                        value={shipping.zipcode}
                        error={errors.zipcode}
                        onChange={(e) => {
                          setShipping((s) => ({ ...s, zipcode: onlyDigits(e.target.value).slice(0, 5) }));
                          clearError('zipcode');
                        }}
                      />
                    </div>
                    <Button variant="secondary" className="h-[46px] w-[100px] flex-none lg:w-[120px]">
                      주소검색
                    </Button>
                  </div>
                  <Input
                    aria-label="기본주소"
                    placeholder="기본주소"
                    maxLength={100}
                    value={shipping.address1}
                    error={errors.address1}
                    onChange={(e) => {
                      setShipping((s) => ({ ...s, address1: e.target.value }));
                      clearError('address1');
                    }}
                  />
                  <Input
                    aria-label="상세주소"
                    placeholder="상세주소를 입력해 주세요"
                    maxLength={100}
                    value={shipping.address2}
                    error={errors.address2}
                    onChange={(e) => {
                      setShipping((s) => ({ ...s, address2: e.target.value }));
                      clearError('address2');
                    }}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Select
                    label="배송 요청사항"
                    value={memoPreset}
                    options={DELIVERY_MEMOS.map((m) => ({ value: m, label: m }))}
                    onChange={(e) => {
                      const v = e.target.value;
                      setMemoPreset(v);
                      setShipping((s) => ({ ...s, memo: v === CUSTOM_MEMO ? '' : v }));
                    }}
                  />
                  {memoPreset === CUSTOM_MEMO && (
                    <Input
                      aria-label="배송 요청사항 직접 입력"
                      placeholder="요청사항을 입력해 주세요"
                      maxLength={50}
                      value={shipping.memo}
                      onChange={(e) => setShipping((s) => ({ ...s, memo: e.target.value }))}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="border-b border-ink-200 py-6 lg:mt-10 lg:border-0">
              <h2 className="mb-4 text-h3 text-ink-900 lg:border-b lg:border-ink-900 lg:pb-3.5 lg:text-h2-lg">
                결제수단
              </h2>
              <div className="flex gap-2 lg:gap-3">
                {PAY_METHODS.map((m) => (
                  <Radio
                    key={m.code}
                    name="pay"
                    checked={payMethod === m.code}
                    onChange={() => setPayMethod(m.code)}
                    label={m.name}
                    className="lg:h-14"
                  />
                ))}
              </div>
              <p className="mt-3 text-micro text-ink-500">· 1차 범위에서는 실제 결제가 진행되지 않습니다</p>
            </section>

            {/* Mobile summary + agreements */}
            <section className="py-6 lg:hidden">
              <h2 className="mb-4 text-h3 text-ink-900">결제 금액</h2>
              {Summary}
              <div className="mt-7">{Agreements}</div>
              <p className="mt-7 text-micro text-ink-500">
                결제 버튼은 화면 하단에 고정되어 있습니다
              </p>
            </section>
          </div>

          {/* Desktop summary */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:w-[380px] lg:flex-none lg:border lg:border-ink-200 lg:p-6">
            <h2 className="mb-4 border-b border-ink-200 pb-3 text-h2-lg text-ink-900">결제 금액</h2>
            {Summary}
            <div className="mt-6 border-t border-ink-200 pt-5">{Agreements}</div>
            <Button size="xl" fullWidth loading={submitting} onClick={submit} className="mt-6">
              {won(viewAmount.finalTotal)} 결제하기
            </Button>
          </aside>
        </div>
      </div>

      {/* 모바일 하단 고정 결제 바 */}
      <div className="fixed inset-x-0 bottom-0 z-sticky border-t border-ink-200 bg-ink-0 px-4 pb-5 pt-3 shadow-sm lg:hidden">
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-caption text-ink-500">총 결제금액</span>
          <span className="text-price font-bold text-ink-900">{won(viewAmount.finalTotal)}</span>
        </div>
        <Button size="xl" fullWidth loading={submitting} onClick={submit}>
          {won(viewAmount.finalTotal)} 결제하기
        </Button>
      </div>

      <Modal
        open={!!placedOrder}
        title="주문이 완료되었습니다"
        description={
          <>
            주문번호 <strong className="text-ink-900">{placedOrder?.orderId}</strong>
            <br />
            주문 내역은 등록하신 이메일로 발송됩니다.
          </>
        }
        confirmLabel="확인"
        onClose={() => navigate('/', { replace: true })}
        onConfirm={() => navigate('/', { replace: true })}
      />
    </Layout>
  );
}
