import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * GitHub Pages 프로젝트 페이지는 https://<user>.github.io/<repo>/ 하위에 배포되므로
 * CI에서 BASE_PATH를 주입한다. 로컬 개발에서는 '/'.
 */
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: { port: 5173, open: true },
  build: { outDir: 'dist', sourcemap: false },
});
