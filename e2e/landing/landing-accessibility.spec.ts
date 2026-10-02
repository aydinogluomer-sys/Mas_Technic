import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { gotoAndSettle, landingReady } from "../helpers";

/**
 * Gerçek `/` rotasının erişilebilirlik taraması.
 *
 * TOLERANS LİSTESİ YOKTUR. Eski `landing-flow.spec.ts` 37 kalemlik bir
 * `KNOWN_V1_SEMANTIC_VIOLATIONS` ve yedi seçicilik bir
 * `KNOWN_MOBILE_CONTRAST_TARGETS` listesiyle ciddi ihlalleri hoş görüyordu
 * (`reports/baseline/known-blockers.md` B04). Bu paket hiçbirini devralmaz:
 * gerçek bir ihlal varsa test kırmızı kalır. Onarım Faz 13'ün işidir.
 */
test.describe("production landing accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);
  });

  test("has no serious or critical axe violations on the whole document", async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => node.target.join(" ")),
      }));
    expect(blocking).toEqual([]);
  });

  test("exposes one landmark set and a working skip link target", async ({ page }) => {
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.locator("#main-content")).toHaveCount(1);

    const skip = page.getByRole("link", { name: "Ana içeriğe geç" });
    await expect(skip).toHaveCount(1);
    expect(await skip.getAttribute("href")).toBe("#main-content");
  });

  test("keeps heading order legible: exactly one h1 and no skipped level", async ({ page }) => {
    const levels = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll((headings) =>
      headings.map((heading) => Number(heading.tagName.slice(1))));
    expect(levels.filter((level) => level === 1)).toHaveLength(1);

    const jumps = levels.flatMap((level, index) =>
      index > 0 && level - levels[index - 1] > 1 ? [`${levels[index - 1]}→${level}`] : []);
    expect(jumps).toEqual([]);
  });
});
