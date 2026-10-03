import { expect, test } from "@playwright/test";
import {
  assertHostedAuthWasNotCaptured,
  expectLocatorUnobscured,
  freezeVisualState,
  fullScrollToBottom,
  gotoAndSettle,
  hydrateLanding,
  LEGACY_LANDING_PATH,
} from "./legacy-helpers";

const LANDING_ROUTES: readonly string[] = [LEGACY_LANDING_PATH];

test.describe("Deterministic full-page evidence capture", () => {
  for (const route of LANDING_ROUTES) {
    test(`captures ${route} and verifies interactive footer hit targets`, async ({ page }, testInfo) => {
      await gotoAndSettle(page, route);
      if (route === LEGACY_LANDING_PATH) await hydrateLanding(page);
      await fullScrollToBottom(page);
      await assertHostedAuthWasNotCaptured(page);

      await expect(page.locator("#main-header")).toBeVisible();
      const footer = page.getByRole("contentinfo");
      await expect(footer).toBeVisible();
      await expectLocatorUnobscured(
        footer.getByRole("link", { name: "Gizlilik Politikası" }),
        "footer privacy link",
      );
      await expectLocatorUnobscured(
        footer.getByRole("link", { name: "KVKK Aydınlatma Metni" }),
        "footer KVKK link",
      );

      await freezeVisualState(page);
      const brokenVisibleImages = await page.locator("img").evaluateAll((images) =>
        images.filter((image) => {
          const element = image as HTMLImageElement;
          const style = getComputedStyle(element);
          const contributesToCapture = style.display !== "none"
            && style.visibility !== "hidden"
            && Number(style.opacity) > 0;
          const hasRequestedSource = Boolean(element.currentSrc || element.getAttribute("src"));
          return contributesToCapture && hasRequestedSource && !element.naturalWidth;
        }).map((image) => ({ src: (image as HTMLImageElement).currentSrc, alt: image.getAttribute("alt") })));
      expect(brokenVisibleImages).toEqual([]);

      const safeRoute = route === "/" ? "index" : route.replace(/\W+/g, "_");
      const fileName = `${testInfo.project.name}-${safeRoute}-fullpage.png`;
      await testInfo.attach(fileName, {
        body: await page.screenshot({ fullPage: true, animations: "disabled" }),
        contentType: "image/png",
      });
    });
  }
});
