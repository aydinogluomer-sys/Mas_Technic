/* PROBE 12b — block the font hosts FOR REAL, and separately measure whether the
 * glob `https://fonts.g*` that installFontRetry() registers actually intercepts
 * the stylesheet and face requests.
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const FAMILIES = ["Space Grotesk", "IBM Plex Mono", "Newsreader"];
const FACES = ['700 22px "Space Grotesk"', '400 12px "IBM Plex Mono"', 'italic 400 30px "Newsreader"'];

const M = ([faces, families]) => document.fonts.ready.then(() => {
  const loaded = [];
  document.fonts.forEach((f) => { if (f.status === "loaded") loaded.push(f.family.replace(/["']/g, "")); });
  const s = document.createElement("span");
  s.style.cssText = 'position:absolute;font:700 22px "Space Grotesk";white-space:pre';
  s.textContent = "MAS TECHNIC HASSAS";
  document.body.appendChild(s);
  const w = s.getBoundingClientRect().width; s.remove();
  return {
    readyResolved: true,
    checks: faces.map((f) => [f, document.fonts.check(f)]),
    faceSetSize: document.fonts.size,
    loadedFamilies: [...new Set(loaded)],
    missingByEnumeration: families.filter((fam) => !loaded.includes(fam)),
    sampleWidth: +w.toFixed(2),
  };
});

const browser = await launch();
const out = {};

for (const mode of ["blocked-doublestar", "live", "coder-glob-probe"]) {
  const c = await ctx(browser, { width: 1280, height: 900, reduce: true });
  const seen = { coderGlob: 0, all: [] };
  if (mode === "blocked-doublestar") {
    await c.route("**://fonts.googleapis.com/**", (r) => r.abort());
    await c.route("**://fonts.gstatic.com/**", (r) => r.abort());
  }
  if (mode === "coder-glob-probe") {
    // EXACTLY the pattern e2e/visual/fonts.ts registers
    await c.route("https://fonts.g*", async (route) => { seen.coderGlob++; await route.continue(); });
  }
  const page = await c.newPage();
  page.on("request", (r) => { if (/fonts\.g/.test(r.url())) seen.all.push(r.url().slice(0, 70)); });
  await goto(page, "/hizmetler/cnc-frezeleme");
  await page.waitForTimeout(3500);
  out[mode] = { ...(await page.evaluate(M, [FACES, FAMILIES])),
                fontRequests: seen.all.length, fontRequestSample: seen.all.slice(0, 4),
                interceptedByCoderGlob: seen.coderGlob };
  await page.screenshot({ path: `reports/qa/phase-07/evidence/p12b-${mode}.png`, clip: { x: 0, y: 0, width: 700, height: 90 } });
  await c.close();
}
await browser.close();
log(out);
