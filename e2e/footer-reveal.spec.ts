import { test, expect } from "@playwright/test";
import {
  expectLocatorUnobscured,
  gotoAndSettle,
  hydrateLanding,
  revealFooterCopyright,
} from "./helpers";

const ROUTES = ["/", "/sss", "/iletisim", "/malzemeler"] as const;

for (const route of ROUTES) {
  test(`complete footer is reachable on ${route}`, async ({ page }, testInfo) => {
    await gotoAndSettle(page, route);
    if (route === "/") {
      const landing = page.getByTestId("landing-version-root");
      await expect(landing).toBeVisible({ timeout: 20_000 });
      if (await landing.getAttribute("data-landing-version") === "legacy") await hydrateLanding(page);
    }

    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeAttached({ timeout: 20_000 });
    await expect(footer).toHaveCSS("position", "relative");
    await expect(page.locator("[data-footer-spacer]")).toHaveCount(0);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--footer-height"))).toBe("");

    const checkpoints = [
      footer.getByRole("link", { name: /Yazıları incele/i }),
      footer.getByRole("link", { name: /Hemen Teklif Al/i }),
      footer.getByRole("link", { name: /Gizlilik Politikası/i }),
    ];
    const footerBox = await footer.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
    });
    for (const checkpoint of checkpoints) {
      await expect(checkpoint).toHaveCount(1);
      const box = await checkpoint.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top + scrollY, bottom: rect.bottom + scrollY, width: rect.width, height: rect.height };
      });
      expect(box.width).toBeGreaterThan(0);
      expect(box.height).toBeGreaterThan(0);
      expect(box.top).toBeGreaterThanOrEqual(footerBox.top - 1);
      expect(box.bottom).toBeLessThanOrEqual(footerBox.bottom + 1);
    }

    const footerLinks = footer.locator("a[href]:visible");
    const linkCount = await footerLinks.count();
    expect(linkCount).toBeGreaterThanOrEqual(3);
    for (const index of [0, Math.floor(linkCount / 2), linkCount - 1]) {
      const link = footerLinks.nth(index);
      await link.scrollIntoViewIfNeeded();
      await link.focus();
      await expect(link).toBeFocused();
      await expect.poll(() => link.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top >= -1 && rect.bottom <= window.innerHeight + 1;
      })).toBe(true);
      await expectLocatorUnobscured(link, `keyboard-reachable footer link ${index} on ${route}`);
    }

    const copyright = await revealFooterCopyright(page);
    const box = await copyright.boundingBox();
    expect(box).not.toBeNull();
    const viewportHeight = page.viewportSize()?.height ?? 0;
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeLessThan(viewportHeight);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewportHeight + 1);
    await expectLocatorUnobscured(
      footer.getByRole("link", { name: /Gizlilik Politikası/i }),
      `footer privacy link on ${route}`,
    );

    await expectLocatorUnobscured(
      footer.getByRole("link", { name: /^KVKK/i }),
      `footer KVKK link on ${route}`,
    );

    const safe = route.replace(/\W+/g, "_") || "_root";
    await testInfo.attach(`footer-${testInfo.project.name}${safe}.png`, {
      body: await page.screenshot({ fullPage: false }),
      contentType: "image/png",
    });
  });
}

test("complete landing footer is reachable in a short desktop viewport", async ({ page }) => {
  const viewport = page.viewportSize();
  test.skip(viewport?.width !== 1440 || viewport.height !== 650, "canonical V7 lane");
  await gotoAndSettle(page, "/");
  const landing = page.getByTestId("landing-version-root");
  await expect(landing).toBeVisible({ timeout: 20_000 });
  if (await landing.getAttribute("data-landing-version") === "legacy") await hydrateLanding(page);

  const footer = page.getByRole("contentinfo");
  await expect(footer).toBeAttached({ timeout: 20_000 });
  await expect(footer).toHaveCSS("position", "relative");
  const top = footer.getByRole("link", { name: /Yazıları incele/i });
  await expect(top).toHaveCount(1);
  await revealFooterCopyright(page);
  const privacy = footer.getByRole("link", { name: /Gizlilik Politikası/i });
  await expectLocatorUnobscured(privacy, "short-desktop footer privacy link");

  const scrollTop = page.getByRole("button", { name: /Yukarı çık/i });
  await expect(scrollTop).toHaveCount(0);
});
