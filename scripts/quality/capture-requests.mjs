#!/usr/bin/env node
/**
 * Cold-cache request capture for a built `dist/` served by `vite preview`.
 *
 * Usage:
 *   node scripts/quality/capture-requests.mjs --base http://localhost:4173 \
 *     --dist dist --out docs/quality/mas-technic-awwwards/evidence/s01-baseline.json \
 *     [--routes /,/malzemeler] [--screens evidence/screens-dir]
 *
 * For every route × width (375, 1440) × motion (normal, reduce) it opens a fresh
 * browser context (cold cache), records every response for 10 s without user
 * interaction and reports:
 *   - requests split into "until load" and "load → 10 s" (automatic deferral),
 *   - unique JS files with their real transfer size AND the gzip size computed
 *     from the matching file in `dist/` (the two are reported separately, never
 *     summed into one figure),
 *   - fonts / images, long tasks (> 50 ms), console errors, page errors,
 *   - whether `#root` rendered anything (blank-root detection).
 *
 * Nothing here interacts with the page, so viewer/renderer modules that only
 * load on user request do not appear; that is intentional and stated in the
 * output.
 */
import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { gzipSync } from "node:zlib";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, value, index, all) => {
    if (value.startsWith("--")) pairs.push([value.slice(2), all[index + 1]]);
    return pairs;
  }, []),
);

const BASE = args.base ?? "http://localhost:4173";
const DIST = args.dist ?? "dist";
const OUT = args.out;
const ROUTES = (args.routes ?? "/,/malzemeler").split(",");
const SCREENS = args.screens;
const WIDTHS = [375, 1440];
const MOTIONS = ["no-preference", "reduce"];
const WINDOW_MS = 10_000;
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

if (!OUT) {
  console.error("--out is required");
  process.exit(2);
}

function distFileFor(url) {
  const { pathname } = new URL(url);
  const file = join(DIST, decodeURIComponent(pathname));
  return existsSync(file) ? file : undefined;
}

function fileFacts(url) {
  const file = distFileFor(url);
  if (!file) return {};
  const bytes = readFileSync(file);
  return {
    rawBytes: bytes.length,
    gzipBytes: gzipSync(bytes, { level: 9 }).length,
    sha256: createHash("sha256").update(bytes).digest("hex").slice(0, 16),
  };
}

const KiB = (n) => Math.round((n / 1024) * 10) / 10;

async function captureOne(browser, route, width, motion) {
  const context = await browser.newContext({
    viewport: { width, height: width < 768 ? 812 : 900 },
    reducedMotion: motion,
    deviceScaleFactor: 1,
    isMobile: width < 768,
    hasTouch: width < 768,
  });
  const page = await context.newPage();
  const started = Date.now();
  let loadAt = null;
  const responses = [];
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text().slice(0, 300));
  });
  page.on("pageerror", (error) => pageErrors.push(String(error).slice(0, 300)));
  page.on("load", () => { loadAt = Date.now() - started; });
  page.on("requestfinished", async (request) => {
    const at = Date.now() - started;
    const response = await request.response();
    let transfer = null;
    try {
      const sizes = await request.sizes();
      transfer = sizes.responseBodySize + sizes.responseHeadersSize;
    } catch { /* request already gone */ }
    responses.push({
      url: request.url(),
      type: request.resourceType(),
      status: response?.status() ?? null,
      contentType: response?.headers()["content-type"] ?? null,
      transferBytes: transfer,
      at,
    });
  });
  page.on("requestfailed", (request) => {
    responses.push({
      url: request.url(),
      type: request.resourceType(),
      status: "failed",
      failure: request.failure()?.errorText ?? null,
      at: Date.now() - started,
    });
  });

  await page.addInitScript(() => {
    window.__longTasks = [];
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          window.__longTasks.push({ start: Math.round(entry.startTime), duration: Math.round(entry.duration) });
        }
      }).observe({ type: "longtask", buffered: true });
    } catch { /* unsupported */ }
  });

  await page.goto(BASE + route, { waitUntil: "load", timeout: 60_000 });
  await page.waitForTimeout(Math.max(0, WINDOW_MS - (Date.now() - started)));

  const dom = await page.evaluate(() => {
    const root = document.getElementById("root");
    return {
      rootChildren: root ? root.children.length : -1,
      rootTextLength: root ? (root.innerText || "").trim().length : -1,
      title: document.title,
      bodyScrollWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
      documentHeight: document.documentElement.scrollHeight,
      canvases: document.querySelectorAll("canvas").length,
      longTasks: window.__longTasks ?? [],
    };
  });

  if (SCREENS) {
    mkdirSync(SCREENS, { recursive: true });
    const name = `${route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "")}-${width}-${motion === "reduce" ? "reduced" : "normal"}.png`;
    await page.screenshot({ path: join(SCREENS, name), fullPage: false });
  }

  await context.close();

  const sameOrigin = responses.filter((item) => item.url.startsWith(BASE));
  const jsByUrl = new Map();
  for (const item of sameOrigin.filter((entry) => entry.type === "script")) {
    if (!jsByUrl.has(item.url)) jsByUrl.set(item.url, { ...item, ...fileFacts(item.url) });
  }
  const js = [...jsByUrl.values()].map((item) => ({
    file: new URL(item.url).pathname,
    phase: loadAt !== null && item.at <= loadAt ? "until-load" : "load-to-10s",
    transferBytes: item.transferBytes,
    gzipBytes: item.gzipBytes ?? null,
    rawBytes: item.rawBytes ?? null,
    sha256: item.sha256 ?? null,
  }));
  const sum = (list, key) => list.reduce((total, item) => total + (item[key] ?? 0), 0);
  const untilLoad = js.filter((item) => item.phase === "until-load");
  const deferred = js.filter((item) => item.phase === "load-to-10s");

  return {
    route,
    width,
    motion,
    loadMs: loadAt,
    requestCount: responses.length,
    failedRequests: responses.filter((item) => item.status === "failed" || (typeof item.status === "number" && item.status >= 400)),
    js: {
      files: js,
      gzipKiB: { untilLoad: KiB(sum(untilLoad, "gzipBytes")), loadTo10s: KiB(sum(deferred, "gzipBytes")), total: KiB(sum(js, "gzipBytes")) },
      transferKiB: { untilLoad: KiB(sum(untilLoad, "transferBytes")), loadTo10s: KiB(sum(deferred, "transferBytes")), total: KiB(sum(js, "transferBytes")) },
    },
    css: sameOrigin.filter((item) => item.type === "stylesheet").map((item) => ({ file: new URL(item.url).pathname, ...fileFacts(item.url) })),
    fonts: responses.filter((item) => item.type === "font").map((item) => ({ url: item.url, status: item.status, contentType: item.contentType })),
    images: responses.filter((item) => item.type === "image").map((item) => ({ url: item.url.replace(BASE, ""), status: item.status, contentType: item.contentType, at: item.at })),
    imageCount: responses.filter((item) => item.type === "image").length,
    sequenceFrameRequests: responses.filter((item) => item.url.includes("/sequence-material/")).length,
    consoleErrors,
    pageErrors,
    dom,
  };
}

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const results = [];
for (const route of ROUTES) {
  for (const width of WIDTHS) {
    for (const motion of MOTIONS) {
      process.stdout.write(`capture ${route} @${width} ${motion} … `);
      const result = await captureOne(browser, route, width, motion);
      results.push(result);
      console.log(`js gzip ${result.js.gzipKiB.total} KiB, images ${result.imageCount}, frames ${result.sequenceFrameRequests}, root text ${result.dom.rootTextLength}`);
    }
  }
}
await browser.close();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify({
  capturedAt: new Date().toISOString(),
  base: BASE,
  method: "Cold browser context per run, no interaction, 10 s window. gzip = level-9 gzip of the dist file (computed); transfer = bytes on the wire from vite preview (uncompressed server). The two are never added together.",
  scope: "LOCAL_FIXTURE — built without real Supabase env; not a candidate-host measurement.",
  results,
}, null, 2));
console.log(`wrote ${OUT}`);
