import { defineConfig, loadEnv, type Plugin } from "vite";
import type { OutputChunk } from "rollup";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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
        /* PERF01 — THE LANDING'S OWN CHUNKS, DISCOVERED EARLY. The landing is
           a lazy route, so its JS and CSS used to be requested only after the
           entry script had run and resolved the route: two more round trips
           before the hero could paint (lab, slow 4G). The chunk graph is known
           here, so the landing's chunks and stylesheets are preloaded from the
           HTML — but only on `/` and `/en`, by a guard in an inline script, so
           no other route downloads them. */
        const landingAssets: [string, string][] = [];
        if (ctx.bundle) {
          const base = ctx.path.replace(/[^/]*$/, "");
          const chunks = Object.values(ctx.bundle).filter((item): item is OutputChunk => item.type === "chunk");
          const entry = chunks.find((chunk) => chunk.isEntry);
          const preloaded = new Set<string>([...(entry?.imports ?? []), entry?.fileName ?? ""]);
          const landing = chunks.find((chunk) => chunk.facadeModuleId?.replace(/\\/g, "/").endsWith("/src/pages/Index.tsx"));
          const visit = (chunk: OutputChunk | undefined) => {
            if (!chunk || preloaded.has(chunk.fileName)) return;
            preloaded.add(chunk.fileName);
            landingAssets.push(["modulepreload", `${base}${chunk.fileName}`]);
            for (const css of chunk.viteMetadata?.importedCss ?? []) landingAssets.push(["style", `${base}${css}`]);
            for (const name of chunk.imports) visit(chunks.find((item) => item.fileName === name));
          };
          visit(landing);
          /* On `/en` the route also waits for the English dictionary. */
          const dictionary = chunks.find((chunk) => chunk.facadeModuleId?.replace(/\\/g, "/").endsWith("/src/i18n/locales/en.ts"));
          if (dictionary) landingAssets.push(["modulepreload-en", `${base}${dictionary.fileName}`]);
        }
        const landingScript = landingAssets.length
          ? `(function(){var p=location.pathname;if(!/^\\/(en\\/?)?$/.test(p))return;var en=p.indexOf("/en")===0;${JSON.stringify(landingAssets)}.forEach(function(a){if(a[0]==="modulepreload-en"&&!en)return;var l=document.createElement("link");if(a[0]==="style"){l.rel="preload";l.as="style"}else{l.rel="modulepreload"}l.href=a[1];document.head.appendChild(l)})})();`
          : null;
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
            ...(landingScript ? [{ tag: "script", children: landingScript, injectTo: "head" as const }] : []),
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
/**
 * RELEASE01 — BUILD IDENTITY. Every production build writes `release.json`
 * at the site root and a `<meta name="mas-build">` in `index.html`:
 *
 *   commit     the git commit the build was made from (`GITHUB_SHA` in CI,
 *              else `git rev-parse HEAD`; "unknown" outside a checkout)
 *   builtAt    ISO build time
 *   files      sha256 + bytes of every emitted asset and of the final
 *              `index.html`, so a deployed response can be compared with the
 *              build it claims to be (`scripts/quality/verify-release.mjs`)
 *
 * No environment value is written — not the Supabase URL or key, not the site
 * origin. A local `git rev-parse HEAD` proves only the checkout; the live
 * version is proven by fetching `/release.json` from the host and matching it.
 */
function buildIdentityPlugin(command: "build" | "serve"): Plugin {
  const commit = (() => {
    if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
    try {
      return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    } catch {
      return "unknown";
    }
  })();
  const builtAt = new Date().toISOString();
  const sha = (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex");
  let outDir = "";
  return {
    name: "mas-build-identity",
    enforce: "post",
    apply: () => command === "build",
    transformIndexHtml: {
      order: "post",
      handler: () => [{ tag: "meta", attrs: { name: "mas-build", content: `${commit} ${builtAt}` }, injectTo: "head" }],
    },
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    /* Hashed from the files as WRITTEN, after every plugin has finished with
       them — chunk code seen in `generateBundle` can still change (preload
       markers), and `public/` files (PDFs, robots.txt) never pass through the
       bundle at all. */
    closeBundle() {
      if (!outDir || !existsSync(outDir)) return;
      const files: Record<string, { sha256: string; bytes: number }> = {};
      const walk = (dir: string) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) { walk(full); continue; }
          const name = path.relative(outDir, full).split(path.sep).join("/");
          if (name === "release.json" || name.startsWith(".vite/")) continue;
          const data = readFileSync(full);
          files[name] = { sha256: sha(data), bytes: data.byteLength };
        }
      };
      walk(outDir);
      writeFileSync(path.join(outDir, "release.json"), `${JSON.stringify({ name: "mas-technic", commit, builtAt, files }, null, 2)}\n`);
    },
  };
}

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
  plugins: [react(), mode === "development" && componentTagger(), siteMetaPlugin(mode, command), heroPreloadPlugin(), buildIdentityPlugin(command)].filter(Boolean),
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
