import { expect, test } from "@playwright/test";
import {
  gotoAndSettle,
  hydrateLanding,
  isReducedMotionAuditViewport,
  usesNaturalLandingFlow,
  LEGACY_LANDING_PATH,
} from "./legacy-helpers";

test("legacy reverse-scroll bridge is absent on full-motion profiles", async ({ page }) => {
  await gotoAndSettle(page, LEGACY_LANDING_PATH);
  await hydrateLanding(page);
  test.skip(await usesNaturalLandingFlow(page), "full-motion profile only");
  await expect(page.locator("[data-reverse-scroll]")).toHaveCount(0);
  await expect(page.locator("[data-reverse-scroll-content]")).toHaveCount(0);
});

test("compact profiles use editorial native flow without a reverse bridge", async ({ page }) => {
  await gotoAndSettle(page, LEGACY_LANDING_PATH);
  await hydrateLanding(page);
  test.skip(!(await usesNaturalLandingFlow(page)), "natural-flow profile only");
  await expect(page.locator("[data-reverse-scroll]")).toHaveCount(0);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});

test("reduced motion uses natural flow without a reverse bridge", async ({ page }) => {
  test.skip(!isReducedMotionAuditViewport(page), "V2/V8 reduced-motion audit lanes only");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoAndSettle(page, LEGACY_LANDING_PATH);
  await hydrateLanding(page);
  await expect(page.locator("[data-reverse-scroll]")).toHaveCount(0);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
});
