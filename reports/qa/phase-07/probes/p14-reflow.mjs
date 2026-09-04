/* PROBE 14 — reflow and scrollable-region access on the rebuilt pages.
 *  - documentElement horizontal overflow at 320/375 (a real 1.4.10 failure)
 *  - every element that scrolls horizontally: is it focusable, named, and
 *    reachable by keyboard (Phase 04's useScrollableRegionAccess contract)?
 *  - the /malzemeler register's column count and its row-disclosure control
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const ROUTES = ["/malzemeler", "/malzemeler/aluminyum", "/hizmetler/cnc-frezeleme",
  "/endustriyel/havacilik-uzay", "/hakkimizda", "/iletisim", "/hizmetler/kategori/talasli-imalat"];
const VPS = [{ width: 320, height: 640, mobile: true }, { width: 375, height: 812, mobile: true }, { width: 768, height: 1024, mobile: true }];

const M = () => {
  const scrollers = [];
  for (const el of document.querySelectorAll("body *")) {
    if (el.scrollWidth - el.clientWidth <= 1) continue;
    const cs = getComputedStyle(el);
    if (!/auto|scroll/.test(cs.overflowX)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 40 || r.height < 40) continue;
    scrollers.push({
      cls: (el.getAttribute("class") || "").slice(0, 60),
      tag: el.tagName.toLowerCase(),
      overflowX: cs.overflowX,
      scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
      tabindex: el.getAttribute("tabindex"),
      role: el.getAttribute("role"),
      ariaLabel: el.getAttribute("aria-label"),
      ariaLabelledby: el.getAttribute("aria-labelledby"),
      labelledbyText: el.getAttribute("aria-labelledby")
        ? (document.getElementById(el.getAttribute("aria-labelledby"))?.textContent || "").trim().slice(0, 50)
        : null,
      focusable: el.tabIndex >= 0,
    });
  }
  const table = document.querySelector(".shell-table table, table");
  return {
    docOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    bodyOverflowX: document.body.scrollWidth - document.body.clientWidth,
    scrollers,
    tableCols: table ? table.querySelectorAll("thead th").length : null,
    tableHeaders: table ? [...table.querySelectorAll("thead th")].map((t) => t.textContent.trim().slice(0, 22)) : null,
    rowToggles: document.querySelectorAll(".shell-row-toggle").length,
    rowToggleSample: (() => {
      const b = document.querySelector(".shell-row-toggle");
      if (!b) return null;
      return { text: b.textContent.trim().slice(0, 30), expanded: b.getAttribute("aria-expanded"), controls: b.getAttribute("aria-controls"), label: b.getAttribute("aria-label") };
    })(),
  };
};

const browser = await launch();
const out = {};
for (const vp of VPS) {
  const c = await ctx(browser, { ...vp, reduce: true });
  const page = await c.newPage();
  for (const r of ROUTES) {
    await goto(page, r);
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += window.innerHeight * 0.8) { window.scrollTo(0, y); await new Promise((res) => setTimeout(res, 60)); }
      window.scrollTo(0, 0); await new Promise((res) => setTimeout(res, 200));
    });
    out[`${vp.width}|${r}`] = await page.evaluate(M);
  }
  await c.close();
}
await browser.close();
log(out);
