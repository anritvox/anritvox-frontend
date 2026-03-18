import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks(id) {
          if (id && id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'lucide-icons';
            if (id.includes('framer-motion') || id.includes('motion-utils')) return 'framer-motion';
            return 'vendor'; // Groups remaining dependencies cleanly
          }
        },
      },
    },
  },
  define: {
    global: "globalThis",
  },
});
