import { expect, test } from "@playwright/test";
import {
  gotoAndSettle,
  hydrateLanding,
  isReducedMotionAuditViewport,
  usesNaturalLandingFlow,
} from "./helpers";

const visualSurfaces = [
  ["hero", "#top"],
  ["manifesto", '[aria-label="Üretim yaklaşımı"]'],
  ["services", "#hizmetler"],
  ["industries", "#endustriler"],
  ["materials", "#malzemeler"],
  ["process and proof", "[data-process-cinema]"],
  ["trust", "#referanslar"],
  ["decision support", "#sss"],
  ["conversion", "#iletisim"],
] as const;

test.describe("Editorial landing color system", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndSettle(page, "/");
    await hydrateLanding(page);
  });

  test("every visual surface exists and owns an opaque background", async ({ page }) => {
    for (const [label, selector] of visualSurfaces) {
      const surface = page.locator(selector);
      await expect(surface, `${label} surface must exist exactly once`).toHaveCount(1);
      const style = await surface.evaluate((element) => ({
        background: getComputedStyle(element).backgroundColor,
        display: getComputedStyle(element).display,
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height,
      }));
      expect(style.background, `${label} must not inherit a transparent surface`).not.toBe("rgba(0, 0, 0, 0)");
      expect(style.display).not.toBe("none");
      expect(style.width).toBeGreaterThan(0);
      expect(style.height).toBeGreaterThan(0);
    }
    await expect(page.locator("[data-section-transition]")).toHaveCount(0);
  });

  test("theme class changes never make a landing surface transparent", async ({ page }) => {
    for (const dark of [false, true]) {
      await page.evaluate((enabled) => document.documentElement.classList.toggle("dark", enabled), dark);
      for (const [, selector] of visualSurfaces) {
        await expect(page.locator(selector)).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      }
    }
  });

  test("records the known mobile copper-on-light contrast blocker", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-375", "canonical mobile contrast lane");

    const target = page.locator("[data-process-cinema] .ppc-kicker span");
    const targetCount = await target.count();
    const contrast = await target.evaluate((foreground) => {
      const parse = (value: string) => value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
      const luminance = ([r, g, b]: number[]) => {
        const convert = (channel: number) => {
          const value = channel / 255;
          return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        };
        return convert(r) * 0.2126 + convert(g) * 0.7152 + convert(b) * 0.0722;
      };
      const background = foreground.closest("[data-process-cinema]") as HTMLElement;
      const foregroundLuminance = luminance(parse(getComputedStyle(foreground).color));
      const backgroundLuminance = luminance(parse(getComputedStyle(background).backgroundColor));
      return {
        foreground: getComputedStyle(foreground).color,
        background: getComputedStyle(background).backgroundColor,
        ratio: (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
          / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05),
      };
    });
    expect(Number.isFinite(contrast.ratio)).toBe(true);
    const matchesKnownDefect = targetCount === 1
      && contrast.foreground === "rgb(201, 119, 66)"
      && contrast.background === "rgb(233, 228, 218)"
      && Math.round(contrast.ratio * 100) / 100 === 2.67;

    test.fail(matchesKnownDefect, "Frozen copper/light color and 2.67:1 ratio signature; production repair is outside Slice 0.");
    expect(contrast.ratio).toBeGreaterThanOrEqual(4.5);
  });

  test("reduced motion keeps restored and conversion content readable", async ({ page }) => {
    test.skip(!isReducedMotionAuditViewport(page), "V2/V8 reduced-motion audit lanes only");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await hydrateLanding(page);

    const cta = page.locator("#iletisim");
    await cta.scrollIntoViewIfNeeded();
    await expect(cta.getByRole("heading", { name: /Bir sonraki/i })).toBeVisible();
    await expect(cta.getByRole("link", { name: /Projeni başlat/i })).toBeVisible();
    await expect(page.locator("[data-process-stage]")).toHaveCount(5);
    await expect(page.locator("[data-process-proof]")).toHaveCount(5);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  });

  test("natural-flow profiles have no transition bridge or horizontal overflow", async ({ page }) => {
    test.skip(!(await usesNaturalLandingFlow(page)), "natural-flow profile only");
    await expect(page.locator("[data-section-transition]")).toHaveCount(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
