/**
 * QA PROBE — Phase 08 rendered-text capture.
 *
 * Renders every Phase 08 surface in Chromium at 1280 and writes, per route:
 *   · <h1> count and text
 *   · heading outline
 *   · full visible innerText of <main> (or body)
 *   · every anchor href on the page
 *
 * Read-only. Writes only into reports/qa/phase-08/.
 */
import { chromium } from "file:///C:/Users/Trade%20Bilisim/precision-dynamics-hub-main/node_modules/playwright/index.mjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE ?? "http://localhost:4173";

const ROUTES = [
  "/kabiliyet-profilleri",
  "/kabiliyet-profilleri/ince-cidarli-govde",
  "/kabiliyet-profilleri/titanyum-baglanti-parcasi",
  "/kabiliyet-profilleri/hassas-mil",
  "/kabiliyet-profilleri/olmayan-slug",
  "/kalite-dosyasi",
  "/blog",
  "/sss",
  "/kvkk",
  "/gizlilik-politikasi",
  "/cerez-politikasi",
  "/hizmetler/cnc-frezelme",      // 404, POPULATED nearest-record branch
  "/zzzz",                        // 404, EMPTY nearest-record branch
];

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  reducedMotion: "reduce",
});

const report = [];
for (const route of ROUTES) {
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(String(e)));
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const data = await page.evaluate(() => {
    const h1s = [...document.querySelectorAll("h1")].map((n) => n.innerText.replace(/\s+/g, " ").trim());
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")]
      .filter((n) => n.offsetParent !== null || getComputedStyle(n).position === "fixed")
      .map((n) => `${n.tagName} ${n.innerText.replace(/\s+/g, " ").trim()}`);
    const main = document.querySelector("main") ?? document.body;
    const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
    return {
      title: document.title,
      h1Count: h1s.length,
      h1s,
      headings,
      text: main.innerText,
      links: [...new Set(links)],
      detailsCount: document.querySelectorAll("details").length,
    };
  });
  data.route = route;
  data.pageErrors = consoleErrors;
  report.push(data);
  await page.close();
}

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "rendered.json"), JSON.stringify(report, null, 2), "utf8");

let md = "";
for (const r of report) {
  md += `\n\n================ ${r.route} ================\n`;
  md += `title: ${r.title}\nh1Count: ${r.h1Count}\nh1: ${JSON.stringify(r.h1s)}\n`;
  md += `details: ${r.detailsCount}\npageErrors: ${JSON.stringify(r.pageErrors)}\n`;
  md += `--- headings ---\n${r.headings.join("\n")}\n`;
  md += `--- links ---\n${r.links.join("\n")}\n`;
  md += `--- text ---\n${r.text}\n`;
}
writeFileSync(join(OUT, "rendered.txt"), md, "utf8");
console.log("routes:", report.length);
for (const r of report) console.log(r.route, "h1=", r.h1Count, "|", r.h1s[0] ?? "(none)");
await browser.close();
