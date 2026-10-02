import { expect, test } from "@playwright/test";
import { PROFILE_INDEX_LABEL, PROFILE_LABEL } from "../src/content/caseStudies";
import { gotoAndSettle } from "./helpers";

/* COPY01 — internal-audit language is not public copy, and the rail speaks
   the reader's language. The phrases below described how the SITE was built
   ("comes from one source", "measured, not typed", "not a template") or argued
   about permissions; none of them helps a buyer decide. */

const FORBIDDEN = [
  /tek (?:bir )?kaynaktan gelir/i,
  /aynı kaynaktan gelir/i,
  /ölçülür\s*[—-]\s*yazılmaz/i,
  /şablon değil/i,
  /müşteri projesi\s+değildir<\/em>/i,
  /yayımlanması için izin alınmış bir proje henüz yok/i,
  /belge değil\s+belge görüntüsü/i,
];
const DEV_RAIL = /^(HEADER|HERO|PROOF STRIP|MARQUEE|DEFINITION|REGISTER|NEXT STEP|PAGE|QUALITY FILE|CAPABILITY PROFILES)$/;

const ROUTES = [
  "/",
  "/hakkimizda",
  "/sss",
  "/kalite-dosyasi",
  "/kabiliyet-profilleri",
  "/kabiliyet-profilleri/ince-cidarli-govde",
  "/malzemeler/aluminyum",
  "/hizmetler/cnc-frezeleme",
];

test.describe("COPY01 — user-facing language", () => {
  test.skip(({ browserName }) => browserName !== "chromium" || test.info().project.name !== "desktop-1280",
    "copy sweep runs once, in desktop-1280");

  for (const route of ROUTES) {
    test(`${route} carries no internal-audit phrase and a Turkish rail`, async ({ page }) => {
      await gotoAndSettle(page, route);
      const html = await page.locator("body").innerHTML();
      const text = await page.locator("body").innerText();
      for (const pattern of FORBIDDEN) {
        expect(text, `${route} matches ${pattern}`).not.toMatch(pattern);
        expect(html, `${route} matches ${pattern}`).not.toMatch(pattern);
      }
      const rail = (await page.locator(".tl-band-index small").allTextContents()).map((label) => label.trim());
      expect(rail.length, `${route} has rail labels`).toBeGreaterThan(0);
      for (const label of rail) expect(label, `${route} rail`).not.toMatch(DEV_RAIL);
    });
  }

  test("profile pages state what a profile is, in one sentence", async ({ page }) => {
    await gotoAndSettle(page, "/kabiliyet-profilleri");
    await expect(page.getByText(PROFILE_INDEX_LABEL, { exact: true })).toBeVisible();
    await gotoAndSettle(page, "/kabiliyet-profilleri/hassas-mil");
    await expect(page.getByText(PROFILE_LABEL, { exact: true })).toBeVisible();
  });

  test("the landing opens with the reviewed hero description", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await expect(page.locator(".tl-hero-copy p")).toHaveText(
      "MAS TECHNIC; CNC frezeleme, tornalama ve tamamlayıcı işlemler için parçanızı teknik resimden üretim ve kontrol planına taşır. Geometri ve tolerans gereksinimleri incelendikten sonra üretim teklifi hazırlanır.",
    );
    await expect(page.locator(".tl-band-index small").first()).toHaveText("MENÜ");
  });
});
