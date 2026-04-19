import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    })
  ],
  server: {
    port: 3000,
  },
  build: {
    // Let Rollup automatically chunk dependencies safely to preserve interop logic
    chunkSizeWarningLimit: 1500
  }
});
