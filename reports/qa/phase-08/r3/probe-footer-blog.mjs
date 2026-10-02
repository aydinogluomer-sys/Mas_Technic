/** QA round 3 — `/blog` appears three times inside `.tl-footer` while the other
 *  four resource links appear twice. Two of the two are the nav rendering and
 *  the <768 disclosures rendering, both always in the DOM. Where is the third? */
import { chromium } from "playwright";

const EXE = "C:/Users/Trade Bilisim/AppData/Local/ms-playwright/chromium-1234/chrome-win64/chrome.exe";
const BASE = process.env.BASE || "http://localhost:4205";

const b = await chromium.launch({ executablePath: EXE });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
await p.goto(BASE + "/", { waitUntil: "networkidle" });
await p.waitForTimeout(700);
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await p.waitForTimeout(1200);

const out = await p.evaluate(() => {
  const footer = document.querySelector(".tl-footer");
  const chain = (el) => {
    const parts = [];
    let n = el;
    while (n && n !== footer) {
      parts.unshift(n.tagName.toLowerCase() + (typeof n.className === "string" && n.className.trim() ? "." + n.className.trim().split(/\s+/)[0] : ""));
      n = n.parentElement;
    }
    return parts.join(" > ");
  };
  const paths = ["/malzemeler", "/kabiliyet-profilleri", "/kalite-dosyasi", "/blog", "/sss"];
  return Object.fromEntries(paths.map((path) => [
    path,
    [...footer.querySelectorAll(`a[href="${path}"]`)].map((a) => ({
      text: a.textContent.trim(),
      visible: a.getBoundingClientRect().width > 0,
      where: chain(a),
    })),
  ]));
});

await b.close();
console.log(JSON.stringify(out, null, 2));
