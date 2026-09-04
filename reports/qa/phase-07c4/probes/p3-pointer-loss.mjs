/* QA round 4 — probe 3. §2.5 severity, measured where it matters.
 *
 * The packet states the defect from the PARKED corner and from
 * `elementsFromPoint(2,2)`. Both cursor layers are `pointer-events: none`, so
 * `elementsFromPoint` cannot see them at any coordinate — probe 2 measured
 * `cursorInHitTest: false`. The corner is also not where a user's pointer is.
 *
 * So this probe asks the question a user would: MOVE the pointer to a real
 * place inside the fixed header band, and to a control place below it, and
 * compare the composited frame with the replacement layers present against the
 * same frame with them removed. Zero differing pixels means the user sees no
 * pointer there at all, because `cursor: none` has already taken the native
 * one away.
 */
import { launch, log } from "./lib.mjs";

const BASE = process.env.QA_BASE ?? "http://localhost:4917";
const browser = await launch();
const out = {};

for (const [width, height] of [[1280, 900], [1440, 900], [900, 900], [768, 900]]) {
  const c = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
  const page = await c.newPage();
  await page.goto(BASE + "/hakkimizda", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForFunction(() => document.querySelectorAll("[data-custom-cursor]").length === 2, null, { timeout: 8000 }).catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready.catch(() => {});
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });

  const bandH = await page.evaluate(() => {
    const b = document.querySelector(".tl-header-band");
    return b ? Math.round(b.getBoundingClientRect().height) : 0;
  });

  const POINTS = [
    { name: "INSIDE header band", x: Math.round(width * 0.45), y: Math.max(4, Math.round(bandH / 2)) },
    { name: "BELOW header band ", x: Math.round(width * 0.45), y: bandH + 220 },
  ];

  const diffPixels = async (a, b, w, h) => page.evaluate(async ([a64, b64]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = "data:image/png;base64," + s; });
    const [ia, ib] = await Promise.all([load(a64), load(b64)]);
    const cv = document.createElement("canvas");
    cv.width = ia.width; cv.height = ia.height;
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.drawImage(ia, 0, 0);
    const da = cx.getImageData(0, 0, cv.width, cv.height).data;
    cx.clearRect(0, 0, cv.width, cv.height);
    cx.drawImage(ib, 0, 0);
    const db = cx.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0, maxd = 0;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]));
      if (d > 0) n += 1;
      if (d > maxd) maxd = d;
    }
    return { differing: n, maxChannelDelta: maxd };
  }, [a.toString("base64"), b.toString("base64")]);

  out[`${width}px`] = { bandHeight: bandH, points: {} };

  for (const pt of POINTS) {
    await page.addStyleTag({ content: "[data-custom-cursor]{display:revert !important}" });
    await page.mouse.move(pt.x, pt.y);
    await page.evaluate(() => new Promise((r) => setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(r)), 400)));

    const clip = { x: Math.max(0, pt.x - 40), y: Math.max(0, pt.y - 40), width: 80, height: 80 };
    const shot = () => page.screenshot({ clip, animations: "disabled", caret: "hide" });

    const withCursor = await shot();
    const stable = await diffPixels(withCursor, await shot());
    await page.addStyleTag({ content: "[data-custom-cursor]{display:none !important}" });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const without = await shot();
    const d = await diffPixels(withCursor, without);

    const styles = await page.evaluate(([x, y]) => {
      const el = document.elementFromPoint(x, y);
      return {
        elementUnderPointer: el ? `${el.tagName.toLowerCase()}${typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/)[0] : ""}` : null,
        computedCursorThere: el ? getComputedStyle(el).cursor : null,
        bodyCursor: getComputedStyle(document.body).cursor,
        layers: document.querySelectorAll("[data-custom-cursor]").length,
      };
    }, [pt.x, pt.y]);

    out[`${width}px`].points[pt.name] = {
      at: [pt.x, pt.y],
      determinism: stable,
      cursorContributesPixels: d,
      pointerVisible: d.differing > 0,
      ...styles,
    };
  }
  await c.close();
}

await browser.close();
log(out);
console.log("\n--- reading ---");
for (const w of Object.keys(out)) {
  for (const p of Object.keys(out[w].points)) {
    const r = out[w].points[p];
    const nativeGone = r.computedCursorThere === "none";
    console.log(`${w.padEnd(7)} ${p}  native=${String(r.computedCursorThere).padEnd(7)} replacementPixels=${String(r.cursorContributesPixels.differing).padEnd(5)} => ${nativeGone && r.cursorContributesPixels.differing === 0 ? "NO VISIBLE POINTER" : nativeGone ? "replacement only" : r.cursorContributesPixels.differing > 0 ? "BOTH POINTERS DRAWN" : "native only"}`);
  }
}
