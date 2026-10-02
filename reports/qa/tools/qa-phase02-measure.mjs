#!/usr/bin/env node
/**
 * QA PHASE 02 — independent runtime measurement instrument.
 *
 * This is QA-owned evidence collection. It does not modify anything; it opens
 * the built site and measures. Every number in reports/qa/phase-02.md that is
 * described as "QA measured" comes from here.
 *
 *   PROBE_BASE_URL=http://localhost:4299 node reports/qa/tools/qa-phase02-measure.mjs
 *
 * Covers: AC4 (tablet process tracks), AC5 (mobile rail at 320 AND 375),
 * S3 (visual defects that still measure on-grid), S4 (band heights),
 * S6 (remaining internal grid breaks).
 */
import { chromium } from "@playwright/test";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const WIDTHS = [320, 375, 768, 1280, 1440, 1600];
const OUT = process.env.QA_SHOT_DIR ?? "reports/qa/tools/shots";
const baseUrl = process.env.PROBE_BASE_URL ?? "http://localhost:4299";

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
  return readdirSync(root)
    .filter((e) => e.startsWith("chromium-"))
    .map((e) => join(root, e, "chrome-win", "chrome.exe"))
    .find((c) => existsSync(c));
}

function measure() {
  const r = (v) => Math.round(v * 100) / 100;
  const box = (sel, root = document) => {
    const el = root.querySelector(sel);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { left: r(b.left), right: r(b.right), top: r(b.top), width: r(b.width), height: r(b.height) };
  };

  const band = document.querySelector(".tl-band");
  const bandStyle = band ? getComputedStyle(band) : null;
  const tracks = bandStyle
    ? bandStyle.gridTemplateColumns.split(/\s+/).filter(Boolean).map(Number.parseFloat)
    : [];

  // ── rail ────────────────────────────────────────────────────────────────
  const railEl = document.querySelector(".tl-band-index");
  const railBox = railEl?.getBoundingClientRect();

  // ── AC4: tablet process tracks ─────────────────────────────────────────
  const intro = box(".tl-process-intro");
  const figure = box(".tl-process-body > figure");
  const processBody = box(".tl-process-body");

  // ── S3: process flow arrows (the 02→03 arrow the tablet nth-child(2)
  //        rule used to swallow on mobile) ─────────────────────────────────
  const arrows = [...document.querySelectorAll(".tl-process-body > ol > li")].map((li, i) => {
    const after = getComputedStyle(li, "::after");
    return {
      step: i + 1,
      display: after.display,
      content: after.content,
      visible: after.display !== "none",
    };
  });

  // ── S4: band heights ───────────────────────────────────────────────────
  const bandHeights = {};
  for (const cls of ["tl-hero", "tl-proof", "tl-process", "tl-nexus", "tl-projects",
    "tl-sectors", "tl-manifesto", "tl-quality", "tl-references", "tl-faq-band",
    "tl-rfq", "tl-footer"]) {
    const el = document.querySelector("." + cls);
    if (el) bandHeights[cls] = r(el.getBoundingClientRect().height);
  }

  // ── S4: quality stamp placement ────────────────────────────────────────
  const stamp = box(".tl-stamp");
  const lastCert = (() => {
    const cells = [...document.querySelectorAll(".tl-quality-strip > .tl-cert")];
    const el = cells[cells.length - 1];
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { left: r(b.left), right: r(b.right), top: r(b.top), bottom: r(b.bottom), height: r(b.height) };
  })();
  const certCount = document.querySelectorAll(".tl-quality-strip > .tl-cert").length;

  // ── S6: every element that declares its own explicit tracks inside a band
  const explicitTrackElements = [];
  for (const el of document.querySelectorAll(".tl-root [class*='tl-']")) {
    const cs = getComputedStyle(el);
    if (cs.display !== "grid" && cs.display !== "inline-grid") continue;
    const parent = el.parentElement;
    if (!parent) continue;
    // only report blocks whose own tracks are not subgrid-derived and that sit
    // directly on the master field
    const n = el.className.toString().split(/\s+/)[0];
    explicitTrackElements.push({ cls: n, tracks: cs.gridTemplateColumns });
  }

  // ── overflow ───────────────────────────────────────────────────────────
  const de = document.documentElement;
  const overflow = {
    scrollWidth: de.scrollWidth,
    clientWidth: de.clientWidth,
    horizontal: de.scrollWidth - de.clientWidth,
  };

  // ── S3: clipped / overlapping detection over landing subtree ───────────
  const clipped = [];
  for (const el of document.querySelectorAll(".tl-root *")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const b = el.getBoundingClientRect();
    if (b.width === 0 || b.height === 0) continue;
    if (b.right > de.clientWidth + 1 || b.left < -1) {
      clipped.push({
        cls: (el.className || "").toString().slice(0, 60),
        tag: el.tagName,
        left: r(b.left), right: r(b.right),
      });
    }
  }

  return {
    width: window.innerWidth,
    tracks: tracks.map(r),
    rail: railBox ? r(railBox.width) : null,
    railShare: railBox ? r((railBox.width / window.innerWidth) * 1000) / 10 : null,
    columns: tracks.length ? tracks.length - 1 : null,
    columnPx: tracks.length > 1 ? r(tracks[1]) : null,
    processBody, intro, figure,
    processIntroCols: intro && processBody && tracks.length > 1
      ? r((intro.width) / tracks[1]) : null,
    processFigureCols: figure && tracks.length > 1 ? r(figure.width / tracks[1]) : null,
    arrows,
    bandHeights,
    stamp, lastCert, certCount,
    overflow,
    clipped: clipped.slice(0, 25),
    clippedCount: clipped.length,
    explicitTrackCount: explicitTrackElements.length,
  };
}

mkdirSync(OUT, { recursive: true });
const executablePath = resolveChromium();
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const context = await browser.newContext({ reducedMotion: "reduce" });
const page = await context.newPage();
const out = {};

for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-testid='technical-landing-root']", { timeout: 30_000 });
  await page.waitForFunction(() => document.getElementById("hero-shell") === null, undefined, { timeout: 20_000 });
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((img) => { img.loading = "eager"; });
    await document.fonts?.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), undefined, { timeout: 30_000 })
    .catch(() => undefined);
  out[width] = await page.evaluate(measure);
  await page.screenshot({ path: join(OUT, `full-${width}.png`), fullPage: true });
  for (const [name, sel] of [["process", ".tl-process"], ["quality", ".tl-quality"], ["projects", ".tl-projects"], ["nexus", ".tl-nexus"], ["footer", ".tl-footer"], ["sectors", ".tl-sectors"]]) {
    const el = page.locator(sel).first();
    if (await el.count()) {
      await el.screenshot({ path: join(OUT, `${name}-${width}.png`) }).catch(() => undefined);
    }
  }
}

console.log(JSON.stringify(out, null, 2));
await browser.close();
