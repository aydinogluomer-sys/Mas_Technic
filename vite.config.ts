import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    rollupOptions: {
      treeshake: {
        moduleSideEffects(id) {
          const moduleId = id.replace(/\\/g, "/");
          if (moduleId.includes("/node_modules/@react-three/") || moduleId.includes("/node_modules/three/")) return false;
          return true;
        },
      },
      output: {
        hoistTransitiveImports: false,
        manualChunks(id) {
          const moduleId = id.replace(/\\/g, "/");
          if (moduleId.includes("vite/preload-helper")) return "vendor-runtime";
          if (!moduleId.includes("/node_modules/")) return;
          if (/\/node_modules\/(clsx|tailwind-merge|class-variance-authority)\//.test(moduleId)) return "vendor-utils";
          if (moduleId.includes("/node_modules/framer-motion/")) return "vendor-framer";
          if (moduleId.includes("/node_modules/gsap/")) return "vendor-gsap";
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(moduleId)) return "vendor-react";
          // xlsx-js-style intentionally NOT chunked here — loaded via dynamic
          // import() inside src/utils/excelExport.ts so it splits into its
          // own async chunk and stays out of the landing initial load.
        },
      },
    },
  },
}));
