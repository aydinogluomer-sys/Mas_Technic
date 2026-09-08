/* QA 09b-1 R2 — PROVING THE TYPOGRAPHY GATE RED A DIFFERENT WAY
   ==========================================================================
   The gate ships with two negative controls of its own; both mutate the LIVE
   PAGE with `addStyleTag`. The packet asked for a red arrived at differently,
   so this one is arrived at differently in three respects:

     1. the defect is in the SHIPPED STYLESHEET, not in the page under test;
     2. it is a GROUND-scoped rule - the exact axis the gate's header claims
        is held constant and claims is "a defect by the system's own rule" -
        rather than the child-combinator failure from history;
     3. the check that goes red is the REAL spec, unmodified, run by the real
        runner in the real project, not a probe that reimplements it.

   The mutation touches `dist/`, which is a build artefact and is gitignored.
   No tracked production file is edited. `restore` puts the byte-identical
   original back and the run afterwards proves it.

   usage:  node scripts/qa-probes/09b1r2-gate-red-mutation.mjs apply|restore
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync, readdirSync, copyFileSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";

const DIR = "dist/assets";
const MARK = "/* 09b1r2-QA-MUTATION */";

/* A real defect of the class the gate says it catches: one design-system
   component computing two typographies because a rule was scoped to a ground.
   `header.shell-title-block` renders TWICE on `/iletisim` — once inside a
   paper band and once not — so this splits one component inside one route.
   Everything about it is what a careless commit looks like: a real class, a
   real selector, a plausible intention, in the stylesheet.

   THE FIRST ATTEMPT AIMED AT `[data-shell-surface="paper"]` AND MATCHED
   NOTHING. `09b1r2-ground-recon.mjs` measured why: `data-shell-surface` takes
   exactly one value in this application, `graphite`, and `paper` is only ever
   a `data-band-tone`. The rule sat in the CSSOM (confirmed) and selected zero
   elements, so the gate stayed green for a reason that had nothing to do with
   the gate. Recorded rather than quietly corrected: a mutation test that is
   not proved to mutate is not a test. */
const RULE = `\n${MARK}\n.tl-band[data-band-tone="paper"] .shell-title-block{font-size:17px !important;letter-spacing:3px !important}\n`;

const target = () => {
  const f = readdirSync(DIR).filter((x) => x.startsWith("index-") && x.endsWith(".css"));
  if (f.length !== 1) throw new Error(`expected exactly one index-*.css in ${DIR}, found ${f.length}`);
  return `${DIR}/${f[0]}`;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex").slice(0, 16);

const file = target();
const backup = `${file}.09b1r2.bak`;
const mode = process.argv[2];

if (mode === "apply") {
  if (existsSync(backup)) throw new Error("a backup already exists — restore first");
  copyFileSync(file, backup);
  const before = sha(file);
  writeFileSync(file, readFileSync(file, "utf8") + RULE);
  console.log(`mutated ${file}`);
  console.log(`  sha256[0:16] before ${before}  after ${sha(file)}`);
  console.log(`  appended: ${RULE.trim().split("\n")[1]}`);
} else if (mode === "restore") {
  if (!existsSync(backup)) throw new Error("no backup to restore");
  const mutated = sha(file);
  copyFileSync(backup, file);
  unlinkSync(backup);
  const now = sha(file);
  const clean = !readFileSync(file, "utf8").includes(MARK);
  console.log(`restored ${file}`);
  console.log(`  sha256[0:16] mutated ${mutated}  restored ${now}`);
  console.log(`  marker gone: ${clean}`);
  if (!clean) process.exit(1);
} else if (mode === "verify") {
  /* A MUTATION TEST THAT IS NOT PROVED TO MUTATE IS NOT A TEST. Open the
     route, count what the injected selector actually matches, and print the
     two fingerprints the gate should now see. */
  const { chromium } = await import("@playwright/test");
  const { guard, canary, chromiumExecutable } = await import("../../reports/09b1c1/probe-lib.mjs");
  const { preview, URL_BASE } = await import("./09b1r2-lib.mjs");
  const stop = await preview();
  const browser = await chromium.launch(chromiumExecutable() ? { executablePath: chromiumExecutable() } : {});
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    await guard(ctx, []);
    const page = await ctx.newPage();
    await page.goto(`${URL_BASE}/iletisim`, { waitUntil: "domcontentloaded" });
    await canary(page, (s) => console.log(s));
    await page.waitForSelector("#root", { state: "visible", timeout: 20_000 });
    const dl = Date.now() + 20_000;
    while (await page.locator(".shell-boot").count() && Date.now() < dl) await page.waitForTimeout(200);
    await page.evaluate(async () => { await document.fonts?.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
    const sel = RULE.split("{")[0].split("\n").pop().trim();
    const info = await page.evaluate((s) => ({
      matched: document.querySelectorAll(s).length,
      all: Array.from(document.querySelectorAll(".shell-title-block")).map((e) => {
        const c = getComputedStyle(e);
        return `${c.fontSize} / ${c.letterSpacing}  matches=${e.matches(s)}`;
      }),
    }), sel);
    console.log(`selector      : ${sel}`);
    console.log(`matched       : ${info.matched} element(s) on /iletisim`);
    for (const a of info.all) console.log(`  .shell-title-block  ${a}`);
    if (info.matched === 0) { console.log("MUTATION IS INERT — do not draw a conclusion from the run that follows"); process.exitCode = 1; }
  } finally {
    await browser.close();
    await stop();
  }
} else {
  console.error("usage: apply|verify|restore");
  process.exit(2);
}
