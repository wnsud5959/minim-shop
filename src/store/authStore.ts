import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { createSafeStorage } from '@/lib/storage';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  keepLogin: boolean;
  setKeepLogin: (v: boolean) => void;
  signIn: (user: User) => void;
  signOut: () => void;
}

/**
 * "로그인 상태 유지" 정책.
 * 체크 시 localStorage(브라우저 재시작 후에도 유지), 미체크 시 sessionStorage(탭 종료 시 만료).
 * 저장 시점의 keepLogin 값으로 저장소를 선택하고 반대편 값은 제거한다.
 */
const authStorage = createSafeStorage((value: string): Storage => {
  let keep = false;
  try {
    keep = Boolean(JSON.parse(value)?.state?.keepLogin);
  } catch {
    keep = false;
  }
  return keep ? window.localStorage : window.sessionStorage;
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      keepLogin: false,
      setKeepLogin: (keepLogin) => set({ keepLogin }),
      signIn: (user) => set({ user, isLoggedIn: true }),
      signOut: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: 'minim-auth',
      storage: createJSONStorage(() => authStorage),
    },
  ),
);
