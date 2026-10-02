/* QA round 4 — probe 4. §2.4: adjudicating the Coder's refusal.
 *
 * The packet asked for: "every full-page-capturing visual project either has
 * (pointer: fine) false, or hides [data-custom-cursor]". The Coder refused and
 * gave two reasons for why the second disjunct was unreachable — one of which
 * is a factual claim I have to check rather than accept:
 *
 *   "adding the cursor to FOREIGN_OVERLAYS would move landing-fullpage.png at
 *    1280 and 1440 — a golden change the packet forbade."
 *
 * `hideForeignOverlays` only does `display: none !important` on its selectors,
 * and probe 2 measured the cursor contributing ZERO pixels to the top-left
 * corner. If that holds for the whole stitched full-page frame, the claimed
 * golden movement does not exist and the refusal rests on a wrong reason.
 *
 * NOTHING IS BANKED. Both captures are bare `page.screenshot()` taken seconds
 * apart in the same context and compared against each other, never against
 * `e2e/__golden__`.
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
  await page.waitForFunction(() => document.querySelectorAll("[data-custom-cursor]").length === 2, null, { timeout: 8000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready.catch(() => {});
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  /* Freeze the same way the golden spec does, so the two frames differ only by
     the cursor and not by a spring that is still settling. */
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none !important;transition:none !important}" });
  await page.evaluate(() => new Promise((r) => setTimeout(() => requestAnimationFrame(r), 600)));

  const full = () => page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" });

  const a = await full();
  const b = await full();               // determinism control
  await page.addStyleTag({ content: "[data-custom-cursor]{display:none !important}" });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const hidden = await full();

  const diff = async (x, y) => page.evaluate(async ([p, q]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = "data:image/png;base64," + s; });
    const [ia, ib] = await Promise.all([load(p), load(q)]);
    if (ia.width !== ib.width || ia.height !== ib.height) {
      return { sizeMismatch: [ia.width, ia.height, ib.width, ib.height] };
    }
    const cv = document.createElement("canvas");
    cv.width = ia.width; cv.height = ia.height;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(ia, 0, 0);
    const da = cx.getImageData(0, 0, cv.width, cv.height).data;
    cx.clearRect(0, 0, cv.width, cv.height);
    cx.drawImage(ib, 0, 0);
    const db = cx.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0; const where = [];
    for (let i = 0; i < da.length; i += 4) {
      if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) {
        n += 1;
        if (where.length < 6) where.push([(i / 4) % cv.width, Math.floor((i / 4) / cv.width)]);
      }
    }
    return { differing: n, firstAt: where, size: [cv.width, cv.height] };
  }, [x.toString("base64"), y.toString("base64")]);

  out[`${width}`] = {
    determinism_AA: await diff(a, b),
    counterfactual_cursorHidden_vs_asShipped: await diff(a, hidden),
  };
  await c.close();
}

await browser.close();
log(out);
console.log("\n--- reading ---");
for (const w of Object.keys(out)) {
  const r = out[w];
  const d = r.counterfactual_cursorHidden_vs_asShipped.differing;
  console.log(`${w}px  determinism=${r.determinism_AA.differing}  fullPage diff when [data-custom-cursor] is hidden = ${d} px`
    + `  => adding it to FOREIGN_OVERLAYS would ${d === 0 ? "NOT move landing-fullpage.png" : "MOVE the golden by " + d + " px"}`);
}
