/* 09b-1-C1 — ONE INSTRUMENT FOR EVERY BOUNDARY ON EVERY GROUND
   ══════════════════════════════════════════════════════════════════════════
   09b-1 measured `.shell-field`'s input border at 2.16:1 on five surfaces and
   proved the defect was the SHELL's, not auth's. This is the same measurement
   widened in four directions the correction packet requires:

     1. IT DISCOVERS THE CONTROLS RATHER THAN BEING TOLD THEM. A hand-written
        selector list can only find the components the author already
        suspected — the first version of this probe missed `.tl-social a` in
        the footer, which is on every route in the run. So it walks the whole
        document, keeps every element that is interactive (or is the visible
        half of a control), keeps every element that draws a border, and
        reports the two sets separately. "Every control you checked" is then a
        measurement rather than a memory.
     2. BOTH grounds. `/sss` renders `.shell-field` inputs inside a
        `tone="paper"` band nested in a `graphite` root, which is the exact
        shape that falsified two `--sf-danger` proposals in 09a. A number that
        is only measured on graphite has not been measured.
     3. BOTH adjacent colours. WCAG 1.4.11 asks for 3:1 against the colours
        ADJACENT to the indicator. A border has two: the control's own fill on
        the inside and the ground on the outside. Both are reported.
     4. Both viewports, 1280 and 375.

   It measures the DECORATIVE rules in the same pass and the same file, so the
   claim "the decorative rules were left alone" is a number rather than a
   promise.

   NETWORK POSTURE. `guard()` from `./probe-lib.mjs` aborts every non-loopback
   request and `canary()` proves it before the first control is read. Nothing
   here submits, signs in, or touches the project. */
import { writeFileSync } from "node:fs";
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

const LABEL = process.argv[2] ?? "before";

const ROUTES = [
  "/giris",
  "/sifremi-unuttum",
  "/reset-password#token_hash=probe-no-network",
  "/iletisim",
  "/teklif-al",
  "/sss",
  "/malzemeler",
];

const VIEWPORTS = [
  { width: 1280, height: 900, mobile: false },
  { width: 375, height: 812, mobile: true },
];

/** Runs inside the page. Discovers, classifies and measures every bordered box. */
const CENSUS = () => {
  const srgb = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const parse = (s) => {
    const n = String(s).match(/[-\d.]+/g);
    return n && n.length >= 3 ? n.slice(0, 3).map(Number) : null;
  };
  const alphaOf = (c) => {
    const m = String(c).match(/rgba?\(([^)]+)\)/);
    const parts = m ? m[1].split(",").map((v) => parseFloat(v)) : [];
    return parts.length === 4 ? parts[3] : (String(c) === "transparent" ? 0 : 1);
  };
  const lum = ([r, g, b]) => 0.2126 * srgb(r / 255) + 0.7152 * srgb(g / 255) + 0.0722 * srgb(b / 255);
  const ratio = (a, b) => {
    const x = parse(a); const y = parse(b);
    if (!x || !y) return null;
    const [hi, lo] = [lum(x), lum(y)].sort((p, q) => q - p);
    return Number(((hi + 0.05) / (lo + 0.05)).toFixed(2));
  };
  const over = (c, ground) => {
    const a = alphaOf(c); const x = parse(c); const y = parse(ground);
    if (!x || !y) return null;
    if (a >= 0.999) return `rgb(${x.join(", ")})`;
    return `rgb(${x.map((v, i) => Math.round(a * v + (1 - a) * y[i])).join(", ")})`;
  };
  /* The nearest ancestor that actually paints something opaque, with every
     alpha surface in between composited back down in order, so a tint stack
     does not silently change the number. */
  const groundOf = (el) => {
    const stack = [];
    let node = el.parentElement;
    let base = null;
    while (node) {
      const bg = getComputedStyle(node).backgroundColor;
      const a = alphaOf(bg);
      if (a > 0.999 && parse(bg)) { base = bg; break; }
      if (a > 0) stack.push(bg);
      node = node.parentElement;
    }
    if (!base || !parse(base) || alphaOf(base) < 0.999) base = "rgb(0, 0, 0)";
    let flat = base;
    for (let i = stack.length - 1; i >= 0; i -= 1) flat = over(stack[i], flat) ?? flat;
    return flat;
  };
  const toneOf = (el) => {
    const band = el.closest("[data-band-tone]");
    const root = el.closest("[data-shell-surface]");
    const bandTone = band ? band.getAttribute("data-band-tone") : null;
    const rootTone = root ? root.getAttribute("data-shell-surface") : null;
    if (bandTone && root && band !== root) return `${bandTone}-band-in-${rootTone}-root`;
    return bandTone ?? rootTone ?? "no-shell-root";
  };
  /* The side that is actually drawn. A component whose only rule is a
     `border-top` must not be read off its (zero-width) left edge. */
  const drawnSide = (s) => {
    const drawn = [];
    for (const side of ["Top", "Right", "Bottom", "Left"]) {
      const w = parseFloat(s[`border${side}Width`]);
      const style = s[`border${side}Style`];
      const color = s[`border${side}Color`];
      if (w > 0 && style !== "none" && style !== "hidden" && alphaOf(color) > 0) {
        drawn.push({ side: side.toLowerCase(), width: w, color });
      }
    }
    if (!drawn.length) return null;
    return { ...drawn[0], sides: drawn.length, enclosing: drawn.length === 4 };
  };

  const INTERACTIVE = "a[href],button,input,select,textarea,summary,[role='button'],[role='link'],[role='checkbox'],[role='radio'],[role='switch'],[role='tab'],[contenteditable='true']";

  /** The visible half of a control whose real input is visually hidden. */
  const isControlSurface = (el) => {
    if (el.matches(INTERACTIVE)) return true;
    if (el.tagName === "LABEL") {
      const id = el.getAttribute("for");
      if (id && document.getElementById(id)) return true;
      if (el.querySelector("input,select,textarea")) return true;
    }
    return false;
  };

  /** A stable name for a component: its tag plus its design-system classes. */
  const keyOf = (el) => {
    const classes = Array.from(el.classList).filter((c) => /^(shell-|tl-|sf-)/.test(c));
    return `${el.tagName.toLowerCase()}${classes.length ? `.${classes.join(".")}` : ""}`;
  };

  const seen = new Map();
  for (const el of Array.from(document.querySelectorAll("*"))) {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") continue;
    const edge = drawnSide(s);
    if (!edge) continue;
    const box = el.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) continue;

    /* THREE CLASSES, NOT TWO — and the third is the one that keeps this
       honest. An element can be interactive AND have a border that is not its
       boundary: `a.tl-brand` takes a `border-right` because it is a column of
       the header grid, and `.shell-faq-source a` takes a `border-bottom`
       because that is a link underline. Neither draws a box around a control,
       so neither is what 1.4.11 asks about. Only an ENCLOSING border is a
       control boundary; a one- or two-sided rule on a control is reported in
       its own list rather than folded into either verdict. */
    const control = isControlSurface(el);
    const cls = control ? (edge.enclosing ? "control" : "control-edge") : "decor";
    const key = `${cls}|${keyOf(el)}|${toneOf(el)}`;
    /* One row per component-per-tone. Four `.shell-tags > li` on one band are
       the same measurement four times; a count is enough. */
    const existing = seen.get(key);
    if (existing) { existing.count += 1; continue; }

    const ground = groundOf(el);
    const fill = over(s.backgroundColor, ground) ?? ground;
    const border = over(edge.color, fill);
    const vsFill = ratio(border, fill);
    const vsGround = ratio(border, ground);
    const fillVsGround = ratio(fill, ground);
    /* WHY THE BINDING NUMBER IS A MAXIMUM AND NOT A MINIMUM.
       Going outward the edge is fill → border → ground, so the control's
       extent is perceivable if ANY of those three transitions clears 3:1. A
       minimum fails a filled control — a pressed `.shell-segment` paints its
       border the same colour as its fill, reads 1:1 against itself and
       16.32:1 against the ground, and is plainly not an invisible control. */
    const binding = Math.max(...[vsFill, vsGround, fillVsGround].filter((v) => v !== null));

    seen.set(key, {
      kind: cls,
      component: keyOf(el),
      within: [el.parentElement, el.parentElement?.parentElement]
        .filter(Boolean).map(keyOf).join(" < "),
      tone: toneOf(el),
      count: 1,
      side: edge.side,
      sides: edge.sides,
      enclosing: edge.enclosing,
      width: edge.width,
      borderRaw: edge.color,
      borderFlat: border,
      fill,
      ground,
      vsFill,
      vsGround,
      fillVsGround,
      binding,
      disabled: !!el.disabled || el.getAttribute("aria-disabled") === "true",
      text: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 26),
    });
  }
  return Array.from(seen.values());
};

const browser = await launch();
const all = [];
let canaryResult = null;
const traffic = { blocked: 0, allowed: 0 };

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    reducedMotion: "reduce",
  });
  const watched = await guard(context, []);

  for (const route of ROUTES) {
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 45_000 });
    } catch {
      all.push({ viewport: vp.width, route, error: "navigation-timeout" });
      await page.close();
      continue;
    }
    /* MEASURED INSTRUMENT DEFECT THIS FIXES. The first run waited a flat
       1000 ms and reported ZERO elements for `/giris` and `/iletisim` at 1280
       — the two coldest chunk loads of the run — while the same routes at 375
       (warm server, warm file cache) returned 7 and 15 rows. A probe that
       cannot tell "this surface has no such control" from "this surface had
       not mounted yet" is not an instrument. */
    try {
      await page.waitForSelector(".shell-root", { timeout: 30_000 });
      await page.waitForFunction(
        () => document.querySelectorAll("[class^='shell-'],[class*=' shell-']").length > 12,
        null,
        { timeout: 20_000 },
      );
    } catch {
      all.push({ viewport: vp.width, route, error: "shell-never-mounted" });
      await page.close();
      continue;
    }
    await page.waitForTimeout(800);
    if (canaryResult === null) canaryResult = await canary(page, (m) => console.log(m));

    const rows = await page.evaluate(CENSUS);
    for (const row of rows) all.push({ viewport: vp.width, route, ...row });
    await page.close();
  }
  traffic.blocked += watched.blocked.length;
  traffic.allowed += watched.allowed.length;
  await context.close();
}
await browser.close();

if (canaryResult === null) throw new Error("canary never ran — refusing to report numbers");

/* ── Coverage, before any number is read ────────────────────────────────── */
const coverage = [];
for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    const n = all.filter((r) => r.viewport === vp.width && r.route === route && !r.error).length;
    coverage.push({ viewport: vp.width, route, rows: n });
    if (n === 0) console.log(`!! NO ROWS  ${vp.width}  ${route}  — the probe saw nothing; do not read this run as a pass`);
  }
}

const live = (r) => !r.error && !r.disabled;
const failing = all.filter((r) => live(r) && r.kind === "control" && r.binding < 3);
const passing = all.filter((r) => live(r) && r.kind === "control" && r.binding >= 3);
const edges = all.filter((r) => live(r) && r.kind === "control-edge");
const decor = all.filter((r) => live(r) && r.kind === "decor");

const line = (r) =>
  `${String(r.viewport).padStart(4)}  ${String(r.route).padEnd(44)} ${String(r.component).padEnd(38)}`
  + ` ${String(r.tone).padEnd(30)} x${String(r.count).padEnd(4)} ${String(r.sides)}side`
  + ` fill ${String(r.vsFill).padStart(5)}  ground ${String(r.vsGround).padStart(5)}  BINDING ${String(r.binding).padStart(5)}`;

console.log(`\n══ CONTROLS WITH AN ENCLOSING BOUNDARY, UNDER 3:1 — ${failing.length} component/tone rows ══`);
for (const r of failing) console.log(line(r));
console.log(`\n══ CONTROLS WITH AN ENCLOSING BOUNDARY, AT OR OVER 3:1 — ${passing.length} ══`);
for (const r of passing) console.log(line(r));
console.log(`\n══ CONTROLS WHOSE BORDER IS NOT A BOUNDARY (a grid divider, a link underline) — ${edges.length} ══`);
for (const r of edges) console.log(`${line(r)}   within ${r.within}`);
console.log(`\n══ NOT CONTROLS: rules, frames, chips, separators — ${decor.length} ══`);
for (const r of decor) console.log(line(r));

const boxed = [...new Set(all.filter((r) => r.kind === "control").map((r) => r.component))].sort();
const edged = [...new Set(edges.map((r) => `${r.component}  (${r.sides}-side, within ${r.within})`))].sort();
console.log(`\n══ EVERY BOXED CONTROL THE SWEEP FOUND (${boxed.length}) ══`);
for (const c of boxed) console.log(`  ${c}`);
console.log(`\n══ EVERY INTERACTIVE ELEMENT WITH A NON-ENCLOSING RULE (${edged.length}) ══`);
for (const c of edged) console.log(`  ${c}`);

console.log(`\ncanary: ${canaryResult}`);
console.log(`traffic: blocked ${traffic.blocked}, ALLOWED ${traffic.allowed}`);

writeFileSync(
  `reports/09b1c1/control-boundary-${LABEL}.json`,
  JSON.stringify({ label: LABEL, canary: canaryResult, traffic, coverage, rows: all }, null, 2),
);
