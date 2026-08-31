import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Üretim landing'inin (`/` → `TechnicalLanding`) gerçekten yayınladığı çapalar.
 * `TechnicalHeader` bu altısına link verir; `sss` ayrıca footer'dan hedeflenir.
 * Doğrulama: `e2e/landing/landing-anchors.spec.ts` bu listeyi DOM'a karşı ve
 * header linklerine karşı çift yönlü sınar.
 */
export const LANDING_SCENE_IDS = [
  "surec",
  "nexus",
  "projeler",
  "sektorler",
  "kalite",
  "sss",
  "iletisim",
] as const;

/**
 * Dev-only `/legacy-landing` sahnelerinin çapaları. Yalnız `e2e/legacy/**`
 * kullanır; üretim `/` rotasında bu id'lerin hiçbiri yoktur.
 */
export const LEGACY_LANDING_SCENE_IDS = [
  "top",
  "hizmetler",
  "endustriler",
  "malzemeler",
  "neden-biz",
  "kabiliyetler",
  "referanslar",
  "sss",
  "iletisim",
] as const;

export async function settleRendering(page: Page) {
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

/**
 * Uses a real keyboard scroll command and waits until the document reaches its
 * natural bottom. Programmatic scrollIntoView is deliberately not used here so a
 * sticky or pinned trap cannot be hidden by the helper.
 */
export async function fullScrollToBottom(page: Page) {
  const pressEndAndMeasure = async () => {
    await page.keyboard.press("End");
    await settleRendering(page);
    return page.evaluate(() => {
      const root = document.documentElement;
      return Math.ceil(window.scrollY + window.innerHeight) >= root.scrollHeight - 2;
    });
  };

  // Fonts and lazy media can grow the document after the first End key. Keep
  // using the real keyboard command until the natural bottom stabilizes.
  await expect.poll(pressEndAndMeasure, {
    timeout: 15_000,
    intervals: [100, 250, 500],
  }).toBe(true);
  await settleRendering(page);
  await expect.poll(pressEndAndMeasure, {
    timeout: 15_000,
    intervals: [100, 250, 500],
  }).toBe(true);
}

/**
 * Verifies that a real End-key journey reaches the footer bottom bar.
 */
export async function revealFooterCopyright(page: Page) {
  await fullScrollToBottom(page);
  const copyright = page.getByRole("contentinfo").getByText(/©\s*\d{4}\s+MAS\s+TECHNIC/);
  await expect(copyright).toBeVisible();
  return copyright;
}

/**
 * `path` neyse ona gider. Burada bir zamanlar `path === "/" ? "/legacy-landing"`
 * yeniden yazımı vardı; bütün landing regresyonunu sessizce dev-only bir rotaya
 * yönlendiriyor ve gerçek ana sayfa hakkında hiçbir şey söylemiyordu
 * (`reports/baseline/known-blockers.md` B02). `/` artık `/` demektir.
 */
export async function gotoAndSettle(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#root")).toBeVisible();
  await page.locator("body").waitFor({ state: "visible" });
  // Persistent analytics/realtime connections make networkidle nondeterministic.
  // Font readiness plus two paint frames is a bounded visual readiness contract.
  await settleRendering(page);
}

/** Üretim landing'inin (`/`) yerleşim hazırlığı. */
export async function landingReady(page: Page) {
  await expect(page.getByTestId("technical-landing-root")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator("main#main-content")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("technical-hero-title")).toBeVisible({ timeout: 20_000 });
  for (const id of LANDING_SCENE_IDS) {
    await expect(page.locator(`#${id}`), `${id} anchor must exist exactly once`).toHaveCount(1);
  }
  await waitForHeroShellTeardown(page);
  await settleRendering(page);
}

/**
 * `index.html` giriş sekansının devir sözleşmesi: sekans bitince `#hero-shell`
 * DOM'dan kalkar ve `<html data-intro-active>` geride kalmaz. Tavan süre
 * `src/lib/hero-shell.ts` içindeki 7000 ms güvenlik ağıdır.
 */
export async function waitForHeroShellTeardown(page: Page) {
  await expect
    .poll(
      () => page.evaluate(() => ({
        shell: document.getElementById("hero-shell") !== null,
        introActive: document.documentElement.hasAttribute("data-intro-active"),
      })),
      { timeout: 12_000, intervals: [100, 250, 500] },
    )
    .toEqual({ shell: false, introActive: false });
}

export function isReducedMotionAuditViewport(page: Page) {
  const viewport = page.viewportSize();
  return (viewport?.width === 375 && viewport.height === 812)
    || (viewport?.width === 1440 && viewport.height === 900);
}

export async function expectLocatorUnobscured(locator: Locator, label: string) {
  await locator.page().evaluate(async () => {
    await document.fonts?.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
  await expect(locator, `${label} must be visible`).toBeVisible();

  const hitTest = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const left = Math.max(0, rect.left);
    const right = Math.min(window.innerWidth, rect.right);
    const top = Math.max(0, rect.top);
    const bottom = Math.min(window.innerHeight, rect.bottom);
    if (right <= left || bottom <= top) {
      return { inViewport: false, fullyInViewport: false, unobscured: false, blockers: [] };
    }

    const insetX = Math.min(3, Math.max(1, (right - left) / 4));
    const insetY = Math.min(3, Math.max(1, (bottom - top) / 4));
    const points = [
      [left + (right - left) / 2, top + (bottom - top) / 2],
      [left + insetX, top + insetY],
      [right - insetX, top + insetY],
      [left + insetX, bottom - insetY],
      [right - insetX, bottom - insetY],
    ];
    const hits = points.map(([x, y]) => document.elementFromPoint(x, y));
    const blockers = hits
      .filter((hit) => !hit || (hit !== element && !element.contains(hit)))
      .map((hit) => hit instanceof HTMLElement ? `${hit.tagName}.${hit.className}` : "unknown")
      .filter((value, index, values) => values.indexOf(value) === index);
    return {
      inViewport: true,
      fullyInViewport: rect.left >= -1 && rect.right <= window.innerWidth + 1
        && rect.top >= -1 && rect.bottom <= window.innerHeight + 1,
      unobscured: blockers.length === 0,
      blockers,
    };
  });

  expect(hitTest.inViewport, `${label} must intersect the viewport`).toBe(true);
  expect(hitTest.fullyInViewport, `${label} must be fully contained in the viewport`).toBe(true);
  expect(hitTest.unobscured, `${label} is obscured by ${hitTest.blockers?.join(", ") ?? "an unknown layer"}`).toBe(true);
}

/**
 * Altın görüntü için belirlenimli sayfa durumu.
 *
 * ÖLÇÜLEN KUSUR: `loading="lazy"` görsellerin yükleme durumu koşudan koşuya
 * değişiyordu. Aynı önizleme sunucusuna karşı arka arkaya iki yüklemede beş
 * sektör/kalite görselinden bazıları `complete: true`, bazıları `complete:
 * false` ölçüldü. `img.loading = "eager"` + `decode()` bunu kapatmıyor:
 * `decode()` henüz `currentSrc` almamış bir görselde hemen döner. Sonuç,
 * `toHaveScreenshot` içinde gerçek bir yapısal fark olmadan kırmızıya düşen
 * kararsız bir altın karşılaştırmaydı.
 *
 * Çözüm tolerans gevşetmek DEĞİL, yakalamayı belirlenimli kılmaktır:
 * belge bir kez baştan sona gezilir (lazy yükleme tetiklenir), başa dönülür,
 * ardından HER görselin gerçekten tamamlanması beklenir.
 */
export async function freezeVisualState(page: Page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-play-state: paused !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
        caret-color: transparent !important;
      }
    `,
  });

  // 1) Gerçek bir gezinme lazy yüklemeyi tetikler; sonra başa dönülür.
  await page.evaluate(async () => {
    document.querySelectorAll("img").forEach((img) => { img.loading = "eager"; });
    const step = Math.max(200, window.innerHeight);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
    window.scrollTo(0, 0);
  });

  // 2) Her görsel gerçekten tamamlanmalı. Beklenti burada patlarsa bu bir
  //    varlık hatasıdır ve öyle raporlanmalıdır — sessizce yutulmaz.
  await page.waitForFunction(
    () => [...document.images].every((img) => img.complete && img.naturalWidth > 0),
    undefined,
    { timeout: 30_000 },
  );

  // 3) Kod çözme, medya duraklatma ve yazı tipi hazırlığı.
  await page.evaluate(async () => {
    await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
    document.querySelectorAll("video").forEach((video) => { video.pause(); video.currentTime = 0; });
    window.scrollTo(0, 0);
    await document.fonts?.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}

/**
 * Yatay taşma ölçümü. Ölçüm belge düzeyindedir: bir bant kendi içinde kaydırma
 * yapabilir, ama belgenin kendisi yatayda büyümemelidir.
 */
export async function measureHorizontalOverflow(page: Page) {
  return page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
}
