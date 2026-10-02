/**
 * QA round 2 — is the /cerez-politikasi storage table CLIPPED at 375, and did
 * the fifth row make it worse?
 *
 * The screenshot shows only columns 1 and 2. `documentElement.scrollWidth -
 * clientWidth` is 0, so the repository's reflow assertion is satisfied while
 * two of four columns are unreachable. This walks the ancestor chain to find
 * what clips, asks whether any ancestor can actually be scrolled, and then
 * re-measures the same table with the fifth row removed IN THE BROWSER (a
 * rendering experiment; no source is touched) to separate "the fifth row did
 * this" from "this was already true".
 */
import { chromium } from "playwright";
const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4173";
const browser = await chromium.launch({ executablePath: EXE });
const out = {};

for (const vp of [{ n: "375", w: 375, h: 812 }, { n: "320", w: 320, h: 568 }, { n: "390", w: 390, h: 844 }, { n: "768", w: 768, h: 1024 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/cerez-politikasi`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  out[vp.n] = await page.evaluate(() => {
    const t = document.querySelector("main table");
    const chain = [];
    let el = t;
    while (el && el !== document.documentElement) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      chain.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className).slice(0, 50),
        w: +r.width.toFixed(1), x: +r.x.toFixed(1),
        overflowX: cs.overflowX,
        clientW: el.clientWidth, scrollW: el.scrollWidth,
        canScrollX: el.scrollWidth > el.clientWidth + 1,
      });
      el = el.parentElement;
    }

    // Which cells are outside the viewport?
    const cellVis = [...t.querySelectorAll("thead th")].map((th) => {
      const r = th.getBoundingClientRect();
      return { text: th.textContent.trim(), left: +r.left.toFixed(1), right: +r.right.toFixed(1), fullyVisible: r.right <= window.innerWidth + 0.5 };
    });

    const before = {
      tableW: +t.getBoundingClientRect().width.toFixed(1),
      tableH: +t.getBoundingClientRect().height.toFixed(1),
      colWidths: [...t.querySelectorAll("thead th")].map((th) => +th.getBoundingClientRect().width.toFixed(1)),
      rowHeights: [...t.querySelectorAll("tbody tr")].map((tr) => +tr.getBoundingClientRect().height.toFixed(1)),
      docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };

    // Rendering experiment: drop the mas_intro_seen row and re-measure.
    const introRow = [...t.querySelectorAll("tbody tr")].find((tr) => /mas_intro_seen/.test(tr.textContent));
    if (introRow) introRow.style.display = "none";
    const after = {
      tableW: +t.getBoundingClientRect().width.toFixed(1),
      tableH: +t.getBoundingClientRect().height.toFixed(1),
      colWidths: [...t.querySelectorAll("thead th")].map((th) => +th.getBoundingClientRect().width.toFixed(1)),
      docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
    if (introRow) introRow.style.display = "";

    return { viewportW: window.innerWidth, chain, cellVis, withFiveRows: before, withFourRows: after };
  });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
