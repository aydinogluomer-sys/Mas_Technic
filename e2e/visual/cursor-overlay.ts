import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";

/* ══════════════════════════════════════════════════════════════════════════
   THE CURSOR'S MOUNT CONDITION, AS DATA — PHASE 07 CORRECTION #3, H4

   This file exists because the same claim was written down wrong three times
   in a row, in prose, in three different places. `IMPLEMENTATION.md` §10 says
   that when one root cause survives three loops the STRATEGY changes, so the
   threshold is no longer a sentence anyone has to trust. It is a constant here
   and an assertion in `./cursor-overlay-guard.spec.ts`, and the next person to
   get it wrong is told by a red test.

   WHAT WAS WRITTEN WRONG, EVERY TIME
   ----------------------------------
   That `CustomCursor` does not mount below 901 px. It does. `901` is the
   breakpoint of the `cursor: none` rule at `src/index.css:786` — a different
   rule, in a different file, for a different job — and it is quoted in a
   docblock inside `CustomCursor.tsx`. A comment describing a stylesheet was
   read as the component's own mount condition.

   WHAT THE BROWSER ACTUALLY DOES (measured, `/hakkimizda` and `/`, reduce,
   no pointer ever moved):

     width  pointer   layers   computed `body { cursor }`
     ────────────────────────────────────────────────────
      375   fine        0      auto
      375   coarse      0      auto
      767   fine        0      auto
      768   fine        2      auto     ← mounts here, NOT at 901
      768   coarse      0      auto
      900   fine        2      auto
      901   fine        2      none     ← the 901 rule starts here
     1280   fine        2      none
     1280   coarse      0      auto

   So there are two thresholds and they are 133 px apart. Between 768 and 900
   with a fine pointer BOTH pointers are drawn: the replacement mounts and the
   stylesheet has not yet taken the native one away.
   ══════════════════════════════════════════════════════════════════════════ */

/** Both layers carry it: `CustomCursor.tsx` `data-custom-cursor="dot" | "ring"`. */
export const CURSOR_SELECTOR = "[data-custom-cursor]";

/** A dot and a ring. */
export const CURSOR_LAYER_COUNT = 2;

/**
 * The real floor, and where it comes from: `MOBILE_BREAKPOINT` in
 * `src/hooks/use-mobile.tsx` is 768, `useIsMobile()` is `width < 768`, and
 * `CustomCursor` returns null on `isMobile || !finePointer`. Below this width
 * the component renders nothing at any pointer type; at or above it renders
 * whenever the pointer is fine.
 */
export const CURSOR_MIN_WIDTH = 768;

/**
 * NOT the mount threshold. The breakpoint of the `cursor: none` rule in
 * `src/index.css`, kept here only so the guard can assert the two apart.
 */
export const NATIVE_CURSOR_HIDDEN_MIN_WIDTH = 901;

/**
 * The parked geometry, before any pointer has moved: the dot is 6×6 centred on
 * the viewport origin and the ring is 44×44 centred on it, both `opacity: 1`.
 * A capture whose frame includes (0,0) therefore includes up to 22×22 px of
 * cursor unless something paints over it.
 */
export const CURSOR_PARKED_CLIP = { x: 0, y: 0, width: 64, height: 64 } as const;

/** The subset of a Playwright project's `use` this file reasons about. */
export type PointerUse = {
  isMobile?: boolean;
  hasTouch?: boolean;
  viewport?: { width: number; height: number } | null;
};

/**
 * Give the cursor the same chance to appear at every width before counting.
 *
 * `App.tsx` mounts `CustomCursor` through `lazy` + `Suspense`, so a count of
 * zero means nothing until the chunk has had time to land. Measured while
 * writing this guard: a flat 500 ms wait reported 0 layers at 768 + fine on a
 * loaded machine and 2 on an idle one — the first version of the test was
 * itself flaky, in the direction of the retired claim.
 *
 * The budget and the exit condition are IDENTICAL for every context, including
 * the ones expected to stay at zero. Polling only where layers are expected
 * would manufacture the answer instead of measuring it, so the widths that
 * mount nothing spend the whole budget proving it and the ones that mount
 * return in a few hundred milliseconds.
 */
export async function awaitCursorOpportunity(page: Page, timeout = 4_000): Promise<void> {
  await page
    .waitForFunction(
      (selector) => document.querySelectorAll(selector).length > 0,
      CURSOR_SELECTOR,
      { timeout },
    )
    .catch(() => undefined);
}

/**
 * MEASURED, not assumed, and the distinction is load-bearing.
 *
 * `playwright.config.ts` marks its 375 and 768 visual projects `mobile: true`,
 * which spreads to `{ isMobile: true, hasTouch: true }`. It is easy — and
 * wrong — to read that as "isMobile suppresses the cursor". At 768 with
 * `{ isMobile: true, hasTouch: false }` Chromium still reports
 * `(pointer: fine)` and BOTH layers mount; with `{ hasTouch: true }` alone it
 * reports `(pointer: coarse)` and neither does. `hasTouch` is the whole
 * mechanism, so that is what this predicate reads. A future project that sets
 * `isMobile` without `hasTouch` would paint the cursor, and this returns true
 * for it, which is the answer that keeps the guard honest.
 */
export function pointerIsFine(use: PointerUse | undefined): boolean {
  return use?.hasTouch !== true;
}

export type ProjectShape = { name: string; testMatch?: unknown; use?: PointerUse };

/** A project belongs to the golden family if it runs `e2e/visual/**`. */
export function isVisualProject(project: ProjectShape): boolean {
  const match = project.testMatch;
  const patterns = Array.isArray(match) ? match : match === undefined ? [] : [match];
  return patterns.some((pattern) => typeof pattern === "string" && pattern.startsWith("visual/"));
}

/** Visual projects whose pointer is fine, i.e. the ones that mount the cursor. */
export function finePointerVisualProjects(projects: readonly ProjectShape[]): ProjectShape[] {
  return projects.filter((project) => isVisualProject(project) && pointerIsFine(project.use));
}

export type SpecSource = { file: string; text: string };

/**
 * The caller passes `dirname(testInfo.file)` — the guard reads the directory it
 * is itself running from, rather than a path built from the process cwd, which
 * would let the scan silently point at nothing.
 */
export function readVisualSpecs(dir: string): SpecSource[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith(".spec.ts"))
    .sort()
    .map((file) => ({ file, text: readFileSync(join(dir, file), "utf8") }));
}

/** Comments describe; only code captures. Strip them before pattern-matching. */
export function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
}

/**
 * Specs that bank a baseline whose FRAME IS THE PAGE rather than an element.
 *
 * Only these can contain the viewport origin, and only `toHaveScreenshot`
 * writes a baseline at all — a bare `page.screenshot()` (this guard uses one)
 * compares against nothing and bakes nothing, so it is deliberately not
 * flagged.
 */
export function pageScopedGoldenSpecs(sources: readonly SpecSource[]): string[] {
  return sources
    .filter(({ text }) => {
      const code = stripComments(text);
      if (/expect\(\s*page\s*\)\s*\.\s*toHaveScreenshot/.test(code)) return true;
      return /toHaveScreenshot/.test(code) && /fullPage\s*:\s*true/.test(code);
    })
    .map(({ file }) => file);
}

/**
 * Synthetic inputs for the detector's own red controls.
 *
 * They live HERE, in a module the scan does not read, for a reason worth
 * recording: written inline in the guard spec, the fixture string
 * `"…expect(page).toHaveScreenshot…"` made the detector flag its own source
 * file — measured, on the first run. The tempting fix is to skip the guard's
 * file, and a scanner with one file skipped is a scanner with a hole. So the
 * fixtures moved out of the scanned set instead; `readVisualSpecs` reads only
 * `*.spec.ts`.
 */
export const SYNTHETIC_CAPTURES: Record<
  "fullPage" | "viewport" | "element" | "commentOnly",
  SpecSource
> = {
  fullPage: {
    file: "hypothetical-fullpage.spec.ts",
    text: 'await expect(section).toHaveScreenshot("x.png", { fullPage: true });',
  },
  viewport: {
    file: "hypothetical-viewport.spec.ts",
    text: 'await expect(page).toHaveScreenshot("y.png");',
  },
  element: {
    file: "hypothetical-element.spec.ts",
    text: 'await expect(page.locator("footer")).toHaveScreenshot("z.png");',
  },
  commentOnly: {
    file: "hypothetical-comment.spec.ts",
    text: "/* we do not use expect(page).toHaveScreenshot here */\nconst x = 1;",
  },
};
