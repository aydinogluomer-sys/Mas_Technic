import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "../helpers";

/* Round 2, item 18 — the booking studio. The Google appointment page itself
   is never loaded here: requests to google.com are answered locally so the
   test measures OUR frame, focus and fallback, not Google's uptime. */
const EMBED = /calendar\.google\.com\/calendar\/appointments\/schedules\/.+\?gv=true/;

test.describe("contact booking studio", () => {
  test("the booking card opens a dialog that embeds the schedule and keeps a new-tab exit", async ({ page }) => {
    await page.route(EMBED, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>schedule</body></html>" }));
    await gotoAndSettle(page, "/iletisim");
    await expect(page.getByRole("heading", { level: 1, name: "Bize ulaşın" })).toBeVisible();
    await expect(page.locator("#toplanti")).toBeVisible();
    await expect(page.locator("#toplanti a[target='_blank']")).toHaveAttribute("href", "https://calendar.app.google/7V4P8Ygeh5YDSLWX7");

    await page.getByTestId("booking-open").click();
    const dialog = page.getByRole("dialog", { name: "Uygun bir saat seçin" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Kapat" })).toBeFocused();
    await expect(dialog.locator("iframe")).toHaveAttribute("src", EMBED);
    // UX04: the bar link plus the persistent hint link once the frame reports load.
    for (const link of await dialog.getByRole("link", { name: /Randevuyu yeni sekmede aç/ }).all()) await expect(link).toHaveAttribute("target", "_blank");
    await expect(dialog).toHaveAttribute("data-state", "ready");

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("booking-open")).toBeFocused();
  });

  test("a frame that never loads falls back to the new-tab action", async ({ page }) => {
    await page.route(EMBED, () => { /* never answered */ });
    await gotoAndSettle(page, "/iletisim?randevu");
    const dialog = page.getByRole("dialog", { name: "Uygun bir saat seçin" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("TAKVİM BURADA AÇILAMADI")).toBeVisible({ timeout: 12_000 });
    await expect(dialog.getByRole("link", { name: /Randevuyu yeni sekmede aç/ })).toHaveCount(2);
  });
});
