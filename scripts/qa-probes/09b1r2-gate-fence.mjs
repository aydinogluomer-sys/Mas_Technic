/* QA 09b-1 R2 — DOES THE GATE'S FENCE HOLD?
   ==========================================================================
   The gate lied once: a contended machine left two routes stuck on
   `.shell-boot` with no stylesheet, and it reported a design-system split.
   Two preconditions were added — the route left its loading state, and
   `--tl-rail` is non-empty — and a control provokes both.

   That control provokes them with an ALL-CSS abort and a HELD route chunk.
   This probe asks whether a partial corruption gets past both. The build ships
   THREE stylesheets, and only two of them declare `--tl-rail`:

     index-*.css      130 KB   no `--tl-rail`
     Index-*.css       53 KB   `--tl-rail`   (landing)
     PageShell-*.css   65 KB   `--tl-rail`, `.shell-title-block`, `.shell-field`

   S1  block every .css                    (the control's own case)
   S2  block ONLY index-*.css              — the one that does NOT carry the sentinel
   S3  block ONLY PageShell-*.css
   S4  block ONLY Index-*.css
   S5  ABORT one route's JS chunk. Disclosed by the author: an aborted dynamic
       import reaches an error boundary rather than staying in Suspense, so
       `.shell-boot` comes down and the page "arrives". Does the gate then
       measure that route at all, and does its `rows.length > 300` floor
       notice that a whole route contributed nothing?

   For each: did a PRECONDITION fire (and which), and did the census report a
   SPLIT? A cell with "no precondition + a split" is the gate lying again.
   NETWORK: guard() at allowHosts=[], canary first.
   ========================================================================== */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { guard, canary, chromiumExecutable } from "../../reports/09b1c1/probe-lib.mjs";
import { preview, URL_BASE, CENSUS_SRC, splits, GATE_ROUTES } from "./09b1r2-lib.mjs";

const OUT = "reports/qa/phase-09b1r2";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

/* The gate's `arriveAt`, returning WHICH precondition fired instead of
   throwing, so the whole matrix can be measured in one run. */
async function arrive(page, route) {
  await page.goto(`${URL_BASE}${route}`, { waitUntil: "domcontentloaded" }).catch(() => {});
  try { await page.waitForSelector("#root", { state: "visible", timeout: 20_000 }); }
  catch { return "root-never-visible"; }
  const deadline = Date.now() + 20_000;
  let boot = await page.locator(".shell-boot").count();
  while (boot !== 0 && Date.now() < deadline) { await page.waitForTimeout(250); boot = await page.locator(".shell-boot").count(); }
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }).catch(() => {});
  if (boot !== 0) return "P1 never left its route loading state";
  const rail = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--tl-rail").trim()).catch(() => "");
  if (rail === "") return "P2 rendered without the stylesheet applied";
  return null;
}

const SCENARIOS = [
  { id: "S0", why: "control, nothing blocked", block: null },
  { id: "S1", why: "every stylesheet blocked (the gate's own control case)", block: "**/*.css" },
  { id: "S2", why: "ONLY index-*.css blocked — the sheet that does NOT declare --tl-rail", block: "**/assets/index-*.css" },
  { id: "S3", why: "ONLY PageShell-*.css blocked", block: "**/assets/PageShell-*.css" },
  { id: "S4", why: "ONLY Index-*.css blocked (the landing sheet)", block: "**/assets/Index-*.css" },
];

const run = async () => {
  const stop = await preview();
  const browser = await chromium.launch(chromiumExecutable() ? { executablePath: chromiumExecutable() } : {});
  try {
    for (const sc of SCENARIOS) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
      await guard(ctx, []);
      const page = await ctx.newPage();
      await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded" });
      if (sc.id === "S0") await canary(page, log);
      if (sc.block) await page.route(sc.block, (r) => r.abort());

      const rows = [];
      const fired = [];
      for (const route of GATE_ROUTES) {
        const p = await arrive(page, route);
        if (p) { fired.push(`${route}: ${p}`); continue; }
        const got = await page.evaluate(new Function(`return (${CENSUS_SRC})()`)).catch(() => []);
        for (const r of got) rows.push({ route, ...r });
      }
      const sp = splits(rows);
      log(`── ${sc.id}  ${sc.why}`);
      log(`   preconditions fired on ${fired.length}/${GATE_ROUTES.length} routes`);
      for (const f of fired.slice(0, 4)) log(`     ${f}`);
      log(`   observations reaching the census: ${rows.length}  (the gate's floor is >300)`);
      log(`   splits reported: ${sp.length}${sp.length ? "  *** the gate would go RED ***" : ""}`);
      for (const s of sp.slice(0, 4)) log(`     ${s.slice(0, 210)}`);
      log(`   VERDICT: ${fired.length === 0 && sp.length > 0
        ? "*** LIES — no precondition fired and it reports a split ***"
        : fired.length ? "a precondition names the real cause" : "clean"}`);
      log("");
      await ctx.close();
    }

    /* ── S5 — one route's JS chunk aborted ───────────────────────────────── */
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    await guard(ctx, []);
    const page = await ctx.newPage();
    await page.route("**/assets/SSS-*.js", (r) => r.abort());
    await page.route("**/assets/Sss-*.js", (r) => r.abort());
    const rows = [];
    const fired = [];
    const perRoute = {};
    for (const route of GATE_ROUTES) {
      const p = await arrive(page, route);
      if (p) { fired.push(`${route}: ${p}`); perRoute[route] = p; continue; }
      const got = await page.evaluate(new Function(`return (${CENSUS_SRC})()`)).catch(() => []);
      perRoute[route] = got.length;
      for (const r of got) rows.push({ route, ...r });
    }
    const sp = splits(rows);
    log("── S5  one route's JS chunk ABORTED (the disclosed error-boundary path)");
    log(`   preconditions fired on ${fired.length}/${GATE_ROUTES.length} routes: ${fired.join(" | ") || "none"}`);
    log("   observations per route:");
    for (const [r, n] of Object.entries(perRoute)) log(`     ${r.padEnd(34)} ${n}`);
    log(`   total observations: ${rows.length}  (gate floor >300 → ${rows.length > 300 ? "PASSES the floor" : "trips the floor"})`);
    log(`   splits: ${sp.length}`);
    log(`   VERDICT: ${fired.length === 0 && rows.length > 300 && sp.length === 0
      ? "*** the gate PASSES while one route was never measured — the floor is a total, not a per-route check ***"
      : "the corruption is visible"}`);
    await ctx.close();
  } finally {
    await browser.close();
    await stop();
    writeFileSync(`${OUT}/gate-fence.txt`, lines.join("\n") + "\n");
  }
};
run().catch((e) => { lines.push(`PROBE ERROR: ${e && e.stack}`); writeFileSync(`${OUT}/gate-fence.txt`, lines.join("\n") + "\n"); console.error(e); process.exit(1); });
