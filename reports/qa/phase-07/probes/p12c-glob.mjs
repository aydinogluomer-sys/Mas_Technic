/* PROBE 12c — red/green on the interception counter itself, using page.route()
 * exactly as e2e/visual/fonts.ts does, so the "0 intercepts" result cannot be
 * an artefact of how I counted.
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const PATTERNS = [
  "https://fonts.g*",              // EXACTLY what installFontRetry registers
  "https://fonts.g**",
  "**fonts.googleapis.com**",
  "https://fonts.googleapis.com/**",
];

const browser = await launch();
const out = {};
for (const pat of PATTERNS) {
  const c = await ctx(browser, { width: 1280, height: 900, reduce: true });
  const page = await c.newPage();
  let hits = 0, total = 0;
  page.on("request", (r) => { if (/fonts\.g/.test(r.url())) total++; });
  await page.route(pat, async (route) => { hits++; await route.continue(); });
  await goto(page, "/hizmetler/cnc-frezeleme");
  await page.waitForTimeout(3000);
  out[pat] = { intercepted: hits, fontRequestsSeen: total };
  await c.close();
}
await browser.close();
log(out);
