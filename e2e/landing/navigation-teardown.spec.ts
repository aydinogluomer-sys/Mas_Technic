import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle, waitForHeroShellTeardown } from "../helpers";

/**
 * THE MENU MUST BE ESCAPABLE — ON EVERY PATH, IN EVERY MOTION MODE.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Phase 03 shipped a menu that, under `prefers-reduced-motion: reduce`, could
 * be opened but never closed: a permanent modal trap — WCAG 2.1 SC 2.1.2, on
 * the site's only navigation, hitting exactly the readers the reduced-motion
 * path exists to serve. Every gate stayed green because the matrix held both
 * halves of the combination and never the combination itself:
 *
 *   - `e2e/fullscreen-menu.spec.ts` opened AND closed — without reduced motion.
 *   - `e2e/fullscreen-menu.spec.ts` opened under reduced motion — and never
 *     closed.
 *   - `e2e/visual/navigation-golden.spec.ts` opened under reduced motion — and
 *     only photographed the open state.
 *
 * So the axis under test here is a PRODUCT, never one variable alone:
 * motion mode × close mechanism × shell (landing / inner page). The viewport is
 * the fourth factor and comes from the project matrix — this file lives under
 * `e2e/landing/**`, so `critical-1280` and `critical-375` gate it and every
 * regression viewport (320 included) re-runs it.
 *
 * WHAT "CLOSED" MEANS HERE
 * ------------------------
 * Not "the sheet is gone". A modal latches several things at once, and a
 * teardown that releases all but one still strands the reader. So the page
 * state is measured BEFORE the menu opens and must be restored EXACTLY:
 * sheet out of the DOM, `body`/`html` overflow back to their prior values,
 * `#root` and the header bar free of `inert` and `aria-hidden`. On top of that
 * the reader's own wheel must move the page again, and dismissal must put
 * focus back on the trigger (a navigation path deliberately hands focus to the
 * incoming page instead).
 */

const LANDING = "/";
const INNER = "/hakkimizda";
/** Distinct from both shells, so "it navigated" is unambiguous either way. */
/* Revision 4: reached through the flat 04 Kurumsal family (4th rail entry). */
const DESTINATION = { label: "Sık Sorulan Sorular", path: "/sss" } as const;

const ROUTES = [
  { name: "landing", path: LANDING },
  { name: "inner page", path: INNER },
] as const;

type Latches = {
  menuCount: number;
  bodyOverflow: string;
  htmlOverflow: string;
  rootInert: boolean;
  rootAriaHidden: string | null;
  headerInert: boolean;
  headerAriaHidden: string | null;
};

const readLatches = (page: Page): Promise<Latches> => page.evaluate(() => {
  const root = document.getElementById("root");
  const header = document.querySelector("[data-fullscreen-header]");
  return {
    menuCount: document.querySelectorAll("[data-fullscreen-menu]").length,
    bodyOverflow: getComputedStyle(document.body).overflow,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    rootInert: !!root?.hasAttribute("inert"),
    rootAriaHidden: root?.getAttribute("aria-hidden") ?? null,
    headerInert: !!header?.hasAttribute("inert"),
    headerAriaHidden: header?.getAttribute("aria-hidden") ?? null,
  };
});

async function arrive(page: Page, path: string) {
  await gotoAndSettle(page, path);
  if (path === LANDING) await waitForHeroShellTeardown(page);
  await expect(page.locator("[data-fullscreen-header]")).toHaveCount(1);
  const before = await readLatches(page);
  // A trap cannot be "released" into a state that was already trapped.
  expect(before.menuCount).toBe(0);
  expect(before.rootInert).toBe(false);
  expect(before.rootAriaHidden).toBeNull();
  expect(before.htmlOverflow).not.toBe("hidden");
  return before;
}

async function openMenu(page: Page) {
  const trigger = page.locator("[data-menu-trigger]");
  await expect(trigger).toBeVisible();
  await trigger.click();
  const menu = page.locator("[data-fullscreen-menu]");
  await expect(menu).toBeVisible();
  // The latches must really be ON, or their release proves nothing.
  await expect(page.locator("html")).toHaveCSS("overflow", "hidden");
  await expect(page.locator("#root")).toHaveAttribute("inert", "");
  await expect(page.locator("#root")).toHaveAttribute("aria-hidden", "true");
  return menu;
}

/**
 * Polled rather than sampled once: the release is allowed to take an
 * animation's worth of time; it is not allowed to never happen. 12s is the
 * order the QA probe waited before declaring the trap permanent, and ~19x the
 * 0.62s exit this menu actually animates.
 */
async function expectFullyReleased(page: Page, before: Latches) {
  await expect.poll(() => readLatches(page), {
    timeout: 12_000,
    intervals: [100, 250, 500, 1000],
    message: "closing the menu must release every latch it took",
  }).toEqual(before);

  // Released `overflow` is a claim about styles. This is the reader's own
  // input actually moving the page again.
  //
  // Polled, not sampled: on the navigation paths the destination is a lazily
  // loaded route chunk, so the document is briefly shorter than the viewport
  // while it mounts. MEASURED — under reduced motion the whole close settles
  // in one task, so a single sample here read `scrollHeight <= innerHeight`
  // and failed on a page that is in fact 4x the viewport a moment later.
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollHeight > window.innerHeight + 8), {
    timeout: 15_000,
    intervals: [100, 250, 500],
    message: "the route under test must become tall enough to prove scrolling",
  }).toBe(true);
  await expect.poll(async () => {
    await page.mouse.wheel(0, 600);
    return page.evaluate(() => Math.round(window.scrollY));
  }, {
    timeout: 10_000,
    intervals: [200, 400, 800],
    message: "a real wheel gesture must move the page once the menu is closed",
  }).toBeGreaterThan(0);
}

for (const motion of [
  { name: "reduced motion", media: "reduce" },
  { name: "full motion", media: "no-preference" },
] as const) {
  test.describe(`global navigation teardown — ${motion.name}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: motion.media });
    });

    for (const route of ROUTES) {
      test(`Escape closes and fully releases on the ${route.name}`, async ({ page }) => {
        const before = await arrive(page, route.path);
        const trigger = page.locator("[data-menu-trigger]");
        await openMenu(page);
        await page.keyboard.press("Escape");
        await expectFullyReleased(page, before);
        await expect(trigger, "dismissal must return focus to the trigger").toBeFocused();
        expect(new URL(page.url()).pathname).toBe(route.path);
      });

      test(`the close button closes and fully releases on the ${route.name}`, async ({ page }) => {
        const before = await arrive(page, route.path);
        const trigger = page.locator("[data-menu-trigger]");
        const menu = await openMenu(page);
        await menu.getByRole("button", { name: "Menüyü kapat" }).click();
        await expectFullyReleased(page, before);
        await expect(trigger, "dismissal must return focus to the trigger").toBeFocused();
        expect(new URL(page.url()).pathname).toBe(route.path);
      });

      test(`a menu link navigates and fully releases on the ${route.name}`, async ({ page }) => {
        const before = await arrive(page, route.path);
        const menu = await openMenu(page);
        await menu.locator("button[aria-pressed]:not([lang])").nth(3).click();
        await menu.getByRole("link", { name: DESTINATION.label, exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`${DESTINATION.path}$`));
        await expectFullyReleased(page, before);
      });
    }
  });
}
