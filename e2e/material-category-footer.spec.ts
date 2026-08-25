import { expect, test } from "@playwright/test";
import { expectLocatorUnobscured, gotoAndSettle, revealFooterCopyright } from "./helpers";

test.describe("/malzemeler/:slug footer overlap regression", () => {
  test("hero, local CTA and footer preserve order and usable hit targets", async ({ page }, testInfo) => {
    await gotoAndSettle(page, "/malzemeler/aluminyum");

    const footer = page.getByRole("contentinfo");
    const heroHeading = page.getByRole("heading", { level: 1 }).first();
    const localCta = page.locator("section", {
      has: page.getByRole("link", { name: /teklif al/i }),
    }).last();
    const localCtaLink = localCta.getByRole("link", { name: /teklif al/i }).first();

    await expect(heroHeading).toHaveCount(1);
    await expect(localCta).toHaveCount(1);
    await expect(localCtaLink).toHaveCount(1);
    await expect(footer).toHaveCount(1);

    const [heroBox, ctaBox, footerBox] = await Promise.all([
      heroHeading.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
      }),
      localCta.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
      }),
      footer.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
      }),
    ]);

    expect(heroBox.top).toBeLessThan(ctaBox.top);
    expect(ctaBox.bottom).toBeLessThanOrEqual(footerBox.top + 1);
    expect(footerBox.bottom).toBeGreaterThan(footerBox.top);

    await localCtaLink.focus();
    await expect(localCtaLink).toBeFocused();
    await expectLocatorUnobscured(localCtaLink, "material-category local quote CTA reached by focus");
    await revealFooterCopyright(page);
    await expectLocatorUnobscured(
      footer.getByRole("link", { name: "Gizlilik Politikası" }),
      "material-category footer privacy link",
    );

    await testInfo.attach(`material-category-footer-${testInfo.project.name}.png`, {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    });
  });
});
