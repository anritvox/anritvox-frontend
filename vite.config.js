import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/lucide-react/')) {
            return 'lucide-icons';
          }
          if (id.includes('/node_modules/framer-motion/') || id.includes('/node_modules/motion-utils/')) {
            return 'framer-motion';
          }
        },
      },
    },
  },
  // Removed optimizeDeps referring to node-mailjet
  define: {
    global: "globalThis",
  },
});
