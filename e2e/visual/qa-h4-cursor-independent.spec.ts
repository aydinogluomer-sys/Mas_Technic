import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { expect, test } from "@playwright/test";
import { readVisualSpecs, stripComments } from "./cursor-overlay";

/* ══════════════════════════════════════════════════════════════════════════
   QA ROUND 4 — TWO TRIPWIRES THE CODER'S H4 GUARD LEAVES OPEN

   QA-owned. Nothing here duplicates `cursor-overlay-guard.spec.ts`; both
   questions below are ones that guard does not ask.

   NOTE ON THIS FILE'S OWN VOCABULARY. The sibling detector matches the literal
   name of Playwright's baseline-comparison assertion ANYWHERE in a spec's
   non-comment text, string literals included. Measured: an earlier draft named
   that assertion inside a failure message and, because the draft also used a
   whole-page capture option, the detector flagged THIS FILE and turned the
   Coder's guard red. The API is therefore referred to by description here and
   never by name — the same reason `SYNTHETIC_CAPTURES` was moved out of the
   scanned set rather than the scanner being taught to skip a file.

   ─────────────────────────────────────────────────────────────────────────
   WHAT USED TO BE HERE, WHY IT WAS MEASURED, AND WHY IT IS NOT A STANDING
   TEST

   This file also carried a whole-page counterfactual, to settle one factual
   claim in the Coder's §2.4 refusal: "adding [data-custom-cursor] to
   FOREIGN_OVERLAYS would move landing-fullpage.png at 1280 and 1440".

   It was measured, on `/`, with `landing-golden.spec.ts`'s own settle, both
   frames stabilised to three consecutive identical captures
   (`reports/qa/phase-07c4/run11-annotations.json`):

     1280   cursor region 0 px    whole frame 150 688 px, bbox [65,210,1278,3898]
     1440   cursor region 0 px    whole frame 0 px,       bbox null

   Both layers are `position: fixed` about the viewport origin — dot 6x6 at
   (-3,-3), ring 44x44 at (-22,-22) — so the only pixels they can reach are the
   top-left 22x22. The 1280 bounding box EXCLUDES that region entirely, so none
   of those 150 688 pixels is the cursor; they are a long landing page not
   being byte-identical between two whole-page captures. At 1440 the whole
   frame is identical with and without the cursor.

   CONCLUSION: hiding the cursor moves no pixel it could have moved. The
   claim is false.

   THE TEST IS NOT KEPT, and the reason is not that it was red. Under full-suite
   load `stableFrame` could not reach three consecutive identical whole-page
   frames at 1440 within fourteen captures, so the test was FLAKY — it passed
   alone and failed in the suite, which is the same "fails together, passes
   apart" pattern this phase has already had to settle by chunking three times.
   Reduced to a stable measurement it becomes a clipped capture of the same
   64x64 corner, which is exactly what `cursor-overlay-guard.spec.ts` already
   asserts, with the same red control. Shipping it would have added a flake and
   no coverage. The finding is recorded in `reports/qa/phase-07.md`; the raw
   numbers are in `reports/qa/phase-07c4/`.
   ══════════════════════════════════════════════════════════════════════════ */

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
