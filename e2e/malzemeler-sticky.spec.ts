import { expect, test } from "@playwright/test";
import { expectLocatorUnobscured, gotoAndSettle, revealFooterCopyright } from "./helpers";

test.describe("/malzemeler footer release contract", () => {
  test("sticky filters release before the footer and legal links stay unobscured", async ({ page }, testInfo) => {
    await gotoAndSettle(page, "/malzemeler");

    const filters = page.locator("section.sticky:has(select)");
    await expect(filters).toHaveCount(1);
    await expect(filters).toHaveCSS("position", "sticky");

    const footer = page.getByRole("contentinfo");
    await expect(footer).toHaveCSS("position", "relative");
    const geometry = await Promise.all([filters, footer].map((locator) => locator.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
    })));
    expect(geometry[0].bottom).toBeLessThan(geometry[1].top);
    await revealFooterCopyright(page);
    const [filterViewport, footerViewport] = await Promise.all([filters, footer].map((locator) =>
      locator.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom };
      })));
    const overlapsFooter = filterViewport.top < footerViewport.bottom
      && filterViewport.bottom > footerViewport.top;
    expect(overlapsFooter, "sticky material filters must release before the footer viewport").toBe(false);

    await expectLocatorUnobscured(
      footer.getByRole("link", { name: "Gizlilik Politikası" }),
      "materials footer privacy link",
    );
    await expectLocatorUnobscured(
      footer.getByRole("link", { name: "KVKK Aydınlatma Metni" }),
      "materials footer KVKK link",
    );

    await testInfo.attach(`malzemeler-${testInfo.project.name}.png`, {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    });
  });
});
