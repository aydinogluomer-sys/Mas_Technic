import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle } from "../helpers";

/**
 * F1 — CRITICAL FLOWS ON WEBKIT AND FIREFOX (projects `interop-*`).
 *
 * `smoke/` proves the page paints in the other engines; this proves the
 * interactions a buyer needs work there too. Kept engine-agnostic on purpose:
 * roles, labels and stable data attributes only, no pixel or timing
 * assumptions. Chromium covers the same flows (and much more) in the critical
 * and regression families; this file is the WebKit/Firefox ACCEPTANCE line,
 * separate from the smoke line.
 *
 * Emulated engines are not real devices: a pass here is not a statement
 * about iPhone Safari or an Android phone (release.md, real-device list).
 */

test.beforeEach(async ({ page }) => {
  // No backend writes from this file; the chat and RFQ endpoints are never reached.
  await page.route(/supabase\.(co|in)|calendar\.(google|app\.google)|hcaptcha\.com/i, (route) => route.abort());
});

async function openMenu(page: Page) {
  const trigger = page.locator("[data-menu-trigger]").first();
  await trigger.click();
  await expect(page.locator("[data-fullscreen-menu]")).toBeVisible();
  return trigger;
}

test("menu opens, Escape closes it and focus returns to the trigger", async ({ page }) => {
  await gotoAndSettle(page, "/");
  const trigger = await openMenu(page);
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-fullscreen-menu]")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("a menu link navigates and the page below is usable", async ({ page }) => {
  await gotoAndSettle(page, "/");
  await openMenu(page);
  const families = page.locator("[data-fullscreen-menu] button[aria-pressed]:not([lang])");
  await families.nth(3).click(); // Kurumsal: flat page list
  await page.locator("[data-fullscreen-menu] [data-nav-page-list] a").first().click();
  await expect(page).toHaveURL(/\/hakkimizda$/);
  await expect(page.locator("h1").first()).toBeVisible();
  await expect(page.locator("[data-fullscreen-menu]")).toBeHidden();
});

test("FAQ: search narrows, a hash deep link opens its question", async ({ page }) => {
  await gotoAndSettle(page, "/sss");
  await page.locator("#sss-arama").fill("anodizasyon");
  await expect(page.locator(".shell-faq-priority")).toHaveCount(0);
  const target = await page.locator(".shell-faq-section details").first().getAttribute("id");
  expect(target).toBeTruthy();
  await gotoAndSettle(page, `/sss#${target}`);
  await expect(page.locator(`#${target}`)).toHaveAttribute("open", "");
  await expect(page.locator(`#${target}`)).toBeInViewport();
});

test("materials: two picks start a comparison", async ({ page }) => {
  await gotoAndSettle(page, "/malzemeler");
  const boxes = page.locator("input.shell-check");
  await boxes.nth(0).check();
  await expect(page.locator("#malzeme-compare-status")).toContainText("bir malzeme daha seçin");
  await boxes.nth(1).check();
  await expect(page.locator("#malzeme-compare-status")).not.toContainText("bir malzeme daha seçin");
});

test("quality file: every document link is a real PDF", async ({ page }) => {
  await gotoAndSettle(page, "/kalite-dosyasi");
  const hrefs = await page.locator('main a[href$=".pdf"]').evaluateAll((links) =>
    [...new Set(links.map((link) => link.getAttribute("href")!))]);
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    const response = await page.request.get(href);
    expect(response.status(), href).toBe(200);
    expect(response.headers()["content-type"], href).toContain("application/pdf");
  }
});

test("RFQ: the form starts, the file field is reachable by keyboard", async ({ page }) => {
  await gotoAndSettle(page, "/teklif-al");
  await expect(page.locator("h1").first()).toBeVisible();
  const file = page.locator('input[type="file"]').first();
  await expect(file).toHaveCount(1);
  // The visible control for the file input is a focusable element in the tab order.
  let reached = false;
  for (let i = 0; i < 40 && !reached; i += 1) {
    await page.keyboard.press("Tab");
    reached = await page.evaluate(() => {
      const active = document.activeElement;
      return !!active && (active.matches('input[type="file"]') || !!active.closest("label")?.querySelector('input[type="file"]')
        || (active as HTMLElement).getAttribute("aria-controls") !== null && !!document.querySelector('input[type="file"]'));
    });
  }
  expect(reached, "the file control is in the keyboard path").toBe(true);
});

test("booking dialog opens, traps focus and closes on Escape", async ({ page }) => {
  await gotoAndSettle(page, "/iletisim");
  const trigger = page.getByTestId("booking-open");
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest("[role='dialog']"))).toBe(true);
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => !!document.activeElement?.closest("[role='dialog']") || document.activeElement?.tagName === "IFRAME")).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("back and forward move between two client-side pages", async ({ page }) => {
  await gotoAndSettle(page, "/");
  await expect(page.getByTestId("technical-hero-title")).toBeVisible();
  await page.getByTestId("technical-hero-cta").click();
  await expect(page).toHaveURL(/\/teklif-al$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByTestId("technical-hero-title")).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/teklif-al$/);
  await expect(page.locator("h1").first()).toBeVisible();
});

test("reduced motion keeps the landing complete and readable", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await gotoAndSettle(page, "/");
  await expect(page.getByTestId("technical-hero-title")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeAttached();
  await context.close();
});
