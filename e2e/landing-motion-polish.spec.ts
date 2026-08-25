import { expect, test } from "@playwright/test";
import {
  gotoAndSettle,
  hydrateLanding,
  isReducedMotionAuditViewport,
  usesNaturalLandingFlow,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await gotoAndSettle(page, "/");
  await hydrateLanding(page);
});

test("process controls keep one synchronized stage, proof and media item", async ({ page }) => {
  test.skip(await usesNaturalLandingFlow(page), "full-motion profile only");

  const section = page.locator("[data-process-cinema]");
  const controls = section.locator("[data-process-stage-trigger]");
  await expect(section).toHaveCount(1);
  await expect(controls).toHaveCount(5);
  await expect(section.locator("[data-process-stage]")).toHaveCount(5);
  await expect(section.locator("[data-process-proof]")).toHaveCount(5);
  await expect(section.locator("[data-process-media]")).toHaveCount(5);

  await controls.nth(2).focus();
  await expect(controls.nth(2)).toHaveAttribute("aria-current", "step");
  await expect(section.locator("[data-process-stage][data-active]")).toHaveCount(1);
  await expect(section.locator("[data-process-proof][data-active]")).toHaveCount(1);
  await expect(section.locator("[data-process-media][data-active]")).toHaveCount(1);

  const activeIds = await section.evaluate((root) => ({
    control: root.querySelector("[data-process-stage-trigger][aria-current]")?.getAttribute("data-process-stage-trigger"),
    stage: root.querySelector("[data-process-stage][data-active]")?.getAttribute("data-process-stage"),
    proof: root.querySelector("[data-process-proof][data-active]")?.getAttribute("data-process-proof"),
    media: root.querySelector("[data-process-media][data-active]")?.getAttribute("data-process-media"),
  }));
  expect(new Set(Object.values(activeIds)).size).toBe(1);
  await expect(section.locator("[data-process-proof][data-active]")).toBeVisible();
});

test("editorial technical routes remain keyboard destinations", async ({ page }) => {
  const section = page.locator("#sss");
  await section.scrollIntoViewIfNeeded();
  const links = section.locator(".lf-decision-dossier .lf-editorial-list > a:not(.lf-inline-link)");
  await expect(links).toHaveCount(3);

  await links.nth(1).focus();
  await expect(links.nth(1)).toBeFocused();
  await expect(links.nth(1)).toHaveAttribute("href", /havacilik-parcalarinda-malzeme-secimi/);
  if (!(await usesNaturalLandingFlow(page))) {
    await expect(links.nth(1)).toHaveAttribute("data-active", "");
    await expect(section.locator(".lf-editorial-floating-preview img[data-active]")).toHaveCount(1);
  }
});

test("natural-flow profiles expose all process and editorial content without a pin", async ({ page }) => {
  test.skip(!(await usesNaturalLandingFlow(page)), "natural-flow profile only");

  const process = page.locator("[data-process-cinema]");
  await process.scrollIntoViewIfNeeded();
  await expect(page.locator(".pin-spacer:has([data-process-cinema]), .pin-spacer:has([data-process-pin])")).toHaveCount(0);
  await expect(process.locator("[data-process-stage]")).toHaveCount(5);
  await expect(process.locator('[data-process-stage][aria-hidden="true"]')).toHaveCount(0);
  await expect(process.locator('[data-process-proof][aria-hidden="true"]')).toHaveCount(0);

  const positions = await process.locator("[data-process-stage]").evaluateAll((nodes) =>
    nodes.map((node) => getComputedStyle(node).position));
  expect(positions.every((position) => position === "relative" || position === "static")).toBe(true);

  await expect(page.locator(".lf-editorial-floating-preview")).toBeHidden();
  await expect(page.locator("#sss .lf-decision-dossier .lf-editorial-list > a:not(.lf-inline-link)")).toHaveCount(3);
});

test("reduced motion leaves material, process and conversion content readable", async ({ page }) => {
  test.skip(!isReducedMotionAuditViewport(page), "V2/V8 reduced-motion audit lanes only");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "domcontentloaded" });
  await hydrateLanding(page);

  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator("#malzemeler a.lf-material-card")).toHaveCount(6);
  await expect(page.locator("[data-process-stage]")).toHaveCount(5);
  await expect(page.locator("[data-process-proof]")).toHaveCount(5);
  await expect(page.locator("#iletisim").getByRole("link", { name: /Projeni başlat/i })).toBeVisible();

  const hidden = await page.locator("[data-process-stage], [data-process-proof]").evaluateAll((nodes) =>
    nodes.filter((node) => {
      const style = getComputedStyle(node);
      return style.opacity === "0" || style.visibility === "hidden" || style.display === "none";
    }).length);
  expect(hidden).toBe(0);
});
