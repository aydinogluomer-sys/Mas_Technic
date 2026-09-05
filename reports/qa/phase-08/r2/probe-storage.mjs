/**
 * QA round 2 — close round 1's open item: is `mas_intro_seen` really the only
 * unlisted browser-storage key?
 *
 * Enumerates cookies + localStorage + sessionStorage over EVERY public route
 * template in `src/App.tsx`, in three regimes:
 *   A. ONE context, visiting every route in sequence (accumulates)
 *   B. A FRESH context per route (isolates which route writes what)
 *   C. A reduced-motion context on `/` (where `mas_intro_seen` must NOT appear)
 * Plus D: the landing with a full RELOAD, and E: theme toggle / chat open, the
 * two interactions that write the two keys nothing else touches.
 */
import { chromium } from "playwright";
const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4173";

const ROUTES = [
  "/",
  "/sss",
  "/gizlilik-politikasi",
  "/kvkk",
  "/cerez-politikasi",
  "/hakkimizda",
  "/iletisim",
  "/malzemeler",
  "/malzemeler/aluminyum",
  "/blog",
  "/blog/havacilik-parcalarinda-malzeme-secimi",
  "/kabiliyet-profilleri",
  "/kabiliyet-profilleri/ince-cidarli-aluminyum-govde",
  "/kalite-dosyasi",
  "/hizmetler/kategori/talasli-imalat",
  "/kabiliyetler/kategori/kalite-standartlar",
  "/endustriyel/kategori/yuksek-teknoloji",
  "/hizmetler/cnc-frezeleme",
  "/kabiliyetler/kalite-kontrol",
  "/endustriyel/havacilik",
  "/giris",
  "/sifremi-unuttum",
  "/reset-password",
  "/teklif-al",
  "/cad-dashboard",
  "/qa-r2-no-such-route",
];

const read = (page) =>
  page.evaluate(() => ({
    local: Object.keys(localStorage).sort(),
    session: Object.keys(sessionStorage).sort(),
  }));

const browser = await chromium.launch({ executablePath: EXE });
const out = { A_oneContext: {}, B_freshPerRoute: {}, C_reducedMotion: null, D_landingReload: null, E_interactions: null };

// ── A: one context, every route in order ───────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  for (const r of ROUTES) {
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const s = await read(page);
    const cookies = await ctx.cookies();
    out.A_oneContext[r] = { ...s, cookies: cookies.map((c) => c.name) };
  }
  out.A_final = { ...(await read(page)), cookies: (await ctx.cookies()).map((c) => c.name) };
  await ctx.close();
}

// ── B: a fresh context per route ───────────────────────────────────────────
for (const r of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + r, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const s = await read(page);
  const cookies = await ctx.cookies();
  out.B_freshPerRoute[r] = { ...s, cookies: cookies.map((c) => c.name) };
  await ctx.close();
}

// ── C: reduced motion on the landing ───────────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const first = await read(page);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const second = await read(page);
  out.C_reducedMotion = { first, afterReload: second, cookies: (await ctx.cookies()).map((c) => c.name) };
  await ctx.close();
}

// ── D: landing, plain, with a reload (the intro path) ──────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const first = await read(page);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const second = await read(page);
  // and an inner route reached by a full load, where the script must not write
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p2 = await ctx2.newPage();
  await p2.goto(BASE + "/kvkk", { waitUntil: "networkidle" });
  await p2.waitForTimeout(1500);
  const innerOnly = await read(p2);
  out.D_landingReload = { first, afterReload: second, innerRouteFreshContext: innerOnly };
  await ctx.close(); await ctx2.close();
}

// ── E: the two interactions that write keys ────────────────────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const before = await read(page);

  // open the chat and send one message (local FAQ path — no AI consent given)
  let chatState = null;
  try {
    const launcher = page.locator("button").filter({ has: page.locator("svg") }).last();
    await launcher.click({ timeout: 4000 });
    await page.waitForTimeout(900);
    const input = page.locator('textarea, input[type="text"]').last();
    await input.fill("teslim süresi nedir");
    await input.press("Enter");
    await page.waitForTimeout(2500);
    chatState = await read(page);
  } catch (e) { chatState = { error: String(e).slice(0, 160) }; }

  // the 3D viewer palette toggle lives on a material detail page
  let themeState = null;
  try {
    await page.goto(BASE + "/malzemeler/aluminyum", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const toggles = page.locator('button[aria-label*="palet"], button[aria-label*="tema"], button[aria-label*="Palet"], button[aria-label*="Tema"]');
    if (await toggles.count()) { await toggles.first().click(); await page.waitForTimeout(900); }
    themeState = { ...(await read(page)), toggleFound: await toggles.count() };
  } catch (e) { themeState = { error: String(e).slice(0, 160) }; }

  out.E_interactions = { before, afterChat: chatState, afterThemeAttempt: themeState, cookies: (await ctx.cookies()).map((c) => c.name) };
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
