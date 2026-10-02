#!/usr/bin/env node
/**
 * QA PHASE 02 — AC3 dev-runtime half.
 *
 * The bundle half (overlay absent from dist/) is a grep. This checks the other
 * half the packet asks for: that the overlay ACTUALLY WORKS under `npm run dev`
 * and that the lines it draws are the master boundaries — i.e. that the overlay
 * markers coincide with the real band track boundaries at every breakpoint, on
 * every band named in the acceptance criterion.
 *
 *   PROBE_BASE_URL=http://localhost:5299 node reports/qa/tools/qa-overlay-check.mjs
 */
import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.env.PROBE_BASE_URL ?? "http://localhost:5299";
const OUT = "reports/qa/tools/shots";

function resolveChromium() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    "/bin/chromium",
    process.env.ProgramFiles && join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe"),
    process.env["ProgramFiles(x86)"] && join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
  ].filter(Boolean);
  const found = candidates.find((c) => existsSync(c));
  if (found) return found;
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH
    ?? (process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "ms-playwright") : undefined);
  if (!root || !existsSync(root)) return undefined;
  return readdirSync(root).filter((e) => e.startsWith("chromium-"))
    .map((e) => join(root, e, "chrome-win", "chrome.exe")).find((c) => existsSync(c));
}

const BANDS = [
  ["Hero", ".tl-hero"], ["Process", ".tl-process"], ["Nexus", ".tl-nexus"],
  ["Projects", ".tl-projects"], ["Quality", ".tl-quality"], ["FAQ", ".tl-faq-band"],
  ["RFQ", ".tl-rfq"], ["Footer", ".tl-footer"],
];

mkdirSync(OUT, { recursive: true });
const executablePath = resolveChromium();
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const report = {};

for (const width of [375, 768, 1280]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-testid='technical-landing-root']", { timeout: 60_000 });
  await page.waitForFunction(() => document.getElementById("hero-shell") === null, undefined, { timeout: 30_000 });

  const before = await page.locator("[data-testid='master-grid-overlay']").count();
  // toggle via the documented keyboard shortcut, not by poking state
  await page.keyboard.down("Control");
  await page.keyboard.down("Alt");
  await page.keyboard.press("g");
  await page.keyboard.up("Alt");
  await page.keyboard.up("Control");
  await page.waitForTimeout(400);
  const after = await page.locator("[data-testid='master-grid-overlay']").count();

  const result = await page.evaluate((bands) => {
    const r = (v) => Math.round(v * 100) / 100;
    const markers = [...document.querySelectorAll(".tl-grid-overlay-sheet > i")];
    if (markers.length === 0) return { error: "no overlay markers" };
    // Each marker's LEFT border is a drawn axis; the last one also draws right.
    const drawn = markers.map((m) => r(m.getBoundingClientRect().left));
    drawn.push(r(markers[markers.length - 1].getBoundingClientRect().right));

    const perBand = {};
    for (const [name, sel] of bands) {
      const band = document.querySelector(sel);
      if (!band) { perBand[name] = { status: "MISSING" }; continue; }
      const cs = getComputedStyle(band);
      const tracks = cs.gridTemplateColumns.split(/\s+/).filter(Boolean).map(Number.parseFloat);
      const rect = band.getBoundingClientRect();
      const gap = Number.parseFloat(cs.columnGap) || 0;
      let x = rect.left + (Number.parseFloat(cs.borderLeftWidth) || 0) + (Number.parseFloat(cs.paddingLeft) || 0);
      const real = [];
      for (const t of tracks) { real.push(r(x)); x += t + gap; }
      real.push(r(x - gap));
      // worst distance from each real boundary to the nearest drawn line
      const worst = Math.max(...real.map((v) =>
        Math.min(...drawn.map((d) => Math.abs(d - v)))));
      perBand[name] = { boundaries: real.length, worstDeltaPx: r(worst), status: worst <= 1 ? "SHARED" : "DIVERGES" };
    }
    const readout = document.querySelector(".tl-grid-overlay-readout span")?.textContent ?? null;
    return { markerCount: markers.length, drawnAxes: drawn.length, readout, perBand };
  }, BANDS);

  await page.screenshot({ path: join(OUT, `overlay-${width}.png`) });
  report[width] = { overlayNodesBeforeToggle: before, overlayNodesAfterToggle: after, ...result };
}

console.log(JSON.stringify(report, null, 2));
await browser.close();
