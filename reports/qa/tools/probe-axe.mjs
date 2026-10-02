/* QA probe — AC12: no NEW serious/critical axe violations across the shell.
 * B24 (`ServiceDetail.tsx` contrast) is a recorded pre-existing carry-forward
 * owned by Phases 07/13; this probe must show it neither fixed nor worsened.
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const ROUTES = [
  "/", "/hakkimizda", "/iletisim", "/sss", "/blog", "/malzemeler", "/kvkk",
  "/gizlilik-politikasi", "/cerez-politikasi", "/teklif-al",
  "/hizmetler/cnc-frezeleme", "/hizmetler/kategori/talasli-imalat",
  "/giris", "/sifremi-unuttum", "/reset-password", "/__phase04-not-a-route__",
];

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const totals = { serious: 0, critical: 0 };

for (const width of [1280, 375]) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 768 ? 812 : 800 },
    ...(width < 768 ? { isMobile: true, hasTouch: true } : {}),
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  console.log(`\n===== ${width}px =====`);
  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const res = await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21a","wcag21aa"]).analyze();
    const bad = res.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    const line = bad.map((v) => `${v.id}[${v.impact}]x${v.nodes.length}`).join(" ");
    for (const v of bad) totals[v.impact] += v.nodes.length;
    console.log(`  ${route.padEnd(38)} ${bad.length === 0 ? "clean" : line}`);
    for (const v of bad) {
      for (const n of v.nodes.slice(0, 4)) {
        console.log(`        ${v.id}: ${n.target.join(" ")}`);
        const msg = (n.any?.[0]?.message ?? n.all?.[0]?.message ?? "").replace(/\s+/g, " ").slice(0, 170);
        if (msg) console.log(`            ${msg}`);
      }
    }
  }
  await ctx.close();
}
console.log(`\nTOTAL serious nodes: ${totals.serious}   critical nodes: ${totals.critical}`);
await browser.close();
