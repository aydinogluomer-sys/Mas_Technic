import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { normalizeOrigin } from "./src/lib/site-origin";

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

/**
 * SEO01 — the static head follows the public site config.
 *
 * `VITE_SITE_ORIGIN` (https origin, no path) and `VITE_SITE_INDEXING`
 * (`public` | `preview`, default `preview`) are read here and in
 * `src/lib/site-config.ts`. The origin is never written into the source:
 * `index.html` carries no canonical and no og:url of its own, and this plugin
 * adds them only when an origin is configured.
 *
 *   preview (default)  robots `noindex, nofollow`; no canonical without an origin.
 *   public             robots `index, follow`; canonical, og:url and hreflang
 *                      tr / en / x-default for the home page. A public BUILD
 *                      without a valid origin fails here.
 *
 * Per-route values are written at runtime by `usePageMeta` (SPA). The
 * prerender adapter that would bake them into each route's HTML is
 * BLOCKED_DATA until the host is known (owner input O01).
 */
function siteMetaPlugin(mode: string, command: "build" | "serve"): Plugin {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const rawIndexing = (process.env.VITE_SITE_INDEXING ?? env.VITE_SITE_INDEXING ?? "").trim();
  const rawOrigin = process.env.VITE_SITE_ORIGIN ?? env.VITE_SITE_ORIGIN;
  const origin = normalizeOrigin(rawOrigin);

  if (rawIndexing && rawIndexing !== "public" && rawIndexing !== "preview") {
    throw new Error(`[mas-site-meta] VITE_SITE_INDEXING must be "public" or "preview", got "${rawIndexing}".`);
  }
  if (rawOrigin && !origin) {
    throw new Error(`[mas-site-meta] VITE_SITE_ORIGIN must be a bare https origin (https://host), got "${rawOrigin}".`);
  }
  if (command === "build" && rawIndexing === "public" && !origin) {
    throw new Error("[mas-site-meta] VITE_SITE_INDEXING=public requires VITE_SITE_ORIGIN. A public build must state its origin.");
  }
  const indexable = rawIndexing === "public" && Boolean(origin);

  return {
    name: "mas-site-meta",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        const robots = indexable
          ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          : "noindex, nofollow";
        const out = html
          .replace(/\s*<link rel="canonical"[^>]*>/g, "")
          .replace(/\s*<meta property="og:url"[^>]*>/g, "")
          .replace(/(<meta name="robots" content=")[^"]*(")/, `$1${robots}$2`);
        if (!origin) return out;
        return {
          html: out,
          tags: [
            { tag: "link", attrs: { rel: "canonical", href: `${origin}/` }, injectTo: "head" },
            { tag: "meta", attrs: { property: "og:url", content: `${origin}/` }, injectTo: "head" },
            { tag: "link", attrs: { rel: "alternate", hreflang: "tr", href: `${origin}/` }, injectTo: "head" },
            { tag: "link", attrs: { rel: "alternate", hreflang: "en", href: `${origin}/en` }, injectTo: "head" },
            { tag: "link", attrs: { rel: "alternate", hreflang: "x-default", href: `${origin}/` }, injectTo: "head" },
          ],
        };
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger(), siteMetaPlugin(mode, command), heroPreloadPlugin()].filter(Boolean),
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
