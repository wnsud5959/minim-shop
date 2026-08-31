import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * 테스트 전용 설정. vite.config.ts와 분리해 빌드 설정을 건드리지 않는다.
 * - environment: jsdom — zustand persist가 localStorage를 참조하므로 필요
 * - globals: false — describe/it/expect를 명시적으로 import한다.
 *   tsconfig의 include가 src이므로, 전역 타입을 쓰면 npm run typecheck가 깨진다.
 */
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
});
