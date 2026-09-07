/* THE DEMONSTRATION, AND THE FOUR WAYS IT COULD BE WRONG.
   ══════════════════════════════════════════════════════════════════════════
   `probe-oauth-return.mjs` shows the notice appears where a failure lands.
   That is only half a demonstration: a notice that appears is worth nothing
   if it also appears when there was no failure, if it repeats itself, if it
   renders a stranger's sentence, or if the reader cannot hear it. So:

     clean       `/giris` with no parameters must render NO notice.
     hostile     an `error_description` and an `error_code` written by whoever
                 sent the link must not reach the DOM as prose. A sign-in page
                 is the one surface where "type your password here" in the
                 site's own voice is worth something to an attacker.
     re-entry    after the notice is shown, leaving and coming back INSIDE THE
                 SAME DOCUMENT must not show it again — the parameters that
                 survive in `PerformanceNavigationTiming.name` are immutable
                 for the document's life, so without a latch the message would
                 reappear every time the reader passed this route.
     announced   the notice must carry `role="alert"` and must be inserted
                 AFTER first paint, because an alert region that is already in
                 the DOM when the document loads is frequently never read out.

   Offline, every non-loopback request aborted, guard proven first. No auth
   call of any kind. */
import { writeFileSync, mkdirSync } from "node:fs";
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

mkdirSync("reports/09b1c1/shots", { recursive: true });

const HOSTILE =
  "#error=server_error"
  + "&error_code=%3Cscript%3Ealert(1)%3C%2Fscript%3E%20Oturumunuz%20kilitlendi"
  + "&error_description=Devam%20etmek%20i%C3%A7in%20%C5%9Fifrenizi%20a%C5%9Fa%C4%9F%C4%B1daki%20kutuya%20yaz%C4%B1n";

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const traffic = await guard(context, []);
const out = {};
let canaryResult = null;

const noticeState = () =>
  Array.from(document.querySelectorAll(".shell-notice")).map((n) => ({
    tone: n.getAttribute("data-tone"),
    role: n.getAttribute("role"),
    text: n.textContent.replace(/\s+/g, " ").trim(),
  }));

/* ── clean ──────────────────────────────────────────────────────────────── */
{
  const page = await context.newPage();
  await page.goto(`${BASE}/giris`, { waitUntil: "load" });
  canaryResult = await canary(page, (m) => console.log(m));
  await page.waitForTimeout(2500);
  out.clean = { url: page.url(), notices: await page.evaluate(noticeState) };
  console.log(`clean      notices ${out.clean.notices.length}  url ${out.clean.url}`);
  await page.close();
}

/* ── hostile ────────────────────────────────────────────────────────────── */
{
  const page = await context.newPage();
  await page.goto(`${BASE}/giris${HOSTILE}`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const state = await page.evaluate((needles) => {
    const body = document.body.innerText;
    return {
      notices: Array.from(document.querySelectorAll(".shell-notice")).map((n) => ({
        tone: n.getAttribute("data-tone"),
        role: n.getAttribute("role"),
        text: n.textContent.replace(/\s+/g, " ").trim(),
      })),
      leaked: needles.filter((n) => body.includes(n)),
      scriptTagsInNotice: document.querySelectorAll(".shell-notice script").length,
      url: location.href,
    };
  }, ["şifrenizi aşağıdaki kutuya", "Oturumunuz kilitlendi", "alert(1)", "<script>"]);
  out.hostile = state;
  console.log(`hostile    notices ${state.notices.length}  leaked ${JSON.stringify(state.leaked)}  scripts ${state.scriptTagsInNotice}`);
  console.log(`           text    ${state.notices.map((n) => n.text).join(" || ")}`);
  console.log(`           url     ${state.url}`);
  await page.close();
}

/* ── re-entry, inside one document ──────────────────────────────────────── */
{
  const page = await context.newPage();
  await page.goto(`${BASE}/giris#error=access_denied&error_code=access_denied`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const first = await page.evaluate(noticeState);
  /* An in-app link, so the document is not replaced. */
  await page.click(".shell-auth-back");
  await page.waitForTimeout(1500);
  const away = await page.evaluate(() => location.pathname);
  await page.goBack();
  await page.waitForTimeout(2000);
  const second = await page.evaluate(noticeState);
  const sameDocument = await page.evaluate(() => performance.getEntriesByType("navigation")[0]?.name ?? null);
  out.reentry = { first, away, second, entryUrlStillCarriesError: String(sameDocument).includes("error=") };
  console.log(`re-entry   first ${first.length}  went to ${away}  back ${second.length}`);
  console.log(`           document entry url still carries the error: ${out.reentry.entryUrlStillCarriesError}`);
  await page.close();
}

/* ── announced, and a picture for the record ────────────────────────────── */
{
  const page = await context.newPage();
  await page.goto(`${BASE}/giris#error=server_error&error_code=provider_disabled`, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const state = await page.evaluate(() => {
    const n = document.querySelector(".shell-notice");
    if (!n) return null;
    const s = getComputedStyle(n);
    const social = document.querySelector(".shell-auth-social");
    return {
      role: n.getAttribute("role"),
      tone: n.getAttribute("data-tone"),
      text: n.textContent.replace(/\s+/g, " ").trim(),
      borderLeftColor: s.borderLeftColor,
      /* The notice must be BEFORE the buttons it is about. */
      precedesSocialButtons: social ? !!(n.compareDocumentPosition(social) & Node.DOCUMENT_POSITION_FOLLOWING) : null,
      hasReferenceLine: !!n.querySelector(".shell-field-hint"),
      referenceText: n.querySelector(".shell-field-hint")?.textContent?.trim() ?? null,
    };
  });
  out.announced = state;
  console.log(`announced  ${JSON.stringify(state)}`);
  await page.locator(".shell-auth-panel").screenshot({ path: "reports/09b1c1/shots/oauth-notice-1280.png" });
  await page.close();
}

console.log(`\ncanary: ${canaryResult}`);
console.log(`traffic: blocked ${traffic.blocked.length}, ALLOWED ${traffic.allowed.length}`);
writeFileSync("reports/09b1c1/oauth-notice.json", JSON.stringify({ canary: canaryResult, traffic: { blocked: traffic.blocked.length, allowed: traffic.allowed.length }, out }, null, 2));
await context.close();
await browser.close();
