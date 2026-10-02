/* PROBE 8 — read the PUBLISHED text, not the source.
 * Phase 06's decisive finding came from reading what the page renders while the
 * source-text gate reported 0. This dumps the full visible text of every route
 * given, after scrolling the page so IO-gated content mounts.
 */
import { launch, ctx, goto } from "./lib.mjs";
import { writeFileSync } from "node:fs";

const ROUTES = (process.env.QA_ROUTES || [
  "/hakkimizda",
  "/iletisim",
  "/malzemeler",
  "/malzemeler/aluminyum",
  "/malzemeler/paslanmaz-celik",
  "/hizmetler/kategori/talasli-imalat",
  "/hizmetler/kategori/yuzey-islemleri",
  "/hizmetler/cnc-frezeleme",
  "/hizmetler/anodizasyon",
  "/hizmetler/mekanik-montaj",
  "/hizmetler/enjeksiyon-kalibi",
  "/endustriyel/havacilik-uzay",
  "/endustriyel/otomotiv",
  "/kabiliyetler/makine-parkuru",
  "/kabiliyetler/malzeme-kutuphanesi",
].join(",")).split(",");

const browser = await launch();
const c = await ctx(browser, { width: 1280, height: 900, reduce: true });
const page = await c.newPage();
const out = {};
for (const route of ROUTES) {
  await goto(page, route);
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += window.innerHeight * 0.8) {
      window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70));
    }
    window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 200));
  });
  out[route] = await page.evaluate(() => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
    };
    const parts = [];
    const walk = (n) => {
      if (n.nodeType === 3) { const t = n.nodeValue.replace(/\s+/g, " ").trim(); if (t) parts.push(t); return; }
      if (n.nodeType !== 1) return;
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(n.tagName)) return;
      if (!vis(n)) return;
      for (const k of n.childNodes) walk(k);
    };
    walk(document.body);
    return { title: document.title, text: parts.join(" | ") };
  });
  process.stderr.write(`${route}: ${out[route].text.length} chars\n`);
}
await c.close();
await browser.close();
writeFileSync("reports/qa/phase-07/evidence/p8-published-text.json", JSON.stringify(out, null, 1));
