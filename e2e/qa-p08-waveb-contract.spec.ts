import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { caseStudies } from "../src/content/caseStudies";
import { gotoAndSettle, measureHorizontalOverflow, settleRendering } from "./helpers";

/* ══════════════════════════════════════════════════════════════════════════
   QA-OWNED — PHASE 08 WAVE B SURFACE CONTRACT

   WHY THIS FILE EXISTS AT ALL, given `e2e/shared-shell-accessibility.spec.ts`
   already grew to a 99-path inventory in this phase.

   That file proves SHELL ownership across 99 paths (one header, one footer,
   one `<main id="main-content">`). Its axe lanes are narrower than that:

     · `has no serious or critical axe violations in the closed shared shell`
       scopes AxeBuilder to `[data-fullscreen-header]` and `footer`, so it
       measures the SHELL and deliberately not the page body;
     · `records whole-page axe evidence and isolates documented non-shell debt`
       is a whole-page scan, but of ONE route — `/sss` — and it is skipped on
       every project except `desktop-1280`.

   So of the six surfaces Phase 08 created or rewrote, exactly one — `/sss` —
   has ever been through a whole-page axe run in the repository suite.
   `/kabiliyet-profilleri`, its detail route, `/kalite-dosyasi`, `/blog`, the
   three legal documents and the 404 catch-all body have not. Phase 07's
   blocking finding F3 was a MISSING `<h1>` on new surfaces; nothing in the
   suite asserts the `<h1>` count on the surfaces Phase 08 added, either.

   This file closes exactly that gap and nothing else. It adds no assertion the
   repository already makes, and it weakens none.

   THE FOUR CONTRACTS
   ------------------
   1. EXACTLY ONE `<h1>`, on every Phase 08 surface including both not-found
      bodies. One, not "at least one": two `<h1>`s is the same navigational
      defect as none for a screen-reader user moving by heading level.
   2. NO SERIOUS/CRITICAL AXE VIOLATION, whole page, per surface. Only
      `violations` are read — `incomplete` is axe declining to decide and is
      not evidence of a failure.
   3. REFLOW AT 320 CSS px (SC 1.4.10): no horizontal scroll on any surface.
      Measured as `scrollWidth - clientWidth` on the document element, the same
      instrument `e2e/helpers.ts` already publishes, so this file and the
      repository suite cannot disagree about what overflow means.
   4. THE `/sss` REGISTER IS KEYBOARD-OPERABLE WITH NO TRAP (SC 2.1.2): a
      `<details>` must open from the keyboard, and Tab must be able to leave
      the register and reach the page's own next-step action.

   The route curtain is waited out the same way the repository suite waits it
   out, and for the same measured reason recorded there: axe run mid-transition
   reports `color-contrast` nodes belonging to the curtain and not to the page.
   ══════════════════════════════════════════════════════════════════════════ */

/** Every public surface Phase 08 created or rewrote. */
const WAVE_B_ROUTES = [
  "/kabiliyet-profilleri",
  ...caseStudies.map((study) => `/kabiliyet-profilleri/${study.slug}`),
  "/kabiliyet-profilleri/__qa-no-such-profile__",
  "/kalite-dosyasi",
  "/blog",
  "/blog/5-eksen-cnc-isleme-avantajlari",
  "/blog/__qa-no-such-post__",
  "/sss",
  "/kvkk",
  "/gizlilik-politikasi",
  "/cerez-politikasi",
  /* Both 404 branches. `/kalite-dosyas` scores against the real IA and renders
     the populated YAKIN KAYITLAR block; `/qa-zzz-nothing` scores nothing and
     renders the empty branch, which is the one no one looks at. */
  "/kalite-dosyas",
  "/qa-zzz-nothing",
] as const;

/** Wait for `PageTransition`'s curtain to finish before measuring anything. */
async function settleRouteCurtain(page: Page) {
  const curtain = page.locator("[data-route-curtain-label]");
  if (await curtain.count() === 0) return;
  await expect
    .poll(
      () => page.evaluate(() => {
        const element = document.querySelector("[data-route-curtain-label]");
        return element ? Number(getComputedStyle(element).opacity) : 0;
      }),
      { message: "measurements must be taken on a settled page", timeout: 20_000 },
    )
    .toBe(0);
}

test.describe("QA — Phase 08 Wave B surface contract", () => {
  for (const route of WAVE_B_ROUTES) {
    test(`exposes exactly one <h1> on ${route}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "desktop-1280", "one canonical heading lane");
      await gotoAndSettle(page, route);
      await settleRouteCurtain(page);
      const headings = page.locator("main#main-content h1");
      await expect(headings, `${route} must publish exactly one <h1>`).toHaveCount(1);
      await expect(headings.first()).toBeVisible();
      const text = (await headings.first().innerText()).trim();
      expect(text.length, `${route} <h1> must not be empty`).toBeGreaterThan(2);
    });
  }

  for (const route of WAVE_B_ROUTES) {
    test(`has no serious or critical axe violation on ${route}`, async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "desktop-1280" && testInfo.project.name !== "mobile-375",
        "two canonical whole-page axe lanes",
      );
      await gotoAndSettle(page, route);
      await settleRouteCurtain(page);
      await settleRendering(page);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      // `incomplete` is deliberately not read: it is axe declining to decide.
      const blocking = result.violations.filter(
        (violation) => violation.impact === "serious" || violation.impact === "critical",
      );
      await testInfo.attach(`axe-${route.replace(/\W+/g, "_")}.json`, {
        body: JSON.stringify(blocking, null, 2),
        contentType: "application/json",
      });
      expect(
        blocking.map((violation) => `${violation.id} x${violation.nodes.length}`),
        `${route} must carry no serious/critical axe violation`,
      ).toEqual([]);
    });
  }

  for (const route of WAVE_B_ROUTES) {
    test(`reflows without horizontal scroll at 320 CSS px on ${route}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== "mobile-320", "SC 1.4.10 is measured at 320 CSS px");
      await gotoAndSettle(page, route);
      await settleRouteCurtain(page);
      await settleRendering(page);
      const overflow = await measureHorizontalOverflow(page);
      expect(overflow, `${route} must not scroll horizontally at 320 CSS px`).toBeLessThanOrEqual(1);
    });
  }

  test("keeps the /sss register keyboard-operable and free of a focus trap", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1280", "one canonical keyboard lane");
    await gotoAndSettle(page, "/sss");
    await settleRouteCurtain(page);

    const summaries = page.locator("main#main-content details.shell-faq-item > summary");
    const registerSize = await summaries.count();
    expect(registerSize, "the register must actually be populated").toBeGreaterThan(50);

    // A disclosure must open from the keyboard, not only from the mouse.
    const first = summaries.first();
    await first.scrollIntoViewIfNeeded();
    await first.focus();
    await expect(first).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content details.shell-faq-item").first())
      .toHaveAttribute("open", "");
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content details.shell-faq-item").first())
      .not.toHaveAttribute("open", "");

    // SC 2.1.2 — focus must be able to LEAVE the register by keyboard alone.
    // Bounded: the register is large, so the bound is the register size plus
    // slack, and the assertion is that focus escapes it, not how fast.
    let escaped = false;
    for (let step = 0; step < registerSize + 40; step += 1) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() =>
        !!document.activeElement?.closest("details.shell-faq-item"));
      if (!inside) { escaped = true; break; }
    }
    expect(escaped, "Tab must be able to leave the /sss disclosure register").toBe(true);
  });
});
