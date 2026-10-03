import { expect, type Page, type Request, type Route } from "@playwright/test";

/* ═══════════════════════════════════════════════════════════════════════════
   QA 09a-R2 — NETWORK SEAL

   Earlier in this phase an agent wrote four rows to `public.rfqs` and three
   objects to `cad-uploads` on the customer's PRODUCTION database, by trusting
   this repository's copy of an edge function that the deployed one does not
   match. The packet's prohibition is absolute and this file is how it is kept
   structurally rather than by intention.

   This seal is STRICTER than round 1's: round 1 needed synthetic responses
   because it exercised the submit path. Round 2 does not go near the submit
   path at all, so there is no `fakes` parameter and no fulfil branch — every
   non-loopback request is either the font CDN or aborted. There is no code
   path in this file that can forward a request to Supabase.

   `assertSealed()` fires a LIVE CANARY at a non-loopback host and requires it
   to fail before the test touches any control. Proving the seal beats
   asserting it.
   ══════════════════════════════════════════════════════════════════════════ */

export const CANARY = "https://example.com/qa-p09a2-network-seal-canary";

/**
 * The one off-origin allowance. `index.html` loads Space Grotesk / IBM Plex
 * Mono / Newsreader from Google Fonts; aborting them would make every
 * measurement describe a fallback-font layout instead of the page. Both are
 * public read-only CDNs, neither is the configured Supabase project, and no
 * GET to them can create a row or an object.
 */
/* C1 — fonts are self-hosted now, so NO off-origin host is allowed out: a
   request to fonts.googleapis.com / fonts.gstatic.com would mean the page
   went back to Google for type, and that must fail here. */
const FONT_HOSTS = new Set<string>();

export type Seal = {
  /** Off-origin URLs the page attempted; none was forwarded. */
  blocked: string[];
  /** Off-origin requests deliberately allowed out: font CDN only. */
  passed: string[];
  /** Must stay empty. */
  escaped: string[];
};

function isLoopback(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
  } catch {
    return false;
  }
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export async function sealNetwork(page: Page): Promise<Seal> {
  const seal: Seal = { blocked: [], passed: [], escaped: [] };
  await page.route("**/*", async (route: Route, request: Request) => {
    const url = request.url();
    if (isLoopback(url) || url.startsWith("data:") || url.startsWith("blob:")) {
      await route.fallback();
      return;
    }
    if (FONT_HOSTS.has(hostOf(url)) && request.method() === "GET") {
      seal.passed.push(`${request.method()} ${url}`);
      await route.fallback();
      return;
    }
    seal.blocked.push(`${request.method()} ${url}`);
    await route.abort("blockedbyclient");
  });
  return seal;
}

/** Proves the seal is live. Call before anything that could conceivably write. */
export async function assertSealed(page: Page, seal: Seal): Promise<void> {
  const reached = await page.evaluate(async (url) => {
    try {
      await fetch(url, { method: "GET", mode: "no-cors" });
      return true;
    } catch {
      return false;
    }
  }, CANARY);
  expect(reached, "live canary to a non-loopback host must be blocked").toBe(false);
  expect(
    seal.blocked.some((e) => e.includes("qa-p09a2-network-seal-canary")),
    "the canary must appear in the blocked ledger",
  ).toBe(true);
  expect(seal.escaped, "nothing may escape the seal").toEqual([]);
  const passedHosts = [...new Set(seal.passed.map((e) => hostOf(e.split(" ")[1])))].sort();
  for (const h of passedHosts) {
    expect(FONT_HOSTS.has(h), `only the font CDN may be reached off-origin, saw ${h}`).toBe(true);
  }
}

/** Asserts no Supabase host was ever contacted, at the end of a test. */
export function assertNoSupabaseContact(seal: Seal): void {
  const supa = [...seal.blocked, ...seal.passed].filter((e) => /supabase/i.test(e));
  // Blocked entries are fine as evidence the app TRIED; passed must be empty.
  const escapedSupa = seal.passed.filter((e) => /supabase/i.test(e));
  expect(escapedSupa, `a Supabase request escaped the seal: ${supa.join(", ")}`).toEqual([]);
}
