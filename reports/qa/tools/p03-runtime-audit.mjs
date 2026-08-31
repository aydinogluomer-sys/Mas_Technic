/* QA-owned independent runtime audit for Phase 03.
   Drives a real Chromium against the production preview on PROBE_BASE_URL.
   Deliberately does NOT import e2e/helpers.ts or any Coder-authored fixture —
   every observation below is made with primitives this file owns. */
import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.PROBE_BASE_URL ?? "http://localhost:4307";
const results = [];
const rec = (id, ok, detail) => {
  results.push({ id, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${id}  ${detail}`);
};

const exeCandidates = [
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  process.env.ProgramFiles ? join(process.env.ProgramFiles, "Google", "Chrome", "Application", "chrome.exe") : undefined,
  process.env["ProgramFiles(x86)"] ? join(process.env["ProgramFiles(x86)"], "Microsoft", "Edge", "Application", "msedge.exe") : undefined,
].filter((p) => p && existsSync(p));
const launch = exeCandidates.length ? { executablePath: exeCandidates[0] } : {};

const browser = await chromium.launch(launch);

async function ctx(opts = {}) {
  const c = await browser.newContext({
    viewport: opts.viewport ?? { width: 1280, height: 800 },
    isMobile: !!opts.mobile,
    hasTouch: !!opts.mobile,
    reducedMotion: opts.reduced ? "reduce" : "no-preference",
  });
  const p = await c.newPage();
  return { c, p };
}

/** Wait until the landing has finished its intro shell + first paint. */
async function landingSettled(p) {
  await p.waitForSelector("[data-fullscreen-header]", { state: "attached", timeout: 30000 });
  await p.waitForLoadState("networkidle").catch(() => {});
  await p.waitForFunction(() => !document.getElementById("hero-shell"), null, { timeout: 20000 }).catch(() => {});
  await p.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

const describeActive = () => document.activeElement
  ? [document.activeElement.tagName,
     document.activeElement.getAttribute("data-menu-trigger") !== null ? "[data-menu-trigger]" : "",
     (document.activeElement.getAttribute("aria-label") || document.activeElement.textContent || "").trim().slice(0, 40),
    ].filter(Boolean).join(" ")
  : "NONE";

/* ═══════════════ AC4 — keyboard operability, measured by QA ═══════════════ */
{
  const { c, p } = await ctx();
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await landingSettled(p);

  // --- tab order: skip link -> brand -> trigger
  await p.evaluate(() => document.body.focus());
  const order = [];
  for (let i = 0; i < 4; i += 1) {
    await p.keyboard.press("Tab");
    order.push(await p.evaluate(describeActive));
  }
  rec("AC4.tab-order", /Ana içeriğe geç/.test(order[0]) && /MAS Technic ana sayfa/.test(order[1]) && order[2].includes("[data-menu-trigger]"),
    `first four tab stops: ${JSON.stringify(order)}`);

  // --- open with the keyboard (Enter on the focused trigger)
  await p.locator("[data-menu-trigger]").focus();
  await p.keyboard.press("Enter");
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible", timeout: 10000 });
  rec("AC4.keyboard-open", true, "Enter on [data-menu-trigger] opened [data-fullscreen-menu]");

  // --- scroll lock
  const lock = await p.evaluate(() => ({
    body: getComputedStyle(document.body).overflow,
    html: getComputedStyle(document.documentElement).overflow,
    rootInert: document.getElementById("root")?.hasAttribute("inert") ?? false,
    rootHidden: document.getElementById("root")?.getAttribute("aria-hidden"),
  }));
  rec("AC4.scroll-lock", lock.body === "hidden" && lock.html === "hidden" && lock.rootInert === true && lock.rootHidden === "true",
    JSON.stringify(lock));

  // --- scroll lock actually prevents movement
  const before = await p.evaluate(() => window.scrollY);
  await p.mouse.wheel(0, 1200);
  await p.waitForTimeout(400);
  const after = await p.evaluate(() => window.scrollY);
  rec("AC4.scroll-lock-effective", before === after, `scrollY ${before} -> ${after} after a 1200px wheel with the menu open`);

  // --- forward focus trap: tab many times, focus must never leave the dialog
  let escapedForward = null;
  for (let i = 0; i < 90; i += 1) {
    await p.keyboard.press("Tab");
    const inside = await p.evaluate(() =>
      !!document.activeElement?.closest("[data-fullscreen-menu]"));
    if (!inside) { escapedForward = await p.evaluate(describeActive); break; }
  }
  rec("AC4.trap-forward", escapedForward === null, escapedForward === null
    ? "90 Tab presses, focus stayed inside [data-fullscreen-menu] every time"
    : `focus escaped to: ${escapedForward}`);

  // --- Shift+Tab wrap: from the FIRST focusable, Shift+Tab must land on the LAST
  const focusableSel = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const firstLast = await p.evaluate((sel) => {
    const panel = document.querySelector("[data-fullscreen-menu]");
    const list = [...panel.querySelectorAll(sel)].filter((el) => {
      if (el.tabIndex < 0 || el.closest("[hidden],[inert],[aria-hidden='true']")) return false;
      const s = getComputedStyle(el);
      return s.display !== "none" && s.visibility !== "hidden" && el.getClientRects().length > 0;
    });
    list[0].focus();
    return { count: list.length, first: list[0].textContent.trim().slice(0, 30), last: list[list.length - 1].textContent.trim().slice(0, 30) };
  }, focusableSel);
  await p.keyboard.press("Shift+Tab");
  const afterShift = await p.evaluate((sel) => {
    const panel = document.querySelector("[data-fullscreen-menu]");
    const list = [...panel.querySelectorAll(sel)].filter((el) => {
      if (el.tabIndex < 0 || el.closest("[hidden],[inert],[aria-hidden='true']")) return false;
      const s = getComputedStyle(el);
      return s.display !== "none" && s.visibility !== "hidden" && el.getClientRects().length > 0;
    });
    return {
      isLast: document.activeElement === list[list.length - 1],
      inside: !!document.activeElement?.closest("[data-fullscreen-menu]"),
      what: (document.activeElement?.textContent || "").trim().slice(0, 30),
    };
  }, focusableSel);
  rec("AC4.trap-shift-tab-wrap", afterShift.isLast && afterShift.inside,
    `${firstLast.count} focusables; Shift+Tab from first("${firstLast.first}") -> "${afterShift.what}" (expected last "${firstLast.last}")`);

  // --- backward trap: many Shift+Tab presses must never leave
  let escapedBack = null;
  for (let i = 0; i < 90; i += 1) {
    await p.keyboard.press("Shift+Tab");
    const inside = await p.evaluate(() => !!document.activeElement?.closest("[data-fullscreen-menu]"));
    if (!inside) { escapedBack = await p.evaluate(describeActive); break; }
  }
  rec("AC4.trap-backward", escapedBack === null, escapedBack === null
    ? "90 Shift+Tab presses, focus stayed inside" : `focus escaped to: ${escapedBack}`);

  // --- ESC closes and restores focus to the ORIGINAL trigger
  await p.keyboard.press("Escape");
  await p.waitForSelector("[data-fullscreen-menu]", { state: "detached", timeout: 10000 });
  await p.waitForTimeout(500);
  const restored = await p.evaluate(() => document.activeElement?.getAttribute("data-menu-trigger") !== null
    && document.activeElement?.closest("[data-fullscreen-header]") !== null);
  rec("AC4.esc-close-and-restore", restored, `after Escape, activeElement = ${await p.evaluate(describeActive)}`);

  // --- unlock after close
  const unlocked = await p.evaluate(() => ({
    body: getComputedStyle(document.body).overflow,
    html: getComputedStyle(document.documentElement).overflow,
    rootInert: document.getElementById("root")?.hasAttribute("inert") ?? false,
    rootHidden: document.getElementById("root")?.getAttribute("aria-hidden"),
  }));
  rec("AC4.unlock-after-close", unlocked.body !== "hidden" && unlocked.html !== "hidden"
    && unlocked.rootInert === false && unlocked.rootHidden === null, JSON.stringify(unlocked));

  // --- close on route change (menu open, then navigate by link click)
  await p.locator("[data-menu-trigger]").click();
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible" });
  await p.locator("[data-fullscreen-menu]").getByRole("link", { name: "Hakkımızda" }).click();
  await p.waitForURL(/\/hakkimizda$/, { timeout: 15000 });
  await p.waitForTimeout(800);
  const afterRoute = await p.evaluate(() => ({
    menus: document.querySelectorAll("[data-fullscreen-menu]").length,
    body: getComputedStyle(document.body).overflow,
    rootInert: document.getElementById("root")?.hasAttribute("inert") ?? false,
  }));
  rec("AC4.close-on-route-change", afterRoute.menus === 0 && afterRoute.body !== "hidden" && afterRoute.rootInert === false,
    JSON.stringify(afterRoute));

  await c.close();
}

/* ═══════════════ S2(2) + AC1 — exactly one header, incl. transitions ═══════ */
{
  const { c, p } = await ctx();
  const counts = async (label) => {
    const n = await p.evaluate(() => ({
      header: document.querySelectorAll("[data-fullscreen-header]").length,
      trigger: document.querySelectorAll("[data-menu-trigger]").length,
      banner: document.querySelectorAll("header, [role=banner]").length,
      spacer: document.querySelectorAll(".tl-header-spacer").length,
    }));
    return { label, ...n };
  };
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await landingSettled(p);
  const c1 = await counts("/ (landing)");

  await p.locator("[data-menu-trigger]").click();
  await p.locator("[data-fullscreen-menu]").getByRole("link", { name: "Hakkımızda" }).click();
  await p.waitForURL(/\/hakkimizda$/);
  await p.waitForTimeout(1200);
  const c2 = await counts("/hakkimizda");

  // The measured failure was on goBack. Sample DURING the curtain too.
  const during = [];
  const goBack = p.goBack();
  for (let i = 0; i < 12; i += 1) {
    await p.waitForTimeout(90);
    during.push(await p.evaluate(() => document.querySelectorAll("[data-menu-trigger]").length).catch(() => -1));
  }
  await goBack;
  await p.waitForTimeout(1500);
  const c3 = await counts("/ after goBack");

  const ok = [c1, c2, c3].every((x) => x.header === 1 && x.trigger === 1 && x.spacer === 1)
    && during.every((n) => n <= 1);
  rec("S2b.one-header-instance", ok,
    `${JSON.stringify([c1, c2, c3])} ; trigger count sampled every 90ms across the goBack curtain: ${JSON.stringify(during)}`);
  await c.close();
}

/* ═══════════════ S2(2) — pages that legitimately have NO header ═══════════ */
{
  const { c, p } = await ctx();
  const rows = [];
  for (const path of ["/giris", "/reset-password", "/sifremi-unuttum", "/bu-sayfa-yok-404", "/teklif-al"]) {
    await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(1800);
    rows.push({
      path,
      header: await p.evaluate(() => document.querySelectorAll("[data-fullscreen-header]").length),
      spacer: await p.evaluate(() => document.querySelectorAll(".tl-header-spacer").length),
      firstY: await p.evaluate(() => {
        const m = document.getElementById("main-content") || document.querySelector("main");
        return m ? Math.round(m.getBoundingClientRect().top) : null;
      }),
    });
  }
  const expectNone = rows.filter((r) => ["/giris", "/reset-password", "/sifremi-unuttum", "/bu-sayfa-yok-404"].includes(r.path));
  rec("S2b.no-header-routes-unbroken", expectNone.every((r) => r.header === 0 && r.spacer === 0),
    JSON.stringify(rows));
  await c.close();
}

/* ═══════════════ S2(1) — landing anchor navigation actually scrolls ═══════ */
for (const vp of [{ width: 1280, height: 800, mobile: false, name: "1280" },
                  { width: 375, height: 812, mobile: true, name: "375" }]) {
  const { c, p } = await ctx({ viewport: { width: vp.width, height: vp.height }, mobile: vp.mobile });
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await landingSettled(p);
  const out = [];
  for (const id of ["surec", "projeler", "kalite", "iletisim"]) {
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(400);
    await p.locator("[data-menu-trigger]").click();
    await p.waitForSelector("[data-fullscreen-menu]", { state: "visible" });
    await p.locator(`[data-fullscreen-menu] [href="/#${id}"], [data-fullscreen-menu] [data-nav-section="${id}"]`).first()
      .click({ timeout: 8000 })
      .catch(async () => {
        // fall back to the section control by accessible name
        await p.locator("[data-fullscreen-menu]").getByRole("button", { name: new RegExp(id, "i") }).first().click();
      });
    await p.waitForTimeout(2200);
    const m = await p.evaluate((sid) => {
      const el = document.getElementById(sid);
      const hdr = document.querySelector("[data-fullscreen-header]");
      return {
        scrollY: Math.round(window.scrollY),
        top: el ? Math.round(el.getBoundingClientRect().top) : null,
        headerH: hdr ? Math.round(hdr.getBoundingClientRect().height) : null,
        menus: document.querySelectorAll("[data-fullscreen-menu]").length,
      };
    }, id);
    out.push({ id, ...m });
  }
  const ok = out.every((r) => r.scrollY > 100 && r.menus === 0
    && r.top !== null && Math.abs(r.top - r.headerH) <= 40);
  rec(`S2a.anchor-scroll@${vp.name}`, ok, JSON.stringify(out));
  await c.close();
}

/* ═══════════════ AC6 — deep links + back/forward ═════════════════════════ */
{
  const { c, p } = await ctx();
  // 1. cold deep link
  await p.goto(`${BASE}/#kalite`, { waitUntil: "domcontentloaded" });
  await landingSettled(p);
  await p.waitForTimeout(3500);
  const deep = await p.evaluate(() => {
    const el = document.getElementById("kalite");
    const hdr = document.querySelector("[data-fullscreen-header]");
    return { scrollY: Math.round(window.scrollY), top: Math.round(el.getBoundingClientRect().top),
             headerH: Math.round(hdr.getBoundingClientRect().height) };
  });
  rec("AC6.cold-deep-link", deep.scrollY > 100 && Math.abs(deep.top - deep.headerH) <= 40, JSON.stringify(deep));

  // 2. deep link straight to an inner route, refreshed
  await p.goto(`${BASE}/hizmetler/cnc-frezeleme`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);
  await p.reload({ waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1500);
  const inner = await p.evaluate(() => ({
    url: location.pathname,
    h1: document.querySelector("h1")?.textContent?.trim().slice(0, 40) ?? null,
    header: document.querySelectorAll("[data-fullscreen-header]").length,
  }));
  rec("AC6.inner-deep-link-refresh", inner.url === "/hizmetler/cnc-frezeleme" && !!inner.h1 && inner.header === 1, JSON.stringify(inner));

  // 3. back / forward chain across three routes
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await landingSettled(p);
  await p.goto(`${BASE}/hakkimizda`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1200);
  await p.goto(`${BASE}/blog`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1200);
  const chain = [];
  await p.goBack(); await p.waitForTimeout(1500); chain.push(await p.evaluate(() => location.pathname));
  await p.goBack(); await p.waitForTimeout(2500); chain.push(await p.evaluate(() => location.pathname));
  await p.goForward(); await p.waitForTimeout(1500); chain.push(await p.evaluate(() => location.pathname));
  await p.goForward(); await p.waitForTimeout(1500); chain.push(await p.evaluate(() => location.pathname));
  const headersAtEnd = await p.evaluate(() => document.querySelectorAll("[data-fullscreen-header]").length);
  rec("AC6.back-forward-chain",
    JSON.stringify(chain) === JSON.stringify(["/hakkimizda", "/", "/hakkimizda", "/blog"]) && headersAtEnd === 1,
    `${JSON.stringify(chain)} headers=${headersAtEnd}`);

  // 4. history move with the menu OPEN closes it
  await p.goto(`${BASE}/hakkimizda`, { waitUntil: "domcontentloaded" });
  await p.waitForTimeout(1200);
  await p.locator("[data-menu-trigger]").click();
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible" });
  await p.goBack();
  await p.waitForTimeout(2000);
  const afterHist = await p.evaluate(() => ({
    menus: document.querySelectorAll("[data-fullscreen-menu]").length,
    body: getComputedStyle(document.body).overflow,
    rootInert: document.getElementById("root")?.hasAttribute("inert") ?? false,
  }));
  rec("AC6.history-closes-open-menu", afterHist.menus === 0 && afterHist.body !== "hidden" && afterHist.rootInert === false,
    JSON.stringify(afterHist));
  await c.close();
}

/* ═══════════════ AC5 — reduced motion + 320/375 ══════════════════════════ */
for (const vp of [{ width: 320, height: 568, name: "320" }, { width: 375, height: 812, name: "375" }]) {
  const { c, p } = await ctx({ viewport: vp, mobile: true, reduced: true });
  await p.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await landingSettled(p);
  const hdr = await p.evaluate(() => {
    const h = document.querySelector("[data-fullscreen-header]");
    const r = h.getBoundingClientRect();
    return { x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) };
  });
  await p.locator("[data-menu-trigger]").click();
  await p.waitForSelector("[data-fullscreen-menu]", { state: "visible", timeout: 10000 });
  await p.waitForTimeout(600);
  const menu = await p.evaluate(() => {
    const m = document.querySelector("[data-fullscreen-menu]");
    const r = m.getBoundingClientRect();
    const running = m.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length;
    const links = [...m.querySelectorAll("a[href]")].length;
    const overflowX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    // any interactive control smaller than 24px in either axis?
    const tiny = [...m.querySelectorAll("a[href],button")].filter((el) => {
      const b = el.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && (b.width < 24 || b.height < 24);
    }).length;
    return { x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height), running, links, overflowX, tiny,
             opacity: getComputedStyle(m).opacity, transform: getComputedStyle(m).transform };
  });
  const ok = menu.w <= vp.width && menu.x >= 0 && menu.running === 0 && menu.links > 20
    && menu.overflowX === 0 && Number(menu.opacity) === 1
    && (menu.transform === "none" || menu.transform === "matrix(1, 0, 0, 1, 0, 0)");
  rec(`AC5.reduced-motion-mobile@${vp.name}`, ok, `header=${JSON.stringify(hdr)} menu=${JSON.stringify(menu)}`);

  // ESC must still work under reduced motion
  await p.keyboard.press("Escape");
  await p.waitForTimeout(900);
  const closed = await p.evaluate(() => document.querySelectorAll("[data-fullscreen-menu]").length);
  rec(`AC5.reduced-motion-esc@${vp.name}`, closed === 0, `menus after Escape = ${closed}`);
  await c.close();
}

/* ═══════════════ S8 — fixed-bar clipping on inner pages at <=767 ═════════ */
for (const vp of [{ width: 320, height: 568, name: "320" }, { width: 375, height: 812, name: "375" }, { width: 767, height: 900, name: "767" }]) {
  const { c, p } = await ctx({ viewport: vp, mobile: vp.width < 768 });
  const rows = [];
  for (const path of ["/hizmetler/cnc-frezeleme", "/endustriyel/otomotiv", "/kabiliyetler/makine-parkuru",
                      "/hizmetler/kategori/talasli-imalat", "/hakkimizda", "/iletisim", "/blog", "/sss",
                      "/malzemeler", "/kvkk", "/teklif-al"]) {
    await p.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(1600);
    const m = await p.evaluate(() => {
      const hdr = document.querySelector("[data-fullscreen-header]");
      const headerH = hdr ? hdr.getBoundingClientRect().height : 0;
      const main = document.getElementById("main-content") || document.querySelector("main");
      const first = main ? main.firstElementChild : null;
      const nav = document.querySelector("nav[aria-label*='readcrumb'], .breadcrumb, [class*=breadcrumb]");
      const h1 = document.querySelector("h1");
      const r = (el) => (el ? Math.round(el.getBoundingClientRect().top) : null);
      return { headerH: Math.round(headerH), mainTop: r(main), firstTop: r(first), crumbTop: r(nav), h1Top: r(h1),
               crumbTag: nav ? `${nav.tagName}.${nav.className}`.slice(0, 60) : null };
    });
    // "clipped" = a real content top sits above the bottom edge of the fixed bar
    const tops = [m.mainTop, m.crumbTop].filter((v) => v !== null);
    const clippedBy = Math.max(0, ...tops.map((t) => Math.round(m.headerH - t)));
    rows.push({ path, ...m, clippedBy });
  }
  const clipped = rows.filter((r) => r.clippedBy > 0);
  rec(`S8.no-clipping@${vp.name}`, clipped.length === 0,
    clipped.length === 0 ? `all ${rows.length} routes clear the ${rows[0].headerH}px bar` : JSON.stringify(clipped));
  console.log(`      detail@${vp.name}: ${JSON.stringify(rows)}`);
  await c.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n──────── ${results.length - failed.length}/${results.length} checks passed ────────`);
if (failed.length) { console.log("FAILED:"); for (const f of failed) console.log(` - ${f.id}: ${f.detail}`); }
process.exit(failed.length ? 1 : 0);
