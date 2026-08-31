import { expect, type Page } from "@playwright/test";
import { LEGACY_LANDING_SCENE_IDS, settleRendering } from "../helpers";

/**
 * Dev-only `/legacy-landing` yardımcıları.
 *
 * Bu klasördeki paketler `src/components/LandingFlow.tsx` sözleşmelerini
 * (`.lf-*` sınıfları, `#hizmetler`/`#endustriler` çapaları, `data-lf-reveal`)
 * sınar. O bileşen üretim derlemesinde hiç yayınlanmaz — `src/App.tsx`
 * içindeki DEV_ONLY_ROUTES bloğu `import.meta.env.DEV` yanlışken üç dev
 * rotasını da hiç oluşturmaz. Bu yüzden bu paketler hiçbir kapının parçası
 * değildir ve yalnız `PLAYWRIGHT_LEGACY=1` ile, bir dev sunucusuna karşı
 * çalıştırılabilir.
 *
 * ÜRETİM KARŞILIĞI: `/` rotasının gerçek sözleşmeleri
 * `e2e/technical-landing.spec.ts` ve `e2e/landing/**` altındadır.
 */
export const LEGACY_LANDING_PATH = "/legacy-landing";

// Paketler tek bir yardımcı modülden içe aktarsın diye ortak yardımcılar da
// buradan yeniden yayınlanır.
export * from "../helpers";

/** Hydrates the intent-deferred legacy landing scenes and waits for layout readiness. */
export async function hydrateLanding(page: Page) {
  const versionRoot = page.getByTestId("landing-version-root");
  await expect(versionRoot).toBeVisible({ timeout: 20_000 });
  const version = await versionRoot.getAttribute("data-landing-version");
  await expect(page.locator("main#main-content")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("#top")).toBeVisible({ timeout: 20_000 });
  if (version === "legacy") {
    await page.mouse.wheel(0, 1);
    await expect(page.locator('main#main-content > .lf-root[data-motion-ready="true"]'))
      .toHaveCount(1, { timeout: 20_000 });
  } else {
    await expect(versionRoot).toHaveAttribute("data-landing-state", "static");
  }
  for (const id of LEGACY_LANDING_SCENE_IDS) {
    await expect(page.locator(`#${id}`), `${id} anchor must exist exactly once`).toHaveCount(1);
  }
  await settleRendering(page);
}

export async function usesNaturalLandingFlow(page: Page) {
  return (await page.locator('#hizmetler article[aria-hidden="true"]').count()) === 0;
}

/** Approved compact-profile contract, intentionally independent of current CSS/runtime behavior. */
export async function expectsNaturalLandingFlow(page: Page) {
  return page.evaluate(() => window.matchMedia(
    "(max-width: 1023px), (max-height: 699px), (pointer: coarse), (prefers-reduced-motion: reduce)",
  ).matches);
}

export async function assertLovableAuthWasNotCaptured(page: Page) {
  const loginSignature = page.getByRole("heading", { name: /^Log in$/i });
  const googleButton = page.getByRole("button", { name: /Continue with Google/i });
  const githubButton = page.getByRole("button", { name: /Continue with GitHub/i });
  await expect(loginSignature).toHaveCount(0);
  await expect(googleButton).toHaveCount(0);
  await expect(githubButton).toHaveCount(0);
}
