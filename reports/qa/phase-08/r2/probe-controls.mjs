/**
 * QA round 2 — the two IA controls, plus the real cost of `Ana Sayfa` leaving
 * the footer.
 *
 * `ia.ts` was untouched by C3. So:
 *   · the fullscreen menu's KAYNAKLAR index must still print `05`
 *     (`NavDirectory.tsx:50` = `resourceLinks.length` zero-padded), and
 *   · the 404 directory must still hold 8 entries
 *     (`NotFound.tsx:150,164` = navigationItems.length + resourceLinks.length).
 * If either moved, the footer fix leaked into the IA.
 *
 * Then: scroll to the footer at 375 and at 1280 and CLICK the header brand,
 * asserting the reader actually lands on `/`. A rect is not an affordance.
 */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4173";
const browser = await chromium.launch({ executablePath: EXE });
const out = {};

for (const vp of [{ n: "375", w: 375, h: 812 }, { n: "1280", w: 1280, h: 800 }]) {
  const r = (out[vp.n] = {});
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();

  // ── control A: the fullscreen menu's KAYNAKLAR index ────────────────────
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  const trigger = page.locator("header button").filter({ hasText: /MENÜ|MENU/i }).first();
  const triggerCount = await page.locator("header button").count();
  let opened = false;
  try {
    if (await trigger.count()) { await trigger.click(); opened = true; }
    else { await page.locator("header button").last().click(); opened = true; }
  } catch (e) { r.menuOpenError = String(e).slice(0, 200); }
  await page.waitForTimeout(1000);
  r.headerButtons = triggerCount;
  r.menuOpened = opened;
  r.menuDirectory = await page.evaluate(() =>
    [...document.querySelectorAll(".tl-menu-dir-col")].map((col) => {
      const t = col.querySelector(".tl-menu-dir-title");
      const idx = t?.querySelector("span");
      return {
        title: (t?.childNodes[0]?.textContent || "").trim(),
        index: idx ? idx.textContent : null,
        entries: col.querySelectorAll("li a").length,
        hrefs: [...col.querySelectorAll("li a")].map((a) => a.getAttribute("href")),
      };
    }));
  r.menuBrandHome = await page.evaluate(() =>
    [...document.querySelectorAll('a[href="/"]')].map((a) => ({
      text: (a.textContent || "").trim().slice(0, 40),
      cls: a.className,
      visible: a.getClientRects().length > 0,
    })));

  // ── control B: the 404 directory ────────────────────────────────────────
  await page.goto(`${BASE}/qa-r2-no-such-route`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  r.notFound = await page.evaluate(() => {
    const main = document.querySelector("main");
    const dirLists = [...document.querySelectorAll("main ul, main ol")].map((ul) => ({
      cls: ul.className,
      items: ul.querySelectorAll("li").length,
      hrefs: [...ul.querySelectorAll("a")].map((a) => a.getAttribute("href")),
    }));
    return {
      h1: [...document.querySelectorAll("main h1")].map((h) => h.textContent),
      lists: dirLists,
      mainAnchorCount: main ? main.querySelectorAll("a").length : 0,
      homeActions: [...document.querySelectorAll('main a[href="/"]')].map((a) => (a.textContent || "").trim()),
    };
  });

  // ── the click test: from the bottom of the page, get home ───────────────
  await page.goto(`${BASE}/kalite-dosyasi`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  const beforeUrl = page.url();
  const brand = page.locator('header a[href="/"]').first();
  const brandBox = await brand.boundingBox();
  // Is the brand under something else at that point?
  const topAtCentre = brandBox
    ? await page.evaluate(([x, y]) => {
        const el = document.elementFromPoint(x, y);
        return el ? { tag: el.tagName, cls: String(el.className).slice(0, 60), inBrand: !!el.closest('header a[href="/"]') } : null;
      }, [brandBox.x + brandBox.width / 2, brandBox.y + brandBox.height / 2])
    : null;
  let clickResult;
  try {
    await brand.click({ timeout: 5000 });
    await page.waitForTimeout(1200);
    clickResult = { url: page.url(), scrollY: await page.evaluate(() => window.scrollY) };
  } catch (e) { clickResult = { error: String(e).slice(0, 200) }; }
  r.homeFromFooter = { beforeUrl, brandBox, elementAtBrandCentre: topAtCentre, afterClick: clickResult };

  // ── the same, by keyboard: is the brand reachable with Tab from the footer?
  await page.goto(`${BASE}/kalite-dosyasi`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(900);
  r.brandTabIndex = await page.evaluate(() => {
    const focusables = [...document.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')]
      .filter((el) => el.getClientRects().length > 0 || el.closest("header"));
    const brand = document.querySelector('header a[href="/"]');
    return { position: focusables.indexOf(brand), total: focusables.length };
  });

  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(out, null, 2));
