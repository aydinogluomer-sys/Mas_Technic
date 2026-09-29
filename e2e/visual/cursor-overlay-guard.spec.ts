import { dirname } from "node:path";
import { expect, test, type Browser } from "@playwright/test";
import playwrightConfig from "../../playwright.config";
import { freezeVisualState, gotoAndSettle, landingReady, settleRendering } from "../helpers";
import { awaitRealFaces, installFontRetry } from "./fonts";
import {
  CURSOR_LAYER_COUNT,
  CURSOR_MIN_WIDTH,
  CURSOR_PARKED_CLIP,
  CURSOR_SELECTOR,
  NATIVE_CURSOR_HIDDEN_MIN_WIDTH,
  SYNTHETIC_CAPTURES,
  awaitCursorOpportunity,
  finePointerVisualProjects,
  isVisualProject,
  pageScopedGoldenSpecs,
  pointerIsFine,
  readVisualSpecs,
  stripComments,
  type ProjectShape,
} from "./cursor-overlay";

/* ══════════════════════════════════════════════════════════════════════════
   THE CURSOR THRESHOLD IS AN ASSERTION NOW — PHASE 07 CORRECTION #3, H4

   Three consecutive loops wrote the same claim down wrong: that `CustomCursor`
   does not mount below 901 px, and that this is why no golden contains it.
   Both halves are false. `IMPLEMENTATION.md` §10 requires a change of strategy
   when one root cause survives three loops, so the claim stopped being prose.

   WHAT THIS FILE PINS, AND WHY EACH PART EXISTS
   ---------------------------------------------
   1. THE MOUNT MATRIX. Ten (width, pointer) contexts, measured on a real page
      with no pointer ever moved. It contains the cell the retired claim denied
      — 768 px + fine pointer → two layers — so re-asserting the old threshold
      cannot pass.

   2. THE OCCLUSION MEASUREMENT. The goldens really are clean, but for two
      independent reasons, and NEITHER of them is the one that was written down:

        · at 375 and 768 the visual projects emulate touch, which makes
          `(pointer: fine)` false, so nothing mounts. That is a property of
          `playwright.config.ts`, NOT of the component: at 768 with a fine
          pointer both layers mount and paint;
        · at 1280 and 1440 the pointer IS fine, both layers DO mount, and they
          DO paint at the viewport origin — and `landing-golden.spec.ts` really
          does take a page-scoped, full-page capture there. Nothing of them
          reaches the image because the fixed header band sits above them:
          `z-index: 10000` and an opaque graphite ground, against the layers'
          `z-index: 101 / 100`.

      So the second reason is a paint-order accident, and an accident is exactly
      the kind of safety that has to be measured rather than believed. The test
      compares the same 64×64 corner with and without the cursor and requires
      the two to be byte-identical — and then removes the occluder and requires
      the same comparison to DIFFER, so a scan that had gone blind fails loudly
      instead of passing quietly. Measured while writing it: identical with the
      header, six differing pixels without it, at both 1280 and 1440.

   3. THE TRIPWIRES. The occlusion matrix is derived from the config, so a new
      fine-pointer visual project is measured automatically. What cannot be
      derived is which ROUTE a new page-scoped golden would be taken on, so the
      set of specs that take one is pinned; adding another goes red with an
      instruction rather than silently baking the overlay.

   NO GOLDEN IS TOUCHED HERE. Every capture in this file is a bare
   `page.screenshot()` compared against another `page.screenshot()` taken
   seconds earlier in the same context. Nothing is banked.
   ══════════════════════════════════════════════════════════════════════════ */

/** The project the browser-backed halves run in — they build their own contexts. */
const GATE_PROJECT = "visual-1280";

const PROJECTS = (playwrightConfig.projects ?? []) as unknown as ProjectShape[];

const PROBE_ROUTE = "/hakkimizda";

/**
 * The route the one page-scoped golden is captured on. Pinned rather than
 * derived: a regex over spec source can tell that a page-scoped capture EXISTS,
 * but not which URL it happens at.
 */
const PAGE_SCOPED_GOLDENS = [{ spec: "landing-golden.spec.ts", route: "/" }] as const;

type PointerKind = "fine" | "coarse" | "isMobile-without-touch";

const POINTER_CONTEXT: Record<PointerKind, { isMobile?: boolean; hasTouch?: boolean }> = {
  fine: {},
  coarse: { isMobile: true, hasTouch: true },
  "isMobile-without-touch": { isMobile: true, hasTouch: false },
};

const MOUNT_MATRIX: { width: number; pointer: PointerKind }[] = [
  { width: 375, pointer: "fine" },
  { width: 375, pointer: "coarse" },
  { width: 767, pointer: "fine" },
  { width: 768, pointer: "fine" },
  { width: 768, pointer: "coarse" },
  { width: 768, pointer: "isMobile-without-touch" },
  { width: 900, pointer: "fine" },
  { width: 901, pointer: "fine" },
  { width: 1280, pointer: "fine" },
  { width: 1280, pointer: "coarse" },
];

type Cell = { layers: number; finePointer: boolean; bodyCursor: string };

const EXPECTED_MOUNT_MATRIX: Record<string, Cell> = {
  "375/fine": { layers: 0, finePointer: true, bodyCursor: "auto" },
  "375/coarse": { layers: 0, finePointer: false, bodyCursor: "auto" },
  "767/fine": { layers: 0, finePointer: true, bodyCursor: "auto" },
  "768/fine": { layers: 2, finePointer: true, bodyCursor: "auto" },
  "768/coarse": { layers: 0, finePointer: false, bodyCursor: "auto" },
  "768/isMobile-without-touch": { layers: 2, finePointer: true, bodyCursor: "auto" },
  "900/fine": { layers: 2, finePointer: true, bodyCursor: "auto" },
  "901/fine": { layers: 2, finePointer: true, bodyCursor: "none" },
  "1280/fine": { layers: 2, finePointer: true, bodyCursor: "none" },
  "1280/coarse": { layers: 0, finePointer: false, bodyCursor: "auto" },
};

async function measureCell(
  browser: Browser,
  baseURL: string,
  width: number,
  pointer: PointerKind,
): Promise<Cell> {
  const context = await browser.newContext({
    baseURL,
    viewport: { width, height: 900 },
    reducedMotion: "reduce",
    ...POINTER_CONTEXT[pointer],
  });
  try {
    const page = await context.newPage();
    await gotoAndSettle(page, PROBE_ROUTE);
    await awaitCursorOpportunity(page);
    await settleRendering(page);
    return await page.evaluate((selector) => ({
      layers: document.querySelectorAll(selector).length,
      finePointer: matchMedia("(pointer: fine)").matches,
      bodyCursor: getComputedStyle(document.body).cursor,
    }), CURSOR_SELECTOR);
  } finally {
    await context.close();
  }
}

test.describe("H4 — CustomCursor's mount condition, measured", () => {
  test.beforeEach(() => {
    test.skip(
      test.info().project.name !== GATE_PROJECT,
      `builds its own contexts; runs once, in ${GATE_PROJECT}`,
    );
  });
  test.slow();

  test("the whole (width, pointer) matrix is what the browser does", async ({ browser, baseURL }) => {
    expect(baseURL, "the guard needs the preview base URL").toBeTruthy();

    const measured: Record<string, Cell> = {};
    for (const { width, pointer } of MOUNT_MATRIX) {
      measured[`${width}/${pointer}`] = await measureCell(browser, baseURL!, width, pointer);
    }

    expect(
      measured,
      "the mount matrix moved. This is the register three loops of prose kept getting "
        + "wrong; fix the code or re-measure and update THIS table, and then the docs "
        + "that quote it (e2e/visual/cursor-overlay.ts, docs/lean/17 §4)",
    ).toEqual(EXPECTED_MOUNT_MATRIX);

    /* The retired claim, stated as its own counterfactual so the failure names
       it. If `CustomCursor` ever really did stop mounting below 901, THIS is
       the assertion that would go red and invite the docs to change back. */
    expect(
      measured[`${CURSOR_MIN_WIDTH}/fine`].layers,
      `RETIRED CLAIM: "CustomCursor does not mount below 901 px". It mounts from `
        + `${CURSOR_MIN_WIDTH} px upward with a fine pointer — 768 is MOBILE_BREAKPOINT `
        + "in src/hooks/use-mobile.tsx; 901 is the breakpoint of an unrelated "
        + "`cursor: none` rule in src/index.css",
    ).toBe(CURSOR_LAYER_COUNT);

    /* And the two thresholds are different thresholds, which is the whole
       mechanism of the mistake: between them the replacement is mounted while
       the native pointer is still drawn. */
    expect(
      measured[`${NATIVE_CURSOR_HIDDEN_MIN_WIDTH - 1}/fine`],
      `at ${NATIVE_CURSOR_HIDDEN_MIN_WIDTH - 1} px both pointers are drawn: the component `
        + "is mounted and the `cursor: none` rule has not started yet",
    ).toEqual({ layers: CURSOR_LAYER_COUNT, finePointer: true, bodyCursor: "auto" });
  });
});

test.describe("H4 — the goldens are clean, and the reason is measured", () => {
  test.beforeEach(() => {
    test.skip(
      test.info().project.name !== GATE_PROJECT,
      `builds its own contexts; runs once, in ${GATE_PROJECT}`,
    );
  });
  test.slow();

  const finePointerProjects = finePointerVisualProjects(PROJECTS);

  for (const project of finePointerProjects) {
    for (const golden of PAGE_SCOPED_GOLDENS) {
      test(`${project.name}: the cursor contributes no pixel to ${golden.spec}`, async ({
        browser,
        baseURL,
      }) => {
        const viewport = project.use?.viewport;
        expect(viewport, `${project.name} must declare a viewport`).toBeTruthy();

        const context = await browser.newContext({
          baseURL,
          viewport: viewport!,
          reducedMotion: "reduce",
          ...POINTER_CONTEXT.fine,
        });
        try {
          const page = await context.newPage();
          await installFontRetry(page);
          await page.emulateMedia({ reducedMotion: "reduce" });
          await gotoAndSettle(page, golden.route);
          if (golden.route === "/") await landingReady(page);
          await freezeVisualState(page);
          await awaitRealFaces(page);

          /* The premise. If the layers were not mounted and painting here the
             rest of this test would be vacuously green — which is how the
             wrong reason survived three reviews. */
          await expect(
            page.locator(CURSOR_SELECTOR),
            "both layers must be mounted, or this measurement proves nothing",
          ).toHaveCount(CURSOR_LAYER_COUNT);
          const parked = await page.locator(CURSOR_SELECTOR).evaluateAll((nodes) =>
            nodes.map((node) => {
              const rect = node.getBoundingClientRect();
              return {
                opacity: getComputedStyle(node).opacity,
                rect: [Math.round(rect.x), Math.round(rect.y), Math.round(rect.width), Math.round(rect.height)],
              };
            }));
          /* POLISH RUN (2026-09-29): the layers now sit ABOVE the header and the
             menu (`Z.cursor` 10020, portaled to body) so the pointer never
             vanishes over them. The goldens therefore stay clean for a new
             reason: an unarmed cursor is transparent until the first
             `pointermove`, and no capture moves the pointer. */
          expect(parked, "both layers are parked over the viewport origin, unarmed and transparent").toEqual([
            { opacity: "0", rect: [-3, -3, 6, 6] },
            { opacity: "0", rect: [-22, -22, 44, 44] },
          ]);

          const shot = () => page.screenshot({
            clip: { ...CURSOR_PARKED_CLIP },
            animations: "disabled",
            caret: "hide",
          });

          /* Determinism precondition: two consecutive captures of the same
             corner must be identical, or the comparison below means nothing. */
          const first = await shot();
          expect(
            (await shot()).equals(first),
            "the captured corner is not deterministic; the comparison below cannot be trusted",
          ).toBe(true);

          await page.addStyleTag({
            content: `${CURSOR_SELECTOR} { display: none !important; }`,
          });
          expect(
            (await shot()).equals(first),
            "ARMED: the cursor layers reach the composited image at the viewport origin, so a "
              + "page-scoped golden here bakes a foreign fixed overlay — the defect advisory A2 "
              + "removed from 25 baselines. Add [data-custom-cursor] to FOREIGN_OVERLAYS in "
              + "e2e/visual/overlays.ts",
          ).toBe(true);

          /* RED CONTROL, kept in the suite rather than described in a comment.
             The only thing keeping the layers out of the image is the fixed
             header painting above them. Remove it and the identical comparison
             must stop being identical — otherwise the scan has gone blind and
             the assertion above is a no-op that looks like success. */
          await page.addStyleTag({
            content: `${CURSOR_SELECTOR} { display: revert !important; opacity: 1 !important; }`,
          });
          await settleRendering(page);
          const unoccludedWithCursor = await shot();
          await page.addStyleTag({
            content: `${CURSOR_SELECTOR} { display: none !important; }`,
          });
          expect(
            (await shot()).equals(unoccludedWithCursor),
            "CONTROL: with the cursor forced opaque it MUST change the corner — it is above the "
              + "header now. It did not, so this test cannot see the cursor and its green is worthless",
          ).toBe(false);
        } finally {
          await context.close();
        }
      });
    }
  }
});

test.describe("H4 — the configuration the safety depends on", () => {
  test("the gate project still exists, so the measured half cannot vanish quietly", () => {
    const names = PROJECTS.map((project) => project.name);
    expect(
      names,
      `the browser-backed halves of this guard run only in ${GATE_PROJECT}; if it is renamed `
        + "they would skip in every project and this file would pass while measuring nothing",
    ).toContain(GATE_PROJECT);
  });

  test("only touch-emulating visual projects are exempt from the cursor", () => {
    const visual = PROJECTS.filter(isVisualProject);
    expect(visual.length, "the visual project family must not be empty").toBeGreaterThan(0);

    const byPointer = Object.fromEntries(
      visual.map((project) => [project.name, pointerIsFine(project.use) ? "fine" : "coarse"]),
    );
    expect(
      byPointer,
      "a visual project changed pointer class. A project whose pointer is FINE mounts the "
        + "cursor at every width from 768 up, so it must be covered by the occlusion "
        + "measurement above — which derives its matrix from this same list, so simply "
        + "re-measuring and updating this expectation is the correct fix",
    ).toEqual({
      "visual-375": "coarse",
      "visual-768": "coarse",
      "visual-1280": "fine",
      "visual-1440": "fine",
    });
  });

  test("no new page-scoped golden appears without a route to measure it on", () => {
    const specs = readVisualSpecs(dirname(test.info().file));
    expect(specs.length, "the spec scan must not come up empty").toBeGreaterThan(0);

    expect(
      pageScopedGoldenSpecs(specs),
      "a spec now banks a baseline whose frame is the PAGE, which includes the viewport "
        + "origin where both cursor layers are parked. Add it to PAGE_SCOPED_GOLDENS with the "
        + "route it captures, so the occlusion measurement covers it",
    ).toEqual(PAGE_SCOPED_GOLDENS.map((golden) => golden.spec));
  });

  test("the detector is red on the defect it exists to catch", () => {
    /* Synthetic inputs, so the controls stay in the suite instead of being a
       paragraph claiming the detector works. They are imported rather than
       written here: inline, their text made this file flag ITSELF — see the
       note on `SYNTHETIC_CAPTURES`. */
    const { fullPage, viewport, element, commentOnly } = SYNTHETIC_CAPTURES;

    expect(pageScopedGoldenSpecs([fullPage])).toEqual([fullPage.file]);
    expect(pageScopedGoldenSpecs([viewport])).toEqual([viewport.file]);
    expect(pageScopedGoldenSpecs([element]), "element crops do not contain the origin").toEqual([]);
    expect(
      pageScopedGoldenSpecs([commentOnly]),
      "a comment describing a capture is not a capture",
    ).toEqual([]);
    expect(stripComments("a // b\nc")).toBe("a \nc");

    /* And the pointer predicate, on the shape that actually bit: `isMobile`
       without `hasTouch` leaves the pointer fine and the cursor mounted. */
    expect(pointerIsFine({ hasTouch: true })).toBe(false);
    expect(pointerIsFine({ isMobile: true, hasTouch: true })).toBe(false);
    expect(
      pointerIsFine({ isMobile: true }),
      "isMobile alone does NOT make the pointer coarse — measured at 768: two layers mount",
    ).toBe(true);
    expect(pointerIsFine(undefined)).toBe(true);

    expect(
      finePointerVisualProjects([
        { name: "visual-900", testMatch: ["visual/**/*.spec.ts"], use: { isMobile: true } },
        { name: "visual-320", testMatch: ["visual/**/*.spec.ts"], use: { hasTouch: true } },
        { name: "desktop-1280", use: {} },
      ]).map((project) => project.name),
      "a visual project that emulates a phone WITHOUT touch still paints the cursor",
    ).toEqual(["visual-900"]);
  });
});
