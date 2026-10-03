/**
 * PERF01 — lab profile: five cold runs per route/width under a slow-4G network
 * profile and 4× CPU throttling (Chrome DevTools Protocol), reporting the
 * median and p75 of LCP and CLS, the JavaScript transferred in the first 10 s
 * (initial + 10 s budget, gzip bytes on the wire), lab total blocking time,
 * plus one HAR per route/width.
 *
 *   PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium \
 *   node scripts/quality/perf-lab.mjs --base http://127.0.0.1:4181 \
 *     --out docs/quality/mas-technic-awwwards/evidence/p7-perf-lab.json \
 *     --har-dir docs/quality/mas-technic-awwwards/evidence/har [--routes /,/en] [--runs 5] \
 *     [--scope "what was served and how"]
 *
 * LAB ONLY. This is not field data: no INP is reported (Lighthouse-style TBT
 * is not INP, and there is no real-user interaction here), and nothing in the
 * output may be described as "Core Web Vitals passed". Third-party hosts that
 * the sandbox cannot reach (Google Fonts) are aborted and listed.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, value, index, all) => {
    if (value.startsWith("--")) pairs.push([value.slice(2), all[index + 1]]);
    return pairs;
  }, []),
);
const BASE = args.base ?? "http://127.0.0.1:4181";
const ROUTES = (args.routes ?? "/,/en").split(",");
const RUNS = Number(args.runs ?? 5);
const WIDTHS = (args.widths ?? "375,1440").split(",").map(Number);
/* "Slow 4G" as Chrome DevTools defines it (2024+): 150 ms RTT, ~1.6 Mbps down,
   ~750 Kbps up. CPU 4× slowdown, the DevTools mobile preset. */
const NETWORK = { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };
const CPU_RATE = 4;
const BLOCKED = /fonts\.(googleapis|gstatic)\.com|supabase\.co/;

const percentile = (values, p) => {
  const sorted = [...values].sort((a, b) => a - b);
  const rank = (p / 100) * (sorted.length - 1);
  const low = Math.floor(rank), high = Math.ceil(rank);
  return Math.round((sorted[low] + (sorted[high] - sorted[low]) * (rank - low)) * 1000) / 1000;
};

async function runOnce(browser, route, width, harPath) {
  const context = await browser.newContext({
    viewport: { width, height: width === 375 ? 812 : 900 },
    ...(harPath ? { recordHar: { path: harPath, content: "omit" } } : {}),
  });
  const blocked = new Set();
  await context.route("**/*", (request) => {
    if (BLOCKED.test(request.request().url())) {
      blocked.add(new URL(request.request().url()).host);
      return request.abort();
    }
    return request.continue();
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", NETWORK);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_RATE });
  await page.addInitScript(() => {
    window.__lab = { lcp: 0, cls: 0, lcpElement: "", tbt: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__lab.tbt += Math.max(0, entry.duration - 50);
    }).observe({ type: "longtask", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__lab.lcp = entry.startTime;
        window.__lab.lcpElement = entry.element ? `${entry.element.tagName.toLowerCase()}.${entry.element.className}`.slice(0, 80) : entry.url;
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__lab.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  /* JS budget: compressed bytes of every script response finished within the
     first 10 s after navigation start. */
  const scripts = new Map();
  let jsBytes = 0;
  cdp.on("Network.responseReceived", (event) => { if (event.type === "Script") scripts.set(event.requestId, true); });
  cdp.on("Network.loadingFinished", (event) => { if (scripts.has(event.requestId)) jsBytes += event.encodedDataLength; });
  const started = Date.now();
  await page.goto(BASE + route, { waitUntil: "load", timeout: 120_000 });
  await page.waitForTimeout(Math.max(0, 10_000 - (Date.now() - started)));
  const jsKiB10s = Math.round((jsBytes / 1024) * 10) / 10;
  const lab = await page.evaluate(() => window.__lab);
  const nav = await page.evaluate(() => {
    const [entry] = performance.getEntriesByType("navigation");
    return entry ? { ttfb: Math.round(entry.responseStart), domContentLoaded: Math.round(entry.domContentLoadedEventEnd), load: Math.round(entry.loadEventEnd) } : null;
  });
  await context.close();
  return { lcpMs: Math.round(lab.lcp), cls: Math.round(lab.cls * 10000) / 10000, lcpElement: lab.lcpElement, tbtMs: Math.round(lab.tbt), jsKiB10s, nav, wallMs: Date.now() - started, blockedHosts: [...blocked] };
}

const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {});
const results = [];
if (args["har-dir"]) mkdirSync(args["har-dir"], { recursive: true });
for (const route of ROUTES) {
  for (const width of WIDTHS) {
    const runs = [];
    for (let i = 0; i < RUNS; i += 1) {
      const harPath = i === 0 && args["har-dir"] ? `${args["har-dir"]}/${route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "")}-${width}.har` : null;
      runs.push(await runOnce(browser, route, width, harPath));
    }
    const lcp = runs.map((run) => run.lcpMs);
    const cls = runs.map((run) => run.cls);
    const summary = {
      route, width, runs: RUNS,
      lcpMs: { median: percentile(lcp, 50), p75: percentile(lcp, 75) },
      cls: { median: percentile(cls, 50), p75: percentile(cls, 75) },
      lcpElement: runs[0].lcpElement,
      jsKiB10s: { median: percentile(runs.map((run) => run.jsKiB10s), 50), max: Math.max(...runs.map((run) => run.jsKiB10s)) },
      labTbtMs: { median: percentile(runs.map((run) => run.tbtMs), 50), p75: percentile(runs.map((run) => run.tbtMs), 75) },
      targets: { lcpMs: 2500, cls: 0.1, jsKiB10s: 320 },
      passLab: percentile(lcp, 75) <= 2500 && percentile(cls, 75) <= 0.1 && Math.max(...runs.map((run) => run.jsKiB10s)) <= 320,
      blockedHosts: [...new Set(runs.flatMap((run) => run.blockedHosts))],
      detail: runs,
    };
    console.log(`${route} @${width}: LCP median ${summary.lcpMs.median} ms p75 ${summary.lcpMs.p75} ms · CLS p75 ${summary.cls.p75} · JS(10s) ${summary.jsKiB10s.max} KiB · lab TBT p75 ${summary.labTbtMs.p75} ms · ${summary.lcpElement}`);
    results.push(summary);
  }
}
await browser.close();
const out = {
  capturedAt: new Date().toISOString(),
  base: BASE,
  profile: { network: "Slow 4G (150 ms RTT, 1.6 Mbps down, 750 Kbps up)", cpuThrottling: `${CPU_RATE}x`, runsPerCell: RUNS, coldContextPerRun: true },
  scope: args.scope ?? "LOCAL_FIXTURE lab — local server, placeholder Supabase env. Not field data; INP NOT_MEASURED; lab TBT is not INP.",
  results,
};
if (args.out) writeFileSync(args.out, JSON.stringify(out, null, 2));
console.log(args.out ? `wrote ${args.out}` : JSON.stringify(out, null, 2));
