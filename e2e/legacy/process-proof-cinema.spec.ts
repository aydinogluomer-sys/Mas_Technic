import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  gotoAndSettle,
  hydrateLanding,
  isReducedMotionAuditViewport,
  LEGACY_LANDING_SCENE_IDS,
  usesNaturalLandingFlow,
  LEGACY_LANDING_PATH,
} from "./legacy-helpers";

const cinemaSelector = "[data-process-cinema]";
const stageSelector = "[data-process-stage]";
const triggerSelector = "[data-process-stage-trigger]";
const proofSelector = "[data-process-proof]";
const mediaSelector = "[data-process-media]";

async function openLanding(page: Page) {
  await gotoAndSettle(page, LEGACY_LANDING_PATH);
  await hydrateLanding(page);
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function expectSingleActive(locator: Locator) {
  await expect(locator).toHaveCount(1);
  await expect(locator).toBeVisible();
}

async function jumpToStage(page: Page, index: number) {
  const trigger = page.locator(triggerSelector).nth(index);
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-current", "step");
}

async function scrollCinemaToStage(page: Page, index: number) {
  const expectedId = await page.locator(triggerSelector).nth(index).getAttribute("data-process-stage-trigger");
  expect(expectedId).toBeTruthy();
  const destination = await page.locator(cinemaSelector).evaluate((root, stageIndex) => {
    const rootTop = root.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(1, root.getBoundingClientRect().height - window.innerHeight);
    const progress = 0.16 + (stageIndex / 4) * (0.9 - 0.16);
    const y = rootTop + progress * travel;
    const lenis = (window as unknown as {
      __lenis?: { scrollTo: (target: number, options: { immediate: boolean }) => void };
    }).__lenis;
    if (lenis) lenis.scrollTo(y, { immediate: true });
    else window.scrollTo({ top: y, behavior: "auto" });
    return y;
  }, index);

  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5_000 })
    .toBeGreaterThanOrEqual(destination - 4);
  await expect.poll(() => page.evaluate(() => ({
    trigger: document.querySelector("[data-process-stage-trigger][aria-current=step]")?.getAttribute("data-process-stage-trigger"),
    stage: document.querySelector("[data-process-stage][data-active]")?.getAttribute("data-process-stage"),
    proof: document.querySelector("[data-process-proof][data-active]")?.getAttribute("data-process-proof"),
    media: document.querySelector("[data-process-media][data-active]")?.getAttribute("data-process-media"),
  })), { timeout: 5_000 }).toEqual({
    trigger: expectedId,
    stage: expectedId,
    proof: expectedId,
    media: expectedId,
  });
}

test.describe("Process proof cinema", () => {
  test.beforeEach(async ({ page }) => {
    await openLanding(page);
  });

  test("preserves the nine-anchor process and proof contract", async ({ page }) => {
    for (const id of LEGACY_LANDING_SCENE_IDS) await expect(page.locator(`#${id}`)).toHaveCount(1);

    await expect(page.locator(cinemaSelector)).toHaveCount(1);
    await expect(page.locator(stageSelector)).toHaveCount(5);
    await expect(page.locator(triggerSelector)).toHaveCount(5);
    await expect(page.locator(proofSelector)).toHaveCount(5);
    await expect(page.locator(mediaSelector)).toHaveCount(5);
    await expect(page.locator('[data-process-anchor="start"]')).toHaveCount(1);
    await expect(page.locator('[data-process-anchor="end"]')).toHaveCount(1);

    const sentinels = await page.locator("[data-process-anchor]").evaluateAll((nodes) =>
      nodes.map((node) => ({
        name: node.getAttribute("data-process-anchor"),
        top: node.getBoundingClientRect().top + window.scrollY,
      })),
    );
    expect(sentinels.map(({ name }) => name)).toEqual(["start", "end"]);
    expect(sentinels[0].top).toBeLessThan(sentinels[1].top);
  });

  test("full-motion profiles keep exactly one active process, proof and media item forward and reverse", async ({ page }) => {
    test.skip(await usesNaturalLandingFlow(page), "full-motion profile only");

    const order = [0, 1, 2, 3, 4, 3, 2, 1, 0];
    for (const index of order) {
      await page.locator(triggerSelector).nth(index).click();
      await expect(page.locator(triggerSelector).nth(index)).toHaveAttribute("aria-current", "step");
      await expectSingleActive(page.locator(`${stageSelector}[data-active]`));
      await expectSingleActive(page.locator(`${proofSelector}[data-active]`));
      await expectSingleActive(page.locator(`${mediaSelector}[data-active]`));
      const activeIds = await page.evaluate(() => ({
        trigger: document.querySelector("[data-process-stage-trigger][aria-current]")?.getAttribute("data-process-stage-trigger"),
        stage: document.querySelector("[data-process-stage][data-active]")?.getAttribute("data-process-stage"),
        proof: document.querySelector("[data-process-proof][data-active]")?.getAttribute("data-process-proof"),
        media: document.querySelector("[data-process-media][data-active]")?.getAttribute("data-process-media"),
      }));
      expect(new Set(Object.values(activeIds)).size).toBe(1);
      await expect(page.locator(stageSelector).nth(index)).toHaveAttribute("data-active", "");
      await expect(page.locator(proofSelector).nth(index)).toHaveAttribute("data-active", "");
      await expect(page.locator(mediaSelector).nth(index)).toHaveAttribute("data-active", "");
    }
  });

  test("scroll progress synchronizes every stage forward and in reverse", async ({ page }) => {
    test.skip(await usesNaturalLandingFlow(page), "full-motion profile only");

    for (const index of [0, 1, 2, 3, 4, 3, 2, 1, 0]) {
      await scrollCinemaToStage(page, index);
      await expectSingleActive(page.locator(`${stageSelector}[data-active]`));
      await expectSingleActive(page.locator(`${proofSelector}[data-active]`));
      await expectSingleActive(page.locator(`${mediaSelector}[data-active]`));
    }
  });

  test("focus selection keeps the selected stage and its proof visible", async ({ page }) => {
    test.skip(await usesNaturalLandingFlow(page), "full-motion profile only");

    for (let index = 0; index < 5; index += 1) {
      await jumpToStage(page, index);
      const visibility = await page.locator(`${proofSelector}[data-active]`).evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          horizontal: rect.right > 0 && rect.left < innerWidth,
          vertical: rect.bottom > 0 && rect.top < innerHeight,
        };
      });
      expect(visibility).toEqual({ horizontal: true, vertical: true });
      await expect(page.locator(`${stageSelector}[aria-hidden="true"] a:not([tabindex="-1"])`)).toHaveCount(0);
    }
  });

  test("short desktop hover previews every synchronized stage without clipped proof", async ({ page }) => {
    const viewport = page.viewportSize();
    test.skip(viewport?.width !== 1440 || viewport.height !== 650, "canonical V7 hover lane");
    const destination = await page.locator(cinemaSelector).evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const destination = top + (element.scrollHeight - window.innerHeight) * 0.5;
      const lenis = (window as unknown as {
        __lenis?: { scrollTo: (target: number, options: { immediate: boolean }) => void };
      }).__lenis;
      if (lenis) lenis.scrollTo(destination, { immediate: true });
      else window.scrollTo(0, destination);
      return destination;
    });
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(destination - 4);
    await expect(page.locator(triggerSelector).first()).toBeVisible();

    for (let index = 0; index < 5; index += 1) {
      const trigger = page.locator(triggerSelector).nth(index);
      const expectedId = await trigger.getAttribute("data-process-stage-trigger");
      expect(expectedId).toBeTruthy();
      await trigger.hover();
      await expect(trigger).toHaveAttribute("aria-current", "step");
      await expect.poll(() => page.evaluate(() => {
        const id = (selector: string, attribute: string) =>
          document.querySelector(selector)?.getAttribute(attribute) ?? null;
        const proof = document.querySelector<HTMLElement>("[data-process-proof][data-active]");
        const rect = proof?.getBoundingClientRect();
        return {
          ids: [
            id('[data-process-stage-trigger][aria-current="step"]', "data-process-stage-trigger"),
            id("[data-process-stage][data-active]", "data-process-stage"),
            id("[data-process-proof][data-active]", "data-process-proof"),
            id("[data-process-media][data-active]", "data-process-media"),
          ],
          proofVisible: !!rect && rect.top >= 64 && rect.bottom <= window.innerHeight,
        };
      })).toEqual({ ids: [expectedId, expectedId, expectedId, expectedId], proofVisible: true });
    }
  });

  test("compact and coarse profiles use natural flow without a process pin", async ({ page }) => {
    test.skip(!(await usesNaturalLandingFlow(page)), "natural-flow profile only");

    await expect(page.locator(".pin-spacer:has([data-process-cinema]), .pin-spacer:has([data-process-pin])")).toHaveCount(0);
    await expect(page.locator("[data-process-pin]")).not.toHaveCSS("position", "fixed");
    await expect(page.locator(stageSelector)).toHaveCount(5);
    await expect(page.locator(`${stageSelector}[aria-hidden="true"]`)).toHaveCount(0);
    await expect(page.locator(`${proofSelector}[aria-hidden="true"]`)).toHaveCount(0);
    await expect(page.locator(`${mediaSelector}[aria-hidden="true"]`)).toHaveCount(0);

    const positions = await page.locator(stageSelector).evaluateAll((stages) =>
      stages.map((stage) => getComputedStyle(stage).position),
    );
    expect(positions.every((position) => position === "relative" || position === "static")).toBe(true);

    const flowGeometry = await page.locator(cinemaSelector).evaluate((root) => {
      const stages = [...root.querySelectorAll<HTMLElement>("[data-process-stage]")];
      const proofs = [...root.querySelectorAll<HTMLElement>("[data-process-proof]")];
      const media = [...root.querySelectorAll<HTMLElement>(".ppc-stage-mobile-media")];
      const rootRect = root.getBoundingClientRect();
      const lastRect = stages.at(-1)?.getBoundingClientRect();
      const boxes = (nodes: HTMLElement[]) => nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return {
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          painted: style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0,
        };
      });
      const ordered = (items: ReturnType<typeof boxes>) => items.every((item, index) =>
        index === 0 || item.top > items[index - 1].top,
      );
      const nonOverlapping = (items: ReturnType<typeof boxes>) => items.every((item, index) =>
        index === 0 || items[index - 1].bottom <= item.top + 1,
      );
      const visible = (items: ReturnType<typeof boxes>) => items.every((item) =>
        item.width > 0 && item.height > 0 && item.painted,
      );
      const stageBoxes = boxes(stages);
      const proofBoxes = boxes(proofs);
      const mediaBoxes = boxes(media);
      return {
        rootTallerThanViewport: rootRect.height > window.innerHeight * 2,
        lastStageContained: !!lastRect && lastRect.bottom <= rootRect.bottom + 1,
        stagesVisible: visible(stageBoxes),
        stagesOrdered: ordered(stageBoxes),
        stagesNonOverlapping: nonOverlapping(stageBoxes),
        proofsVisibleAndOrdered: visible(proofBoxes) && ordered(proofBoxes),
        mediaVisibleAndOrdered: visible(mediaBoxes) && ordered(mediaBoxes),
      };
    });
    expect(flowGeometry).toEqual({
      rootTallerThanViewport: true,
      lastStageContained: true,
      stagesVisible: true,
      stagesOrdered: true,
      stagesNonOverlapping: true,
      proofsVisibleAndOrdered: true,
      mediaVisibleAndOrdered: true,
    });
    await expect(page.locator(`${stageSelector} a[href]`)).toHaveCount(5);
  });

  test("has no horizontal overflow and hides unapproved case-study blocks", async ({ page }) => {
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.locator("[data-approved-case-study]")).toHaveCount(0);
  });
});

test("reduced motion exposes every process, proof and media item without clips or pins", async ({ page }) => {
  test.skip(!isReducedMotionAuditViewport(page), "V2/V8 reduced-motion audit lanes only");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openLanding(page);

  await expect(page.locator(".pin-spacer:has([data-process-cinema]), .pin-spacer:has([data-process-pin])")).toHaveCount(0);
  for (const selector of [stageSelector, proofSelector, mediaSelector]) {
    await expect(page.locator(selector)).toHaveCount(5);
    const hidden = await page.locator(selector).evaluateAll((nodes) =>
      nodes.filter((node) => {
        const style = getComputedStyle(node);
        return style.opacity === "0"
          || style.visibility === "hidden"
          || style.display === "none"
          || (style.clipPath !== "none" && style.clipPath !== "inset(0px)");
      }).length,
    );
    expect(hidden).toBe(0);
  }

  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
