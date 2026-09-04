/* PROBE 10 — the ONE justification offered for regenerating six goldens:
 * `.tl-footer` gets a 1px border-top only on a paper root, and /hakkimizda and
 * /hizmetler/cnc-frezeleme are graphite roots now.
 *
 * Phase 04's precedent is that a justification can be true at 1280/1440 and
 * false at 375, so this measures at every width the goldens exist at, with a
 * paper control (/blog) and a graphite control (/).
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const ROUTES = ["/hakkimizda", "/hizmetler/cnc-frezeleme", "/blog", "/", "/teklif-al", "/qa-bogus-404"];
const VPS = [375, 768, 1280, 1440];

const M = () => {
  const f = document.querySelector(".tl-footer");
  if (!f) return { footer: false };
  const cs = getComputedStyle(f);
  const root = document.querySelector(".shell-root, [data-surface], .tl-sheet");
  const surfaceHost = document.querySelector("[data-surface]");
  return {
    footer: true,
    borderTopWidth: cs.borderTopWidth,
    borderTopStyle: cs.borderTopStyle,
    borderTopColor: cs.borderTopColor,
    borderTopWidthPx: parseFloat(cs.borderTopWidth),
    rectTop: +f.getBoundingClientRect().top.toFixed(2),
    surface: surfaceHost ? surfaceHost.getAttribute("data-surface") : null,
    rootCls: root ? (root.getAttribute("class") || "").slice(0, 70) : null,
    rootDataset: root ? Object.fromEntries([...root.attributes].map((a) => [a.name, a.value.slice(0, 40)])) : null,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    footerBg: cs.backgroundColor,
  };
};

const browser = await launch();
const out = {};
for (const w of VPS) {
  const c = await ctx(browser, { width: w, height: 900, mobile: w < 900, reduce: true });
  const page = await c.newPage();
  for (const r of ROUTES) {
    await goto(page, r);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    out[`${w}|${r}`] = await page.evaluate(M);
  }
  await c.close();
}
await browser.close();
log(out);
