import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { freezeVisualState, gotoAndSettle, landingReady } from "../helpers";
import { awaitRealFaces, installFontRetry } from "./fonts";
import { CURSOR_SELECTOR, readVisualSpecs, stripComments } from "./cursor-overlay";

/* ══════════════════════════════════════════════════════════════════════════
   QA ROUND 4 — INDEPENDENT CONFIRMATION OF H4, AND TWO TRIPWIRES THE CODER'S
   GUARD LEAVES OPEN

   This file is QA-owned. It does NOT duplicate `cursor-overlay-guard.spec.ts`:
   everything here is a question that guard does not ask.

   1. THE §2.4 COUNTERFACTUAL, MEASURED.
      The Coder refused the packet's literal invariant partly on this claim:
      "adding [data-custom-cursor] to FOREIGN_OVERLAYS would move
      landing-fullpage.png at 1280 and 1440". `hideForeignOverlays` does
      nothing but `display: none`, and the cursor measurably contributes zero
      pixels to the corner — so the claim is checkable, and a refusal resting
      on a wrong reason is the exact failure mode this phase spent three loops
      on. It is settled here by capturing the landing page the way
      `landing-golden.spec.ts` captures it, with the cursor and without it.

      NOTHING IS BANKED. Both frames are bare `page.screenshot()` compared
      against each other in the same context; no baseline is read or written.

   2. THE SCAN IS NOT RECURSIVE BUT THE CONFIG IS.
      `readVisualSpecs` is a flat `readdirSync`, while `playwright.config.ts`
      matches visual specs RECURSIVELY (a double-star glob under `visual/`).
      Measured with a synthetic tree: a spec one
      directory down RUNS and is NOT SCANNED, so a page-scoped golden added at
      `e2e/visual/<anything>/x.spec.ts` would bake the cursor with the guard
      still green. Today no such directory exists; this fails the day one does.

   3. THE DETECTOR ONLY KNOWS THE IDENTIFIER `page`.
      Measured: `const p = page; expect(p).toHaveScreenshot(...)`, and the
      fixture rename `async ({ page: view })`, both escape
      `pageScopedGoldenSpecs` entirely. That is the dangerous direction — a
      page-scoped golden the guard cannot see. Today no visual spec renames the
      fixture; this fails the day one does.
   ══════════════════════════════════════════════════════════════════════════ */

const GATE_PROJECT = "visual-1280";

/** Byte-exact differing-pixel count between two PNG buffers, decoded in-page. */
async function differingPixels(page: Page, a: Buffer, b: Buffer): Promise<number> {
  return page.evaluate(async ([p, q]) => {
    const load = (s: string) => new Promise<HTMLImageElement>((res) => {
      const img = new Image();
      img.onload = () => res(img);
      img.src = "data:image/png;base64," + s;
    });
    const [ia, ib] = await Promise.all([load(p), load(q)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return -1;
    const cv = document.createElement("canvas");
    cv.width = ia.width;
    cv.height = ia.height;
    const cx = cv.getContext("2d", { willReadFrequently: true })!;
    cx.drawImage(ia, 0, 0);
    const da = cx.getImageData(0, 0, cv.width, cv.height).data;
    cx.clearRect(0, 0, cv.width, cv.height);
    cx.drawImage(ib, 0, 0);
    const db = cx.getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 0; i < da.length; i += 4) {
      if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) n += 1;
    }
    return n;
  }, [a.toString("base64"), b.toString("base64")] as [string, string]);
}

/**
 * Reproduce `landing-golden.spec.ts`'s settle exactly.
 *
 * A first attempt at this measurement used an ad-hoc freeze and its own
 * determinism control came back at 131 838 differing pixels — noise far larger
 * than the signal, which would have made any conclusion drawn from it fiction.
 * The reverse-scroll poll below is the part that matters: without it the
 * framer spring is still travelling when the frame is taken.
 */
async function settleLandingLikeTheGoldenDoes(page: Page): Promise<void> {
  await installFontRetry(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoAndSettle(page, "/");
  await landingReady(page);
  await page.waitForLoadState("networkidle");
  await freezeVisualState(page);
  await awaitRealFaces(page);
  await expect
    .poll(() => page.locator("[data-reverse-scroll-content]").evaluateAll((nodes) =>
      nodes.map((node) => [
        node.parentElement?.getAttribute("data-reverse-scroll-enabled"),
        getComputedStyle(node).transform,
      ].join(":"))))
    .toEqual(["false:none", "false:none"]);
}

test.describe("QA R4 — would hiding the cursor actually move the landing baseline?", () => {
  test.beforeEach(() => {
    test.skip(
      test.info().project.name !== GATE_PROJECT,
      `builds its own contexts; runs once, in ${GATE_PROJECT}`,
    );
  });
  test.slow();

  for (const viewport of [{ width: 1280, height: 900 }, { width: 1440, height: 900 }]) {
    test(`${viewport.width}: the cursor's contribution to the page-scoped frame`, async ({
      browser,
      baseURL,
    }: { browser: Browser; baseURL?: string }) => {
      test.setTimeout(180_000);
      const context = await browser.newContext({ baseURL, viewport, reducedMotion: "reduce" });
      try {
        const page = await context.newPage();
        await settleLandingLikeTheGoldenDoes(page);

        await expect(
          page.locator(CURSOR_SELECTOR),
          "the premise: both layers must be mounted, or this measures nothing",
        ).toHaveCount(2);

        const frame = () => page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" });

        const asShipped = await frame();
        /* Determinism first. Without this the comparison below is worthless,
           and the first version of this probe proved that the hard way. */
        expect(
          await differingPixels(page, asShipped, await frame()),
          "two consecutive page-scoped frames are not identical; nothing below can be trusted",
        ).toBe(0);

        await page.addStyleTag({ content: `${CURSOR_SELECTOR} { display: none !important; }` });
        const cursorHidden = await frame();

        expect(
          await differingPixels(page, asShipped, cursorHidden),
          "hiding [data-custom-cursor] changed the page-scoped frame. If this is non-zero the "
            + "cursor IS reaching landing-fullpage.png and the guard's ARMED assertion should "
            + "already have failed; if it is zero, adding the cursor to FOREIGN_OVERLAYS would "
            + "not move the baseline and any refusal resting on 'it would move the golden' is "
            + "resting on a wrong reason",
        ).toBe(0);
      } finally {
        await context.close();
      }
    });
  }
});

test.describe("QA R4 — the two ways the Coder's scan can be walked around", () => {
  test("the spec scan is flat, so no visual spec may live in a subdirectory", () => {
    const dir = dirname(test.info().file);
    const nested = readdirSync(dir)
      .filter((entry) => statSync(join(dir, entry)).isDirectory())
      .flatMap((sub) =>
        readdirSync(join(dir, sub))
          .filter((file) => file.endsWith(".spec.ts"))
          .map((file) => `${sub}/${file}`));

    expect(
      nested,
      "playwright.config.ts matches `visual/**/*.spec.ts` (recursive) but "
        + "readVisualSpecs() in e2e/visual/cursor-overlay.ts is a flat readdirSync. A spec in a "
        + "subdirectory therefore RUNS while being invisible to the page-scoped-golden "
        + "detector — measured on a synthetic tree. Either keep visual specs flat, or make "
        + "readVisualSpecs recursive before adding one.",
    ).toEqual([]);
  });

  test("no visual spec renames or aliases the `page` fixture", () => {
    const offenders = readVisualSpecs(dirname(test.info().file))
      .map(({ file, text }) => ({ file, code: stripComments(text) }))
      .filter(({ code }) =>
        /\{\s*page\s*:\s*\w+/.test(code) || /\b(?:const|let|var)\s+\w+\s*=\s*page\s*;/.test(code))
      .map(({ file }) => file);

    expect(
      offenders,
      "pageScopedGoldenSpecs() matches the literal identifier `page`. Measured: both "
        + "`const p = page; expect(p).toHaveScreenshot(...)` and the fixture rename "
        + "`async ({ page: view })` escape it completely, which is the dangerous direction — "
        + "a page-scoped golden the guard cannot see. Do not rename the fixture in a visual "
        + "spec without teaching the detector about it.",
    ).toEqual([]);
  });
});
