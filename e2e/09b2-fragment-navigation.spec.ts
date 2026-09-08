import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "./helpers";

/* ══════════════════════════════════════════════════════════════════════════
   PHASE 09b-2 — A CROSS-ROUTE HASH LINK MUST LAND ON ITS TARGET

   WHAT IT GUARDS
   --------------
   `src/components/ScrollToTop.tsx` used to destructure only `pathname` and end
   its effect with `requestAnimationFrame(() => window.scrollTo(0, 0))`. That
   line runs after the browser's own fragment handling, so it overrode it, and
   the app's ONE cross-route hash link — `/gizlilik-politikasi#sohbet-asistani`,
   rendered by `ChatBot.tsx` inside the AI-consent block — landed the reader at
   the top of a seven-clause document instead of at the clause the consent
   notice cites. Phase 08 measured the target 2115 px below a 900 px viewport.

   BOTH ENTRY PATHS ARE TESTED, BECAUSE THEY FAIL FOR DIFFERENT REASONS
     · full navigation to a pasted URL — the browser resolves the fragment at
       parse time, when the `lazy()` route has not mounted and the element does
       not exist. Restoring native behaviour alone fixes nothing here.
     · an SPA click — react-router pushes history and the browser performs no
       fragment scroll for a pushState at all.

   The SPA path is driven through the REAL affordance rather than a synthetic
   link: the chat launcher, an unmatched question, and the link inside the
   consent block. If that link is ever removed or re-worded, this test says so.

   NO NETWORK. Asking an unmatched question only sets `pendingAiPrompt` and
   renders the consent block — `callAi()` is reachable only from "Evet", which
   is never pressed here. Supabase is aborted at the route level regardless, so
   the phase's production-write prohibition holds by construction and not by
   the test's good behaviour.
   ══════════════════════════════════════════════════════════════════════════ */

const CLAUSE_ID = "sohbet-asistani";
const TARGET = `/gizlilik-politikasi#${CLAUSE_ID}`;

/** Distance from the top of the viewport to the top of the cited clause. */
async function clauseOffset(page: import("@playwright/test").Page) {
  return page.evaluate((id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    return {
      top: Math.round(el.getBoundingClientRect().top),
      viewport: window.innerHeight,
      documentHeight: document.documentElement.scrollHeight,
    };
  }, CLAUSE_ID);
}

test.describe("09b-2 — the fragment link lands on the clause it names", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical navigation lane");
    // Nothing in this file may reach the project. The chat endpoint is never
    // called on this path; the abort makes that a property of the run.
    await page.route(/supabase\.(co|in)/i, (route) => route.abort());
  });

  test("a full navigation to a pasted URL lands on the clause", async ({ page }) => {
    await gotoAndSettle(page, TARGET);

    await expect
      .poll(async () => (await clauseOffset(page))?.top ?? null, { timeout: 10_000 })
      .toBeLessThan(200);

    const measured = await clauseOffset(page);
    expect(measured, "the clause element must exist").not.toBeNull();
    // Proves the document really is long enough for the old defect to have
    // been a defect: a page that fits the viewport would pass vacuously.
    expect(measured!.documentHeight).toBeGreaterThan(measured!.viewport * 2);
    expect(measured!.top).toBeGreaterThan(-200);
    expect(page.url()).toContain(`#${CLAUSE_ID}`);
  });

  test("an SPA click from the chat consent block lands on the clause", async ({ page }) => {
    await gotoAndSettle(page, "/kvkk");

    await page.locator("[data-chat-launcher]").click();
    const message = page.getByLabel("Sohbet mesajı");
    await expect(message).toBeVisible();

    // Deliberately unmatchable by `findBestFaqMatch`: no token here is a
    // substring of, or contains, any FAQ keyword, so the score is 0.
    await message.fill("zzzqqq wwwvvv xxxyyy");
    await page.getByLabel("Mesajı gönder").click();

    const clauseLink = page.getByRole("link", { name: /madde 06/i });
    await expect(clauseLink).toBeVisible();
    await clauseLink.click();

    await expect
      .poll(async () => (await clauseOffset(page))?.top ?? null, { timeout: 10_000 })
      .toBeLessThan(200);

    const measured = await clauseOffset(page);
    expect(measured!.documentHeight).toBeGreaterThan(measured!.viewport * 2);
    expect(measured!.top).toBeGreaterThan(-200);
    expect(page.url()).toContain(`#${CLAUSE_ID}`);
  });

  test("a route change with no fragment still lands at the top", async ({ page }) => {
    await gotoAndSettle(page, TARGET);
    await expect.poll(async () => (await clauseOffset(page))?.top ?? null).toBeLessThan(200);

    // The regression the hash branch could plausibly cause: a plain
    // navigation that no longer resets the scroll offset.
    await page.getByRole("link", { name: "KVKK Aydınlatma Metni" }).first().click();
    await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBeLessThan(4);
  });
});
