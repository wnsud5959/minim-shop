import type { User } from '@/types';

const LATENCY = 300;
const DUPLICATED_EMAIL = 'test@test.com';

function delay<T>(data: T, ms = LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export interface SignupPayload {
  email: string;
  password: string;
  name: string;
  phone: string;
}

/** Mock 로그인 — 비밀번호 'minim1234' 만 성공 처리 */
export async function login(email: string, password: string): Promise<User> {
  await delay(null);
  if (password !== 'minim1234') {
    throw new Error('INVALID_CREDENTIALS');
  }
  return {
    id: 'u-0001',
    email,
    name: email.split('@')[0],
    phone: '010-0000-0000',
    createdAt: new Date().toISOString(),
  };
}

export async function signup(payload: SignupPayload): Promise<User> {
  await delay(null);
  if (payload.email.toLowerCase() === DUPLICATED_EMAIL) {
    throw new Error('DUPLICATED_EMAIL');
  }
  return {
    id: `u-${Date.now()}`,
    email: payload.email,
    name: payload.name,
    phone: payload.phone,
    createdAt: new Date().toISOString(),
  };
}

export async function checkEmailDuplicated(email: string): Promise<boolean> {
  return delay(email.toLowerCase() === DUPLICATED_EMAIL, 150);
}
