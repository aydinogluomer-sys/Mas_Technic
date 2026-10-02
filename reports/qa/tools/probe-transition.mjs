/* QA adversarial probe — AC3 / AC7 / AC8 / S4 / S5, written independently of
 * the Coder's `e2e/landing/shell-and-transition.spec.ts`.
 *
 * Everything here is user-driven: real clicks, real Back/Forward, real key
 * presses. Nothing is asserted from a component's own internal state.
 */
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.QA_BASE ?? "http://localhost:4200";
const ROUNDS = Number(process.env.QA_ROUNDS ?? 8);
const exe = [
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].find((c) => c && existsSync(c));

const fails = [];
const note = (ok, msg) => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${msg}`);
  if (!ok) fails.push(msg);
};

/** The five things a stranded modal lock leaves behind. */
const lockState = () => ({
  menuOpen: !!document.querySelector("[data-fullscreen-menu]"),
  rootInert: document.getElementById("root")?.hasAttribute("inert") ?? false,
  rootAriaHidden: document.getElementById("root")?.getAttribute("aria-hidden") === "true",
  htmlOverflow: getComputedStyle(document.documentElement).overflow,
  bodyOverflow: getComputedStyle(document.body).overflow,
  triggers: document.querySelectorAll("[data-menu-trigger]").length,
  headers: document.querySelectorAll("[data-fullscreen-header]").length,
  mains: document.querySelectorAll("main").length,
  transitionWrappers: document.querySelectorAll("[data-route-transition]").length,
  landingRoots: document.querySelectorAll("[data-testid='technical-landing-root'], .tl-root").length,
  h1: document.querySelector("h1")?.textContent?.trim().slice(0, 40) ?? null,
  url: location.pathname + location.hash,
});

const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

/* ── AC3 — direct load, client navigation, Back, Forward ─────────────── */
console.log("\n== AC3 — transition on direct load / client nav / Back / Forward ==");

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
const curtainOnLoad = await page.locator("[data-route-curtain]").count();
note(curtainOnLoad === 1, `direct load of / mounts exactly one curtain (got ${curtainOnLoad})`);

// Does the curtain actually ANIMATE (S4: transition still animates)?
const anim = await page.evaluate(() => {
  const panel = document.querySelector("[data-route-curtain-panel]");
  if (!panel) return null;
  const list = panel.getAnimations().map((a) => ({ name: a.animationName ?? "?", state: a.playState }));
  const cs = getComputedStyle(panel);
  return { animations: list, animationName: cs.animationName, animationDuration: cs.animationDuration };
});
note(!!anim && anim.animationName !== "none",
  `curtain panel carries a CSS keyframe animation (name=${anim?.animationName}, dur=${anim?.animationDuration})`);

// Client navigation via the real menu.
await page.locator("[data-menu-trigger]").first().click();
await page.waitForSelector("[data-fullscreen-menu]", { timeout: 5000 });
await page.getByRole("link", { name: "Hakkımızda", exact: true }).first().click();
await page.waitForURL("**/hakkimizda", { timeout: 10000 });
await page.waitForTimeout(1200);
let s = await page.evaluate(lockState);
note(s.url === "/hakkimizda", `client navigation lands on /hakkimizda (got ${s.url})`);
note(s.transitionWrappers === 1, `exactly one [data-route-transition] after client nav (got ${s.transitionWrappers})`);
note(s.headers === 1, `exactly one header after client nav (got ${s.headers})`);
note(s.mains === 1, `exactly one <main> after client nav (got ${s.mains})`);
note(!s.menuOpen && !s.rootInert && s.htmlOverflow !== "hidden",
  `no stranded modal lock after client nav (menu=${s.menuOpen} inert=${s.rootInert} htmlOverflow=${s.htmlOverflow})`);

await page.goBack();
await page.waitForTimeout(1200);
s = await page.evaluate(lockState);
note(s.url === "/", `Back returns to / (got ${s.url})`);
note(s.transitionWrappers === 1 && s.headers === 1 && s.mains === 1,
  `one transition wrapper / header / main after Back (${s.transitionWrappers}/${s.headers}/${s.mains})`);

await page.goForward();
await page.waitForTimeout(1200);
s = await page.evaluate(lockState);
note(s.url === "/hakkimizda", `Forward returns to /hakkimizda (got ${s.url})`);
note(s.transitionWrappers === 1 && s.headers === 1 && s.mains === 1,
  `one transition wrapper / header / main after Forward (${s.transitionWrappers}/${s.headers}/${s.mains})`);

// Direct load of a deep route.
await page.goto(`${BASE}/hizmetler/cnc-frezeleme`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
s = await page.evaluate(lockState);
note(s.transitionWrappers === 1 && s.headers === 1 && s.mains === 1,
  `direct load of a deep route is a single subtree (${s.transitionWrappers}/${s.headers}/${s.mains})`);

/* ── AC7 — B25, user-driven, repeated ────────────────────────────────── */
console.log(`\n== AC7 — B25 user-driven probe, ${ROUNDS} rounds ==`);
let b25Fail = 0;
for (let i = 1; i <= ROUNDS; i++) {
  // Build the exact history the blocker needs: /#sektorler then /hakkimizda,
  // go Back, open the menu, then press Forward.
  await page.goto(`${BASE}/#sektorler`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  await page.locator("[data-menu-trigger]").first().click();
  await page.waitForSelector("[data-fullscreen-menu]", { timeout: 5000 });
  await page.getByRole("link", { name: "Hakkımızda", exact: true }).first().click();
  await page.waitForURL("**/hakkimizda", { timeout: 10000 });
  await page.waitForTimeout(700);
  await page.goBack();
  await page.waitForTimeout(900);

  // Menu open on /#sektorler, then Forward to /hakkimizda.
  await page.locator("[data-menu-trigger]").first().click();
  await page.waitForSelector("[data-fullscreen-menu]", { timeout: 5000 });
  await page.goForward();

  // Poll for release, up to 4s — the blocker never released within 8s.
  let final = null;
  for (let t = 0; t < 20; t++) {
    await page.waitForTimeout(200);
    final = await page.evaluate(lockState);
    if (!final.menuOpen && !final.rootInert && final.htmlOverflow !== "hidden") break;
  }
  const stranded = final.menuOpen || final.rootInert || final.rootAriaHidden
    || final.htmlOverflow === "hidden" || final.bodyOverflow === "hidden";
  const doubled = final.triggers > 1 || final.headers > 1 || final.mains > 1
    || final.transitionWrappers > 1 || final.landingRoots > 1;

  // The trigger must still work afterwards.
  let triggerWorks = false;
  try {
    await page.locator("[data-menu-trigger]").first().click({ timeout: 3000 });
    await page.waitForSelector("[data-fullscreen-menu]", { timeout: 3000 });
    triggerWorks = true;
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
  } catch { triggerWorks = false; }

  const ok = !stranded && !doubled && triggerWorks && final.url === "/hakkimizda";
  if (!ok) b25Fail++;
  console.log(`    round ${i}: url=${final.url} menu=${final.menuOpen} inert=${final.rootInert} `
    + `htmlOv=${final.htmlOverflow} triggers=${final.triggers} headers=${final.headers} `
    + `mains=${final.mains} wrappers=${final.transitionWrappers} landingRoots=${final.landingRoots} `
    + `triggerWorks=${triggerWorks} -> ${ok ? "OK" : "STRANDED"}`);
}
note(b25Fail === 0, `B25 does not reproduce in ${ROUNDS} user-driven rounds (failures: ${b25Fail}/${ROUNDS})`);

/* ── AC8 — attack the stuck-transition state ─────────────────────────── */
console.log("\n== AC8 — rapid repeated navigation attack ==");

const TARGETS = ["/hakkimizda", "/iletisim", "/sss", "/blog", "/malzemeler", "/teklif-al"];
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);

// (1) Hammer the same link mid-transition.
for (let i = 0; i < 6; i++) {
  await page.locator("[data-menu-trigger]").first().click();
  await page.waitForSelector("[data-fullscreen-menu]", { timeout: 5000 });
  const link = page.getByRole("link", { name: "Hakkımızda", exact: true }).first();
  await link.click();
  // Click again while the curtain is still down (curtain total is ~0.9s).
  await page.waitForTimeout(80);
  await page.mouse.click(640, 400).catch(() => {});
  await page.waitForTimeout(60);
  await page.goBack().catch(() => {});
  await page.waitForTimeout(120);
  await page.goForward().catch(() => {});
}
await page.waitForTimeout(2500);
s = await page.evaluate(lockState);
note(s.transitionWrappers === 1, `after hammering, exactly one [data-route-transition] (got ${s.transitionWrappers})`);
note(s.headers === 1 && s.mains === 1, `after hammering, one header and one main (${s.headers}/${s.mains})`);
note(!s.rootInert && s.htmlOverflow !== "hidden", `after hammering, no stranded lock`);

// The curtain must not be left covering the page.
const curtainCover = await page.evaluate(() => {
  const panels = [...document.querySelectorAll("[data-route-curtain-panel]")];
  return panels.map((p) => {
    const cs = getComputedStyle(p);
    const r = p.getBoundingClientRect();
    return { transform: cs.transform, opacity: cs.opacity, pointerEvents: cs.pointerEvents, h: Math.round(r.height) };
  });
});
const blocking = curtainCover.filter((p) => p.pointerEvents !== "none");
note(blocking.length === 0, `no curtain panel captures pointer events (blocking: ${blocking.length})`);

// The page must still be interactive: a link click must still navigate.
let interactive = false;
try {
  await page.locator("[data-menu-trigger]").first().click({ timeout: 4000 });
  await page.waitForSelector("[data-fullscreen-menu]", { timeout: 4000 });
  await page.getByRole("link", { name: "İletişim", exact: true }).first().click();
  await page.waitForURL("**/iletisim", { timeout: 8000 });
  interactive = true;
} catch (e) { interactive = false; }
note(interactive, "the site is still fully navigable after the hammering");

// (2) Rapid-fire distinct routes back to back, faster than the curtain.
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
for (let i = 0; i < 12; i++) {
  const t = TARGETS[i % TARGETS.length];
  await page.evaluate((path) => {
    history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, t);
  await page.waitForTimeout(90);
}
await page.waitForTimeout(2500);
s = await page.evaluate(lockState);
note(s.transitionWrappers === 1 && s.headers === 1 && s.mains === 1,
  `after 12 sub-curtain-interval route swaps: one wrapper/header/main (${s.transitionWrappers}/${s.headers}/${s.mains})`);
note(!s.rootInert && s.htmlOverflow !== "hidden", "no stranded lock after sub-interval swaps");

/* ── S5 — the auth family ────────────────────────────────────────────── */
console.log("\n== S5 — auth routes: no nav, no footer, but a skip-link target ==");
for (const route of ["/giris", "/sifremi-unuttum", "/reset-password"]) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const r = await page.evaluate(() => ({
    headers: document.querySelectorAll("[data-fullscreen-header]").length,
    footers: document.querySelectorAll("footer.tl-footer").length,
    contentinfo: document.querySelectorAll("[role='contentinfo'], footer").length,
    mainId: document.querySelector("main")?.id ?? null,
    mains: document.querySelectorAll("main").length,
    skipHref: document.querySelector(".shared-skip-link")?.getAttribute("href") ?? null,
    skipTargetExists: !!document.getElementById("main-content"),
    shellRoot: document.querySelectorAll(".shell-root").length,
  }));
  const ok = r.headers === 0 && r.footers === 0 && r.mains === 1
    && r.mainId === "main-content" && r.skipHref === "#main-content" && r.skipTargetExists;
  note(ok, `${route}: headers=${r.headers} footers=${r.footers} mains=${r.mains} `
    + `main#id=${r.mainId} skip=${r.skipHref} target=${r.skipTargetExists} shellRoot=${r.shellRoot}`);
}

/* ── AC6 — /teklif-al footer with working legal links ────────────────── */
console.log("\n== AC6 — /teklif-al footer legal links ==");
await page.goto(`${BASE}/teklif-al`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
const rfqFooter = await page.evaluate(() => {
  const f = document.querySelector("footer.tl-footer");
  if (!f) return null;
  return {
    legal: [...f.querySelectorAll(".tl-legal a")].map((a) => ({ label: a.textContent.trim(), href: a.getAttribute("href") })),
    linkCount: f.querySelectorAll("a[href]").length,
    height: Math.round(f.getBoundingClientRect().height),
  };
});
note(!!rfqFooter, "/teklif-al renders footer.tl-footer");
console.log(`    legal: ${JSON.stringify(rfqFooter?.legal)}  totalLinks=${rfqFooter?.linkCount} h=${rfqFooter?.height}`);
for (const link of rfqFooter?.legal ?? []) {
  await page.goto(`${BASE}/teklif-al`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const el = page.locator("footer.tl-footer .tl-legal a", { hasText: link.label }).first();
  await el.scrollIntoViewIfNeeded();
  await el.click();
  await page.waitForTimeout(1400);
  const landed = await page.evaluate(() => ({ url: location.pathname, h1: document.querySelector("h1")?.textContent?.trim().slice(0, 40) ?? null, notFound: !!document.querySelector(".shell-notfound") }));
  note(landed.url === link.href && !landed.notFound,
    `/teklif-al footer legal "${link.label}" -> ${landed.url} (expected ${link.href}), h1="${landed.h1}", 404=${landed.notFound}`);
}

console.log("\n== console errors observed across the whole probe ==");
console.log(consoleErrors.length ? consoleErrors.slice(0, 20).join("\n") : "  (none)");

console.log(`\n===== PROBE RESULT: ${fails.length === 0 ? "ALL PASS" : fails.length + " FAILURE(S)"} =====`);
for (const f of fails) console.log("  FAIL: " + f);
await browser.close();
process.exit(fails.length === 0 ? 0 : 1);
