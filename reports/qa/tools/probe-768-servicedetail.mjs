/* QA probe — `probe-ac2-contract.mjs` reported `/hizmetler/cnc-frezeleme` at
 * 768px with shellRoots=0, mains=0, headers=0, footers=0. Either the page
 * genuinely renders no shell at that width (an AC1 failure) or the probe read
 * it mid-mount. Settle properly, retry, and capture what is on screen.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const snap = () => ({
  shellRoots: document.querySelectorAll(".shell-root").length,
  headers: document.querySelectorAll("[data-fullscreen-header]").length,
  footers: document.querySelectorAll("footer.tl-footer").length,
  mains: document.querySelectorAll("main").length,
  h1: document.querySelector("h1")?.textContent?.trim().slice(0, 40) ?? null,
  boot: !!document.querySelector(".shell-boot"),
  loading: !!document.querySelector(".shell-state-label"),
  errorState: document.body.innerText.slice(0, 200).replace(/\s+/g, " "),
  bodyChildren: [...document.getElementById("root").children].map((n) => `${n.tagName}.${String(n.className).slice(0, 40)}`),
});

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const errors = [];
for (const round of [1, 2, 3, 4, 5]) {
  const ctx = await browser.newContext({
    viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true,
    reducedMotion: "reduce", deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`round${round} pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`round${round} console: ${m.text().slice(0, 160)}`); });
  await page.goto(`${BASE}/hizmetler/cnc-frezeleme`, { waitUntil: "networkidle" });

  const at700 = await page.evaluate(snap);
  await page.waitForTimeout(3000);
  const at3700 = await page.evaluate(snap);
  console.log(`round ${round}:`);
  console.log(`   after networkidle : ${JSON.stringify(at700)}`);
  console.log(`   after +3s         : ${JSON.stringify(at3700)}`);
  await ctx.close();
}

console.log("\n== the same route at neighbouring widths, fully settled ==");
for (const w of [744, 767, 768, 769, 800, 1024]) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 1024 }, isMobile: w < 1024, hasTouch: w < 1024,
    reducedMotion: "reduce", deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/hizmetler/cnc-frezeleme`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const s = await page.evaluate(snap);
  console.log(`  ${String(w).padStart(5)}px  shellRoots=${s.shellRoots} headers=${s.headers} footers=${s.footers} mains=${s.mains} h1="${s.h1}" boot=${s.boot}`);
  await ctx.close();
}

console.log("\n== console/page errors captured ==");
console.log(errors.length ? errors.slice(0, 15).join("\n") : "  (none)");
await browser.close();
