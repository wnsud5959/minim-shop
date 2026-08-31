import { describe, it, expect } from 'vitest';
import {
  calcSalePrice,
  calcShippingFee,
  comma,
  cx,
  formatPhone,
  isEmail,
  isName,
  isPassword,
  isPhone,
  normalizePhoneDigits,
  passwordStrength,
  won,
} from '@/lib/format';

describe('금액 표기', () => {
  it('세 자리마다 콤마를 넣는다', () => {
    expect(comma(1234000)).toBe('1,234,000');
    expect(comma(0)).toBe('0');
  });

  it('원 단위를 붙인다', () => {
    expect(won(3000)).toBe('3,000원');
  });
});

describe('calcSalePrice — 10원 절사', () => {
  it('나누어떨어지는 경우', () => {
    expect(calcSalePrice(168000, 15)).toBe(142800);
  });

  it('10원 미만은 버린다', () => {
    // 12345 * 0.9 = 11110.5 → 11110
    expect(calcSalePrice(12345, 10)).toBe(11110);
  });

  it('할인율 0이면 정가 그대로', () => {
    expect(calcSalePrice(50000, 0)).toBe(50000);
  });

  it('할인율 100이면 0원', () => {
    expect(calcSalePrice(50000, 100)).toBe(0);
  });
});

describe('calcShippingFee — 배송비 경계값', () => {
  it('합계가 0 이하면 배송비도 0', () => {
    // 장바구니에서 아무것도 선택하지 않았을 때 3,000원이 뜨면 안 된다
    expect(calcShippingFee(0)).toBe(0);
    expect(calcShippingFee(-1)).toBe(0);
  });

  it('무료배송 기준 미만이면 3,000원', () => {
    expect(calcShippingFee(1)).toBe(3000);
    expect(calcShippingFee(49999)).toBe(3000);
  });

  it('무료배송 기준 이상이면 0원', () => {
    expect(calcShippingFee(50000)).toBe(0);
    expect(calcShippingFee(50001)).toBe(0);
  });
});

describe('전화번호 정규화·표기', () => {
  it('국가번호 +82를 0으로 바꾼다', () => {
    expect(normalizePhoneDigits('+82 10-1234-5678')).toBe('01012345678');
  });

  it('11자리를 넘으면 잘라낸다', () => {
    expect(normalizePhoneDigits('010123456789')).toBe('01012345678');
  });

  it('11자리를 3-4-4로 끊는다', () => {
    expect(formatPhone('01012345678')).toBe('010-1234-5678');
  });

  it('10자리를 3-3-4로 끊는다', () => {
    expect(formatPhone('0212345678')).toBe('021-234-5678');
  });

  it('입력 중인 짧은 값도 깨지지 않는다', () => {
    expect(formatPhone('010')).toBe('010');
    expect(formatPhone('01012')).toBe('010-12');
  });
});

describe('입력 검증', () => {
  it('이메일 형식', () => {
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('a@b')).toBe(false);
    expect(isEmail('a b@c.com')).toBe(false);
    expect(isEmail('')).toBe(false);
  });

  it('전화번호는 0으로 시작하는 10~11자리', () => {
    expect(isPhone('01012345678')).toBe(true);
    expect(isPhone('010-1234-5678')).toBe(true);
    expect(isPhone('1012345678')).toBe(false);
    expect(isPhone('010123456')).toBe(false);
  });

  it('비밀번호는 8자 이상 + 영문 + 숫자', () => {
    expect(isPassword('minim1234')).toBe(true);
    expect(isPassword('abcdefgh')).toBe(false);
    expect(isPassword('12345678')).toBe(false);
    expect(isPassword('abc123')).toBe(false);
  });

  it('이름은 공백 제외 2자 이상', () => {
    expect(isName('홍길')).toBe(true);
    expect(isName('ab')).toBe(true);
    expect(isName(' a ')).toBe(false);
    expect(isName('')).toBe(false);
  });

  // 화면정책서는 "2자 이상 한글/영문"을 요구하나 현재 구현은 길이만 본다.
  it.todo('QA-068: 숫자·기호만 입력된 이름을 거부해야 한다');
});

describe('passwordStrength', () => {
  it('빈 값은 0', () => {
    expect(passwordStrength('')).toBe(0);
  });

  it('짧고 숫자 없으면 0', () => {
    expect(passwordStrength('abcd')).toBe(0);
  });

  it('8자 이상 + 영문·숫자면 2', () => {
    expect(passwordStrength('abcd1234')).toBe(2);
  });

  it('특수문자가 있으면 3', () => {
    expect(passwordStrength('abcd1234!')).toBe(3);
  });

  it('12자 이상이면 특수문자 없이도 3', () => {
    expect(passwordStrength('abcdefgh1234')).toBe(3);
  });
});

describe('cx', () => {
  it('거짓값을 걸러내고 공백으로 잇는다', () => {
    expect(cx('a', false, 'b', null, undefined, 'c')).toBe('a b c');
    expect(cx()).toBe('');
  });
});
