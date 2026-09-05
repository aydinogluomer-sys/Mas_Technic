/**
 * QA round 3 — the three absolutes the rewritten clauses now carry.
 *
 *   /cerez-politikasi madde 03  "Tarayıcınızın bu sitenin dışına istek
 *                                gönderdiği ÜÇ YER var. Üçü de burada."
 *   /gizlilik-politikasi md 05  "Sayfalara gömülü TEK üçüncü taraf bileşeni
 *                                giriş sayfasındadır."
 *   /cerez-politikasi madde 01  `__cf_bm` … `httpOnly` … "sayfa betikleri onu
 *                                okuyamaz" … "ömrü otuz dakikadır"
 *
 * Each is a closed claim about the reader's own browser, which is the class of
 * sentence this whole round exists because of. Fresh context per route, plain
 * load, no interaction: hosts contacted, iframes embedded, cookies with their
 * flags, and whether `document.cookie` can see the cookie the document says
 * page scripts cannot read.
 */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";
const ROUTES = ["/", "/sss", "/gizlilik-politikasi", "/kvkk", "/cerez-politikasi", "/hakkimizda",
  "/iletisim", "/malzemeler", "/malzemeler/aluminyum", "/blog",
  "/blog/havacilik-parcalarinda-malzeme-secimi", "/kabiliyet-profilleri",
  "/kabiliyet-profilleri/ince-cidarli-aluminyum-govde", "/kalite-dosyasi",
  "/hizmetler/kategori/talasli-imalat", "/hizmetler/cnc-frezeleme", "/kabiliyetler/kalite-kontrol",
  "/endustriyel/havacilik", "/giris", "/sifremi-unuttum", "/reset-password", "/teklif-al",
  "/cad-dashboard"];

const browser = await chromium.launch({ executablePath: EXE });
const out = {};

for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const hosts = new Set();
  page.on("response", (r) => { try { hosts.add(new URL(r.url()).host); } catch { /* opaque */ } });
  await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const frames = page.frames().slice(1).map((f) => f.url());
  const cookies = await ctx.cookies();
  const docCookie = await page.evaluate(() => document.cookie);

  out[route] = {
    thirdPartyHosts: [...hosts].filter((h) => !h.startsWith("localhost") && !h.startsWith("127.")).sort(),
    iframes: frames,
    iframeCount: frames.length,
    cookies: cookies.map((c) => ({
      name: c.name, domain: c.domain, path: c.path, httpOnly: c.httpOnly,
      secure: c.secure, sameSite: c.sameSite,
      lifetimeMinutes: c.expires > 0 ? Number(((c.expires * 1000 - Date.now()) / 60000).toFixed(1)) : null,
    })),
    documentCookie: docCookie,
  };
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
