/**
 * QA PHASE 09a — which routes are `paper` and which are `graphite`, and what
 * the footer's computed geometry is on each. This is what turns the golden
 * peer diff from a puzzle into an adjudication: the six shell-golden surfaces
 * are not one population, they are two, and the rebank claim is that
 * `/teklif-al` moved from the first to the second.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:4173";
const ROUTES = [
  ["home", "/"],
  ["service", "/hizmetler/cnc-frezeleme"],
  ["about", "/hakkimizda"],
  ["journal", "/blog"],
  ["rfq", "/teklif-al"],
  ["notfound", "/__phase04-not-a-route__"],
];

const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
for (const width of [375, 1280]) {
  const ctx = await b.newContext({ viewport: { width, height: width === 375 ? 812 : 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  console.log(`\n══ ${width} ══`);
  console.log("slug".padEnd(10) + "surface".padEnd(10) + "footerH".padEnd(9) + "borderTop".padEnd(22) + "bandIndex color / border-right");
  for (const [slug, path] of ROUTES) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => {
      const root = document.querySelector(".shell-root");
      const footer = document.querySelector("footer.tl-footer");
      if (!footer) return null;
      const cs = getComputedStyle(footer);
      const idx = footer.querySelector(":scope > .tl-band-index");
      const ics = idx ? getComputedStyle(idx) : null;
      return {
        surface: root?.getAttribute("data-shell-surface") ?? "(none)",
        height: Math.round(footer.getBoundingClientRect().height),
        borderTop: `${cs.borderTopWidth} ${cs.borderTopColor}`,
        idxText: idx?.textContent?.replace(/\s+/g, " ").trim().slice(0, 18) ?? "(no index)",
        idxColor: ics?.color ?? "-",
        idxBorderRight: ics?.borderRightColor ?? "-",
      };
    });
    if (!r) { console.log(`${slug.padEnd(10)}NO FOOTER`); continue; }
    console.log(
      slug.padEnd(10) + r.surface.padEnd(10) + String(r.height).padEnd(9) +
      r.borderTop.padEnd(22) + `${r.idxColor} / ${r.idxBorderRight}   "${r.idxText}"`,
    );
  }
  await ctx.close();
}
await b.close();
