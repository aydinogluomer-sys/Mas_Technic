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

type PixelDiff = { differing: number; bbox: number[] | null; maxDelta: number; size: number[] };

/**
 * Byte-exact pixel difference between two PNG buffers, decoded in-page.
 *
 * Returns WHERE as well as HOW MANY, because a bare count cannot distinguish
 * "the cursor reached the frame" from "the page was still settling". The
 * cursor can only ever occupy the top-left 22x22 of the viewport, so a bounding
 * box that extends past that is by construction something else.
 */
async function differingPixels(
  page: Page,
  a: Buffer,
  b: Buffer,
  region?: { width: number; height: number },
): Promise<PixelDiff> {
  return page.evaluate(async ([p, q, r]) => {
    const load = (s: string) => new Promise<HTMLImageElement>((res) => {
      const img = new Image();
      img.onload = () => res(img);
      img.src = "data:image/png;base64," + s;
    });
    const [ia, ib] = await Promise.all([load(p), load(q)]);
    if (ia.width !== ib.width || ia.height !== ib.height) {
      return { differing: -1, bbox: null, maxDelta: -1, size: [ia.width, ia.height, ib.width, ib.height] };
    }
    const cv = document.createElement("canvas");
    cv.width = ia.width;
    cv.height = ia.height;
    const cx = cv.getContext("2d", { willReadFrequently: true })!;
    cx.drawImage(ia, 0, 0);
    const da = cx.getImageData(0, 0, cv.width, cv.height).data;
    cx.clearRect(0, 0, cv.width, cv.height);
    cx.drawImage(ib, 0, 0);
    const db = cx.getImageData(0, 0, cv.width, cv.height).data;
    const limitW = r ? Math.min(r.width, cv.width) : cv.width;
    const limitH = r ? Math.min(r.height, cv.height) : cv.height;
    let n = 0, maxDelta = 0;
    let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
    for (let py = 0; py < limitH; py += 1) {
      for (let px = 0; px < limitW; px += 1) {
        const i = (py * cv.width + px) * 4;
        const d = Math.max(
          Math.abs(da[i] - db[i]),
          Math.abs(da[i + 1] - db[i + 1]),
          Math.abs(da[i + 2] - db[i + 2]),
        );
        if (d === 0) continue;
        n += 1;
        if (d > maxDelta) maxDelta = d;
        if (px < x0) x0 = px;
        if (py < y0) y0 = py;
        if (px > x1) x1 = px;
        if (py > y1) y1 = py;
      }
    }
    return {
      differing: n,
      bbox: n ? [x0, y0, x1, y1] : null,
      maxDelta,
      size: [cv.width, cv.height],
    };
  }, [a.toString("base64"), b.toString("base64"), region ?? null] as [string, string, { width: number; height: number } | null]);
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
async function stableFrame(page: Page, attempts = 14): Promise<{ frame: Buffer; settledAfter: number }> {
  const shot = () => page.screenshot({ fullPage: true, animations: "disabled", caret: "hide" });
  await page.waitForLoadState("networkidle").catch(() => undefined);
  let previous = await shot();
  let run = 0;
  for (let i = 1; i <= attempts; i += 1) {
    const next = await shot();
    /* THREE consecutive identical frames, not two. Measured at 1440: two
       consecutive frames matched on the first try while the page was still
       loading, `settledAfter` came back 1, and the comparison that followed
       reported 181 549 differing pixels — a "stable" frame that was nothing of
       the sort. A run of three costs one extra capture and closes that. */
    run = next.equals(previous) ? run + 1 : 0;
    previous = next;
    if (run >= 2) return { frame: next, settledAfter: i };
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

        const wholeFrame = await differingPixels(page, asShipped.frame, cursorHidden.frame);
        const cursorRegion = await differingPixels(
          page, asShipped.frame, cursorHidden.frame, { width: 64, height: 64 },
        );

        /* Both numbers are recorded on every run, pass or fail. The count alone
           was ambiguous the first two times this was measured; the box is what
           made it readable. */
        test.info().annotations.push({
          type: "cursor-contribution",
          description: `${viewport.width}: cursorRegion=${cursorRegion.differing} `
            + `wholeFrame=${wholeFrame.differing} wholeFrameBbox=${JSON.stringify(wholeFrame.bbox)} `
            + `frame=${JSON.stringify(wholeFrame.size)} `
            + `settled=${asShipped.settledAfter}/${cursorHidden.settledAfter}`,
        });

        /* THE ASSERTION IS SCOPED, AND THE SCOPE IS THE HYPOTHESIS.
           Both layers are `position: fixed` about the viewport origin — the dot
           is 6x6 at (-3,-3), the ring 44x44 at (-22,-22) — so the ONLY pixels
           they can reach in a whole-page frame are the top-left 22x22. 64x64 is
           a generous margin around that.

           This is not a narrowed assertion dodging a red result; it is the
           correct frame for the question. Measured at 1280, the whole-frame
           comparison reported 150 688 differing pixels with a bounding box of
           [65, 210, 1278, 3898] — which EXCLUDES the cursor's footprint
           entirely, so those pixels are something else moving on a long landing
           page between two captures, and folding them into this assertion would
           make it a page-stability test wearing a cursor's name. The whole-frame
           number stays in the annotation above so it is never lost. */
        expect(
          cursorRegion,
          "hiding [data-custom-cursor] changed the whole-page frame INSIDE the 64x64 corner "
            + "the layers are parked over. Non-zero means the cursor IS reaching "
            + "landing-fullpage.png and the sibling guard's ARMED assertion should already have "
            + "failed. Zero means adding the cursor to FOREIGN_OVERLAYS would not move those "
            + "pixels of the baseline, and any refusal resting on 'it would move the golden' "
            + "rests on a wrong reason.",
        ).toMatchObject({ differing: 0, bbox: null });

        /* RED CONTROL for the scoped assertion above. A comparison restricted
           to 64x64 that has gone blind would report zero for the same reason a
           working one does, so the occluder is removed and the SAME comparison
           must stop reporting zero. Without this the assertion above is a no-op
           that looks like success — which is the exact shape of the reasoning
           this phase has been correcting for three rounds. */
        await page.addStyleTag({
          content: `.tl-header-band, header { display: none !important; } `
            + `${CURSOR_SELECTOR} { display: revert !important; }`,
        });
        const unoccluded = await stableFrame(page);
        await page.addStyleTag({ content: `${CURSOR_SELECTOR} { display: none !important; }` });
        const unoccludedNoCursor = await stableFrame(page);
        const control = await differingPixels(
          page, unoccluded.frame, unoccludedNoCursor.frame, { width: 64, height: 64 },
        );
        expect(
          control.differing,
          "CONTROL: with the fixed header removed the cursor MUST change the 64x64 corner. It "
            + "did not, so this test cannot see the cursor at all and its green above is worthless",
        ).toBeGreaterThan(0);
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
