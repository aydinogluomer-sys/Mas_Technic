/**
 * QA round 2 — falsify the C3 footer account (D1).
 *
 * Measures, per viewport, on `/`:
 *   · `.tl-footer` height and height/innerWidth (the exact expression
 *     `e2e/technical-landing.spec.ts:245` evaluates)
 *   · `.tl-footer nav` computed display
 *   · per column: title, link count, labels, hrefs
 *   · row pitch = delta between the tops of two consecutive links, per column
 *   · every anchor inside the footer (nav + disclosure panels), so the
 *     "every resourceLinks entry appears exactly once" claim can be checked
 *   · the header brand link and the menu brand link
 */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4173";
const VIEWPORTS = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1280", width: 1280, height: 800 },
  { name: "1440", width: 1440, height: 900 },
];

const browser = await chromium.launch({ executablePath: EXE });
const out = {};

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);

  out[vp.name] = await page.evaluate(() => {
    const footer = document.querySelector(".tl-footer");
    const nav = document.querySelector(".tl-footer nav");
    const navCS = nav ? getComputedStyle(nav) : null;

    const columns = [...document.querySelectorAll(".tl-footer nav > div")].map((div) => {
      const links = [...div.querySelectorAll("a")];
      const tops = links.map((a) => a.getBoundingClientRect().top);
      const deltas = [];
      for (let i = 1; i < tops.length; i++) deltas.push(+(tops[i] - tops[i - 1]).toFixed(4));
      return {
        title: div.querySelector("h3")?.textContent ?? null,
        count: links.length,
        items: links.map((a) => ({ label: a.textContent, href: a.getAttribute("href") })),
        pitches: deltas,
        boxHeight: +div.getBoundingClientRect().height.toFixed(2),
      };
    });

    // Everything in the footer, both renderings.
    const navAnchors = [...document.querySelectorAll(".tl-footer nav a")].map((a) => a.getAttribute("href"));
    const disclosureRoot = document.querySelector(".shell-footer-disclosures");
    const discAnchors = disclosureRoot
      ? [...disclosureRoot.querySelectorAll("a")].map((a) => a.getAttribute("href"))
      : [];
    const discGroups = disclosureRoot
      ? [...disclosureRoot.children].map((el) => ({
          tag: el.tagName.toLowerCase(),
          title: el.querySelector("summary,h3,button")?.textContent ?? null,
          anchorCount: el.querySelectorAll("a").length,
          hiddenAttr: !!el.querySelector("[hidden]"),
          display: getComputedStyle(el).display,
        }))
      : [];
    const allFooterAnchors = [...document.querySelectorAll(".tl-footer a")].map((a) => ({
      href: a.getAttribute("href"),
      text: (a.textContent || "").trim(),
      visible: a.getClientRects().length > 0,
    }));

    // Header / menu brand affordance.
    const header = document.querySelector("header");
    const headerBrand = header
      ? [...header.querySelectorAll('a[href="/"]')].map((a) => {
          const r = a.getBoundingClientRect();
          const cs = getComputedStyle(a);
          return {
            text: (a.textContent || "").trim().slice(0, 40),
            rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
            display: cs.display,
            visibility: cs.visibility,
            ariaHidden: a.getAttribute("aria-hidden"),
            inert: a.closest("[inert]") !== null,
          };
        })
      : [];

    const fr = footer ? footer.getBoundingClientRect() : null;
    return {
      innerWidth: window.innerWidth,
      footerHeight: fr ? +fr.height.toFixed(4) : null,
      bantOrani: fr ? fr.height / window.innerWidth : null,
      navDisplay: navCS ? navCS.display : null,
      navVisibility: navCS ? navCS.visibility : null,
      columns,
      navAnchors,
      discAnchors,
      discGroups,
      allFooterAnchors,
      headerBrand,
      documentHomeAnchors: [...document.querySelectorAll('a[href="/"]')].length,
    };
  });

  // The fullscreen menu, opened: brand link + KAYNAKLAR index.
  const menu = await page.evaluate(async () => {
    const trigger = [...document.querySelectorAll("button")].find((b) =>
      /menü|menu/i.test(b.getAttribute("aria-label") || b.textContent || ""));
    if (!trigger) return { opened: false };
    trigger.click();
    await new Promise((r) => setTimeout(r, 900));
    const nav = document.querySelector('[role="dialog"], .nav-overlay, [data-menu-open], nav[aria-label*="Ana"]');
    const bodyText = document.body.innerText;
    const kaynaklar = [...document.querySelectorAll("*")]
      .filter((el) => el.children.length === 0 && /KAYNAKLAR/i.test(el.textContent || ""))
      .map((el) => {
        const parent = el.closest("div,section,li,article") || el.parentElement;
        return { text: (el.textContent || "").trim(), parentText: (parent?.innerText || "").slice(0, 120) };
      });
    const brands = [...document.querySelectorAll('a[href="/"]')].map((a) => {
      const r = a.getBoundingClientRect();
      return { text: (a.textContent || "").trim().slice(0, 40), rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }, visible: a.getClientRects().length > 0 };
    });
    return { opened: true, kaynaklar, brands, hasKaynaklar: /KAYNAKLAR/i.test(bodyText) };
  });
  out[vp.name].menu = menu;

  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 2));
