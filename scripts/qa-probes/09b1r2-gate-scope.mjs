/* QA 09b-1 R2 — ATTACKING THE SCOPE OF THE NEW PERMANENT TYPOGRAPHY GATE
   ==========================================================================
   `e2e/design-system-typography.spec.ts` asserts, on every route and with an
   EMPTY exemption register, that a design-system component computes one
   typography everywhere. The scope was measured (256 components / 1730
   observations / 0 splits at 1280) and then declared universal. "Measured
   universal" is a claim about today's tree; this probe asks what the shape of
   the check lets through and what it would wrongly catch.

   FOUR QUESTIONS, ALL ANSWERED FROM PIXELS AND COMPUTED STYLE:

     Q1  How much of the document is the gate NOT looking at? `keyOf` returns
         null for any element without a `shell-*`/`tl-*` class, so those are
         censused only by the ONE hand-written second pass over `.shell-field`.
         The historical defect was exactly a bare element inside a component.
         Count the bare text-bearing elements inside OTHER design-system
         components: every one of them is a place the same defect could recur
         invisibly.

     Q2  Does the key change with state? The key is tagName + every
         `shell-*`/`tl-*` class, SORTED. A component that toggles a
         design-system class on hover/open/focus becomes a DIFFERENT key, so
         the gate cannot compare the two states - and also cannot false-fire
         on them. Measure which keys move under interaction.

     Q3  Is there any legitimate relative sizing that would make the gate red?
         A `font-size` in `em` computes differently per context by design.
         Grep the SHIPPED css, then confirm against the census.

     Q4  Which routes and which states are outside the gate entirely?

   NETWORK: guard() at allowHosts=[] with a live canary first. Read-only; no
   control that starts an auth call is pressed.
   ========================================================================== */
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { chromium } from "@playwright/test";
import { guard, canary, chromiumExecutable } from "./probe-lib.mjs";
import { preview, URL_BASE, CENSUS_SRC, splits, GATE_ROUTES } from "./09b1r2-lib.mjs";

const OUT = "reports/qa/phase-09b1r2";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

/* ── 0. CENSUS PARITY, MEASURED BEHAVIOURALLY ─────────────────────────────
   This probe must measure the GATE, not a paraphrase of it. Textual diffing
   of the two sources is a normalising game that proves nothing; what matters
   is whether they RETURN THE SAME THING. So the spec's own CENSUS is lifted
   out of the .ts file, its type annotations stripped, and both functions are
   evaluated on the same document in the same frame. If a single row differs,
   the probe says so. */
function specCensusSource() {
  const spec = readFileSync("e2e/design-system-typography.spec.ts", "utf8");
  const start = spec.indexOf("const CENSUS = () => {");
  const end = spec.indexOf("/* ── TWO PRECONDITIONS");
  if (start < 0 || end < 0) throw new Error("could not locate CENSUS in the gate spec — re-anchor this probe");
  return spec.slice(start, end)
    .replace(/^const CENSUS = /, "")
    .replace(/;\s*$/, "")
    .trim()
    .replace(/\(el: Element\)/g, "(el)")
    .replace(/\(key: string, el: Element\)/g, "(key, el)")
    .replace(/:\s*\{[^}]*\}\[\]\s*=/, " =")
    .replace(/const out: [^=]+=/, "const out =");
}

async function parity(page) {
  const src = specCensusSource();
  const [mine, theirs] = await Promise.all([
    page.evaluate(new Function(`return (${CENSUS_SRC})()`)),
    page.evaluate(new Function(`return (${src})()`)),
  ]);
  const same = JSON.stringify(mine) === JSON.stringify(theirs);
  log(`census parity with the shipped gate, measured on the same document: ${same ? "IDENTICAL" : "*** DIFFERENT ***"}`);
  log(`  probe rows=${mine.length}  spec rows=${theirs.length}`);
  if (!same) {
    for (let i = 0; i < Math.max(mine.length, theirs.length); i++) {
      if (JSON.stringify(mine[i]) !== JSON.stringify(theirs[i])) {
        log(`  first differing row ${i}:`);
        log(`    probe ${JSON.stringify(mine[i])}`);
        log(`    spec  ${JSON.stringify(theirs[i])}`);
        break;
      }
    }
  }
  return same;
}

/* The gate's `arriveAt`, reproduced including BOTH preconditions. Round 1 of
   this probe skipped the poll and censused `/` while `.shell-boot` was still
   in the document; the numbers were wrong by 78 components and it said so in
   its own output. Poll, then measure. */
async function arriveAt(page, route) {
  await page.goto(`${URL_BASE}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#root", { state: "visible", timeout: 20_000 });
  const deadline = Date.now() + 20_000;
  let boot = await page.locator(".shell-boot").count();
  while (boot !== 0 && Date.now() < deadline) {
    await page.waitForTimeout(200);
    boot = await page.locator(".shell-boot").count();
  }
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  const rail = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--tl-rail").trim());
  if (boot !== 0) throw new Error(`${route} never left its route loading state`);
  if (rail === "") throw new Error(`${route} rendered without the stylesheet applied`);
}

/* Elements that carry text but NO design-system class, grouped by the nearest
   design-system ancestor. Each group is a component whose bare children the
   gate cannot see. */
const BARE_SRC = `() => {
  const key = (el) => {
    const c = Array.from(el.classList).filter((x) => /^(shell-|tl-)/.test(x)).sort();
    return c.length ? el.tagName.toLowerCase() + "." + c.join(".") : null;
  };
  const vis = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width >= 1 || r.height >= 1;
  };
  const out = {};
  for (const el of Array.from(document.querySelectorAll("*"))) {
    if (key(el)) continue;
    if (!vis(el)) continue;
    const t = el.tagName.toLowerCase();
    if (["html","head","body","script","style","link","meta","title","svg","path","g","defs","use","circle","rect","line","polyline","polygon","br","noscript"].includes(t)) continue;
    // text-bearing = has a non-empty direct text node
    const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join("").trim();
    if (!own) continue;
    let a = el.parentElement, owner = null;
    while (a) { const k = key(a); if (k) { owner = k; break; } a = a.parentElement; }
    if (!owner) owner = "(no design-system ancestor)";
    const s = getComputedStyle(el);
    const fp = [s.fontFamily.split(",")[0].replace(/["']/g,""), s.fontSize, s.fontWeight, s.fontStyle, s.letterSpacing, s.textTransform].join(" / ");
    const bucket = owner + "  >  " + t;
    (out[bucket] = out[bucket] || []).push(fp);
  }
  return out;
}`;

const run = async () => {
  const stop = await preview();
  const browser = await chromium.launch(
    chromiumExecutable() ? { executablePath: chromiumExecutable() } : {},
  );
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      reducedMotion: "reduce",
    });
    const net = await guard(ctx, []);
    const page = await ctx.newPage();
    await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded" });
    await canary(page, log);
    log("");

    /* ── Q1 + the full census ───────────────────────────────────────────── */
    const rows = [];
    const bareByRoute = {};
    let okParity = null;
    for (const route of GATE_ROUTES) {
      await arriveAt(page, route);
      if (okParity === null) { okParity = await parity(page); log(""); }
      const got = await page.evaluate(new Function(`return (${CENSUS_SRC})()`));
      for (const r of got) rows.push({ route, ...r });
      bareByRoute[route] = await page.evaluate(new Function(`return (${BARE_SRC})()`));
    }

    const keys = new Set(rows.map((r) => r.key));
    log("── Q0. THE GATE'S OWN NUMBERS, REPRODUCED ─────────────────────────────");
    log(`components (distinct keys): ${keys.size}`);
    log(`observations              : ${rows.length}`);
    log(`splits                    : ${splits(rows).length}`);
    for (const s of splits(rows)) log(`  SPLIT ${s}`);
    log("");

    log("── Q1. WHAT THE GATE CANNOT SEE: bare text elements inside components ──");
    log("`keyOf` returns null without a shell-*/tl-* class, so these are censused");
    log("ONLY by the single hand-written second pass over `.shell-field`. Every");
    log("other row below is a component whose bare child can diverge in silence —");
    log("which is precisely the shape of the defect this gate was written for.");
    log("");
    const bare = new Map();
    for (const [route, groups] of Object.entries(bareByRoute)) {
      for (const [bucket, fps] of Object.entries(groups)) {
        if (!bare.has(bucket)) bare.set(bucket, { routes: new Set(), fps: new Map(), n: 0 });
        const e = bare.get(bucket);
        e.routes.add(route);
        e.n += fps.length;
        for (const fp of fps) e.fps.set(fp, (e.fps.get(fp) ?? 0) + 1);
      }
    }
    const covered = (b) => b.startsWith("div.shell-field") || b.includes("shell-field  >  label");
    const sorted = [...bare.entries()].sort((a, b) => b[1].n - a[1].n);
    log(`distinct (component > bare child) buckets: ${bare.size}`);
    log(`total bare text observations            : ${[...bare.values()].reduce((s, e) => s + e.n, 0)}`);
    log("");
    log("bucket                                                              n   fps  routes");
    for (const [bucket, e] of sorted) {
      log(`${bucket.padEnd(66)} ${String(e.n).padStart(4)} ${String(e.fps.size).padStart(4)}   ${[...e.routes].length}${covered(bucket) ? "   (inside .shell-field: COVERED by pass 2)" : ""}`);
    }
    log("");
    log("Buckets where the SAME bare child of the SAME component already resolves");
    log("more than one typography today — legitimate variation the gate is blind to,");
    log("and therefore also the exact hiding place a real regression would use:");
    let blindMulti = 0;
    for (const [bucket, e] of sorted) {
      if (e.fps.size > 1 && !covered(bucket)) {
        blindMulti++;
        log(`  ${bucket}`);
        for (const [fp, n] of e.fps) log(`      ${String(n).padStart(4)}x  ${fp}`);
      }
    }
    log(`total: ${blindMulti} buckets already carrying >1 treatment, invisible to the gate`);
    log("");

    /* ── Q2. Does the key move under state? ─────────────────────────────── */
    log("── Q2. KEYS THAT MOVE UNDER STATE ──────────────────────────────────────");
    log("The key is tagName + every shell-*/tl-* class, sorted. If a class toggles,");
    log("the element becomes a DIFFERENT component to the gate. That is why it does");
    log("not false-fire on state — and equally why it cannot compare states.");
    await arriveAt(page, "/");
    await page.waitForTimeout(1500);
    const before = await page.evaluate(new Function(`return (${CENSUS_SRC})()`));
    const trigger = page.locator("button.tl-menu-trigger").first();
    let stateReport = "menu trigger not found";
    if (await trigger.count()) {
      await trigger.click();
      await page.waitForTimeout(1200);
      const after = await page.evaluate(new Function(`return (${CENSUS_SRC})()`));
      const kb = new Set(before.map((r) => r.key));
      const ka = new Set(after.map((r) => r.key));
      const added = [...ka].filter((k) => !kb.has(k));
      const gone = [...kb].filter((k) => !ka.has(k));
      /* Keys present in BOTH states with a different fingerprint = the gate
         WOULD have called this a split if it ever censused two states. */
      const fpB = new Map(), fpA = new Map();
      for (const r of before) (fpB.get(r.key) ?? fpB.set(r.key, new Set()).get(r.key)).add(r.style);
      for (const r of after) (fpA.get(r.key) ?? fpA.set(r.key, new Set()).get(r.key)).add(r.style);
      const crossState = [];
      for (const k of ka) {
        if (!kb.has(k)) continue;
        const a = [...(fpA.get(k) ?? [])], b = [...(fpB.get(k) ?? [])];
        if (a.some((x) => !b.includes(x)) || b.some((x) => !a.includes(x))) crossState.push(`${k}: closed=${b.join("|")}  open=${a.join("|")}`);
      }
      stateReport = `keys only when OPEN: ${added.length}, only when CLOSED: ${gone.length}, same key different typography across states: ${crossState.length}`;
      log(stateReport);
      for (const c of crossState) log(`  CROSS-STATE ${c}`);
      log(`  keys appearing only with the menu open (never censused by the gate): ${added.length}`);
      for (const k of added.slice(0, 40)) log(`      ${k}`);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(600);
    } else {
      log(stateReport);
    }
    log("");

    /* ── Q3. Relative font sizing in the SHIPPED css ─────────────────────── */
    log("── Q3. RELATIVE FONT SIZING IN THE SHIPPED CSS ─────────────────────────");
    const cssFiles = readdirSync("dist/assets").filter((f) => f.endsWith(".css"));
    let emDecls = 0, emSamples = [];
    for (const f of cssFiles) {
      const css = readFileSync(`dist/assets/${f}`, "utf8");
      const re = /([^{}]{0,160})\{[^{}]*?font-size:\s*([0-9.]+em)/g;
      let m;
      while ((m = re.exec(css))) {
        emDecls++;
        if (emSamples.length < 25) emSamples.push(`${m[1].trim().slice(-120)} { font-size: ${m[2]} }`);
      }
    }
    log(`shipped css files: ${cssFiles.join(", ")}`);
    log(`\`font-size\` declarations in \`em\` (context-relative by design): ${emDecls}`);
    for (const s of emSamples) log(`  ${s}`);
    log("");
    log("── Q4. ROUTES OUTSIDE THE GATE ─────────────────────────────────────────");
    log(`the gate visits ${GATE_ROUTES.length} routes: ${GATE_ROUTES.join(" ")}`);
    log("");

    log(`network: requested=${net.requested.length} blocked=${net.blocked.length} allowed=${net.allowed.length}`);
    for (const u of net.blocked.slice(0, 10)) log(`  blocked ${u}`);

    writeFileSync(`${OUT}/gate-scope.json`, JSON.stringify({
      parity: okParity,
      keys: keys.size,
      observations: rows.length,
      splits: splits(rows),
      bare: [...bare.entries()].map(([bucket, e]) => ({ bucket, n: e.n, fps: [...e.fps.entries()], routes: [...e.routes] })),
    }, null, 1));
  } finally {
    await browser.close();
    await stop();
    writeFileSync(`${OUT}/gate-scope.txt`, lines.join("\n") + "\n");
  }
};

run().catch((e) => {
  lines.push(`PROBE ERROR: ${e && e.stack}`);
  writeFileSync(`${OUT}/gate-scope.txt`, lines.join("\n") + "\n");
  console.error(e);
  process.exit(1);
});
