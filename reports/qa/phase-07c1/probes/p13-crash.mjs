/* PROBE 13 — a category page rendered the global error boundary during a
 * 15-route sweep. Reproduce it deliberately and capture the reason.
 */
import { launch, ctx, goto, log } from "./lib.mjs";

const ROUTE = process.env.QA_ROUTE || "/kabiliyetler/kategori/prototipten-seri-uretime";
const N = Number(process.env.QA_N || 8);

const browser = await launch();
const out = [];
for (let i = 0; i < N; i++) {
  const fresh = i % 2 === 0; // alternate: fresh context vs reused page
  const c = await ctx(browser, { width: 1280, height: 900, reduce: true });
  const page = await c.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push("pageerror: " + String(e).slice(0, 300)));
  page.on("console", (m) => { if (m.type() === "error") errs.push("console: " + m.text().slice(0, 300)); });
  page.on("requestfailed", (r) => errs.push("reqfail: " + r.url().slice(0, 90) + " " + (r.failure()?.errorText || "")));
  if (!fresh) {
    // warm the SPA first, then client-navigate, which is how a user gets here
    await goto(page, "/");
    await page.evaluate(() => window.history.pushState({}, "", "/kabiliyetler/kategori/prototipten-seri-uretime"));
  }
  await goto(page, ROUTE);
  await page.waitForTimeout(1200);
  const state = await page.evaluate(() => ({
    boundary: /Sayfa şu anda yüklenemedi|Beklenmeyen bir teknik hata/.test(document.body.innerText),
    h1: document.querySelector("h1")?.textContent?.trim().slice(0, 40) ?? null,
    len: document.body.innerText.length,
  }));
  out.push({ i, fresh, ...state, errs });
  await c.close();
}
await browser.close();
log({ route: ROUTE, runs: out, crashes: out.filter((o) => o.boundary).length });
