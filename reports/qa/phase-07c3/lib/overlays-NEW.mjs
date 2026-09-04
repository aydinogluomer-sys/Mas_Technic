import { expect } from "@playwright/test";
const FOREIGN_OVERLAYS = ["[data-chat-launcher]"];
async function hideForeignOverlays(page, { require: require2 = true } = {}) {
  if (!require2) {
    let pathname = page.url();
    try {
      pathname = new URL(page.url()).pathname;
    } catch {
    }
    expect(
      pathname.replace(/\/+$/, "") || "/",
      "hideForeignOverlays({ require: false }) is only legal on `/`, the one route App.tsx does not mount ChatBot on. On any other route the launcher IS there, and waiving the requirement is how it got baked into 25 goldens (see e2e/visual/overlays.ts)"
    ).toBe("/");
  }
  let found = 0;
  for (const selector of FOREIGN_OVERLAYS) found += await page.locator(selector).count();
  if (require2) {
    expect(
      found,
      "no [data-chat-launcher] was found to hide \u2014 either the selector has drifted or ChatBot stopped mounting on this route; either way the goldens would start baking a foreign fixed overlay again (see e2e/visual/overlays.ts)"
    ).toBeGreaterThan(0);
  }
  await page.addStyleTag({
    content: `${FOREIGN_OVERLAYS.join(", ")} { display: none !important; }`
  });
  for (const selector of FOREIGN_OVERLAYS) {
    if (await page.locator(selector).count()) await expect(page.locator(selector)).toBeHidden();
  }
  return found;
}
export {
  hideForeignOverlays
};
