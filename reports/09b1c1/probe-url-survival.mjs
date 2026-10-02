/* The bounce erases the fragment. Does the document remember where it was
   loaded from anyway?

   `CustomerProtectedRoute` sends an unauthenticated reader away with
   `<Navigate to="/giris" replace />`, and a bare path carries no hash, so by
   the time `Login` mounts `location.hash` is empty — measured, not assumed
   (`reports/09b1c1/oauth-return-before.txt`, case `panel-fragment`).

   But `history.replaceState` changes the URL; it does not re-navigate. Several
   things in the platform hold the URL the DOCUMENT was fetched with, and if
   any of them keeps the fragment then the information is still reachable from
   the only file this packet lets me edit. This asks each of them. */
import { writeFileSync } from "node:fs";
import { launch, guard, canary, BASE } from "./probe-lib.mjs";

const FRAGMENT = "#error=server_error&error_code=validation_failed&error_description=Unsupported+provider";

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
const traffic = await guard(context, []);
const page = await context.newPage();
await page.goto(`${BASE}/musteri-paneli${FRAGMENT}`, { waitUntil: "load" });
const canaryResult = await canary(page, (m) => console.log(m));
await page.waitForTimeout(3000);

const survival = await page.evaluate(() => {
  const nav = performance.getEntriesByType("navigation")[0];
  return {
    locationHref: location.href,
    locationHash: location.hash,
    documentURL: document.URL,
    documentBaseURI: document.baseURI,
    navigationName: nav ? nav.name : null,
    navigationType: nav ? nav.type : null,
    referrer: document.referrer,
    historyLength: history.length,
    historyState: JSON.stringify(history.state)?.slice(0, 200) ?? null,
  };
});

console.log(JSON.stringify(survival, null, 2));
const keeps = Object.entries(survival).filter(([, v]) => typeof v === "string" && v.includes("error=server_error"));
console.log(`\nsources that still carry the error: ${keeps.length ? keeps.map(([k]) => k).join(", ") : "NONE"}`);
console.log(`traffic: blocked ${traffic.blocked.length}, ALLOWED ${traffic.allowed.length}`);

writeFileSync("reports/09b1c1/url-survival.json", JSON.stringify({ canary: canaryResult, survival, keeps: keeps.map(([k]) => k) }, null, 2));
await page.close();
await context.close();
await browser.close();
