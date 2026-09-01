/* QA probe — AC1/AC2. Does every public page family really render inside ONE
 * shell, and is the landing's rail/grid/rule/typography contract actually
 * AVAILABLE to inner pages (resolved by the browser, not just declared)?
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const ROUTES = ["/", "/hakkimizda", "/iletisim", "/sss", "/blog", "/blog/cnc-frezeleme-rehberi",
  "/malzemeler", "/malzemeler/aluminyum", "/teklif-al", "/kvkk", "/gizlilik-politikasi",
  "/cerez-politikasi", "/hizmetler/cnc-frezeleme", "/hizmetler/kategori/talasli-imalat",
  "/kabiliyetler/kalite-kontrol", "/endustriyel/otomotiv", "/__phase04-not-a-route__"];

const AUTH = ["/giris", "/sifremi-unuttum", "/reset-password"];

const shape = () => {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const main = document.querySelector("main#main-content");
  const rail = document.querySelector(".shell-rail, .tl-band-index");
  const sheet = document.querySelector(".tl-sheet");
  const railW = parseFloat(cs.getPropertyValue("--tl-rail"));
  const cols = parseInt(cs.getPropertyValue("--tl-cols"), 10);
  const sheetR = sheet?.getBoundingClientRect();
  const railR = rail?.getBoundingClientRect();
  const firstBody = main ? [...main.children].find((n) => !n.classList.contains("shell-rail")) : null;
  const bodyR = firstBody?.getBoundingClientRect();
  const sheetBorderL = sheet ? parseFloat(getComputedStyle(sheet).borderLeftWidth) : null;
  // the master content field should start at sheet.left + border + rail
  const expectedContentLeft = sheetR ? sheetR.left + (sheetBorderL ?? 0) + railW : null;
  return {
    shellRoots: document.querySelectorAll(".shell-root").length,
    headers: document.querySelectorAll("[data-fullscreen-header]").length,
    footers: document.querySelectorAll("footer.tl-footer").length,
    mains: document.querySelectorAll("main").length,
    mainIsShell: !!main && main.classList.contains("shell-main"),
    layout: main?.getAttribute("data-shell-layout") ?? null,
    surface: document.querySelector(".shell-root")?.getAttribute("data-shell-surface") ?? null,
    railToken: railW, cols,
    railRendered: railR ? Math.round(railR.width) : null,
    sheetBorderL,
    contentLeft: bodyR ? Math.round(bodyR.left) : null,
    expectedContentLeft: expectedContentLeft === null ? null : Math.round(expectedContentLeft),
    // typography / rule tokens available?
    tokens: {
      mono: cs.getPropertyValue("--tl-font-mono").trim().slice(0, 24),
      serif: cs.getPropertyValue("--tl-font-serif").trim().slice(0, 24),
      rule: cs.getPropertyValue("--tl-rule").trim(),
      ruleSize: cs.getPropertyValue("--tl-rule-size").trim(),
      sheetMax: cs.getPropertyValue("--tl-sheet-max").trim(),
      gap: cs.getPropertyValue("--tl-gap").trim(),
    },
    footerTracks: (() => {
      const f = document.querySelector("footer.tl-footer");
      return f ? getComputedStyle(f).gridTemplateColumns.split(" ").length : 0;
    })(),
  };
};

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
let fails = 0;
for (const width of [1280, 768, 375]) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 768 ? 812 : 800 },
    ...(width < 768 ? { isMobile: true, hasTouch: true } : {}),
    reducedMotion: "reduce", deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  console.log(`\n===== ${width}px =====`);
  for (const route of [...ROUTES, ...AUTH]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const s = await page.evaluate(shape);
    const isAuth = AUTH.includes(route);
    const problems = [];
    if (s.shellRoots !== 1) problems.push(`shellRoots=${s.shellRoots}`);
    if (s.mains !== 1) problems.push(`mains=${s.mains}`);
    if (!s.mainIsShell) problems.push("main is not shell-main");
    if (!isAuth) {
      if (s.headers !== 1) problems.push(`headers=${s.headers}`);
      if (s.footers !== 1) problems.push(`footers=${s.footers}`);
      if (s.footerTracks !== s.cols + 1) problems.push(`footerTracks=${s.footerTracks} != cols+1=${s.cols + 1}`);
    } else {
      if (s.headers !== 0) problems.push(`auth headers=${s.headers}`);
      if (s.footers !== 0) problems.push(`auth footers=${s.footers}`);
    }
    if (s.layout === "band" && s.contentLeft !== null && s.expectedContentLeft !== null
        && Math.abs(s.contentLeft - s.expectedContentLeft) > 1) {
      problems.push(`content field off the rail axis: left=${s.contentLeft} expected=${s.expectedContentLeft}`);
    }
    for (const [k, v] of Object.entries(s.tokens)) if (!v) problems.push(`token --tl-${k} unresolved`);
    if (problems.length) fails++;
    console.log(`  ${route.padEnd(36)} layout=${String(s.layout).padEnd(5)} surface=${String(s.surface).padEnd(8)} `
      + `rail=${s.railToken}/${s.railRendered} cols=${s.cols} sheetBorderL=${s.sheetBorderL} `
      + `content=${s.contentLeft}/${s.expectedContentLeft} tracks=${s.footerTracks}  `
      + (problems.length ? "PROBLEMS: " + problems.join("; ") : "ok"));
  }
  await ctx.close();
}
console.log(`\nroutes with problems: ${fails}`);
await browser.close();
