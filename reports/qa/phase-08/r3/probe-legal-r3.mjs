/**
 * QA round 3 — the three legal documents, from the RENDERED DOM.
 *
 * Every sentence C4 rewrote has to be read out of the browser, not out of the
 * diff: the diff proves what was typed, the DOM proves what a reader gets.
 * Captures, per route: the meta description, the lede, every clause's number,
 * id, title and full text, every link inside a clause (href + label), every
 * `<code>` token, and the storage table's rows and note.
 */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";
const ROUTES = ["/cerez-politikasi", "/gizlilik-politikasi", "/kvkk"];

const b = await chromium.launch({ executablePath: EXE });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const out = {};

for (const route of ROUTES) {
  await page.goto(BASE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  out[route] = await page.evaluate(() => {
    const main = document.querySelector("main");
    const clauses = [...document.querySelectorAll("section.shell-doc-section")].map((section) => ({
      no: section.querySelector(".shell-doc-section-no")?.textContent?.trim() ?? null,
      id: section.getAttribute("id"),
      title: section.querySelector("h2")?.innerText?.trim() ?? null,
      paragraphs: [...section.querySelectorAll(".shell-doc-section-body p")].map((p) => p.innerText.replace(/\s+/g, " ").trim()),
      text: section.querySelector(".shell-doc-section-body")?.innerText?.replace(/\s+/g, " ").trim() ?? null,
      links: [...section.querySelectorAll("a[href]")].map((a) => ({ href: a.getAttribute("href"), text: a.innerText.trim() })),
      codes: [...section.querySelectorAll("code")].map((c) => c.textContent.trim()),
    }));
    const table = main.querySelector("table");
    return {
      title: document.title,
      metaDescription: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null,
      h1: document.querySelector("h1")?.innerText?.trim() ?? null,
      lede: document.querySelector(".shell-lede, .shell-doc-lede, .shell-title-block p")?.innerText?.replace(/\s+/g, " ").trim() ?? null,
      allTopParagraphs: [...main.querySelectorAll(":scope > * p")].slice(0, 4).map((p) => p.innerText.replace(/\s+/g, " ").trim()),
      clauses,
      table: table ? {
        caption: table.querySelector("caption")?.textContent?.trim() ?? null,
        headers: [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim()),
        rows: [...table.querySelectorAll("tbody tr")].map((tr) => [...tr.querySelectorAll("th,td")].map((c) => c.textContent.trim())),
        note: table.closest("figure")?.querySelector("figcaption")?.innerText?.replace(/\s+/g, " ").trim() ?? null,
      } : null,
      mainText: main.innerText.replace(/\s+/g, " ").trim(),
    };
  });
}

await b.close();
console.log(JSON.stringify(out, null, 2));
