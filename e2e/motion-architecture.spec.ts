import { expect, test } from "@playwright/test";
import {
  gotoAndSettle,
  hydrateLanding,
  isReducedMotionAuditViewport,
  LANDING_SCENE_IDS,
  settleRendering,
  usesNaturalLandingFlow,
} from "./helpers";

test.describe("Awwwards motion architecture", () => {
  test("public route navigation uses a full viewport precision curtain", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await page.evaluate(() => {
      document.documentElement.dataset.spaSession = "preserved";
    });

    await page.locator("[data-menu-trigger]").click();
    const target = page.locator("[data-fullscreen-menu]").getByRole("link", { name: "Hakkımızda" });
    await expect(target).toBeVisible();
    const targetPath = new URL((await target.getAttribute("href"))!, "http://localhost").pathname;
    await target.click();

    const curtainPanels = page.locator("[data-route-curtain-panel]");
    await expect(curtainPanels).toHaveCount(5);
    await expect(page).toHaveURL(new RegExp(`${targetPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
    await settleRendering(page);
    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    const coveringFrame = await curtainPanels.evaluateAll((panels) => {
      panels.forEach((panel) => {
        const animation = panel.getAnimations()[0];
        if (!animation) return;
        const timing = animation.effect?.getComputedTiming();
        const duration = typeof timing?.duration === "number" ? timing.duration : 1_000;
        animation.pause();
        animation.currentTime = duration * 0.42;
      });
      return panels.map((panel) => {
        const rect = panel.getBoundingClientRect();
        const style = getComputedStyle(panel);
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          height: rect.height,
          opacity: Number(style.opacity),
          visibility: style.visibility,
          display: style.display,
          clipPath: style.clipPath,
        };
      });
    });
    const coversViewport = (() => {
      if (coveringFrame.length !== 5) return false;
      const intervals = [...coveringFrame].sort((left, right) => left.left - right.left);
      const paintedAndVertical = intervals.every((panel) =>
        panel.opacity > 0
        && panel.visibility !== "hidden"
        && panel.display !== "none"
        && (panel.clipPath === "none" || panel.clipPath === "")
        && panel.top <= 1
        && panel.bottom >= viewport!.height - 1
        && panel.height >= viewport!.height * 0.99,
      );
      const gapFree = intervals[0].left <= 1
        && intervals.at(-1)!.right >= viewport!.width - 1
        && intervals.slice(1).every((panel, index) => panel.left <= intervals[index].right + 1);
      return paintedAndVertical && gapFree;
    })();
    expect(coversViewport, "the deterministic cover phase must visibly cover the viewport").toBe(true);

    await expect(page.locator("[data-route-transition]")).toHaveCount(1, { timeout: 5_000 });
    await expect(page.locator("[data-route-transition] h1").first()).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-spa-session", "preserved");
  });

  test("multi-route journey stays inside the SPA without runtime errors", async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    test.skip(testInfo.project.name !== "desktop-1280");
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("ERR_NETWORK_ACCESS_DENIED")) {
        runtimeErrors.push(message.text());
      }
    });

    await gotoAndSettle(page, "/");
    await page.evaluate(() => {
      document.documentElement.dataset.motionJourney = "active";
    });

    const visit = async (href: string, expectedPath: RegExp) => {
      await page.locator("[data-menu-trigger]").click();
      if (href === "/malzemeler") {
        await page.locator("[data-fullscreen-menu]").getByRole("button", { name: /Kabiliyetler/ }).click();
      }
      const link = page.locator(`[data-fullscreen-menu] a[href="${href}"]:visible`).first();
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(expectedPath);
      await expect(page.locator("[data-route-transition]")).toHaveCount(1, { timeout: 5_000 });
      await expect(page.locator("html")).toHaveAttribute("data-motion-journey", "active");
    };

    await visit("/malzemeler", /\/malzemeler$/);
    await visit("/", /\/$/);
    await visit("/iletisim", /\/iletisim$/);

    await settleRendering(page);
    expect(runtimeErrors).toEqual([]);
  });

  test("landing preserves nine anchors and its pin budget", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await hydrateLanding(page);

    for (const id of LANDING_SCENE_IDS) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    await expect(page.locator("[data-section-transition]")).toHaveCount(0);

    const featurePin = page.locator(".lf-featured-pin");
    const industryTrack = page.locator(".lf-industry-track");
    if (!(await usesNaturalLandingFlow(page))) {
      const top = await page.locator("#hizmetler").evaluate((element) => element.getBoundingClientRect().top + window.scrollY);
      await page.evaluate((y) => {
        const lenis = (window as unknown as {
          __lenis?: { scrollTo: (target: number, options: { immediate: boolean }) => void };
        }).__lenis;
        if (lenis) lenis.scrollTo(y + 500, { immediate: true });
        else window.scrollTo({ top: y + 500, behavior: "auto" });
      }, top);
      await expect(page.locator(".pin-spacer")).toHaveCount(2);
      await expect(page.locator("#hizmetler .pin-spacer")).toHaveCount(1);
      await expect(page.locator("#endustriler .pin-spacer")).toHaveCount(1);
      await expect(page.locator(".pin-spacer:has([data-process-cinema]), .pin-spacer:has([data-process-pin])")).toHaveCount(0);
      const featureBox = await featurePin.boundingBox();
      expect(featureBox).not.toBeNull();
      expect(Math.abs(featureBox!.y)).toBeLessThan(2);
      expect(await industryTrack.getAttribute("style")).not.toBeNull();
    } else {
      await expect(page.locator(".pin-spacer")).toHaveCount(0);
      await expect(featurePin).toHaveCSS("position", "static");
      await expect(industryTrack).not.toHaveCSS("transform", /matrix/);
    }
  });

  test("reduced motion removes route and section movement without hiding content", async ({ page }) => {
    test.skip(!isReducedMotionAuditViewport(page), "V2/V8 reduced-motion audit lanes only");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await gotoAndSettle(page, "/");
    await hydrateLanding(page);

    await expect(page.locator("[data-route-curtain-panel]")).toHaveCount(0);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await expect(page.locator("[data-process-stage]")).toHaveCount(5);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});
