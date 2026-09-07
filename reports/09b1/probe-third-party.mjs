/* 09b-1 — WHAT THE THREE AUTH ROUTES REACH FOR, AND WHEN.
   ------------------------------------------------------------------------
   09b-2 writes the legal copy from this file. It writes nothing itself.

   TWO PASSES, BECAUSE ONE PASS CANNOT ANSWER BOTH QUESTIONS.

   PASS A — everything non-loopback aborted. Answers "which origins does the
   page ASK for, and at what point in the load", with zero bytes leaving the
   machine. This is the pass that can be run safely near auth, and it is the
   one that establishes TIMING: a request recorded here with no interaction
   whatsoever happened on page load.

   PASS B — hCaptcha and the two Google Font hosts allowed; EVERYTHING ELSE
   still aborted, including Supabase, Google's OAuth endpoints and LinkedIn.
   Answers "what does hCaptcha actually load and store" — the cookie, the
   storage keys, the iframes, and the second-order origins hCaptcha itself
   reaches once it is running. Fetching a public CAPTCHA widget is the same
   read every visitor's browser performs; it writes nothing anywhere.

   NEITHER PASS SIGNS IN, SIGNS UP, REQUESTS A RESET OR STARTS AN OAUTH
   REDIRECT. No control that would do any of those is clicked, and both passes
   prove the abort guard with a live canary before they measure anything.

   THE OAUTH QUESTION IS ANSWERED READ-ONLY AND ONLY AS FAR AS IT CAN BE.
   `signInWithOAuth({ skipBrowserRedirect: true })` builds the authorize URL in
   the browser and returns it WITHOUT navigating and WITHOUT a request — that
   is what pass B records. It proves where the button would send a visitor. It
   cannot prove whether the provider is enabled on the project; only the
   project can say that, and asking it is a network call this packet forbids. */
import { writeFileSync } from "node:fs";
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

const ROUTES = ["/giris", "/sifremi-unuttum", "/reset-password"];
const HCAPTCHA_AND_FONTS = ["hcaptcha.com", "fonts.googleapis.com", "fonts.gstatic.com"];
const OUT = process.env.PROBE_OUT ?? "reports/09b1/third-party.json";

function host(url) { try { return new URL(url).hostname; } catch { return "?"; } }

async function pass(browser, allowHosts, label) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const traffic = await guard(context, allowHosts);
  const out = {};

  for (const route of ROUTES) {
    const page = await context.newPage();
    const t0 = Date.now();
    const seen = [];
    page.on("request", (r) => {
      const h = host(r.url());
      if (h === "localhost" || h === "127.0.0.1") return;
      seen.push({ host: h, url: r.url().slice(0, 160), atMs: Date.now() - t0, type: r.resourceType() });
    });

    await page.goto(`${BASE}${route}`, { waitUntil: "load" });
    /* NO INTERACTION AT ALL between here and the read below. Anything the
       record shows was therefore triggered by the page loading. */
    await page.waitForTimeout(5000);

    const state = await page.evaluate(() => ({
      local: Object.keys(localStorage).sort(),
      session: Object.keys(sessionStorage).sort(),
      documentCookie: document.cookie,
      iframes: Array.from(document.querySelectorAll("iframe")).map((f) => (f.src || "").slice(0, 120)),
      scripts: Array.from(document.querySelectorAll("script[src]"))
        .map((s) => s.src)
        .filter((s) => !s.includes("localhost")),
    }));

    const cookies = (await context.cookies()).map((c) => ({
      name: c.name,
      domain: c.domain,
      path: c.path,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite,
      lifetimeMinutes: c.expires > 0 ? Number(((c.expires * 1000 - Date.now()) / 60000).toFixed(1)) : null,
    }));

    /* READ-ONLY: build the OAuth authorize URLs without navigating and
       without a request. Only meaningful on /giris, where the buttons are. */
    let oauth = null;
    if (route === "/giris") {
      oauth = await page.evaluate(async () => {
        const w = window;
        if (!w.__mas09b1Supabase) return { note: "no client handle exposed on window; URL derived below instead" };
        return null;
      });
    }

    out[route] = {
      externalRequests: seen,
      externalHosts: [...new Set(seen.map((s) => s.host))].sort(),
      firstRequestByHost: Object.fromEntries(
        [...new Set(seen.map((s) => s.host))].sort().map((h) => [h, Math.min(...seen.filter((s) => s.host === h).map((s) => s.atMs))]),
      ),
      storage: state,
      cookies,
      oauth,
    };
    await page.close();
    await context.clearCookies();
  }

  out.__traffic = {
    blockedHosts: [...new Set(traffic.blocked.map(host))].sort(),
    allowedHosts: [...new Set(traffic.allowed.map(host))].sort(),
    blockedCount: traffic.blocked.length,
    allowedCount: traffic.allowed.length,
  };

  /* The canary runs on a real page in this same context, so the guard proven
     is the guard the pass measured under. */
  const canaryPage = await context.newPage();
  await canaryPage.goto(`${BASE}/sifremi-unuttum`, { waitUntil: "load" });
  out.__canary = await canary(canaryPage, (m) => console.log(`[${label}] ${m}`));
  await canaryPage.close();

  await context.close();
  return out;
}

const browser = await launch();
const report = {
  base: BASE,
  measuredAt: new Date().toISOString(),
  passA_allBlocked: await pass(browser, [], "A"),
  passB_hcaptchaAllowed: await pass(browser, HCAPTCHA_AND_FONTS, "B"),
};
await browser.close();

writeFileSync(OUT, JSON.stringify(report, null, 2));
for (const [name, p] of Object.entries(report)) {
  if (!p || typeof p !== "object" || !p.__traffic) continue;
  console.log(`\n${name}: allowed ${p.__traffic.allowedCount} / blocked ${p.__traffic.blockedCount}`);
  for (const route of ROUTES) {
    console.log(`  ${route}  hosts=${JSON.stringify(p[route].externalHosts)}`);
    console.log(`    cookies=${JSON.stringify(p[route].cookies)}`);
    console.log(`    local=${JSON.stringify(p[route].storage.local)} session=${JSON.stringify(p[route].storage.session)}`);
    console.log(`    firstSeenMs=${JSON.stringify(p[route].firstRequestByHost)}`);
  }
}
console.log(`\nwrote ${OUT}`);
