/* PROBE 16 — the one equal-tile group with icons on a rebuilt page:
 * ol.shell-run on /iletisim at 1280. What is the "icon"?
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const browser = await launch();
const c = await ctx(browser, { width: 1280, height: 900, reduce: true });
const page = await c.newPage();
await goto(page, "/iletisim");
const info = await page.evaluate(() => {
  const run = document.querySelector("ol.shell-run");
  if (!run) return null;
  return {
    tag: run.tagName,
    itemTag: run.children[0]?.tagName,
    items: Array.from(run.children).map((li) => ({
      cls: (li.getAttribute("class") || "").slice(0, 50),
      html: li.innerHTML.replace(/\s+/g, " ").slice(0, 420),
      iconMatches: Array.from(li.querySelectorAll("svg, img, [class*='icon']")).map((n) => ({
        tag: n.tagName.toLowerCase(),
        cls: (n.getAttribute("class") || "").slice(0, 50),
        ariaHidden: n.getAttribute("aria-hidden"),
        inLink: !!n.closest("a,button"),
        box: (() => { const r = n.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; })(),
      })),
    })),
  };
});
log(info);
const box = await page.locator("ol.shell-run").boundingBox();
if (box) await page.screenshot({ path: "reports/qa/phase-07/evidence/p16-shellrun.png", clip: { x: box.x - 8, y: box.y - 8, width: Math.min(1264, box.width + 16), height: Math.min(400, box.height + 16) } });
await c.close();
await browser.close();
