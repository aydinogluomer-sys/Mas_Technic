import { expect, type Locator, type Page } from "@playwright/test";

export const LANDING_SCENE_IDS = [
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

export async function gotoAndSettle(page: Page, path: string) {
  // Legacy landing-specific suites remain valuable during the V4 cutover and
  // intentionally exercise the preserved comparison route. The new root route
  // has its own technical-landing contract suite.
  const resolvedPath = path === "/" ? "/legacy-landing" : path;
  await page.goto(resolvedPath, { waitUntil: "domcontentloaded" });
  await expect(page.locator("#root")).toBeVisible();
  await page.locator("body").waitFor({ state: "visible" });
  // Persistent analytics/realtime connections make networkidle nondeterministic.
  // Font readiness plus two paint frames is a bounded visual readiness contract.
  await settleRendering(page);
}

/** Hydrates the intent-deferred landing scenes and waits for layout readiness. */
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
  for (const id of LANDING_SCENE_IDS) {
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
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((img) => { img.loading = "eager"; });
    await Promise.all(images.map((img) => img.decode().catch(() => undefined)));
    window.scrollTo(0, 0);
    document.querySelectorAll("video").forEach((video) => video.pause());
    await document.fonts?.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  });
}

export async function assertLovableAuthWasNotCaptured(page: Page) {
  const loginSignature = page.getByRole("heading", { name: /^Log in$/i });
  const googleButton = page.getByRole("button", { name: /Continue with Google/i });
  const githubButton = page.getByRole("button", { name: /Continue with GitHub/i });
  await expect(loginSignature).toHaveCount(0);
  await expect(googleButton).toHaveCount(0);
  await expect(githubButton).toHaveCount(0);
}
