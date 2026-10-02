/* QA round 3 — H5. Does the derived waiver actually close the hole my own
 * spec header named?
 *
 * The header of e2e/visual/qa-a2-overlay-guard.spec.ts says: "If a later phase
 * adds a non-`/` route with `require: false`, that is a hole this file does not
 * cover." H5 claims to have closed it. So run the OLD implementation and the
 * NEW one side by side, over the same five cases, against the same live build.
 * Both are compiled from their real sources with esbuild — neither is
 * re-implemented here, because a re-implementation proves nothing about the
 * file that ships.
 */
import { launch, ctx, goto } from "./lib.mjs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";

const OLD = await import(pathToFileURL(resolve("reports/qa/phase-07c3/lib/overlays-OLD.mjs")).href);
const NEW = await import(pathToFileURL(resolve("reports/qa/phase-07c3/lib/overlays-NEW.mjs")).href);

const CASES = [
  { id: "1 armed  /hizmetler/cnc-frezeleme  require:true ", route: "/hizmetler/cnc-frezeleme", opts: undefined,            want: "RESOLVE>0" },
  { id: "2 red    /                          require:true ", route: "/",                        opts: undefined,            want: "THROW" },
  { id: "3 legal  /                          require:false", route: "/",                        opts: { require: false },   want: "RESOLVE=0" },
  { id: "4 HOLE   /hakkimizda                require:false", route: "/hakkimizda",              opts: { require: false },   want: "THROW" },
  { id: "5 HOLE   /malzemeler                require:false", route: "/malzemeler",              opts: { require: false },   want: "THROW" },
];

const browser = await launch();
const c = await ctx(browser, { width: 1280, height: 900 });
const rows = [];

for (const impl of [{ name: "OLD (6f37eb0)", m: OLD }, { name: "NEW (7bdd587)", m: NEW }]) {
  for (const cs of CASES) {
    const page = await c.newPage();
    await goto(page, cs.route);
    let outcome, detail;
    try {
      const n = await impl.m.hideForeignOverlays(page, cs.opts);
      outcome = n > 0 ? "RESOLVE>0" : "RESOLVE=0";
      detail = `resolved(${n})`;
    } catch (e) {
      outcome = "THROW";
      detail = String(e.message ?? e).split("\n")[0].slice(0, 90);
    }
    rows.push({ impl: impl.name, case: cs.id, want: cs.want, outcome, ok: outcome === cs.want, detail });
    await page.close();
  }
}

/* The Coder flags a residual: the guard reads page.url(), so a call made
   before the first navigation sees about:blank and fails loudly. Measure it
   rather than argue about it. */
const p = await c.newPage();
await p.goto("about:blank");
let blank;
try { const n = await NEW.hideForeignOverlays(p, { require: false }); blank = `RESOLVE(${n})`; }
catch (e) { blank = "THROW: " + String(e.message ?? e).split("\n")[0].slice(0, 110); }
let blankRequire;
try { const n = await NEW.hideForeignOverlays(p); blankRequire = `RESOLVE(${n})`; }
catch (e) { blankRequire = "THROW: " + String(e.message ?? e).split("\n")[0].slice(0, 110); }
await p.close();
await browser.close();

writeFileSync(process.argv[2], JSON.stringify({ rows, aboutBlank: { requireFalse: blank, requireTrue: blankRequire } }, null, 1));
for (const impl of ["OLD (6f37eb0)", "NEW (7bdd587)"]) {
  const r = rows.filter((x) => x.impl === impl);
  console.log(`\n${impl}:  ${r.filter((x) => x.ok).length}/${r.length} correct`);
  for (const x of r) console.log(`  ${x.ok ? "ok  " : "WRONG"} ${x.case}  want ${x.want.padEnd(9)} got ${x.outcome.padEnd(9)}  ${x.detail}`);
}
console.log("\nabout:blank, require:false ->", blank);
console.log("about:blank, require:true  ->", blankRequire);
