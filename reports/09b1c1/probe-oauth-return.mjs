/* WHERE DOES A FAILED OAUTH RETURN ACTUALLY LAND, AND WHAT SURVIVES THE TRIP?
   ══════════════════════════════════════════════════════════════════════════
   Read statically from the installed SDK (`@supabase/auth-js` 2.95.3):

     GoTrueClient.js:13-24   DEFAULT_OPTIONS flowType: 'implicit'
     src/integrations/supabase/client.ts sets no flowType, so an OAuth error
     comes back in the FRAGMENT, not the query string.

     GoTrueClient.js:1551-1556  `_isImplicitGrantCallback` is true when
     `error_description` is present, so the client treats the return as a
     callback and calls `_getSessionFromURL`.

     GoTrueClient.js:1462-1468  that function throws on `error` /
     `error_description` / `error_code` BEFORE either of its two URL-clearing
     paths (`searchParams.delete('code')` at :1494, `location.hash = ''` at
     :1533). So on the failure path the parameters are still in the URL.

     GoTrueClient.js:273-285  `_initialize()` receives the error and returns
     `{ error }`. Nothing consumes the result of `initialize()`. The error is
     dropped on the floor.

   All of that says the information is IN THE URL when the app boots. What it
   does not say is whether it is still there when the reader can be told about
   it — `signInWithOAuth` is called with `redirectTo: {origin}/musteri-paneli`,
   which is a protected route, and an unauthenticated reader is bounced from it
   by `CustomerProtectedRoute` with `<Navigate to="/giris" replace />`.

   THIS PROBE ASKS THE BROWSER INSTEAD OF REASONING ABOUT IT. It drives the
   exact failure shape GoTrue's `redirectErrors` produces, offline, with every
   non-loopback request aborted and the guard proven first, and prints the URL
   at each hop. No auth call is made: the client never reaches the network on
   this path, and the guard would abort it if it tried. */
import { writeFileSync } from "node:fs";
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

/* The shape GoTrue's `redirectErrors` sends back for a provider that is not
   enabled, URL-encoded exactly as it arrives. */
const FRAGMENT =
  "#error=server_error&error_code=validation_failed"
  + "&error_description=Unsupported+provider%3A+provider+is+not+enabled";

const CASES = [
  { name: "panel-fragment", path: `/musteri-paneli${FRAGMENT}` },
  { name: "login-fragment", path: `/giris${FRAGMENT}` },
  { name: "login-query", path: "/giris?error=access_denied&error_code=provider_email_needs_verification&error_description=Email+not+verified" },
];

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const traffic = await guard(context, []);
const rows = [];
let canaryResult = null;

for (const testCase of CASES) {
  const page = await context.newPage();
  const hops = [];
  page.on("framenavigated", (frame) => { if (frame === page.mainFrame()) hops.push(frame.url()); });
  await page.goto(`${BASE}${testCase.path}`, { waitUntil: "load" });
  if (canaryResult === null) canaryResult = await canary(page, (m) => console.log(m));
  await page.waitForTimeout(2500);

  const state = await page.evaluate(() => ({
    href: location.href,
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    notice: Array.from(document.querySelectorAll(".shell-notice")).map((n) => n.textContent.replace(/\s+/g, " ").trim().slice(0, 140)),
    heading: (document.querySelector("h1")?.textContent ?? "").trim(),
  }));
  rows.push({ case: testCase.name, entered: testCase.path, hops, ...state });
  console.log(`\n── ${testCase.name} ──`);
  console.log(`  entered  ${testCase.path}`);
  console.log(`  hops     ${hops.join("  ->  ")}`);
  console.log(`  landed   ${state.pathname}${state.search}${state.hash}`);
  console.log(`  h1       ${state.heading}`);
  console.log(`  notices  ${state.notice.length ? state.notice.join(" || ") : "(none)"}`);
  await page.close();
}

console.log(`\ncanary: ${canaryResult}`);
console.log(`traffic: blocked ${traffic.blocked.length}, ALLOWED ${traffic.allowed.length}`);
console.log(`blocked hosts: ${[...new Set(traffic.blocked.map((u) => { try { return new URL(u).hostname; } catch { return u; } }))].join(", ")}`);

writeFileSync(
  "reports/09b1c1/oauth-return.json",
  JSON.stringify({ canary: canaryResult, traffic: { blocked: traffic.blocked, allowed: traffic.allowed }, rows }, null, 2),
);
await context.close();
await browser.close();
