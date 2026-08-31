#!/usr/bin/env node
/**
 * MASTER GRID AXIS PROBE — Phase 02 verification instrument.
 *
 * WHY THIS EXISTS
 * ---------------
 * A 12-column grid that is only *drawn* is not a grid. The landing used to
 * declare `rail + repeat(12,1fr)` on `.tl-band` and then let almost every band
 * body opt out with hand-tuned percentages (`23.8%`, `19.2%`, `4.6%`,
 * `35%/65%`, `48%/52%`, a fixed `132px` seventh track, `4fr/5fr/5fr`,
 * `43fr/77fr`). Those bands *looked* aligned at one width and drifted at every
 * other one. Screenshots cannot prove or disprove that; only measurement can.
 *
 * WHAT IT MEASURES
 * ----------------
 * For every probed viewport width:
 *   1. The master grid's real column boundaries are read from the tokens
 *      ACTUALLY IN USE — `getComputedStyle(band).gridTemplateColumns` resolves
 *      `var(--tl-rail) repeat(var(--tl-cols), minmax(0,1fr))` to used pixel
 *      track sizes. Boundaries are the running sums from the band's content-box
 *      origin. Nothing is hardcoded here, so the probe cannot silently agree
 *      with a stale assumption.
 *   2. Every probed block's real `getBoundingClientRect()` left/right edge is
 *      measured.
 *   3. Each edge is matched to its NEAREST master boundary and the signed delta
 *      is reported.
 *
 * TOLERANCE
 * ---------
 * 1.0 px. Fractional track widths (e.g. (1598-64)/12 = 127.8333px) mean exact
 * integer coincidence is impossible; 1 px absorbs sub-pixel layout rounding and
 * nothing else. A band that opted out of the master grid misses by tens of
 * pixels, so this gate is not cosmetic.
 *
 * USAGE
 * -----
 *   node scripts/grid-axis-probe.mjs                 # builds nothing; needs dist/
 *   node scripts/grid-axis-probe.mjs --server=dev    # runs against `npm run dev`
 *   node scripts/grid-axis-probe.mjs --json          # machine-readable output
 *   PROBE_BASE_URL=http://localhost:4173 node scripts/grid-axis-probe.mjs
 *
 * Exit code 0 = every measured edge sits on a master axis. 1 = at least one
 * band is off the grid (or the page failed to render).
 */

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const WIDTHS = [375, 768, 1280, 1440, 1600];
const TOLERANCE_PX = 1.0;
const VIEWPORT_HEIGHT = 900;

/**
 * Probed blocks, grouped by band. The assertion is deliberately
 * breakpoint-agnostic: a block must land on SOME master boundary, not on a
 * hardcoded index. That is what makes one probe valid at 375 (4 columns), 768
 * (6 columns) and 1280+ (12 columns) without encoding three sets of
 * expectations that could each be wrong.
 */
const PROBE_TARGETS = [
  /* `.tl-header` is a DOCUMENTED exception: it is the one structural block
     whose interior is not a subgrid (`210px 1fr auto` — brand plate, nav
     field, actions). The exception is only legitimate if its OUTER edges still
     sit on the master grid, so the promise is measured here rather than
     asserted in prose. Until Phase 02 correction #1 the header was never
     probed and the documented exception was therefore untested. */
  { band: "Header", root: ".tl-header-band", blocks: [
    ["header", ".tl-header"],
  ] },
  { band: "Hero", root: ".tl-hero", blocks: [
    ["copy", ".tl-hero-copy"],
    ["part stage", ".tl-part-stage"],
    ["part passport", ".tl-part-passport"],
  ] },
  { band: "Proof", root: ".tl-proof", blocks: [
    ["grid", ".tl-proof-grid"],
    ["cells", ".tl-proof-grid > article", "all"],
  ] },
  { band: "Process", root: ".tl-process", blocks: [
    ["body", ".tl-process-body"],
    ["intro", ".tl-process-intro"],
    ["figure", ".tl-process-body > figure"],
    ["steps", ".tl-process-body > ol"],
    ["step cells", ".tl-process-body > ol > li", "all"],
  ] },
  { band: "Nexus", root: ".tl-nexus", blocks: [
    ["body", ".tl-nexus-body"],
    ["header title", ".tl-nexus-body > header > h2"],
    ["kpis", ".tl-nexus-kpis"],
    ["app rail", ".tl-nexus-rail"],
    ["app main", ".tl-nexus-main"],
  ] },
  { band: "Projects", root: ".tl-projects", blocks: [
    ["body", ".tl-projects-body"],
    ["featured", ".tl-project-featured"],
    ["secondary cards", ".tl-project-grid > article:not(.tl-project-featured)", "all"],
  ] },
  { band: "Sectors", root: ".tl-sectors", blocks: [
    ["body", ".tl-sectors-body"],
    ["cards", ".tl-sector-card", "all"],
  ] },
  { band: "Manifesto", root: ".tl-manifesto", blocks: [
    ["body", ".tl-manifesto-body"],
    ["copy", ".tl-manifesto-copy"],
  ] },
  { band: "Quality", root: ".tl-quality", blocks: [
    ["body", ".tl-quality-body"],
    ["strip", ".tl-quality-strip"],
    ["evidence cards", ".tl-quality-strip > .tl-cert", "all"],
  ] },
  { band: "References", root: ".tl-references", blocks: [
    ["grid", ".tl-reference-grid"],
    ["cells", ".tl-reference-grid > li", "all"],
  ] },
  { band: "FAQ", root: ".tl-faq-band", blocks: [
    ["body", ".tl-faq-body"],
    ["title", ".tl-faq-title"],
    ["questions", ".tl-faq"],
    ["resources", ".tl-resource"],
  ] },
  { band: "RFQ", root: ".tl-rfq", blocks: [
    ["body", ".tl-rfq-body"],
    ["title", ".tl-rfq-body > h2"],
    ["cad drop", ".tl-cad-drop"],
    ["steps", ".tl-rfq-body > ol"],
  ] },
  { band: "Footer", root: ".tl-footer", blocks: [
    ["body", ".tl-footer-body"],
    ["brand", ".tl-footer-brand"],
    ["nav", ".tl-footer-body > nav"],
    ["nav columns", ".tl-footer-body > nav > div", "all"],
    ["title block", ".tl-title-block"],
  ] },
];

/* ── Chromium resolution ───────────────────────────────────────────────────
   Same constraint as `playwright.config.ts`: the Chromium revision Playwright
   pins is not installed on this machine (reports/baseline/known-blockers.md
   B08). Fall back to an installed Chrome/Edge rather than installing anything.
   ------------------------------------------------------------------------ */
function resolveChromium() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    "/bin/chromium",
    process.env.ProgramFiles && join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe"),
    process.env["ProgramFiles(x86)"] && join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
  ].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (found) return found;

  const root = process.env.PLAYWRIGHT_BROWSERS_PATH
    ?? (process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "ms-playwright") : undefined);
  if (!root || !existsSync(root)) return undefined;
  return readdirSync(root)
    .filter((entry) => entry.startsWith("chromium-"))
    .map((entry) => join(root, entry, "chrome-win", "chrome.exe"))
    .find((candidate) => existsSync(candidate));
}

async function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      /* not up yet */
    }
    if (Date.now() > deadline) throw new Error(`server did not answer at ${url}`);
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}

/**
 * Vite is started through `node node_modules/vite/bin/vite.js`, not through the
 * npm shim: on Windows + Node 26 `spawn("npm.cmd", args)` throws EINVAL unless
 * `shell:true` is used, and `shell:true` with an argument array concatenates
 * arguments without escaping them. Calling the JS entry point directly avoids
 * both problems and leaves a single killable child process.
 */
function startServer(mode, port) {
  const vite = join("node_modules", "vite", "bin", "vite.js");
  const args = mode === "dev"
    ? [vite, "--port", String(port), "--strictPort"]
    : [vite, "preview", "--port", String(port), "--strictPort"];
  const child = spawn(process.execPath, args, { stdio: ["ignore", "ignore", "pipe"] });
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

/* ── In-page measurement ─────────────────────────────────────────────────── */
function measureInPage({ targets, tolerance }) {
  const round = (value) => Math.round(value * 1000) / 1000;

  /**
   * Master boundaries of one band, derived from its USED track sizes.
   *
   * `.tl-band` declares `var(--tl-rail) repeat(var(--tl-cols),minmax(0,1fr))`,
   * so track 1 is the technical rail and tracks 2..n+1 are the n master
   * columns. Axis -1 is the rail's own left edge (the sheet edge); axis k is
   * master column boundary k, k = 0 (rail/content seam) .. n (content right
   * edge). Everything below is read back from the browser, never assumed.
   */
  function masterAxes(band) {
    const style = getComputedStyle(band);
    const tracks = style.gridTemplateColumns.split(/\s+/).filter(Boolean).map(Number.parseFloat);
    if (tracks.length < 2 || tracks.some(Number.isNaN)) return null;
    const rect = band.getBoundingClientRect();
    const gap = Number.parseFloat(style.columnGap) || 0;
    const contentLeft = rect.left
      + (Number.parseFloat(style.borderLeftWidth) || 0)
      + (Number.parseFloat(style.paddingLeft) || 0);

    const trackLeft = [];
    let x = contentLeft;
    for (const track of tracks) { trackLeft.push(x); x += track + gap; }
    const contentRight = x - gap;

    const columns = tracks.length - 1;
    const axes = [{ index: -1, x: round(trackLeft[0]) }];
    for (let k = 0; k < columns; k += 1) axes.push({ index: k, x: round(trackLeft[k + 1]) });
    axes.push({ index: columns, x: round(contentRight) });

    return { rail: round(tracks[0]), column: round(tracks[1]), columns, axes };
  }

  function nearest(axes, value) {
    let best = axes[0];
    for (const axis of axes) {
      if (Math.abs(axis.x - value) < Math.abs(best.x - value)) best = axis;
    }
    return { axis: best.index, axisX: best.x, delta: round(value - best.x) };
  }

  const rows = [];
  for (const target of targets) {
    const band = document.querySelector(target.root);
    if (!band) {
      rows.push({ band: target.band, block: "(band)", status: "MISSING" });
      continue;
    }
    const master = masterAxes(band);
    if (!master) {
      rows.push({ band: target.band, block: "(band)", status: "UNRESOLVED_TRACKS" });
      continue;
    }
    for (const [label, selector, mode] of target.blocks) {
      const nodes = mode === "all"
        ? [...band.querySelectorAll(selector)]
        : [band.querySelector(selector)].filter(Boolean);
      if (nodes.length === 0) {
        rows.push({ band: target.band, block: label, status: "ABSENT" });
        continue;
      }
      nodes.forEach((node, i) => {
        if (getComputedStyle(node).display === "none") return;
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        const left = nearest(master.axes, rect.left);
        const right = nearest(master.axes, rect.right);
        const worst = Math.max(Math.abs(left.delta), Math.abs(right.delta));
        rows.push({
          band: target.band,
          block: nodes.length > 1 ? `${label} #${i + 1}` : label,
          rail: master.rail,
          column: master.column,
          columns: master.columns,
          leftPx: round(rect.left),
          leftAxis: left.axis,
          leftDelta: left.delta,
          rightPx: round(rect.right),
          rightAxis: right.axis,
          rightDelta: right.delta,
          span: right.axis - left.axis,
          status: worst <= tolerance ? "OK" : "OFF_GRID",
        });
      });
    }
  }
  return rows;
}

/* ── Reporting ───────────────────────────────────────────────────────────── */
function renderTable(width, rows) {
  const header = ["BAND", "BLOCK", "LEFT px", "→ AXIS", "Δ", "RIGHT px", "→ AXIS", "Δ", "SPAN", "STATUS"];
  const body = rows.map((row) => row.status === "OK" || row.status === "OFF_GRID"
    ? [
      row.band, row.block,
      row.leftPx.toFixed(2), `C${row.leftAxis}`, row.leftDelta.toFixed(2),
      row.rightPx.toFixed(2), `C${row.rightAxis}`, row.rightDelta.toFixed(2),
      `${row.span}col`, row.status,
    ]
    : [row.band, row.block, "-", "-", "-", "-", "-", "-", "-", row.status]);
  const all = [header, ...body];
  const widths = header.map((_, i) => Math.max(...all.map((line) => String(line[i]).length)));
  const line = (cells) => cells.map((cell, i) => String(cell).padEnd(widths[i])).join("  ");
  const sample = rows.find((row) => row.rail !== undefined);
  const meta = sample
    ? `rail ${sample.rail}px · ${sample.columns} columns · column ${sample.column}px · rail share ${(sample.rail / width * 100).toFixed(1)}%`
    : "no resolved master grid";
  return [
    "",
    `── ${width}px ── ${meta}`,
    line(header),
    line(header.map((_, i) => "-".repeat(widths[i]))),
    ...body.map(line),
  ].join("\n");
}

/* ── Main ────────────────────────────────────────────────────────────────── */
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const mode = (args.find((arg) => arg.startsWith("--server="))?.split("=")[1]) ?? "preview";
const port = Number(process.env.PROBE_PORT ?? (mode === "dev" ? 5199 : 4199));
const baseUrl = process.env.PROBE_BASE_URL ?? `http://localhost:${port}`;

let server;
if (!process.env.PROBE_BASE_URL) {
  if (mode === "preview" && !existsSync("dist/index.html")) {
    console.error("dist/index.html is missing — run `npm run build` first, or pass --server=dev.");
    process.exit(1);
  }
  server = startServer(mode, port);
}

const executablePath = resolveChromium();
let browser;
let failures = 0;
const report = { baseUrl, tolerancePx: TOLERANCE_PX, viewports: {} };

try {
  await waitForServer(baseUrl, 180_000);
  browser = await chromium.launch(executablePath ? { executablePath } : {});
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();

  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: VIEWPORT_HEIGHT });
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("[data-testid='technical-landing-root']", { timeout: 30_000 });
    // The intro shell overlays the document until it hands off; measuring before
    // the hand-off would measure a transient tree.
    await page.waitForFunction(() => document.getElementById("hero-shell") === null, undefined, { timeout: 20_000 });
    await page.evaluate(async () => {
      document.querySelectorAll("img").forEach((img) => { img.loading = "eager"; });
      await document.fonts?.ready;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await page.waitForFunction(
      () => [...document.images].every((img) => img.complete),
      undefined,
      { timeout: 30_000 },
    ).catch(() => undefined);

    const rows = await page.evaluate(measureInPage, { targets: PROBE_TARGETS, tolerance: TOLERANCE_PX });
    report.viewports[width] = rows;
    const bad = rows.filter((row) => row.status !== "OK" && row.status !== "ABSENT");
    failures += bad.length;
    if (!asJson) console.log(renderTable(width, rows));
  }

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("");
    console.log(failures === 0
      ? `GRID AXIS PROBE: PASS — every measured edge sits on a master axis (tolerance ${TOLERANCE_PX}px).`
      : `GRID AXIS PROBE: FAIL — ${failures} measured edge(s) miss the master grid by more than ${TOLERANCE_PX}px.`);
  }
} catch (error) {
  console.error(`GRID AXIS PROBE: ERROR — ${error instanceof Error ? error.message : String(error)}`);
  failures = Math.max(failures, 1);
} finally {
  await browser?.close();
  if (server) {
    server.kill();
  }
}

process.exit(failures === 0 ? 0 : 1);
