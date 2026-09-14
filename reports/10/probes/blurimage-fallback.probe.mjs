// Fallback proof for BlurImage: bundles the component with a deliberately wrong
// `src`, serves it from an in-memory route, and reads the DOM back.
import { build } from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/esbuild/lib/main.js";
import { chromium } from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/@playwright/test/index.mjs";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const WT = "C:/Users/Trade Bilisim/precision-dynamics-hub-main/.claude/worktrees/agent-afba71844040fe0c0";

const result = await build({
  entryPoints: [join(here, "entry.tsx")],
  bundle: true,
  write: false,
  format: "iife",
  jsx: "automatic",
  absWorkingDir: WT,
  nodePaths: [join(WT, "node_modules")],
  alias: { "@": join(WT, "src") },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "error",
});
const js = result.outputFiles[0].text;
const tokens = readFileSync(join(WT, "src/styles/design-tokens.css"), "utf8");
const okImage = readFileSync(join(WT, "src/assets/hero-cnc-frezeleme-640.webp"));

const html = `<!doctype html><html><head><style>${tokens}
.w-full{width:100%}.h-full{height:100%}.object-cover{object-fit:cover}</style></head>
<body style="margin:0"><div id="root"></div><script>${js}</script></body></html>`;

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 700, height: 460 } });
await page.route("**/*", (route) => {
  const url = route.request().url();
  if (url.endsWith("/probe.html")) return route.fulfill({ contentType: "text/html", body: html });
  if (url.endsWith("/ok.webp")) return route.fulfill({ contentType: "image/webp", body: okImage });
  return route.fulfill({ status: 404, body: "not found" });
});
await page.goto("http://probe.local/probe.html");
await page.waitForFunction(() => document.querySelector("#broken [data-image-fallback]") && document.querySelector("#ok img")?.complete);
await page.waitForTimeout(700);

const report = await page.evaluate(() => {
  const broken = document.querySelector("#broken");
  const fb = broken.querySelector("[data-image-fallback]");
  const cs = getComputedStyle(fb);
  const ok = document.querySelector("#ok img");
  return {
    broken_has_img: !!broken.querySelector("img"),
    fallback_role: fb.getAttribute("role"),
    fallback_label: fb.getAttribute("aria-label"),
    fallback_text: fb.textContent,
    fallback_bg: cs.backgroundColor,
    fallback_color: cs.color,
    fallback_font: cs.fontFamily,
    fallback_box: [fb.getBoundingClientRect().width, fb.getBoundingClientRect().height],
    ok_natural: [ok.naturalWidth, ok.naturalHeight],
    ok_attrs: [ok.getAttribute("width"), ok.getAttribute("height"), ok.getAttribute("loading"), ok.getAttribute("decoding")],
    ok_filter: getComputedStyle(ok).filter,
  };
});
console.log(JSON.stringify(report, null, 2));
await page.screenshot({ path: join(here, "fallback-proof.png") });
await browser.close();
