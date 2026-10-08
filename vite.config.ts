import { defineConfig, loadEnv, type Plugin } from "vite";
import type { OutputChunk } from "rollup";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { normalizeOrigin } from "./src/lib/site-origin";
import { LOCALE_TABLE, parseLiveLocales } from "./src/i18n/locale";
import { HERO_IMAGE_SIZES, HERO_IMAGE_WIDTHS, heroImageFile, heroSrcSet } from "./src/components/technical-landing/hero-image";

/**
 * LCP hero görselinin preload'unu gerçek yayınlanan URL'lerle enjekte eder.
 *
 * `TechnicalHero.tsx` hero'yu `<picture>` ile basar: AVIF ve WebP, her biri
 * 480/800/1200/1672 genişlikte (`src/components/technical-landing/hero-image.ts`).
 * Görsel `/` ve `/en` rotalarının LCP elemanıdır. Vite varlıkları içerik
 * hash'iyle yayınladığı için `index.html` içine statik bir href yazılamaz; bu
 * eklenti bundle'daki nihai dosya adlarını özgün adlarından bulur ve
 * `<source>` ile aynı `imagesrcset`/`imagesizes`'a sahip tek bir AVIF preload
 * etiketi ekler. Böylece tarayıcı sayfanın çizeceği adayı önceden indirir;
 * AVIF desteklemeyen tarayıcı `type` yüzünden preload'u atlar.
 *
 * `public/` altına taşımak yerine bu yol seçildi: varlıklar hash'li kalır
 * (immutable cache) ve hero bileşeni ile preload aynı listeden türer.
 */
const HERO_LCP_DIR = "src/assets/technical-landing";

/**
 * C1 — preload the faces the first screen paints.
 *
 * Fonts are self-hosted (`src/styles/fonts.css`), so their URLs are hashed and
 * known only here. Measured on `/`, `/en` and `/sss` (375 and 1440): the hero
 * title is Space Grotesk and needs latin AND latin-ext (İ Ğ Ş in the Turkish
 * headline), the interface text is IBM Plex Mono 400/500. Those four are
 * preloaded; the other ten faces load on demand through `unicode-range`, so
 * they do not compete with the LCP image. A missing file fails the build
 * rather than shipping a preload that 404s.
 */
const CRITICAL_FONTS = [
  /(?:^|\/)space-grotesk-normal-400-500-600-700-latin-[^/]*\.woff2$/,
  /(?:^|\/)space-grotesk-normal-400-500-600-700-latin-ext-[^/]*\.woff2$/,
  /(?:^|\/)ibm-plex-mono-normal-400-latin-[^/]*\.woff2$/,
  /(?:^|\/)ibm-plex-mono-normal-500-latin-[^/]*\.woff2$/,
];

function fontPreloadPlugin(): Plugin {
  return {
    name: "mas-font-preload",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const base = ctx.path.replace(/[^/]*$/, "");
        const files = Object.keys(ctx.bundle);
        const tags = CRITICAL_FONTS.map((pattern) => {
          // `latin-[hash]` must not also match `latin-ext-[hash]`.
          const file = files.find((name) => pattern.test(name) && (pattern.source.includes("latin-ext") || !name.includes("latin-ext")));
          if (!file) throw new Error(`[mas-font-preload] no emitted font matches ${pattern}`);
          return {
            tag: "link",
            attrs: { rel: "preload", as: "font", type: "font/woff2", href: `${base}${file}`, crossorigin: "" },
            injectTo: "head" as const,
          };
        });
        return { html, tags };
      },
    },
  };
}

function heroPreloadPlugin(): Plugin {
  return {
    name: "mas-hero-preload",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        // Dev sunucusunda varlıklar kaynak yolundan servis edilir.
        const urlFor = (file: string) => {
          if (!ctx.bundle) return `/${HERO_LCP_DIR}/${file}`;
          const asset = Object.values(ctx.bundle).find(
            (item) => item.type === "asset" && (item.names?.includes(file) || item.name === file),
          );
          if (!asset) {
            // Sessizce yanlış bir preload yayınlamaktansa derlemeyi durdur:
            // 404'e ya da `text/html`'e çözülen bir preload tam olarak bu
            // eklentinin ortadan kaldırmak için var olduğu hatadır.
            throw new Error(`[mas-hero-preload] ${HERO_LCP_DIR}/${file} bundle çıktısında bulunamadı; preload enjekte edilemiyor.`);
          }
          return `${ctx.path.replace(/[^/]*$/, "")}${asset.fileName}`.replace(/\/{2,}/g, "/");
        };
        const avif = Object.fromEntries(HERO_IMAGE_WIDTHS.map((width) => [width, urlFor(heroImageFile(width, "avif"))])) as Record<(typeof HERO_IMAGE_WIDTHS)[number], string>;
        const href = avif[1672];
        const imagesrcset = heroSrcSet(avif);
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
                type: "image/avif",
                href,
                imagesrcset,
                imagesizes: HERO_IMAGE_SIZES,
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
  const live = parseLiveLocales(
    process.env.VITE_SITE_LOCALES ?? env.VITE_SITE_LOCALES,
    process.env.VITE_SITE_ENGLISH ?? env.VITE_SITE_ENGLISH,
  ).filter((code) => code !== "tr");

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
          /* Share images must be absolute; index.html carries a root path. */
          html: out.replace(/(<meta\s+(?:property="og:image"|name="twitter:image")\s+content=")\/(?!\/)/g, `$1${origin}/`),
          tags: [
            { tag: "link", attrs: { rel: "canonical", href: `${origin}/` }, injectTo: "head" },
            { tag: "meta", attrs: { property: "og:url", content: `${origin}/` }, injectTo: "head" },
            // Language pairs only when another language ships (L1 `VITE_SITE_LOCALES`).
            ...(live.length ? [
              { tag: "link", attrs: { rel: "alternate", hreflang: "tr", href: `${origin}/` }, injectTo: "head" as const },
              ...live.map((code) => ({ tag: "link", attrs: { rel: "alternate", hreflang: code, href: `${origin}${LOCALE_TABLE[code].prefix}` }, injectTo: "head" as const })),
              { tag: "link", attrs: { rel: "alternate", hreflang: "x-default", href: `${origin}/` }, injectTo: "head" as const },
            ] : []),
          ],
        };
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => ({
  server: {
    /* Every interface, IPv4 and IPv6 alike: "::" alone fails to listen
       (EAFNOSUPPORT) on a machine without IPv6. */
    host: true,
    port: 8080,
  },
  plugins: [react(), siteMetaPlugin(mode, command), heroPreloadPlugin(), fontPreloadPlugin(), buildIdentityPlugin(command)].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    /* L2: the Russian-only families (IBM Plex Sans, Source Serif 4) are
       always separate files. Under the default 4 KiB limit their small
       symbol subsets were inlined into the stylesheet every visitor blocks
       on (+~6 KiB gz). Everything else keeps the default. */
    assetsInlineLimit: (filePath: string) =>
      /\/(ibm-plex-sans|source-serif-4)-[^/]*\.woff2$/.test(filePath) ? false : undefined,
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
