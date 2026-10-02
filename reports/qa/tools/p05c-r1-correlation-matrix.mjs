#!/usr/bin/env node
/* QA — phase 05b RE-VERIFICATION, R1 + R2.
 *
 * R1  Hover each of the six measurements at 1440 and read the COMPUTED
 *     opacity of all sixteen participants. The claim under test is that the
 *     hovered measurement, its guide line and its passport counterpart all
 *     reach 1 while everything else in the family recedes to .34.
 *
 * R2  Two negative controls, both performed IN PLACE on the live stylesheet
 *     so that source order is untouched and only the one property under test
 *     changes:
 *
 *       (a) put `opacity` back into the `tl-label-lock-*` keyframes. If that
 *           was really the cause, the six boxes go back to being frozen at 1
 *           in every state (animation origin outranks normal declarations
 *           under `fill-mode: both`).
 *       (b) put `.tl-dim-line path` back into the isolation list, REPLACING
 *           the rule at its own index so it still precedes the correlation.
 *           If specificity was really the cause, the guide lines stop
 *           reaching 1 even though nothing about source order moved.
 *
 *     (b) is deliberately an in-place replacement rather than an appended
 *     style tag: an appended rule would win by ORDER and would prove nothing
 *     about specificity.
 *
 * Every hover is preceded by a check that `.tl-hero:has(SEL:hover)` actually
 * matches. A non-matching selector reads as "nothing dimmed", which is
 * indistinguishable from a pass unless you ask.
 */
import { chromium } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:4211";

function chrome() {
  const c = [
    process.env.ProgramFiles && join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe"),
    process.env["ProgramFiles(x86)"] && join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
  ].filter(Boolean).find(existsSync);
  if (c) return c;
  const root = join(process.env.LOCALAPPDATA, "ms-playwright");
  return readdirSync(root).filter((e) => e.startsWith("chromium-"))
    .map((e) => join(root, e, "chrome-win", "chrome.exe")).find(existsSync);
}

const MEASURES = [".tl-measure-top", ".tl-measure-left", ".tl-measure-finish", ".tl-fcf-top", ".tl-fcf-bottom", ".tl-datum"];
const LINES = [".tl-dim--bore", ".tl-dim--tol", ".tl-dim--height", ".tl-dim--perp", ".tl-dim--finish", ".tl-dim--datum"];
const PASSPORT = [".tl-pp-body", ".tl-pp-bore", ".tl-pp-holes", ".tl-pp-dim"];
const TARGETS = [...MEASURES, ...LINES, ...PASSPORT];

/* The correlation table exactly as the correction packet states it. */
const TABLE = [
  { hover: ".tl-measure-top", line: ".tl-dim--bore", pp: ".tl-pp-bore", receded: [".tl-measure-finish", ".tl-pp-body"] },
  { hover: ".tl-fcf-top", line: ".tl-dim--tol", pp: ".tl-pp-holes", receded: [".tl-measure-top"] },
  { hover: ".tl-measure-left", line: ".tl-dim--height", pp: ".tl-pp-dim", receded: [".tl-measure-top"] },
  { hover: ".tl-fcf-bottom", line: ".tl-dim--perp", pp: ".tl-pp-body", receded: [".tl-pp-holes"] },
  { hover: ".tl-measure-finish", line: ".tl-dim--finish", pp: ".tl-pp-body", receded: [".tl-pp-holes"] },
  { hover: ".tl-datum", line: ".tl-dim--datum", pp: ".tl-pp-dim", receded: [".tl-pp-body"] },
];

/** min / max own opacity over every node the selector matches, plus the count. */
const READ = (sels) => {
  const out = {};
  for (const sel of sels) {
    const nodes = Array.from(document.querySelectorAll(sel));
    if (!nodes.length) { out[sel] = { n: 0, min: -1, max: -1 }; continue; }
    const vals = nodes.map((n) => Number.parseFloat(getComputedStyle(n).opacity));
    out[sel] = { n: nodes.length, min: Math.min(...vals), max: Math.max(...vals) };
  }
  return out;
};

async function open(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "no-preference",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(2800); // let DRAW -> LOCK finish
  return { ctx, page };
}

async function hoverAndRead(page, sel) {
  await page.mouse.move(4, 4);
  await page.waitForTimeout(320);
  await page.locator(sel).first().hover();
  await page.waitForTimeout(420);
  const matched = await page.evaluate((s) => ({
    family: !!document.querySelector(".tl-hero:has([data-dim]:hover)"),
    self: !!document.querySelector(`.tl-hero:has(${s}:hover)`),
  }), sel);
  return { matched, read: await page.evaluate(READ, TARGETS) };
}

const fmt = (v) => (v.n === 0 ? "MISSING" : v.min === v.max ? v.min.toFixed(2) : `${v.min.toFixed(2)}..${v.max.toFixed(2)}`);

const browser = await chromium.launch({
  executablePath: chrome(),
  args: ["--disable-dev-shm-usage", "--disable-gpu", "--no-sandbox", "--disable-extensions"],
});

let failures = 0;
const bad = (m) => { failures += 1; console.log("  ✗ " + m); };
const good = (m) => console.log("  ✓ " + m);

/* ── R1 ───────────────────────────────────────────────────────────────── */
{
  const { ctx, page } = await open(browser);

  console.log("\n### R1 · resting state (no pointer in the hero)");
  await page.mouse.move(4, 4);
  await page.waitForTimeout(400);
  const rest = await page.evaluate(READ, TARGETS);
  for (const sel of TARGETS) {
    const v = rest[sel];
    const ok = v.n > 0 && v.min > 0.99;
    console.log(`  ${ok ? "✓" : "✗"} ${sel.padEnd(20)} n=${String(v.n).padEnd(2)} opacity=${fmt(v)}`);
    if (!ok) failures += 1;
  }

  console.log("\n### R1 · six hovers, full sixteen-element matrix");
  const head = "  " + "hovered".padEnd(20) + TARGETS.map((s) => s.replace(/^\.tl-/, "").slice(0, 8).padStart(9)).join("");
  console.log(head);
  for (const c of TABLE) {
    const { matched, read } = await hoverAndRead(page, c.hover);
    const row = "  " + c.hover.replace(/^\./, "").padEnd(20)
      + TARGETS.map((s) => fmt(read[s]).padStart(9)).join("");
    console.log(row);

    if (!matched.self) bad(`${c.hover}: :has(${c.hover}:hover) did NOT match — every opacity below is meaningless`);
    if (!matched.family) bad(`${c.hover}: :has([data-dim]:hover) did NOT match`);
    if (!(read[c.hover].min > 0.99)) bad(`${c.hover}: hovered measurement is ${fmt(read[c.hover])}, expected 1`);
    if (!(read[c.line].min > 0.99)) bad(`${c.hover}: guide ${c.line} is ${fmt(read[c.line])}, expected 1`);
    if (!(read[c.pp].min > 0.99)) bad(`${c.hover}: passport ${c.pp} is ${fmt(read[c.pp])}, expected 1`);
    for (const r of c.receded) {
      if (!(read[r].max < 0.5)) bad(`${c.hover}: ${r} is ${fmt(read[r])}, expected .34`);
    }
    // Everything in the family that is NOT one of the three correlated must recede.
    const lit = new Set([c.hover, c.line, c.pp]);
    for (const s of TARGETS) {
      if (lit.has(s)) continue;
      if (!(read[s].max < 0.5)) bad(`${c.hover}: uncorrelated ${s} stayed at ${fmt(read[s])}`);
    }
  }

  console.log("\n### R1 · back to rest after the pointer leaves");
  await page.mouse.move(4, 4);
  await page.waitForTimeout(500);
  const rest2 = await page.evaluate(READ, TARGETS);
  const stuck = TARGETS.filter((s) => !(rest2[s].min > 0.99));
  if (stuck.length) bad("did not return to rest: " + stuck.map((s) => `${s}=${fmt(rest2[s])}`).join(", "));
  else good("all sixteen back at 1");

  await ctx.close();
}

/* ── R2 (a) — opacity back in the keyframes ───────────────────────────── */
{
  const { ctx, page } = await open(browser);
  console.log("\n### R2 · negative control (a) — restore `opacity` in tl-label-lock-* keyframes, in place");

  const applied = await page.evaluate(() => {
    const walk = (rules, out) => {
      for (const r of rules) {
        if (r.type === CSSRule.KEYFRAMES_RULE && /^tl-label-lock-/.test(r.name)) out.push(r);
        if (r.cssRules) { try { walk(r.cssRules, out); } catch { /* noop */ } }
      }
      return out;
    };
    const found = [];
    for (const sheet of document.styleSheets) {
      try { walk(sheet.cssRules, found); } catch { /* cross-origin */ }
    }
    for (const kf of found) {
      const down = kf.name.endsWith("down");
      kf.appendRule(`0%{opacity:0;clip-path:inset(${down ? "0 0 100% 0" : "100% 0 0 0"})}`);
      kf.appendRule("100%{opacity:1;clip-path:inset(0)}");
    }
    return found.map((k) => k.name);
  });
  console.log("  patched keyframes: " + JSON.stringify(applied));
  if (applied.length !== 2) bad("expected to find both keyframe rules, found " + applied.length);

  await page.waitForTimeout(400);
  const { matched, read } = await hoverAndRead(page, ".tl-measure-top");
  console.log("  :has() matched: " + JSON.stringify(matched));
  const frozen = MEASURES.filter((s) => read[s].min > 0.99);
  console.log("  measurement boxes: " + MEASURES.map((s) => `${s.replace(/^\.tl-/, "")}=${fmt(read[s])}`).join(" "));
  console.log("  guide lines:       " + LINES.map((s) => `${s.replace(/^\.tl-/, "")}=${fmt(read[s])}`).join(" "));
  if (frozen.length === MEASURES.length) good("cause (a) REPRODUCES — all six boxes frozen at 1 despite the isolation rule");
  else bad(`cause (a) did NOT reproduce — only ${frozen.length}/6 boxes frozen: ${frozen.join(",")}`);

  await ctx.close();
}

/* ── R2 (b) — `.tl-dim-line path` back in the isolation list, same index ── */
{
  const { ctx, page } = await open(browser);
  console.log("\n### R2 · negative control (b) — restore `.tl-dim-line path` in the isolation list, AT ITS OWN INDEX");

  const applied = await page.evaluate(() => {
    const OLD = ".tl-hero:has([data-dim]:hover) :is(.tl-dim-line path,.tl-measure,.tl-fcf,.tl-datum,.tl-pp-bore,.tl-pp-holes,.tl-pp-dim)";
    const find = (container, out) => {
      const rules = container.cssRules;
      if (!rules) return out;
      for (let i = 0; i < rules.length; i += 1) {
        const r = rules[i];
        if (r.type === CSSRule.STYLE_RULE && r.selectorText
            && r.selectorText.includes(":has([data-dim]:hover)")) {
          out.push({ container, index: i, text: r.cssText, selector: r.selectorText });
        }
        if (r.cssRules) { try { find(r, out); } catch { /* noop */ } }
      }
      return out;
    };
    const hits = [];
    for (const sheet of document.styleSheets) {
      try { find(sheet, hits); } catch { /* cross-origin */ }
    }
    const isolation = hits.filter((h) => /opacity:\s*\.?0?\.?34/.test(h.text) || /opacity:\s*0?\.34/.test(h.text));
    const target = isolation[0] ?? hits[0];
    if (!target) return { ok: false, hits: hits.length };
    const before = target.text;
    target.container.deleteRule(target.index);
    target.container.insertRule(OLD + "{opacity:.34}", target.index);
    const after = target.container.cssRules[target.index].cssText;
    return { ok: true, index: target.index, before, after };
  });
  console.log("  " + JSON.stringify(applied, null, 2).split("\n").join("\n  "));
  if (!applied.ok) bad("could not locate the isolation rule to replace");

  await page.waitForTimeout(400);
  const { matched, read } = await hoverAndRead(page, ".tl-measure-top");
  console.log("  :has() matched: " + JSON.stringify(matched));
  console.log("  guide lines:       " + LINES.map((s) => `${s.replace(/^\.tl-/, "")}=${fmt(read[s])}`).join(" "));
  console.log("  measurement boxes: " + MEASURES.map((s) => `${s.replace(/^\.tl-/, "")}=${fmt(read[s])}`).join(" "));
  console.log("  passport:          " + PASSPORT.map((s) => `${s.replace(/^\.tl-/, "")}=${fmt(read[s])}`).join(" "));
  if (read[".tl-dim--bore"].max < 0.5) {
    good("cause (b) REPRODUCES — the correlated guide line is dimmed by the more specific isolation rule that still PRECEDES it");
  } else {
    bad(`cause (b) did NOT reproduce — .tl-dim--bore is ${fmt(read[".tl-dim--bore"])}`);
  }
  // The passport half must still work under (b): it proves (b) is specific to the lines.
  console.log("  (passport counterpart under (b): " + fmt(read[".tl-pp-bore"]) + " — expected still 1, the bug was lines-only)");

  await ctx.close();
}

await browser.close();
console.log(`\nRESULT: ${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"}`);
process.exit(failures === 0 ? 0 : 1);
