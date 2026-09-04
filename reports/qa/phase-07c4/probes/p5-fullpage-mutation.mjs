/* QA round 4 — probe 5. Why the whole-page counterfactual would not converge.
 *
 * At 1280 two STABLE whole-page frames, taken minutes apart in one context,
 * differed by 150 688 px with a bounding box of [65, 210, 1278, 3898] — nearly
 * the entire 1280x3918 page, and starting nowhere near the 22x22 corner the
 * cursor is parked in. So the difference is not the cursor.
 *
 * HYPOTHESIS: a whole-page capture SCROLLS the document, which fires one-shot
 * scroll-triggered reveals (`useInViewClass`, ScrollTrigger). The first capture
 * therefore MUTATES the page it is capturing, and any second capture is of a
 * different page. If so the fix is not a longer settle but a full scroll pass
 * BEFORE the first capture, which is exactly what the radius census already
 * does for the same reason.
 *
 * This probe takes no screenshot comparison at all: it counts revealed
 * elements before and after a single whole-page capture.
 */
import { launch, log } from "./lib.mjs";

const BASE = process.env.QA_BASE ?? "http://localhost:4917";
const browser = await launch();
const out = {};

for (const [width, height] of [[1280, 900], [1440, 900]]) {
  const c = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
  const page = await c.newPage();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready.catch(() => {});
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });

  /* A cheap, capture-free census of "has this been revealed yet" state. */
  const revealState = () => page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("*"));
    const revealed = all.filter((el) => {
      const cl = typeof el.className === "string" ? el.className : "";
      return /\b(is-in|in-view|is-visible|revealed|is-active)\b/.test(cl);
    }).length;
    return {
      revealed,
      scrollY: Math.round(window.scrollY),
      docHeight: Math.round(document.documentElement.scrollHeight),
      /* anything still animating its way in */
      zeroOpacity: all.filter((el) => getComputedStyle(el).opacity === "0").length,
    };
  });

  const before = await revealState();
  await page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" });
  const afterOneCapture = await revealState();

  /* Now the proposed fix: exhaust the reveals explicitly, then capture twice. */
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
  const afterScrollPass = await revealState();
  await page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" });
  const afterScrollPassAndCapture = await revealState();

  out[`${width}`] = { before, afterOneCapture, afterScrollPass, afterScrollPassAndCapture };
  await c.close();
}

await browser.close();
log(out);
console.log("\n--- reading ---");
for (const w of Object.keys(out)) {
  const o = out[w];
  console.log(`${w}px  revealed: ${o.before.revealed} -> ${o.afterOneCapture.revealed} (after ONE whole-page capture)`
    + `  |  zeroOpacity: ${o.before.zeroOpacity} -> ${o.afterOneCapture.zeroOpacity}`);
  console.log(`${w}px  after an explicit scroll pass: revealed=${o.afterScrollPass.revealed} zeroOpacity=${o.afterScrollPass.zeroOpacity}`
    + `  -> after a further capture: revealed=${o.afterScrollPassAndCapture.revealed} zeroOpacity=${o.afterScrollPassAndCapture.zeroOpacity}`);
  const capturesMutate = o.before.revealed !== o.afterOneCapture.revealed || o.before.zeroOpacity !== o.afterOneCapture.zeroOpacity;
  const scrollPassSettles = o.afterScrollPass.revealed === o.afterScrollPassAndCapture.revealed
    && o.afterScrollPass.zeroOpacity === o.afterScrollPassAndCapture.zeroOpacity;
  console.log(`${w}px  => a whole-page capture mutates the page: ${capturesMutate}; a prior scroll pass makes it idempotent: ${scrollPassSettles}\n`);
}
