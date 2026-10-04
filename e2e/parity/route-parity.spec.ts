import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle } from "../helpers";
import { hideForeignOverlays } from "../visual/overlays";

/**
 * PARITY HARNESS — "same behaviour, fewer lines" must render the same pixels.
 *
 * Opt-in (PLAYWRIGHT_PARITY=1 → projects parity-375 / parity-1440). Snapshots
 * live in `.parity/` (git-ignored), never in the repo: the "before" set is
 * recorded from an origin/main build with --update-snapshots, the branch is
 * then compared at maxDiffPixels 0. Steps: docs/quality/mas-technic-awwwards/
 * parity.md.
 *
 *   PARITY_DIST   built dist the server serves (route list), default `dist`
 *   PARITY_SCOPE  `full` (every prerendered route) or `sample` (one per section)
 *
 * Menu states are driven by keyboard only: a pointer move would mount the
 * custom cursor (App.tsx) and paint it into the frame.
 */

const DIST = process.env.PARITY_DIST ?? "dist";
const SCOPE = process.env.PARITY_SCOPE ?? "sample";

function prerenderedRoutes(): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) { if (name !== "assets") walk(path); }
      else if (name.endsWith(".html") && !["404.html", "shell.html"].includes(name)) files.push(path);
    }
  };
  walk(DIST);
  return files
    .map((file) => `/${relative(DIST, file).split(sep).join("/").replace(/\.html$/, "")}`.replace(/^\/index$/, "/"))
    .sort();
}

function scoped(routes: string[]) {
  if (SCOPE === "full") return routes;
  const firstOf = new Map<string, string>();
  for (const route of routes) {
    const key = route.split("/").slice(0, route.startsWith("/en/") ? 3 : 2).join("/");
    if (!firstOf.has(key)) firstOf.set(key, route);
  }
  return [...firstOf.values()];
}

// Long pages at 1440 need more than the 5 s default to give two identical
// full-page captures; a timeout is not a pixel difference.
test.describe.configure({ timeout: 180_000 });
const SHOT = { maxDiffPixels: 0, timeout: 30_000 } as const;

const shotName = (route: string) => `${route === "/" ? "home" : route.slice(1).replace(/\//g, "__")}.png`;

async function prepare(page: Page) {
  await page.route(/supabase\.co/, (route) => route.abort());
}

/* Deterministic resting frame. Animations are run to their END, not paused
   (a reveal paused at frame 0 leaves an image blank — seen on `/` at 1440),
   lazy images are reached by scrolling, and every image is decoded. */
async function rest(page: Page) {
  await page.evaluate(async () => {
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    // decoding=sync: Chromium's full-page capture otherwise paints off-screen
    // async-decoded images blank now and then (noise run, `/` at 1440).
    document.querySelectorAll("img").forEach((img) => { img.loading = "eager"; img.decoding = "sync"; });
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.max(200, window.innerHeight)) {
      window.scrollTo(0, y);
      await frame();
    }
    window.scrollTo(0, 0);
    // decode() can stay pending on an image that never loads; cap each wait.
    await Promise.all([...document.images].map((img) =>
      Promise.race([img.decode().catch(() => undefined), new Promise((resolve) => setTimeout(resolve, 5000))])));
    for (const animation of document.getAnimations()) {
      if (Number.isFinite(Number(animation.effect?.getComputedTiming().endTime))) animation.finish();
    }
    await frame();
    await frame();
  });
  await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
}

test.describe("route parity", () => {
  for (const route of scoped(prerenderedRoutes())) {
    test(route, async ({ page }) => {
      await prepare(page);
      await gotoAndSettle(page, route);
      await hideForeignOverlays(page);
      await rest(page);
      await expect(page).toHaveScreenshot(shotName(route), { ...SHOT, fullPage: true });
    });
  }
});

/* The fullscreen menu, in both motion modes, on the landing and an inner page.
   No mid-animation frame: on main the menu animates through framer-motion,
   whose frames are not all WAAPI, so a paused mid-close frame differs run to
   run (noise runs). The close animation is checked by fullscreen-menu.spec.ts
   and by hand in Faz 2. */
const MENU_ROUTES = ["/", "/hizmetler/cnc-frezeleme"];
const settled = (page: Page) =>
  expect.poll(() => page.evaluate(() => document.getAnimations()
    .filter((a) => a.playState === "running" && Number.isFinite(Number(a.effect?.getComputedTiming().endTime))).length)).toBe(0);

for (const motion of ["reduce", "no-preference"] as const) {
  test.describe(`menu parity (${motion})`, () => {
    for (const route of MENU_ROUTES) {
      const base = `menu-${motion}-${shotName(route).replace(/\.png$/, "")}`;

      test(`${route} menu states`, async ({ page }) => {
        await prepare(page);
        await page.emulateMedia({ reducedMotion: motion });
        await gotoAndSettle(page, route);
        await hideForeignOverlays(page);
        const trigger = page.locator("[data-menu-trigger]").first();

        // Keyboard focus ring on the trigger.
        await trigger.focus();
        await page.keyboard.press("Shift+Tab");
        await page.keyboard.press("Tab");
        await expect(trigger).toBeFocused();
        await expect(page).toHaveScreenshot(`${base}-trigger-focus.png`, SHOT);

        await page.keyboard.press("Enter");
        const menu = page.locator("[data-fullscreen-menu]");
        await expect(menu).toBeVisible();
        await settled(page);
        const families = menu.locator("button[aria-pressed]:not([lang])");
        for (let index = 0; index < Math.min(4, await families.count()); index += 1) {
          await families.nth(index).focus();
          await page.keyboard.press("Enter");
          await settled(page); // the category panel swaps exit-then-enter: act on the new one only
          const category = menu.locator("[data-nav-category]").first();
          if ((await category.count()) && (await category.getAttribute("aria-expanded")) === "false") {
            await category.focus();
            await page.keyboard.press("Enter");
            await settled(page);
          }
          await expect(page).toHaveScreenshot(`${base}-family-${index + 1}.png`, SHOT);
        }
      });
    }
  });
}
