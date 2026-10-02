// QA F5 — is the custom cursor a radius that PAINTS, or only one that exists?
// overlays.ts asserts it "paints nothing until a real pointer moves". That is
// the right call for a golden capture; the radius register is about what a
// reader sees, and a desktop reader has always moved a pointer. Measured both
// ways so the finding can be worded precisely rather than strongly.
import { launch, ctx, goto, log } from "./lib.mjs";

const browser = await launch();
const c = await ctx(browser, { width: 1280, height: 900, reduce: true });
const page = await c.newPage();
const rows = [];
const read = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("div.fixed.top-0.left-0.pointer-events-none")].map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        cls: el.className.slice(0, 62),
        radius: cs.borderTopLeftRadius,
        opacity: cs.opacity,
        transform: cs.transform.slice(0, 44),
        display: cs.display,
        visibility: cs.visibility,
        box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
        bg: cs.backgroundColor,
        borderTop: cs.borderTopWidth + " " + cs.borderTopColor,
      };
    }));

for (const route of ["/hakkimizda", "/malzemeler", "/iletisim"]) {
  await goto(page, route);
  const before = await read();
  await page.mouse.move(640, 450);
  await page.mouse.move(700, 500);
  await page.waitForTimeout(300);
  const after = await read();
  rows.push({ route, before, after });
}
await browser.close();
log(rows);
