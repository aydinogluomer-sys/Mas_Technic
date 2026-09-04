import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { expect, test, type Browser, type Page } from "@playwright/test";
import { freezeVisualState, gotoAndSettle, landingReady } from "../helpers";
import { awaitRealFaces, installFontRetry } from "./fonts";
import { CURSOR_SELECTOR, readVisualSpecs, stripComments } from "./cursor-overlay";

/* ══════════════════════════════════════════════════════════════════════════
   QA ROUND 4 — INDEPENDENT CONFIRMATION OF H4, AND TWO TRIPWIRES THE CODER'S
   GUARD LEAVES OPEN

   QA-owned. Nothing here duplicates `cursor-overlay-guard.spec.ts`; every
   question below is one that guard does not ask.

   NOTE ON THIS FILE'S OWN VOCABULARY. The sibling detector matches the literal
   name of Playwright's baseline-comparison assertion ANYWHERE in a spec's
   non-comment text, string literals included. Measured: an earlier draft named
   that assertion inside a failure message and, because this file also uses a
   whole-page capture option, the detector flagged THIS FILE and turned the
   Coder's guard red. The API is therefore referred to by description here and
   never by name — the same reason `SYNTHETIC_CAPTURES` was moved out of the
   scanned set rather than the scanner being taught to skip a file.

   1. THE §2.4 COUNTERFACTUAL, MEASURED.
      The Coder refused the packet's literal invariant partly on this claim:
      "adding [data-custom-cursor] to FOREIGN_OVERLAYS would move
      landing-fullpage.png at 1280 and 1440". `hideForeignOverlays` does
      nothing but `display: none`, and the cursor measurably contributes zero
      pixels to the viewport corner it is parked over. So the claim is
      checkable, and a refusal resting on a wrong reason is precisely the
      failure mode this phase spent three loops on.

      NOTHING IS BANKED. Every frame is a bare `page.screenshot()` compared
      against another `page.screenshot()` from the same context; no baseline
      under `e2e/__golden__` is read or written.

   2. THE SCAN IS FLAT BUT THE CONFIG IS RECURSIVE.
      `readVisualSpecs` is a flat `readdirSync`, while `playwright.config.ts`
      matches visual specs recursively (a double-star glob under the visual
      directory). Measured on a synthetic tree: a spec one directory down RUNS
      and is NOT SCANNED, so a whole-page baseline added below `e2e/visual/`
      would bake the cursor with the guard still green. No such directory
      exists today; this fails the day one does.

   3. THE DETECTOR ONLY KNOWS THE IDENTIFIER `page`.
      Measured: assigning the fixture to another name, and renaming it in the
      destructuring pattern, both escape the detector completely. That is the
      dangerous direction — a whole-page baseline the guard cannot see. No
      visual spec does either today; this fails the day one does.
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
 * A whole-page frame that has stopped moving.
 *
 * Playwright's own baseline comparison retries until it gets two consecutive
 * stable captures; a bare `page.screenshot()` does not, and the first version
 * of this measurement paid for that. Measured on `/` at 1280 with the golden
 * spec's full settle already applied: two consecutive bare captures differed
 * by 150 688 pixels — noise an order of magnitude larger than the ~500 px the
 * cursor could possibly contribute, which would have made any conclusion drawn
 * from it fiction. So stability is established here, and asserted by the
 * caller, before anything is concluded.
 */
async function stableFrame(page: Page, attempts = 10): Promise<{ frame: Buffer; settledAfter: number }> {
  const shot = () => page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" });
  let previous = await shot();
  for (let i = 1; i <= attempts; i += 1) {
    const next = await shot();
    if (next.equals(previous)) return { frame: next, settledAfter: i };
    previous = next;
  }
  return { frame: previous, settledAfter: -1 };
}

/** Reproduce `landing-golden.spec.ts`'s settle exactly, including its poll. */
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
    test(`${viewport.width}: the cursor's contribution to the whole-page frame`, async ({
      browser,
      baseURL,
    }: { browser: Browser; baseURL?: string }) => {
      test.setTimeout(240_000);
      const context = await browser.newContext({ baseURL, viewport, reducedMotion: "reduce" });
      try {
        const page = await context.newPage();
        await settleLandingLikeTheGoldenDoes(page);

        await expect(
          page.locator(CURSOR_SELECTOR),
          "the premise: both layers must be mounted, or this measures nothing",
        ).toHaveCount(2);

        const asShipped = await stableFrame(page);
        expect(
          asShipped.settledAfter,
          "the whole-page frame never stopped moving, so nothing below can be trusted",
        ).toBeGreaterThan(0);

        await page.addStyleTag({ content: `${CURSOR_SELECTOR} { display: none !important; }` });
        const cursorHidden = await stableFrame(page);
        expect(cursorHidden.settledAfter, "the cursor-hidden frame never settled").toBeGreaterThan(0);

        expect(
          await differingPixels(page, asShipped.frame, cursorHidden.frame),
          "hiding [data-custom-cursor] changed the whole-page frame. Non-zero means the cursor "
            + "IS reaching landing-fullpage.png and the sibling guard's ARMED assertion should "
            + "already have failed. Zero means adding the cursor to FOREIGN_OVERLAYS would not "
            + "move the baseline, and any refusal resting on 'it would move the golden' rests "
            + "on a wrong reason.",
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
      "playwright.config.ts matches visual specs recursively, but readVisualSpecs() in "
        + "e2e/visual/cursor-overlay.ts is a flat readdirSync. A spec in a subdirectory "
        + "therefore RUNS while being invisible to the whole-page-baseline detector — measured "
        + "on a synthetic tree. Either keep visual specs flat, or make readVisualSpecs "
        + "recursive before adding one.",
    ).toEqual([]);
  });

  test("no visual spec renames or aliases the `page` fixture", () => {
    /* Both offending shapes are matched from source rather than written out in
       their literal syntax: spelling them here would put them in this file's
       own text and make the test flag itself, which is how the first draft of
       this test failed. */
    const RENAMED_IN_PATTERN = new RegExp("\\{\\s*page\\s*:\\s*[a-z]\\w*");
    const ASSIGNED_TO_ALIAS = new RegExp("\\b(?:const|let|var)\\s+\\w+\\s*=\\s*page\\s*;");

    const offenders = readVisualSpecs(dirname(test.info().file))
      .map(({ file, text }) => ({ file, code: stripComments(text) }))
      .filter(({ code }) => RENAMED_IN_PATTERN.test(code) || ASSIGNED_TO_ALIAS.test(code))
      .map(({ file }) => file);

    expect(
      offenders,
      "the whole-page-baseline detector in e2e/visual/cursor-overlay.ts matches the literal "
        + "identifier `page`. Measured: aliasing the fixture to another name, or renaming it "
        + "in the destructuring pattern, both escape it completely — the dangerous direction, "
        + "because the resulting baseline is one the guard cannot see. Do not rename the "
        + "fixture in a visual spec without teaching the detector about it.",
    ).toEqual([]);
  });
});
