/**
 * QA round 2 — why the 768 goldens lost ONE row pitch and the 1280/1440 ones
 * lost TWO.
 *
 * Hypothesis: `.tl-footer nav` is a 4-across grid at >=1024 and a 2x2 grid at
 * 768, so at 768 the band's nav height is (tallest of row 1) + (tallest of
 * row 2), not (tallest of all four).
 *
 *   before C3 (5/5/5/8):  1280 tallest 8            768 rows max(5,5)+max(5,8)=13
 *   after  C3 (5/6/5/6):  1280 tallest 6            768 rows max(5,6)+max(5,6)=12
 *   delta                 -2 pitches = -45 px       -1 pitch = -22.5 px
 *
 * Also measures the 375 disclosure rendering, opened, so the claim that a
 * whole viewport is structurally immune can be stated with its limit.
 */
import { chromium } from "playwright";
const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4173";
const browser = await chromium.launch({ executablePath: EXE });
const out = {};

for (const vp of [{ n: "375", w: 375, h: 812 }, { n: "768", w: 768, h: 1024 }, { n: "1280", w: 1280, h: 800 }, { n: "1440", w: 1440, h: 900 }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  out[vp.n] = await page.evaluate(() => {
    const nav = document.querySelector(".tl-footer nav");
    const cs = nav ? getComputedStyle(nav) : null;
    const cols = [...document.querySelectorAll(".tl-footer nav > div")].map((d) => {
      const r = d.getBoundingClientRect();
      return {
        title: d.querySelector("h3")?.textContent,
        links: d.querySelectorAll("a").length,
        x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1),
      };
    });
    const navR = nav ? nav.getBoundingClientRect() : null;
    const rowsY = [...new Set(cols.map((c) => Math.round(c.y)))];
    return {
      navDisplay: cs?.display,
      gridTemplateColumns: cs?.gridTemplateColumns,
      gridTemplateRows: cs?.gridTemplateRows,
      navBox: navR ? { y: +navR.y.toFixed(1), h: +navR.height.toFixed(1) } : null,
      cols,
      distinctRowYs: rowsY.length,
      footerH: +document.querySelector(".tl-footer").getBoundingClientRect().height.toFixed(4),
    };
  });

  // 375 only: open every disclosure and measure what the reader then sees.
  if (vp.n === "375") {
    out.disclosureOpened = await page.evaluate(async () => {
      const root = document.querySelector(".shell-footer-disclosures");
      if (!root) return null;
      const before = document.querySelector(".tl-footer").getBoundingClientRect().height;
      const triggers = [...root.querySelectorAll("button,summary")];
      triggers.forEach((t) => t.click());
      await new Promise((r) => setTimeout(r, 900));
      const groups = [...root.children].map((el) => {
        const links = [...el.querySelectorAll("a")];
        const tops = links.filter((a) => a.getClientRects().length).map((a) => a.getBoundingClientRect().top);
        const pitches = [];
        for (let i = 1; i < tops.length; i++) pitches.push(+(tops[i] - tops[i - 1]).toFixed(2));
        return {
          title: el.querySelector("summary,h3,button")?.textContent?.trim(),
          links: links.length,
          visibleLinks: tops.length,
          pitches,
          labels: links.map((a) => (a.textContent || "").trim()),
        };
      });
      const after = document.querySelector(".tl-footer").getBoundingClientRect().height;
      return { triggers: triggers.length, footerHBefore: +before.toFixed(2), footerHAfter: +after.toFixed(2), groups };
    });
  }
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
