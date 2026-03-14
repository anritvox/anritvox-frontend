import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks(id) {
          if (id.includes('lucide-react')) {
            return 'lucide-icons';
          }
          if (id.includes('framer-motion') || id.includes('motion-utils')) {
            return 'framer-motion';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: ["lucide-react"],
    exclude: ["node-mailjet"],
  },
  define: {
    global: "globalThis",
  },
});
