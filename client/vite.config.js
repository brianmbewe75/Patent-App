import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const clientDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(clientDir, '..');

export default defineConfig({
  plugins: [react()],
  root: clientDir,
  build: {
    outDir: path.join(clientDir, 'dist'),
    emptyOutDir: true,
  },
  css: {
    postcss: path.join(rootDir, 'postcss.config.js'),
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
