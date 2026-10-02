/**
 * QA round 2 — `/cerez-politikasi` madde 01 says, absolutely:
 *   "Herkese açık sayfalarda hiçbir çerez oluşturulmuyor."
 * The route sweep found `__cf_bm` in the context after visiting `/giris`.
 * This establishes, per route, exactly which cookie is created, by which
 * response, on which domain — and whether it survives a reload.
 */
import { chromium } from "playwright";
const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4173";
const ROUTES = ["/giris", "/sifremi-unuttum", "/reset-password", "/teklif-al", "/", "/kvkk", "/cerez-politikasi", "/malzemeler"];

const browser = await chromium.launch({ executablePath: EXE });
const out = {};
for (const r of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const setCookieResponses = [];
  const thirdPartyHosts = new Set();
  page.on("response", async (res) => {
    try {
      const h = res.headers();
      const url = new URL(res.url());
      if (url.host !== "localhost:4173") thirdPartyHosts.add(url.host);
      if (h["set-cookie"]) {
        setCookieResponses.push({
          url: res.url().slice(0, 140),
          status: res.status(),
          setCookie: String(h["set-cookie"]).slice(0, 260),
        });
      }
    } catch { /* ignore */ }
  });
  await page.goto(BASE + r, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const cookies = await ctx.cookies();
  out[r] = {
    cookies: cookies.map((c) => ({
      name: c.name, domain: c.domain, path: c.path, httpOnly: c.httpOnly,
      secure: c.secure, sameSite: c.sameSite,
      expiresInMinutes: c.expires > 0 ? Math.round((c.expires * 1000 - Date.now()) / 60000) : "session",
    })),
    setCookieResponses,
    thirdPartyHosts: [...thirdPartyHosts],
  };
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
