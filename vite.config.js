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
          if (!id?.includes("node_modules")) return;
          if (id.includes("lucide-react")) return "lucide-icons";
          if (id.includes("framer-motion") || id.includes("motion-utils")) return "framer-motion";
          return "vendor";
        },
      },
    },
  },
});
