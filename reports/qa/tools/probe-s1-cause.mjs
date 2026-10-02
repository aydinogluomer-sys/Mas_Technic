/* QA probe — S1: why the 375 landing golden shifted 1px right and 15px down.
 * Measures the live production preview at 375 against the same reduced-motion
 * conditions the visual project uses.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({
  viewport: { width: 375, height: 812 },
  isMobile: true,
  hasTouch: true,
  reducedMotion: "reduce",
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const result = await page.evaluate(() => {
  const sheet = document.querySelector(".tl-sheet");
  const cs = sheet ? getComputedStyle(sheet) : null;
  const rect = sheet?.getBoundingClientRect();
  const hero = document.querySelector(".tl-hero-copy h1");
  const heroRect = hero?.getBoundingClientRect();
  const rail = document.querySelector(".tl-band-index");
  const railRect = rail?.getBoundingClientRect();
  const railCS = rail ? getComputedStyle(rail) : null;

  // the PARÇA BİLGİSİ meta row value that wrapped in the new golden
  const metaValues = [...document.querySelectorAll(".tl-band dd, .tl-proof-grid *")]
    .filter((n) => n.textContent && n.textContent.trim().startsWith("120.00"))
    .map((n) => {
      const r = n.getBoundingClientRect();
      return { tag: n.tagName, cls: n.className, text: n.textContent.trim().slice(0, 40), w: r.width, h: r.height, lines: Math.round(r.height / parseFloat(getComputedStyle(n).lineHeight || "16")) };
    });

  return {
    docWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    sheet: sheet ? {
      borderLeft: cs.borderLeftWidth,
      borderRight: cs.borderRightWidth,
      left: rect.left, right: rect.right, width: rect.width,
      className: sheet.className,
    } : null,
    railVar: getComputedStyle(document.documentElement).getPropertyValue("--tl-rail").trim(),
    rail: railRect ? { left: railRect.left, right: railRect.right, width: railRect.width, borderRight: railCS.borderRightWidth } : null,
    heroH1Left: heroRect?.left,
    metaValues,
  };
});

console.log(JSON.stringify(result, null, 2));
await browser.close();
