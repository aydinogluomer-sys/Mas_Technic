/* QA round 4 — H4 confirmation, probe 1.
 *
 * INDEPENDENT second witness for the ten-cell (width, pointer) matrix that
 * `e2e/visual/cursor-overlay-guard.spec.ts` pins. Deliberately different from
 * the Coder's measurement in two ways, so agreement means something:
 *
 *   · a DIFFERENT route (`/iletisim`, and `/` as a third), because the Coder
 *     measured only `/hakkimizda` and a matrix that is a property of the
 *     component must not depend on the page;
 *   · MY OWN context construction and MY OWN settle, so a shared helper cannot
 *     manufacture the agreement.
 *
 * It also records `elementsFromPoint` at the parked corner, which is the
 * §2.5 severity question, at every cell rather than only at 1280.
 */
import { launch, log } from "./lib.mjs";

const ROUTES = ["/iletisim", "/"];
const CELLS = [
  [375, "fine"], [375, "coarse"], [767, "fine"],
  [768, "fine"], [768, "coarse"], [768, "isMobile-without-touch"],
  [900, "fine"], [901, "fine"], [1280, "fine"], [1280, "coarse"],
];
const POINTER = {
  fine: {},
  coarse: { isMobile: true, hasTouch: true },
  "isMobile-without-touch": { isMobile: true, hasTouch: false },
};

const BASE = process.env.QA_BASE ?? "http://localhost:4917";
const browser = await launch();
const out = {};

for (const route of ROUTES) {
  out[route] = {};
  for (const [width, pointer] of CELLS) {
    const c = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
      ...POINTER[pointer],
    });
    const page = await c.newPage();
    await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForLoadState("networkidle").catch(() => {});
    /* Same budget and same exit condition for every cell, including the ones
       expected to stay at zero — polling only where layers are expected would
       manufacture the answer. */
    await page
      .waitForFunction(() => document.querySelectorAll("[data-custom-cursor]").length > 0, null, { timeout: 4000 })
      .catch(() => undefined);
    await page.evaluate(async () => {
      await document.fonts.ready.catch(() => {});
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    out[route][`${width}/${pointer}`] = await page.evaluate(() => ({
      layers: document.querySelectorAll("[data-custom-cursor]").length,
      finePointer: matchMedia("(pointer: fine)").matches,
      bodyCursor: getComputedStyle(document.body).cursor,
      htmlCursor: getComputedStyle(document.documentElement).cursor,
      /* §2.5: what is actually on top at the parked corner. */
      topAtCorner: Array.from(document.elementsFromPoint(2, 2))
        .slice(0, 4)
        .map((el) => `${el.tagName.toLowerCase()}${el.hasAttribute("data-custom-cursor") ? "[cursor]" : ""}[z=${getComputedStyle(el).zIndex}]`),
      /* both pointers drawn at once? replacement mounted AND native visible */
      bothPointersDrawn:
        document.querySelectorAll("[data-custom-cursor]").length > 0
        && getComputedStyle(document.body).cursor !== "none",
    }));
    await c.close();
  }
}

await browser.close();
log(out);

/* The two claims the table exists to carry, checked here rather than read. */
const a = out["/iletisim"], b = out["/"];
const same = JSON.stringify(Object.fromEntries(Object.entries(a).map(([k, v]) => [k, [v.layers, v.finePointer, v.bodyCursor]])))
  === JSON.stringify(Object.fromEntries(Object.entries(b).map(([k, v]) => [k, [v.layers, v.finePointer, v.bodyCursor]])));
console.log("route-independent (iletisim === /) ? " + same);
console.log("mount floor is 768 not 901 ? " + (a["767/fine"].layers === 0 && a["768/fine"].layers === 2));
console.log("hasTouch is the mechanism ? " + (a["768/isMobile-without-touch"].layers === 2 && a["768/coarse"].layers === 0));
console.log("double-pointer band 768..900 ? " + (a["768/fine"].bothPointersDrawn && a["900/fine"].bothPointersDrawn && !a["901/fine"].bothPointersDrawn));
