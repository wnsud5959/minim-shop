/**
 * 저장소 접근 실패(프라이빗 모드 · 용량 초과 · 차단)가
 * 구매 플로우를 중단시키지 않도록 감싼 어댑터.
 * zustand persist의 storage로 사용한다.
 */
export interface SafeStorage {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
}

export function createSafeStorage(pick?: (value: string) => Storage): SafeStorage {
  const resolve = (value?: string): Storage | null => {
    try {
      return pick && value !== undefined ? pick(value) : window.localStorage;
    } catch {
      return null;
    }
  };

  return {
    getItem: (name: string): string | null => {
      try {
        return window.sessionStorage.getItem(name) ?? window.localStorage.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      try {
        const target = resolve(value);
        if (!target) return;
        target.setItem(name, value);
        // 반대편 저장소에 남은 이전 값 제거
        const other = target === window.localStorage ? window.sessionStorage : window.localStorage;
        other.removeItem(name);
      } catch {
        /* 저장 실패는 무시 — 화면 동작을 막지 않는다 */
      }
    },
    removeItem: (name: string): void => {
      try {
        window.sessionStorage.removeItem(name);
        window.localStorage.removeItem(name);
      } catch {
        /* noop */
      }
    },
  };
}
