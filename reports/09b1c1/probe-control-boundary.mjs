/* 09b-1-C1 — ONE INSTRUMENT FOR EVERY BOUNDARY ON EVERY GROUND
   ══════════════════════════════════════════════════════════════════════════
   09b-1 measured `.shell-field`'s input border at 2.16:1 on five surfaces and
   proved the defect was the SHELL's, not auth's. This is the same measurement
   widened in the three directions the correction packet requires:

     1. EVERY control that takes its boundary from `--sf-rule`, not just the
        text input — so the sweep can say what it checked rather than what it
        happened to look at.
     2. BOTH grounds. `/sss` renders `.shell-field` inputs inside a
        `tone="paper"` band nested in a `graphite` root, which is the exact
        shape that falsified two `--sf-danger` proposals in 09a. A number that
        is only measured on graphite has not been measured.
     3. BOTH adjacent colours. WCAG 1.4.11 asks for 3:1 against the colours
        ADJACENT to the indicator. A border has two: the control's own fill on
        the inside and the ground on the outside. The binding number is the
        WORSE of the two, and this probe reports both plus the minimum, so no
        row can pass by being measured against the friendlier neighbour.

   It also measures the DECORATIVE rules deliberately, unchanged, so the claim
   "the decorative rules were left alone" is a measurement in the same file
   rather than an assertion beside it.

   NETWORK POSTURE. `guard()` from `./probe-lib.mjs` aborts every non-loopback
   request and `canary()` proves it before the first control is read. Nothing
   here submits, signs in, or touches the project. */
import { writeFileSync } from "node:fs";
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

const LABEL = process.argv[2] ?? "before";

/* Controls: something the reader operates. */
const CONTROLS = [
  ".shell-field input",
  ".shell-field select",
  ".shell-field textarea",
  ".shell-dropzone-area",
  ".shell-segment",
  ".shell-row-toggle",
  ".shell-auth-social > button",
  ".shell-action--ghost",
  ".tl-menu-trigger",
];

/* Rules and frames that are NOT controls. Measured so that "unchanged" is a
   number and not a promise. */
const DECOR = [
  ".shell-auth-aside",
  ".shell-auth-mark-block",
  ".shell-index > li",
  ".shell-index-meta > span",
  ".shell-tags > li",
  ".shell-note",
  ".shell-doc-section",
  ".shell-plate-frame",
  ".shell-table-scroll",
  ".shell-faq-item",
  ".shell-notice",
  ".shell-gauge > span",
  ".shell-divider",
  ".shell-meta-row",
];

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

/** Runs inside the page. Returns one row per matched element (first 4 each). */
const CENSUS = (payload) => {
  const { controls, decor } = payload;

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
  /* The nearest ancestor that actually paints something opaque. Every alpha
     surface between the element and it is composited back down in order, so a
     tint stack does not silently change the number. */
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
    if (!base) base = getComputedStyle(document.documentElement).backgroundColor;
    if (!parse(base) || alphaOf(base) < 0.999) base = "rgb(0, 0, 0)";
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
    return bandTone ?? rootTone ?? "unknown";
  };
  /* The side that is actually drawn. A component whose only rule is a
     `border-top` must not be read off its (zero-width) left edge. */
  const drawnSide = (s) => {
    const sides = ["Top", "Right", "Bottom", "Left"];
    for (const side of sides) {
      const w = parseFloat(s[`border${side}Width`]);
      const style = s[`border${side}Style`];
      const color = s[`border${side}Color`];
      if (w > 0 && style !== "none" && style !== "hidden" && alphaOf(color) > 0) {
        return { side: side.toLowerCase(), width: w, color };
      }
    }
    return null;
  };

  const read = (selector, kind) => {
    const rows = [];
    const nodes = Array.from(document.querySelectorAll(selector)).slice(0, 4);
    for (const el of nodes) {
      const box = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      const ground = groundOf(el);
      const fill = over(s.backgroundColor, ground) ?? ground;
      const edge = drawnSide(s);
      if (!edge) continue;
      /* A border paints over the element's OWN background (background-clip is
         border-box by default), so it is composited on the fill, then the
         result is compared to each adjacent colour in turn. */
      const border = over(edge.color, fill);
      const vsFill = ratio(border, fill);
      const vsGround = ratio(border, ground);
      const fillVsGround = ratio(fill, ground);
      /* WHY THE BINDING NUMBER IS A MAXIMUM AND NOT A MINIMUM.
         Going outward the edge is fill → border → ground, so the control's
         extent is perceivable if ANY ONE of those three transitions clears
         3:1. A minimum fails a filled control — a pressed `.shell-segment`
         paints its border the same colour as its fill, which reads 1:1
         against itself and 16.32:1 against the ground, and is obviously not
         an invisible control. A maximum over the three transitions is the
         question WCAG 1.4.11 actually asks. */
      const binding = Math.max(...[vsFill, vsGround, fillVsGround].filter((v) => v !== null));
      rows.push({
        kind,
        selector,
        tone: toneOf(el),
        side: edge.side,
        borderRaw: edge.color,
        borderFlat: border,
        fill,
        ground,
        vsFill,
        vsGround,
        binding,
        fillVsGround,
        visible: box.width > 0 && box.height > 0,
        text: (el.textContent ?? "").trim().slice(0, 28),
        disabled: !!el.disabled,
      });
    }
    return rows;
  };

  const out = [];
  for (const sel of controls) out.push(...read(sel, "control"));
  for (const sel of decor) out.push(...read(sel, "decor"));
  return out;
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
  const seen = await guard(context, []);

  for (const route of ROUTES) {
    const page = await context.newPage();
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 45_000 });
    } catch {
      /* A route that will not settle is reported, not silently skipped. */
      all.push({ viewport: vp.width, route, error: "navigation-timeout" });
      await page.close();
      continue;
    }
    /* MEASURED INSTRUMENT DEFECT THIS FIXES. The first run waited a flat
       1000 ms and reported ZERO elements for `/giris` and `/iletisim` at 1280
       — the two coldest chunk loads of the run — while the same routes at 375
       (warm server, warm file cache) returned 7 and 15 rows. A probe that
       cannot tell "this surface has no such control" from "this surface had
       not mounted yet" is not an instrument. It now waits for the shell to be
       in the DOM and for the route's own body to have rendered, and says so
       out loud if it never does. */
    try {
      await page.waitForSelector(".shell-root", { timeout: 30_000 });
      await page.waitForFunction(() => document.querySelectorAll("[class^='shell-'],[class*=' shell-']").length > 12, null, { timeout: 20_000 });
    } catch {
      all.push({ viewport: vp.width, route, error: "shell-never-mounted" });
      await page.close();
      continue;
    }
    await page.waitForTimeout(800);
    if (canaryResult === null) canaryResult = await canary(page, (m) => console.log(m));

    const rows = await page.evaluate(CENSUS, { controls: CONTROLS, decor: DECOR });
    for (const row of rows) all.push({ viewport: vp.width, route, ...row });
    await page.close();
  }
  traffic.blocked += seen.blocked.length;
  traffic.allowed += seen.allowed.length;
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

/* ── Report ─────────────────────────────────────────────────────────────── */
const failing = all.filter((r) => r.kind === "control" && r.visible && !r.disabled && r.binding !== null && r.binding < 3);
const passing = all.filter((r) => r.kind === "control" && r.visible && !r.disabled && r.binding !== null && r.binding >= 3);

const line = (r) =>
  `${String(r.viewport).padStart(4)}  ${String(r.route).padEnd(44)} ${String(r.selector).padEnd(30)}`
  + ` ${String(r.tone).padEnd(28)} fill ${String(r.vsFill).padStart(5)}  ground ${String(r.vsGround).padStart(5)}`
  + `  BINDING ${String(r.binding).padStart(5)}`;

console.log(`\n── CONTROLS UNDER 3:1 (${failing.length}) ──`);
for (const r of failing) console.log(line(r));
console.log(`\n── CONTROLS AT OR OVER 3:1 (${passing.length}) ──`);
for (const r of passing) console.log(line(r));
console.log(`\n── DECORATIVE RULES (unchanged by contract) ──`);
for (const r of all.filter((x) => x.kind === "decor" && x.visible)) console.log(line(r));
console.log(`\ncanary: ${canaryResult}`);
console.log(`traffic: blocked ${traffic.blocked}, ALLOWED ${traffic.allowed}`);

writeFileSync(
  `reports/09b1c1/control-boundary-${LABEL}.json`,
  JSON.stringify({ label: LABEL, canary: canaryResult, traffic, coverage, rows: all }, null, 2),
);
