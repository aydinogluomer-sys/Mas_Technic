#!/usr/bin/env node
/**
 * QA PHASE 02 — S6.
 *
 * The Coder documents ONE remaining grid break: the band 01 header's internal
 * `210px 1fr auto`. `scripts/grid-axis-probe.mjs` cannot confirm or deny that,
 * because (a) it never probes `.tl-header` at all, and (b) it only measures the
 * outer edges of a hand-picked list of blocks — it never asks whether a block
 * that declares its OWN explicit tracks divides on master lines.
 *
 * This script closes both gaps. For every element inside the landing that is a
 * grid and does NOT use subgrid, it measures each of that element's internal
 * track boundaries against the master axes of its own band, and reports which
 * ones are off-axis. It also measures the header's outer edges.
 *
 *   PROBE_BASE_URL=http://localhost:4499 node reports/qa/tools/qa-s6-grid-breaks.mjs
 */
import { chromium } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.env.PROBE_BASE_URL ?? "http://localhost:4499";
const TOLERANCE = 1;

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

function scan(tolerance) {
  const r = (v) => Math.round(v * 100) / 100;

  function axesOf(band) {
    const cs = getComputedStyle(band);
    const tracks = cs.gridTemplateColumns.split(/\s+/).filter(Boolean).map(Number.parseFloat);
    if (tracks.length < 2 || tracks.some(Number.isNaN)) return null;
    const rect = band.getBoundingClientRect();
    const gap = Number.parseFloat(cs.columnGap) || 0;
    let x = rect.left + (Number.parseFloat(cs.borderLeftWidth) || 0) + (Number.parseFloat(cs.paddingLeft) || 0);
    const out = [];
    for (const t of tracks) { out.push(r(x)); x += t + gap; }
    out.push(r(x - gap));
    return out;
  }

  const bandEls = [...document.querySelectorAll(".tl-band, .tl-header-band")];
  const rows = [];

  // header outer edges (never probed by scripts/grid-axis-probe.mjs)
  const headerBand = document.querySelector(".tl-header-band") ?? document.querySelector(".tl-header")?.closest(".tl-band");
  const header = document.querySelector(".tl-header");
  let headerRow = null;
  if (headerBand && header) {
    const axes = axesOf(headerBand);
    const b = header.getBoundingClientRect();
    const near = (v) => {
      let best = axes[0];
      for (const a of axes) if (Math.abs(a - v) < Math.abs(best - v)) best = a;
      return { x: best, d: r(v - best), i: axes.indexOf(best) - 1 };
    };
    const L = near(b.left), R = near(b.right);
    headerRow = {
      outerLeft: r(b.left), leftAxis: "C" + L.i, leftDelta: L.d,
      outerRight: r(b.right), rightAxis: "C" + R.i, rightDelta: R.d,
      tracks: getComputedStyle(header).gridTemplateColumns,
      onMaster: Math.abs(L.d) <= tolerance && Math.abs(R.d) <= tolerance,
    };
  }

  for (const band of bandEls) {
    const axes = axesOf(band);
    if (!axes) continue;
    const bandName = (band.className || "").toString().split(/\s+/).find((c) => c !== "tl-band") ?? "band";
    for (const el of band.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      if (cs.display !== "grid" && cs.display !== "inline-grid") continue;
      if (cs.gridTemplateColumns === "none") continue;
      const tracks = cs.gridTemplateColumns.split(/\s+/).filter(Boolean).map(Number.parseFloat);
      if (tracks.length < 2 || tracks.some(Number.isNaN)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) continue;
      const gap = Number.parseFloat(cs.columnGap) || 0;
      // internal boundaries only (exclude the element's own outer edges)
      let x = rect.left + (Number.parseFloat(cs.borderLeftWidth) || 0) + (Number.parseFloat(cs.paddingLeft) || 0);
      const inner = [];
      for (let i = 0; i < tracks.length; i += 1) {
        x += tracks[i] + gap;
        if (i < tracks.length - 1) inner.push(r(x - gap));
      }
      if (inner.length === 0) continue;
      const offAxis = inner.filter((v) => Math.min(...axes.map((a) => Math.abs(a - v))) > tolerance);
      if (offAxis.length === 0) continue;
      rows.push({
        band: bandName,
        el: (el.className || "").toString().split(/\s+/)[0] || el.tagName.toLowerCase(),
        tag: el.tagName.toLowerCase(),
        declaredTracks: cs.gridTemplateColumns,
        internalBoundaries: inner.length,
        offAxis: offAxis.length,
        worstPx: r(Math.max(...offAxis.map((v) => Math.min(...axes.map((a) => Math.abs(a - v)))))),
      });
    }
  }

  // collapse duplicates (same band + same class + same track string)
  const seen = new Map();
  for (const row of rows) {
    const key = `${row.band}|${row.el}|${row.declaredTracks}`;
    const prev = seen.get(key);
    if (!prev) seen.set(key, { ...row, instances: 1 });
    else { prev.instances += 1; prev.worstPx = Math.max(prev.worstPx, row.worstPx); }
  }
  return { header: headerRow, breaks: [...seen.values()].sort((a, b) => b.worstPx - a.worstPx) };
}

const executablePath = resolveChromium();
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const report = {};

for (const width of [375, 768, 1280, 1600]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-testid='technical-landing-root']", { timeout: 30_000 });
  await page.waitForFunction(() => document.getElementById("hero-shell") === null, undefined, { timeout: 20_000 });
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((i) => { i.loading = "eager"; });
    await document.fonts?.ready;
    await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
  });
  report[width] = await page.evaluate(scan, TOLERANCE);
}

console.log(JSON.stringify(report, null, 2));
await browser.close();
