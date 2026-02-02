import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // 相対パスでアセットを読み込むように設定
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});