import { test, expect } from "@playwright/test";
import {
  expectLocatorUnobscured,
  fullScrollToBottom,
  gotoAndSettle,
} from "./helpers";

/**
 * An End-key journey must not trap the user before the footer. No
 * scrollIntoView workaround is allowed.
 *
 * FAZ 04 — `/` ARTIK BU LİSTEDE.
 *
 * Eski gerekçe iki ayrı footer'a dayanıyordu: "üretim landing'i paylaşılan
 * footer'ı değil kendi `.tl-footer` bandını basar ve orada `© YYYY MAS
 * TECHNIC` satırı yoktur". Faz 04 tek footer'a indirdi; hayatta kalan antet
 * bloğu oldu ve mega footer'ın alt barından telif satırını da devraldı — bir
 * site footer'ında onun bulunmaması eksiklikti. Yani gerekçenin iki dayanağı
 * da ortadan kalktı ve kapsam üç rotaya çıktı.
 */
const MOBILE_ROUTES = ["/", "/sss", "/iletisim"] as const;

test.describe("FinalCTA → footer bottom-bar reachability (mobile)", () => {
  for (const route of MOBILE_ROUTES) {
    test(`mobile reaches footer bottom-bar on ${route}`, async ({ page }, testInfo) => {
      await gotoAndSettle(page, route);
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
