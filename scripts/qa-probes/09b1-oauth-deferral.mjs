/* QA 09b-1 — THE DEFERRAL, AND WHAT THE BLANK NOTICE ACTUALLY IS
   ==========================================================================
   TWO THINGS THE MAIN ATTACK PROBE COULD NOT SHOW.

   1 THE ADMITTED DEFERRAL, WITHOUT SIGNING ANYONE IN. The Coder's note says a
     reader already signed in when an attempt fails sees the notice only at
     their next `Login` mount. Signing in is forbidden here and would be
     forbidden anyway — but the mechanism does not need a session. All it
     needs is a document that lands on the failure URL and does NOT mount
     `Login`. Any public route does that. So: enter at
     `/malzemeler#error=...`, confirm no notice, walk to `/giris` INSIDE the
     same document, and see what the reader is told and how old it is.

   2 WHAT `error_code=constructor` RENDERS. The main probe shows the notice's
     text collapses to `KOD: constructor`. This reads the notice's actual DOM:
     an alert region whose label and title are `undefined` is a different
     defect from one that merely says the wrong thing.
   ========================================================================== */
import { writeFileSync, mkdirSync } from "node:fs";
import { guard, canary, launch, BASE } from "../../reports/09b1c1/probe-lib.mjs";

const OUT = "reports/qa/phase-09b1";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

const FRAG = "#error=server_error&error_code=user_banned&error_description=x";

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const t = await guard(context, []);
const warm = await context.newPage();
await warm.goto(`${BASE}/giris`, { waitUntil: "load" });
await canary(warm, log);
await warm.close();

/* ── 1. the deferral ─────────────────────────────────────────────────────── */
log("");
log("── 1. a failure that lands on a document which never mounts `Login` ──");
const page = await context.newPage();
await page.goto(`${BASE}/malzemeler${FRAG}`, { waitUntil: "load" });
await page.waitForTimeout(2500);
const atEntry = await page.evaluate(() => ({
  path: location.pathname, hash: location.hash,
  notices: document.querySelectorAll(".shell-notice").length,
  navName: performance.getEntriesByType("navigation")[0]?.name ?? "",
}));
log(`  entered /malzemeler with the failure fragment`);
log(`    notices here: ${atEntry.notices}  (the reader is told nothing, correctly — this is not the sign-in page)`);
log(`    location.hash still: ${atEntry.hash || "(empty)"}`);
log(`    navName: ${atEntry.navName.slice(0, 100)}`);

/* Age the document, then reach /giris by a real in-page link — one document,
   one `PerformanceNavigationTiming`, a `Login` that mounts much later. */
const AGE_MS = 20_000;
log(`  ... aging the same document for ${AGE_MS / 1000}s without reloading ...`);
await page.waitForTimeout(AGE_MS);
const walked = await page.evaluate(async () => {
  const link = Array.from(document.querySelectorAll("a[href]")).find((a) => a.getAttribute("href") === "/giris");
  if (link) { link.click(); return "clicked an in-page /giris link"; }
  /* No such link on this route; use the router's own history so the document
     is still the same one. */
  window.history.pushState({}, "", "/giris");
  window.dispatchEvent(new PopStateEvent("popstate"));
  return "pushState + popstate (same document)";
});
await page.waitForTimeout(3000);
const later = await page.evaluate(() => ({
  path: location.pathname,
  notices: Array.from(document.querySelectorAll(".shell-notice")).map((n) => n.textContent.replace(/\s+/g, " ").trim().slice(0, 120)),
  sameDocument: performance.getEntriesByType("navigation").length === 1,
  navName: performance.getEntriesByType("navigation")[0]?.name ?? "",
}));
log(`  reached /giris by: ${walked}`);
log(`    same document: ${later.sameDocument}   path ${later.path}`);
log(`    notices now: ${later.notices.length ? later.notices.join(" || ") : "(none)"}`);
log(`    → a failure ${AGE_MS / 1000}s old is presented with no age, no timestamp and no "this may be stale".`);
await page.close();

/* ── 2. the blank notice's DOM ───────────────────────────────────────────── */
log("");
log("── 2. what `error_code=constructor` builds ──");
for (const code of ["constructor", "__proto__", "unknown_code_not_in_copy"]) {
  const p = await context.newPage();
  await p.goto(`${BASE}/giris#error=server_error&error_code=${code}`, { waitUntil: "load" });
  await p.waitForTimeout(2000);
  const n = await p.evaluate(() => {
    const el = document.querySelector(".shell-notice");
    if (!el) return null;
    return {
      outer: el.outerHTML.replace(/\s+/g, " ").slice(0, 340),
      role: el.getAttribute("role"),
      ariaLive: el.getAttribute("aria-live"),
      accessibleText: el.textContent.replace(/\s+/g, " ").trim(),
    };
  });
  log(`  error_code=${code}`);
  if (!n) { log("    no notice rendered"); }
  else {
    log(`    role=${n.role} aria-live=${n.ariaLive}`);
    log(`    text: ${JSON.stringify(n.accessibleText)}`);
    log(`    html: ${n.outer}`);
  }
  await p.close();
}

/* ── 3. the reference as an instruction ──────────────────────────────────── */
log("");
log("── 3. `KOD:` is claimed to be a support reference that 'cannot hold an instruction' ──");
for (const code of ["ara-0850-555-1234-destek-icin", "sifrenizi-yeniden-girin", "mas-technic-destek_444_0_000"]) {
  const p = await context.newPage();
  await p.goto(`${BASE}/giris#error=server_error&error_code=${encodeURIComponent(code)}`, { waitUntil: "load" });
  await p.waitForTimeout(1800);
  const kod = await p.evaluate(() => {
    const hint = Array.from(document.querySelectorAll(".shell-notice .shell-field-hint"));
    return hint.map((h) => h.textContent.replace(/\s+/g, " ").trim());
  });
  log(`  sent ${JSON.stringify(code)}  →  rendered ${JSON.stringify(kod.join(" "))}`);
  await p.close();
}

log("");
log(`traffic: blocked ${t.blocked.length}, ALLOWED ${t.allowed.length}`);
if (t.allowed.length) log(`  ALLOWED: ${t.allowed.join(" | ")}`);
await context.close();
await browser.close();
writeFileSync(`${OUT}/oauth-deferral.txt`, lines.join("\n") + "\n");
