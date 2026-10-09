import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "./helpers";

/* L6: a password reset requested on a localized page returns the reader to
   the same language. Supabase builds the e-mail link from `redirect_to`;
   without the prefix every reader landed on the Turkish reset page. */
for (const [prefix, expected] of [["", "/reset-password"], ["/en", "/en/reset-password"]] as const) {
  test(`password reset from ${prefix || "/"} returns to ${expected}`, async ({ page, baseURL }) => {
    const recover: string[] = [];
    await page.route("**/auth/v1/recover**", async (route) => {
      recover.push(route.request().url());
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await gotoAndSettle(page, `${prefix}/sifremi-unuttum`);
    await page.locator('input[name="email"]').fill("reader@example.com");
    await page.locator('form.shell-auth-form button[type="submit"]').click();

    await expect.poll(() => recover.length, { timeout: 15_000 }).toBe(1);
    const redirect = new URL(recover[0]).searchParams.get("redirect_to");
    expect(redirect).toBe(new URL(expected, baseURL).toString());
  });
}
