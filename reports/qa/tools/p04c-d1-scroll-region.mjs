/* QA P04-C / R4 — D1: are the shell's scrollable regions keyboard reachable,
 * named, and does the hook stand down / stay cheap?
 *
 *   node p04c-d1-scroll-region.mjs            (QA_BASE selects the build)
 *
 * Reports, at 1280 and 375 on /hizmetler/cnc-frezeleme:
 *   1. axe `scrollable-region-focusable` node count
 *   2. every genuinely-overflowing region: focusable? named? name text?
 *      already-author-focusable? contains its own focus stop?
 *   3. churn: childList mutation batches inside the sheet at rest and during a
 *      full scroll pass, plus attribute mutations on the hook's own marker
 *   4. cost: median wall time of a replica of the hook's read loop
 */
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4200";
const ROUTE = process.env.QA_ROUTE ?? "/hizmetler/cnc-frezeleme";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const browser = await chromium.launch(exe ? { executablePath: exe } : {});

for (const width of [1280, 375]) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 768 ? 812 : 800 },
    ...(width < 768 ? { isMobile: true, hasTouch: true } : {}),
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  console.log(`\n########## ${BASE}${ROUTE} @ ${width}px ##########`);

  /* 1 — axe */
  const axe = await new AxeBuilder({ page }).withRules(["scrollable-region-focusable"]).analyze();
  const nodes = axe.violations.flatMap((v) => v.nodes.map((n) => n.target.join(" ")));
  console.log(`\n[1] axe scrollable-region-focusable: ${nodes.length} node(s)`);
  for (const n of nodes) console.log(`      ${n}`);

  /* 2 — every overflowing region, and its accessible name via the a11y tree */
  const regions = await page.evaluate(() => {
    const sheet = document.querySelector(".shell-sheet");
    if (!sheet) return null;
    const FOCUS_STOP = "a[href], button:not([disabled]), input:not([disabled]),"
      + " select:not([disabled]), textarea:not([disabled]), summary,"
      + " [contenteditable=''], [contenteditable='true'], [tabindex]:not([tabindex^='-'])";
    const out = [];
    for (const el of sheet.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      const sx = el.scrollWidth > el.clientWidth + 1 && (cs.overflowX === "auto" || cs.overflowX === "scroll");
      const sy = el.scrollHeight > el.clientHeight + 1 && (cs.overflowY === "auto" || cs.overflowY === "scroll");
      if (!sx && !sy) continue;
      const ti = el.getAttribute("tabindex");
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className).slice(0, 70),
        scrollW: el.scrollWidth, clientW: el.clientWidth,
        tabindex: ti,
        role: el.getAttribute("role"),
        ariaLabel: el.getAttribute("aria-label"),
        owned: el.getAttribute("data-shell-scroll-region"),
        authorFocusable: el.matches(FOCUS_STOP) && !el.hasAttribute("data-shell-scroll-region"),
        containsFocusStop: !!el.querySelector(FOCUS_STOP),
      });
    }
    return out;
  });
  console.log(`\n[2] genuinely overflowing regions inside .shell-sheet: ${regions === null ? "NO SHELL SHEET" : regions.length}`);
  for (const r of regions ?? []) {
    console.log(`      <${r.tag} class="${r.cls}">`);
    console.log(`         overflow ${r.scrollW}px in ${r.clientW}px | tabindex=${r.tabindex} role=${r.role}`);
    console.log(`         aria-label=${JSON.stringify(r.ariaLabel)}`);
    console.log(`         hook-owned=${JSON.stringify(r.owned)} authorFocusable=${r.authorFocusable} containsFocusStop=${r.containsFocusStop}`);
  }

  /* 2b — are they actually reachable by keyboard, and what does the a11y tree call them? */
  const reach = await page.evaluate(() => {
    const els = [...document.querySelectorAll(".shell-sheet [data-shell-scroll-region]")];
    return els.map((el) => {
      el.focus();
      return { cls: String(el.className).slice(0, 50), focused: document.activeElement === el };
    });
  });
  console.log(`\n[2b] hook-owned regions that actually take focus: ${reach.filter((r) => r.focused).length}/${reach.length}`);
  for (const r of reach) console.log(`      ${r.focused ? "FOCUSED" : "NOT FOCUSABLE"}  .${r.cls}`);

  /* 3 — churn at rest and during a scroll pass */
  const churn = await page.evaluate(async () => {
    const sheet = document.querySelector(".shell-sheet");
    if (!sheet) return null;
    let childListBatches = 0;
    let ownedAttrMutations = 0;
    const mo = new MutationObserver((records) => {
      if (records.some((r) => r.type === "childList")) childListBatches += 1;
      ownedAttrMutations += records.filter(
        (r) => r.type === "attributes" && r.attributeName === "data-shell-scroll-region",
      ).length;
    });
    mo.observe(sheet, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-shell-scroll-region"] });

    await new Promise((r) => setTimeout(r, 3000));
    const atRest = { childListBatches, ownedAttrMutations };

    childListBatches = 0; ownedAttrMutations = 0;
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y < max; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => r()));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 800));
    const duringScroll = { childListBatches, ownedAttrMutations };
    mo.disconnect();
    return { atRest, duringScroll, pageHeight: max };
  });
  console.log(`\n[3] churn inside .shell-sheet (page height ${churn?.pageHeight}px)`);
  console.log(`      at rest, 3s     : childList batches=${churn?.atRest.childListBatches}  marker-attr mutations=${churn?.atRest.ownedAttrMutations}`);
  console.log(`      full scroll pass: childList batches=${churn?.duringScroll.childListBatches}  marker-attr mutations=${churn?.duringScroll.ownedAttrMutations}`);

  /* 4 — cost of a replica of the hook's read loop */
  const cost = await page.evaluate(() => {
    const root = document.querySelector(".shell-sheet");
    if (!root) return null;
    const times = [];
    for (let i = 0; i < 7; i++) {
      const t0 = performance.now();
      let n = 0;
      for (const el of root.querySelectorAll("*")) {
        if (el.scrollWidth <= el.clientWidth + 1 && el.scrollHeight <= el.clientHeight + 1) continue;
        getComputedStyle(el).overflowX;
        n += 1;
      }
      times.push(performance.now() - t0);
    }
    times.sort((a, b) => a - b);
    return { median: times[3], min: times[0], max: times[6], elements: root.querySelectorAll("*").length };
  });
  console.log(`\n[4] replica sweep over ${cost?.elements} elements: median ${cost?.median.toFixed(2)} ms (min ${cost?.min.toFixed(2)}, max ${cost?.max.toFixed(2)})`);

  await ctx.close();
}
await browser.close();
