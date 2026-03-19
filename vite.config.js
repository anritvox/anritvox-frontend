import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // 1. Prioritize React core libraries into their own chunk
            if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/")) {
              return "react-vendor";
            }
            // 2. Chunk Lucide icons
            if (id.includes("lucide-react")) {
              return "lucide-icons";
            }
            // 3. Chunk Framer Motion
            if (id.includes("framer-motion") || id.includes("motion-utils")) {
              return "framer-motion";
            }
            // 4. Everything else goes to the general vendor chunk
            return "vendor";
          }
        },
      },
    },
  },
});
