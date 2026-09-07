/* Why did `/giris` and `/iletisim` return zero elements at 1280 while every
   other route in the same context returned rows? A probe that reports nothing
   and a surface that HAS nothing are indistinguishable in the output, so this
   asks the page directly before the census is trusted. */
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const traffic = await guard(context, []);
let first = true;

for (const route of ["/giris", "/iletisim"]) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${String(e.message).slice(0, 160)}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 160)}`); });
  await page.goto(`${BASE}${route}`, { waitUntil: "load" });
  if (first) { await canary(page, (m) => console.log(m)); first = false; }
  await page.waitForTimeout(1500);
  const s1 = await page.evaluate(() => ({
    roots: document.querySelectorAll(".shell-root").length,
    fields: document.querySelectorAll(".shell-field input").length,
    text: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 160),
  }));
  await page.waitForTimeout(3500);
  const s2 = await page.evaluate(() => ({
    roots: document.querySelectorAll(".shell-root").length,
    fields: document.querySelectorAll(".shell-field input").length,
    text: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 160),
  }));
  console.log(`${route}\n  @1.5s ${JSON.stringify(s1)}\n  @5.0s ${JSON.stringify(s2)}\n  errors: ${errors.slice(0, 4).join(" | ") || "none"}`);
  await page.close();
}
console.log(`traffic: blocked ${traffic.blocked.length}, ALLOWED ${traffic.allowed.length}`);
await context.close();
await browser.close();
