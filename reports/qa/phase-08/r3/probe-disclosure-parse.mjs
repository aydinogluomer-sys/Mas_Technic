/** QA round 3 — what exactly does the disclosure parser see, and where does the
 *  stray `c.com` come from? A coverage rule fed a token nobody wrote is not a
 *  coverage rule, even when the token is harmless. */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";

const b = await chromium.launch({ executablePath: EXE });
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
await p.goto(BASE + "/cerez-politikasi", { waitUntil: "networkidle" });
await p.waitForTimeout(800);

const out = await p.evaluate(() => {
  const main = document.querySelector("main");
  const text = main.innerText;
  const re = /\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/gi;
  const hits = [...text.matchAll(re)].map((m) => ({
    match: m[0],
    context: text.slice(Math.max(0, m.index - 60), m.index + m[0].length + 40).replace(/\n/g, "\u23ce"),
  }));
  return {
    codes: [...main.querySelectorAll("code")].map((c) => c.textContent.trim()),
    hits,
  };
});

await b.close();
console.log(JSON.stringify(out, null, 2));
