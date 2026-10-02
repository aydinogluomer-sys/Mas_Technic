/* QA round 3 — H4, third leg. overlays.ts now cites "QA's independent
 * exact-colour scan over all 100 committed goldens finds zero cursor pixels".
 * My round-2 scan targeted the LAUNCHER's colour. That citation is only honest
 * if the cursor dot paints the same colour — otherwise the scan says nothing
 * about the cursor and the new reason repeats the old one's sin in a new
 * place. So: read both colours off the live page and compare. */
import { launch, ctx, goto, log } from "./lib.mjs";

const browser = await launch();
const c = await ctx(browser, { width: 1280, height: 900 });
const page = await c.newPage();
await goto(page, "/hizmetler/cnc-frezeleme");
const res = await page.evaluate(() => {
  const l = document.querySelector("[data-chat-launcher], button[class*='rounded-full'][class*='fixed']");
  const dot = document.querySelector('[data-custom-cursor="dot"]');
  const ring = document.querySelector('[data-custom-cursor="ring"]');
  const g = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      background: cs.backgroundColor, borderColor: cs.borderColor, borderWidth: cs.borderWidth,
      opacity: cs.opacity, zIndex: cs.zIndex,
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      insideViewportPx: Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)),
    };
  };
  return { launcher: g(l), dot: g(dot), ring: g(ring), primaryVar: getComputedStyle(document.documentElement).getPropertyValue("--primary").trim() };
});
await browser.close();
log(res);
console.log("launcher bg === dot bg ?  " + (res.launcher?.background === res.dot?.background));
