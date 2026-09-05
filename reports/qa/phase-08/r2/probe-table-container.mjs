/**
 * QA round 2 — why only /cerez-politikasi's table escapes its column.
 * Compares the containing block of `figure.shell-table` on a route where the
 * scroll region works against the one where it does not.
 */
import { chromium } from "playwright";
const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4173";
const b = await chromium.launch({ executablePath: EXE });
const ctx = await b.newContext({ viewport: { width: 375, height: 812 } });
const p = await ctx.newPage();
const out = {};
for (const r of ["/blog/havacilik-parcalarinda-malzeme-secimi", "/kalite-dosyasi", "/hizmetler/cnc-frezeleme", "/cerez-politikasi"]) {
  await p.goto(BASE + r, { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  out[r] = await p.evaluate(() => {
    const figs = [...document.querySelectorAll("figure.shell-table")];
    return figs.map((fig) => {
      const par = fig.parentElement;
      const cs = par ? getComputedStyle(par) : null;
      const fcs = getComputedStyle(fig);
      return {
        aria: fig.querySelector("table")?.getAttribute("aria-label"),
        figW: +fig.getBoundingClientRect().width.toFixed(1),
        figClass: fig.className,
        figMinWidth: fcs.minWidth,
        parent: par ? par.tagName.toLowerCase() + "." + String(par.className) : null,
        parentW: par ? +par.getBoundingClientRect().width.toFixed(1) : null,
        parentDisplay: cs?.display,
        parentGridCols: cs?.gridTemplateColumns,
        parentMinWidth: cs?.minWidth,
        parentMaxWidth: cs?.maxWidth,
      };
    });
  });
}
await b.close();
console.log(JSON.stringify(out, null, 2));
