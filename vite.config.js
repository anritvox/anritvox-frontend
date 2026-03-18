import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks(id) {
          // Fix: Added safety check for 'id' to prevent Vercel build crashes
          if (id && id.includes('/node_modules/lucide-react/')) {
            return 'lucide-icons';
          }
          if (id && (id.includes('/node_modules/framer-motion/') || id.includes('/node_modules/motion-utils/'))) {
            return 'framer-motion';
          }
        },
      },
    },
  },
  define: {
    global: "globalThis",
  },
});
