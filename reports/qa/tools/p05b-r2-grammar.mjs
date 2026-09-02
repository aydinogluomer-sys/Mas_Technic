#!/usr/bin/env node
/* QA — phase 05b R2 / R7 / R8.
 *
 * The claim under test is NOT "there are animations" — the previous layer had
 * those too. It is that eight bands stopped sharing `opacity` + `translateY`
 * and now speak six grammars keyed to content type, with three climaxes and
 * four deliberately quietened bands.
 *
 * So this reads, per band, the SET OF PROPERTIES that band's entrance actually
 * moves — from computed style on the live page, including pseudo-elements,
 * not from the stylesheet source — and then counts how many DISTINCT
 * signatures exist. Bands sharing one reveal with different durations would
 * collapse to one signature; that is the failure this is built to catch.
 *
 * Sub-checks:
 *   climaxes   the three named climax gestures exist as live declarations
 *   quiet      03/04/11/12 really are opacity-only / parked
 *   hover      the 02 hero measurement correlation actually isolates
 *   offscreen  the infinite marquee is parked when off screen (two-way class)
 *   clips      every clip-path that wraps a FOCUSABLE element ends outside the
 *              box, so the `:focus-visible` ring at outline-offset:4px survives
 */
import { chromium } from "@playwright/test";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE_URL ?? "http://localhost:4211";
const VPS = [{ n: "1280", w: 1280, h: 900 }, { n: "375", w: 375, h: 812 }]
  .filter((v) => !process.env.QA_VP || v.n === process.env.QA_VP);

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

/** Per-band signature of what the entrance MOVES. */
const BANDS = () => {
  const props = (el, pseudo) => {
    const s = getComputedStyle(el, pseudo);
    const out = new Set();
    if (s.animationName && s.animationName !== "none") {
      for (const a of s.animationName.split(",")) out.add("@" + a.trim());
    }
    const durs = s.transitionDuration.split(",").map((v) => Number.parseFloat(v) || 0);
    const names = s.transitionProperty.split(",").map((v) => v.trim());
    names.forEach((p, i) => {
      if ((durs[i % durs.length] || 0) > 0 && p !== "none" && p !== "all") out.add(p);
    });
    return [...out];
  };
  const rows = [];
  for (const band of document.querySelectorAll(".tl-band")) {
    const sig = new Set();
    let n = 0;
    for (const el of [band, ...band.querySelectorAll("*")]) {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 && r.height <= 0) continue;
      for (const pseudo of [undefined, "::before", "::after"]) {
        const p = props(el, pseudo);
        if (p.length) { p.forEach((x) => sig.add(x)); if (!pseudo) n += 1; }
      }
    }
    rows.push({
      band: (String(band.className).match(/tl-(?!band|inview|onscreen)[a-z-]+/) || ["?"])[0],
      movedCount: n,
      signature: [...sig].sort().join("+") || "-",
    });
  }
  return rows;
};

const CLIMAXES = () => {
  const g = (sel, pseudo, prop) => {
    const el = document.querySelector(sel);
    if (!el) return "MISSING";
    return getComputedStyle(el, pseudo)[prop];
  };
  return {
    // climax 1 — 02 hero DRAW -> LOCK
    heroDraw: g(".tl-dimension-lines", undefined, "animationName"),
    heroDrawOffset: g(".tl-dimension-lines", undefined, "strokeDashoffset"),
    heroLockTop: g(".tl-measure-top", undefined, "animationName"),
    heroLockUp: g(".tl-measure-finish", undefined, "animationName"),
    heroPartExpose: g(".tl-part-stage img", undefined, "animationName"),
    // climax 2 — 09 manifesto
    manifestoHeadline: g(".tl-manifesto-copy h2", undefined, "animationName"),
    manifestoStrongTransition: g(".tl-manifesto-copy h2 strong", undefined, "transitionProperty"),
    manifestoStrongLetterSpacing: g(".tl-manifesto-copy h2 strong", undefined, "letterSpacing"),
    manifestoRuleBefore: g(".tl-manifesto-copy h2 strong", "::before", "transform"),
    manifestoRuleAfter: g(".tl-manifesto-copy h2 strong", "::after", "transform"),
    manifestoCurtain: g(".tl-manifesto-body", "::before", "opacity"),
    // climax 3 — 13 RFQ gate
    rfqGateClip: g(".tl-cad-drop", undefined, "clipPath"),
    // quietened
    proofTransition: g(".tl-proof-grid article", undefined, "transitionProperty"),
    proofDuration: g(".tl-proof-grid article", undefined, "transitionDuration"),
    proofTransform: g(".tl-proof-grid article", undefined, "transform"),
    faqTitleTransition: g(".tl-faq-title", undefined, "transitionProperty"),
    refItemTransition: g(".tl-reference-grid li", undefined, "transitionProperty"),
    refGridTransition: g(".tl-reference-grid", undefined, "transitionProperty"),
  };
};

/** Every clip-path in effect, and whether it wraps something focusable. */
const CLIPS = () => {
  const FOCUSABLE = "a[href],button,input,select,textarea,summary,[tabindex]:not([tabindex='-1'])";
  const out = [];
  for (const el of document.querySelectorAll(".tl-root *")) {
    const cp = getComputedStyle(el).clipPath;
    if (!cp || cp === "none") continue;
    out.push({
      sel: el.tagName + "." + String(el.className).slice(0, 40),
      clip: cp,
      focusablesInside: el.querySelectorAll(FOCUSABLE).length + (el.matches(FOCUSABLE) ? 1 : 0),
    });
  }
  return out;
};

for (const vp of VPS) {
  const browser = await chromium.launch({
    executablePath: chrome(),
    args: ["--disable-dev-shm-usage", "--disable-gpu", "--no-sandbox", "--disable-extensions"],
  });
  const ctx = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    isMobile: vp.w < 768, hasTouch: vp.w < 768, deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1800);

  console.log("\n########## viewport " + vp.n + " ##########");
  console.log("\n--- per-band grammar signature (armed, before scrolling) ---");
  const rows = await page.evaluate(BANDS);
  for (const r of rows) console.log("  " + r.band.padEnd(20) + " moved=" + String(r.movedCount).padStart(4) + "  " + r.signature);
  const sigs = new Set(rows.map((r) => r.signature).filter((s) => s !== "-"));
  console.log("  DISTINCT SIGNATURES: " + sigs.size + " across " + rows.length + " bands");

  console.log("\n--- climaxes and quietened bands ---");
  const c = await page.evaluate(CLIMAXES);
  for (const [k, v] of Object.entries(c)) console.log("  " + k.padEnd(30) + " = " + v);

  console.log("\n--- clip-path in effect vs focusable content ---");
  const clips = await page.evaluate(CLIPS);
  const seen = new Map();
  for (const cl of clips) {
    const key = cl.sel.split(" ")[0] + "|" + cl.clip + "|" + (cl.focusablesInside > 0);
    if (!seen.has(key)) seen.set(key, cl);
  }
  for (const cl of seen.values()) {
    console.log("  " + (cl.focusablesInside > 0 ? "FOCUSABLE(" + cl.focusablesInside + ")" : "no-focusable ")
      + "  " + cl.clip + "   <- " + cl.sel);
  }

  console.log("\n--- offscreen work: infinite marquee play state ---");
  await page.evaluate(() => document.querySelector(".tl-marquee")?.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(700);
  const onScreen = await page.evaluate(() => {
    const t = document.querySelector(".tl-marquee-track");
    return t ? { play: getComputedStyle(t).animationPlayState, name: getComputedStyle(t).animationName,
                 cls: document.querySelector(".tl-marquee").className } : "MISSING";
  });
  console.log("  visible : " + JSON.stringify(onScreen));
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(900);
  const offScreen = await page.evaluate(() => {
    const t = document.querySelector(".tl-marquee-track");
    return t ? { play: getComputedStyle(t).animationPlayState,
                 cls: document.querySelector(".tl-marquee").className } : "MISSING";
  });
  console.log("  offscreen: " + JSON.stringify(offScreen));

  if (vp.w >= 768) {
    console.log("\n--- 02 hero measurement correlation (hover isolation) ---");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(600);
    const before = await page.evaluate(() => ({
      measureTop: getComputedStyle(document.querySelector(".tl-measure-top")).opacity,
      measureFinish: getComputedStyle(document.querySelector(".tl-measure-finish")).opacity,
      dimBore: getComputedStyle(document.querySelector(".tl-dim--bore")).stroke,
      ppBore: document.querySelector(".tl-pp-bore") ? getComputedStyle(document.querySelector(".tl-pp-bore")).opacity : "n/a",
    }));
    console.log("  no hover : " + JSON.stringify(before));
    await page.hover(".tl-measure-top").catch((e) => console.log("  hover failed: " + e.message));
    await page.waitForTimeout(500);
    const after = await page.evaluate(() => ({
      measureTop: getComputedStyle(document.querySelector(".tl-measure-top")).opacity,
      measureFinish: getComputedStyle(document.querySelector(".tl-measure-finish")).opacity,
      dimBore: getComputedStyle(document.querySelector(".tl-dim--bore")).stroke,
      dimFinish: getComputedStyle(document.querySelector(".tl-dim--finish")).stroke,
      ppBore: document.querySelector(".tl-pp-bore") ? getComputedStyle(document.querySelector(".tl-pp-bore")).opacity : "n/a",
    }));
    console.log("  hover Ø28: " + JSON.stringify(after));
    console.log("  tabbable measurement labels (must be 0 - no new tab stops): "
      + await page.evaluate(() => document.querySelectorAll(".tl-hero [data-dim][tabindex]").length));
  }

  await ctx.close();
  await browser.close();
}
