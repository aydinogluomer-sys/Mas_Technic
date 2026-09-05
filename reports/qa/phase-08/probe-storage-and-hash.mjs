/**
 * QA PROBE
 *  A. `/cerez-politikasi` madde 01 claims no cookie is created on public pages,
 *     and madde 02 claims to list every browser-storage record. Measure both.
 *  B. `ChatBot.tsx:418` links cross-route to `/gizlilik-politikasi#sohbet-asistani`.
 *     Measure whether that link lands on the clause or at the top of the page.
 */
import { chromium } from "playwright";
const BASE = "http://localhost:4173";
const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });

/* ── A ─────────────────────────────────────────────────────────────────── */
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  for (const route of ["/", "/sss", "/kalite-dosyasi", "/blog", "/teklif-al", "/gizlilik-politikasi"]) {
    await p.goto(BASE + route, { waitUntil: "networkidle" });
    await p.waitForTimeout(900);
  }
  const cookies = await ctx.cookies();
  const storage = await p.evaluate(() => ({
    local: Object.keys(localStorage),
    session: Object.keys(sessionStorage),
  }));
  console.log("A. cookies created over six public routes:", JSON.stringify(cookies.map((c) => c.name)));
  console.log("   localStorage keys:", JSON.stringify(storage.local));
  console.log("   sessionStorage keys:", JSON.stringify(storage.session));
  await ctx.close();
}

/* ── B ─────────────────────────────────────────────────────────────────── */
{
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();

  // Same-page anchor (the aside index) — the control.
  await p.goto(BASE + "/gizlilik-politikasi", { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  await p.locator('a[href="#sohbet-asistani"]').first().click();
  await p.waitForTimeout(1200);
  const samePage = await p.evaluate(() => {
    const el = document.getElementById("sohbet-asistani");
    return { scrollY: Math.round(window.scrollY), clauseTop: el ? Math.round(el.getBoundingClientRect().top) : null, hash: location.hash };
  });
  console.log("\nB1. SAME-PAGE anchor click:", JSON.stringify(samePage));

  // Cross-route link, exactly as ChatBot.tsx:418 renders it.
  await p.goto(BASE + "/sss", { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  await p.evaluate(() => {
    const a = document.createElement("a");
    a.id = "qa-cross-route-hash";
    a.textContent = "qa";
    a.href = "/gizlilik-politikasi#sohbet-asistani";
    document.body.prepend(a);
  });
  // A raw <a href> is a full navigation, not the SPA <Link> ChatBot uses, so
  // drive the router the way the component does: click a real router link is
  // impossible from outside, so navigate via history + popstate is also not
  // equivalent. Measure BOTH the full-navigation case and the SPA case.
  await p.goto(BASE + "/gizlilik-politikasi#sohbet-asistani", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const fullNav = await p.evaluate(() => {
    const el = document.getElementById("sohbet-asistani");
    return { scrollY: Math.round(window.scrollY), clauseTop: el ? Math.round(el.getBoundingClientRect().top) : null, hash: location.hash };
  });
  console.log("B2. FULL navigation to /gizlilik-politikasi#sohbet-asistani:", JSON.stringify(fullNav));

  // SPA case: open the chat launcher on a public route, drive it to the
  // consent state, and click the real <Link>.
  await p.goto(BASE + "/sss", { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  await p.locator("[data-chat-launcher]").click();
  await p.waitForTimeout(600);
  await p.getByLabel("Sohbet mesajı").fill("qwertyuiop asdfgh zxcvbn");
  await p.keyboard.press("Enter");
  await p.waitForTimeout(1200);
  const link = p.locator('a[href="/gizlilik-politikasi#sohbet-asistani"]');
  const found = await link.count();
  console.log(`B3. consent-block clause link present in the panel: ${found > 0}`);
  if (found > 0) {
    await link.first().click();
    await p.waitForTimeout(1800);
    const spa = await p.evaluate(() => {
      const el = document.getElementById("sohbet-asistani");
      return {
        url: location.pathname + location.hash,
        scrollY: Math.round(window.scrollY),
        clauseTop: el ? Math.round(el.getBoundingClientRect().top) : null,
        viewportH: window.innerHeight,
      };
    });
    console.log("B4. SPA <Link> click from the chat consent block:", JSON.stringify(spa));
    console.log(spa.clauseTop !== null && spa.clauseTop >= 0 && spa.clauseTop < spa.viewportH
      ? "    -> clause IS in the viewport"
      : "    -> clause is NOT in the viewport (deep link does not land)");
  }
  await ctx.close();
}
await b.close();
