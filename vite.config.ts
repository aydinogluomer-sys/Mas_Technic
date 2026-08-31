import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * LCP hero görselinin preload'unu gerçek yayınlanan URL ile enjekte eder.
 *
 * `TechnicalHero.tsx` `src/assets/technical-landing/hero-manifold-v1.webp`
 * görselini basar ve o görsel `/` rotasının LCP elemanıdır. Vite varlığı
 * içerik hash'iyle yayınladığı için `index.html` içine statik bir href
 * yazılamaz; bu eklenti `transformIndexHtml` bağlamındaki bundle'dan nihai
 * dosya adını okuyup tek bir preload etiketi ekler.
 *
 * `public/` altına taşımak yerine bu yol seçildi: varlık hash'li kalır
 * (immutable cache), tek kopya olarak kalır ve hero bileşeni ile preload
 * hedefinin aynı dosyadan türemesi derleme zamanında garanti altına alınır.
 */
const HERO_LCP_SOURCE = "src/assets/technical-landing/hero-manifold-v1.webp";
const HERO_LCP_EMITTED = /(?:^|\/)hero-manifold-v1-[^/]*\.webp$/;

function heroPreloadPlugin(): Plugin {
  return {
    name: "mas-hero-preload",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        // Dev sunucusunda varlık kaynak yolundan servis edilir.
        let href = `/${HERO_LCP_SOURCE}`;
        if (ctx.bundle) {
          const emitted = Object.keys(ctx.bundle).find((file) => HERO_LCP_EMITTED.test(file));
          if (!emitted) {
            // Sessizce yanlış bir preload yayınlamaktansa derlemeyi durdur:
            // 404'e ya da `text/html`'e çözülen bir preload tam olarak bu
            // eklentinin ortadan kaldırmak için var olduğu hatadır.
            throw new Error(
              `[mas-hero-preload] ${HERO_LCP_SOURCE} bundle çıktısında bulunamadı; preload enjekte edilemiyor.`,
            );
          }
          href = `${ctx.path.replace(/[^/]*$/, "")}${emitted}`.replace(/\/{2,}/g, "/");
        }
        return {
          html,
          tags: [
            {
              tag: "link",
              attrs: {
                rel: "preload",
                as: "image",
                type: "image/webp",
                href,
                fetchpriority: "high",
              },
              injectTo: "head",
            },
          ],
        };
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger(), heroPreloadPlugin()].filter(Boolean),
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
