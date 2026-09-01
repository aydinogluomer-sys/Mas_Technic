/* QA probe — AC12 attribution. For every serious/critical axe node, decide
 * whether it lives in the SHELL (global header, site footer, rail, shell
 * states) or in the PAGE BODY. Phase 04 owns the shell; Phases 07/08 own the
 * bodies. Also scopes axe to the header and the footer directly.
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const ROUTES = ["/", "/hakkimizda", "/iletisim", "/sss", "/blog", "/malzemeler", "/teklif-al",
  "/hizmetler/cnc-frezeleme", "/kvkk", "/giris", "/sifremi-unuttum", "/reset-password",
  "/__phase04-not-a-route__"];

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
let shellNodes = 0;

for (const width of [1280, 375]) {
  const ctx = await browser.newContext({
    viewport: { width, height: width < 768 ? 812 : 800 },
    ...(width < 768 ? { isMobile: true, hasTouch: true } : {}),
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  console.log(`\n===== ${width}px =====`);
  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1300);

    // 1. Scoped scans: the two shell surfaces on their own.
    const scoped = {};
    for (const [name, sel] of [["header", "[data-fullscreen-header]"], ["footer", "footer.tl-footer"]]) {
      const present = await page.locator(sel).count();
      if (!present) { scoped[name] = "absent"; continue; }
      const r = await new AxeBuilder({ page }).withTags(TAGS).include(sel).analyze();
      const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      scoped[name] = bad.length === 0 ? 0 : bad.map((v) => `${v.id}x${v.nodes.length}`).join(",");
    }

    // 2. Whole page, then attribute each node.
    const full = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const bad = full.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    const targets = bad.flatMap((v) => v.nodes.map((n) => ({ id: v.id, impact: v.impact, target: n.target.join(" ") })));
    const attributed = await page.evaluate((items) => items.map((it) => {
      let el = null;
      try { el = document.querySelector(it.target); } catch { el = null; }
      if (!el) return { ...it, where: "unresolved" };
      if (el.closest("[data-fullscreen-header]")) return { ...it, where: "SHELL:header" };
      if (el.closest("footer.tl-footer")) return { ...it, where: "SHELL:footer" };
      if (el.closest(".shell-rail")) return { ...it, where: "SHELL:rail" };
      if (el.closest(".shell-notfound")) return { ...it, where: "SHELL:404-state" };
      if (el.closest("main")) return { ...it, where: "BODY" };
      return { ...it, where: "OUTSIDE-main" };
    }), targets);

    const counts = attributed.reduce((m, a) => { m[a.where] = (m[a.where] ?? 0) + 1; return m; }, {});
    shellNodes += attributed.filter((a) => a.where.startsWith("SHELL") || a.where === "OUTSIDE-main").length;
    console.log(`  ${route.padEnd(30)} scopedHeader=${scoped.header}  scopedFooter=${scoped.footer}  page=${JSON.stringify(counts)}`);
    for (const a of attributed.filter((x) => x.where !== "BODY")) {
      console.log(`      !! ${a.where}  ${a.impact} ${a.id}  ${a.target}`);
    }
  }
  await ctx.close();
}
console.log(`\nTOTAL serious/critical nodes attributable to the SHELL (or outside <main>): ${shellNodes}`);
await browser.close();
