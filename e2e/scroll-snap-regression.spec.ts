import { test, expect } from "@playwright/test";
import {
  expectLocatorUnobscured,
  fullScrollToBottom,
  gotoAndSettle,
  hydrateLanding,
  usesNaturalLandingFlow,
} from "./helpers";

/**
 * On compact/native-flow profiles, an End-key journey must not trap the
 * user before the footer. No scrollIntoView workaround is allowed.
 */
const MOBILE_ROUTES = ["/", "/sss", "/iletisim"] as const;

test.describe("FinalCTA → footer bottom-bar reachability (mobile)", () => {
  for (const route of MOBILE_ROUTES) {
    test(`mobile reaches footer bottom-bar on ${route}`, async ({ page }, testInfo) => {
      await gotoAndSettle(page, route);
      test.skip(!(await usesNaturalLandingFlow(page)), "natural-flow profile only");
      if (route === "/") await hydrateLanding(page);
      await fullScrollToBottom(page);

      const footer = page.getByRole("contentinfo");
      const copyright = footer.getByText(/©\s*\d{4}\s+MAS\s+TECHNIC/);
      await expect(copyright).toBeVisible();

      // Legal links rendered alongside copyright must also be reachable.
      const legal = footer.getByRole("link", { name: /Gizlilik Politikası/ });
      await legal.focus();
      await expect(legal).toBeFocused();
      await expectLocatorUnobscured(legal, "footer privacy link after End-key journey");

      const safe = route.replace(/\W+/g, "_") || "_root";
      await testInfo.attach(`snap-${testInfo.project.name}${safe}.png`, {
        body: await page.screenshot({ fullPage: false }),
        contentType: "image/png",
      });
    });
  }
});
