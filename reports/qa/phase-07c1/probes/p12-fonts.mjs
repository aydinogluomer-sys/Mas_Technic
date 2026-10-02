/* PROBE 12 — the two spec claims e2e/visual/fonts.ts rests on, tested rather
 * than cited:
 *   (1) document.fonts.ready resolves even when the faces failed to load.
 *   (2) document.fonts.check() returns true anyway, because a system fallback
 *       can render the list without a download.
 * Negative control: the same measurements with the font hosts reachable.
 * Also: does the FontFaceSet enumeration the fix uses actually discriminate?
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const FAMILIES = ["Space Grotesk", "IBM Plex Mono", "Newsreader"];
const FACES = ['700 22px "Space Grotesk"', '400 12px "IBM Plex Mono"', 'italic 400 30px "Newsreader"'];

const M = ([faces, families]) => {
  const t0 = performance.now();
  return document.fonts.ready.then(() => {
    const loaded = [], all = [];
    document.fonts.forEach((f) => {
      all.push(f.family.replace(/["']/g, "") + ":" + f.status);
      if (f.status === "loaded") loaded.push(f.family.replace(/["']/g, ""));
    });
    const el = document.querySelector("h1, .tl-brand strong, body");
    return {
      readyResolvedMs: +(performance.now() - t0).toFixed(1),
      checks: faces.map((f) => [f, document.fonts.check(f)]),
      faceSetSize: document.fonts.size,
      faceStatuses: [...new Set(all)],
      missingByEnumeration: families.filter((fam) => !loaded.includes(fam)),
      sampleComputedFamily: el ? getComputedStyle(el).fontFamily.slice(0, 60) : null,
      sampleWidth: (() => {
        const s = document.createElement("span");
        s.style.cssText = 'position:absolute;font:700 22px "Space Grotesk";white-space:pre';
        s.textContent = "MAS TECHNIC HASSAS";
        document.body.appendChild(s);
        const w = s.getBoundingClientRect().width;
        s.remove();
        return +w.toFixed(2);
      })(),
    };
  });
};

const browser = await launch();
const out = {};
for (const mode of ["blocked", "live"]) {
  const c = await ctx(browser, { width: 1280, height: 900, reduce: true });
  if (mode === "blocked") await c.route("https://fonts.g*", (r) => r.abort());
  const page = await c.newPage();
  await goto(page, "/hizmetler/cnc-frezeleme");
  await page.waitForTimeout(2500);
  out[mode] = await page.evaluate(M, [FACES, FAMILIES]);
  await page.screenshot({ path: `reports/qa/phase-07/evidence/p12-fonts-${mode}.png`, clip: { x: 0, y: 0, width: 640, height: 120 } });
  await c.close();
}
await browser.close();
log(out);
