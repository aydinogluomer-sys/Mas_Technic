/**
 * QA PROBE — criterion 3, second instrument.
 * The landing family paints from `--tl-*` / `--sf-*` (graphite, paper, bronze).
 * The pre-redesign language painted from the shadcn `--primary` teal. Count,
 * per route, the visible nodes inside <main> whose background or text colour
 * is in the teal family (hue 170-210, sat > 0.3), and the Radix component
 * roots present.
 */
import { chromium } from "playwright";
const BASE = "http://localhost:4173";
const ROUTES = [
  "/kabiliyet-profilleri", "/kalite-dosyasi", "/blog", "/sss", "/gizlilik-politikasi",
  "/qa-zzz-nothing", "/hakkimizda", "/hizmetler/cnc-frezeleme",
  "/teklif-al", "/giris", "/cad-dashboard",
];
const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const page = await ctx.newPage();
console.log("route".padEnd(34) + "tealNodes  radixRoots  sampleTeal");
for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const r = await page.evaluate(() => {
    const toHsl = (s) => {
      const m = String(s).match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      if (p.length > 3 && p[3] < 0.2) return null;
      const [r0, g0, b0] = [p[0] / 255, p[1] / 255, p[2] / 255];
      const mx = Math.max(r0, g0, b0), mn = Math.min(r0, g0, b0), d = mx - mn;
      if (d < 0.12) return null;
      let h = 0;
      if (mx === r0) h = ((g0 - b0) / d) % 6;
      else if (mx === g0) h = (b0 - r0) / d + 2;
      else h = (r0 - g0) / d + 4;
      h = (h * 60 + 360) % 360;
      const l = (mx + mn) / 2;
      const s2 = d / (1 - Math.abs(2 * l - 1));
      return { h, s: s2, l };
    };
    const main = document.querySelector("main") ?? document.body;
    let teal = 0;
    const samples = new Set();
    for (const n of main.querySelectorAll("*")) {
      const rect = n.getBoundingClientRect();
      if (rect.width < 6 || rect.height < 6) continue;
      const cs = getComputedStyle(n);
      for (const v of [cs.backgroundColor, cs.color, cs.borderTopColor]) {
        const c = toHsl(v);
        if (c && c.h >= 168 && c.h <= 212 && c.s > 0.3) { teal += 1; if (samples.size < 4) samples.add(v); break; }
      }
    }
    const radix = main.querySelectorAll("[data-radix-collection-item],[data-state][role='tab'],[data-radix-scroll-area-viewport],[role='tablist']").length;
    return { teal, radix, samples: [...samples] };
  });
  console.log(route.padEnd(34) + String(r.teal).padStart(9) + String(r.radix).padStart(12) + "  " + r.samples.join(" "));
}
await b.close();
