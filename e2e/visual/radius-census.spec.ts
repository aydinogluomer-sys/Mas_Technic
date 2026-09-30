import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { expect, test } from "@playwright/test";
import { gotoAndSettle, settleRendering } from "../helpers";
import { awaitCursorOpportunity } from "./cursor-overlay";
import {
  CENSUS_ROUTES,
  CENSUS_WIDTHS,
  RADIUS_SOURCES,
  censusOfPage,
  citationDeclaresRadius,
  foldRegister,
  parseRegisterTable,
  renderRow,
  scrollWholeDocument,
  type CensusCell,
} from "./radius-census";

/* ══════════════════════════════════════════════════════════════════════════
   §4's REGISTER IS RE-DERIVED, NOT RE-TYPED — PHASE 07 CORRECTION #3

   `docs/lean/17-inner-page-composition.md` §4 says, in its own last paragraph,
   "the way to add a row is to re-run the census, not to read a file". Three
   versions later that instruction was still only an instruction: nothing ran
   the census, and nothing noticed when the table drifted from the browser.

   This test runs it. Six routes × three widths, fine pointer, reduced motion,
   after a full scroll pass, and every cell of the document's table has to come
   back out of the measurement. It also checks the SOURCE column: a citation
   that no longer lands on a radius declaration is how v2 of the register
   convinced three readers it was complete.

   IT TAKES NO SCREENSHOT AND TOUCHES NO GOLDEN.
   ══════════════════════════════════════════════════════════════════════════ */

const GATE_PROJECT = "visual-1280";

test.describe("§4 — the radius register is the census", () => {
  test.beforeEach(() => {
    test.skip(
      test.info().project.name !== GATE_PROJECT,
      `builds its own contexts; runs once, in ${GATE_PROJECT}`,
    );
  });

  test("every number in docs/lean/17 §4 comes back out of the browser", async ({
    browser,
    baseURL,
  }, testInfo) => {
    /* 18 page loads, each with a full scroll pass. The default 60 s is for a
       single capture, not for a census. */
    test.setTimeout(420_000);

    const cells: CensusCell[] = [];
    for (const width of CENSUS_WIDTHS) {
      const context = await browser.newContext({
        baseURL,
        viewport: { width, height: 900 },
        reducedMotion: "reduce",
      });
      try {
        const page = await context.newPage();
        for (const route of CENSUS_ROUTES) {
          await gotoAndSettle(page, route);
          /* Two of the six rows are the lazily-mounted cursor layers, so the
             census has to give them the same chance to appear at every width
             before it counts — see `awaitCursorOpportunity`. The 375 cells
             spend the whole budget returning zero, which is the price of the
             measurement not being told in advance where to look. */
          await awaitCursorOpportunity(page);
          await scrollWholeDocument(page);
          await settleRendering(page);
          cells.push({ width, route, groups: await censusOfPage(page) });
        }
      } finally {
        await context.close();
      }
    }

    const measured = foldRegister(cells).map((row) => renderRow(row, CENSUS_WIDTHS));

    const repoRoot = join(dirname(testInfo.file), "..", "..");
    const documented = parseRegisterTable(
      readFileSync(join(repoRoot, "docs", "lean", "17-inner-page-composition.md"), "utf8"),
    );

    expect(
      measured,
      "docs/lean/17 §4's register no longer matches what the browser paints on the six "
        + "rebuilt routes. Do not edit the table to match the diff by hand — read the diff, "
        + "decide whether the PAGES changed or the REGISTER rotted, and say which in the "
        + "document. Every previous version of this table was wrong because somebody typed "
        + "it instead of measuring it.",
    ).toEqual(documented);

    /* Both directions of the label map, so a new radius source cannot hide
       behind a table that still adds up. (`foldRegister` throws on an
       unlabelled signature; this is the other half.) */
    const labelled = new Set(foldRegister(cells).map((row) => row.label));
    expect(
      RADIUS_SOURCES.map((source) => source.label).filter((label) => !labelled.has(label)),
      "a RADIUS_SOURCES entry matched nothing. Either the element stopped painting a radius "
        + "— in which case delete its row here and in §4 — or its class list changed and the "
        + "matcher no longer finds it.",
    ).toEqual([]);
  });

  test("§4's source column still lands on a radius declaration", () => {
    const repoRoot = join(dirname(test.info().file), "..", "..");
    const rotten = RADIUS_SOURCES
      .filter((source) => !citationDeclaresRadius(repoRoot, source.file, source.lines))
      .map((source) => `${source.file}:${source.lines}`);
    expect(
      rotten,
      "a cited line no longer declares a radius. A citation that has drifted is worse than "
        + "no citation: it is what made the second version of this register look checkable.",
    ).toEqual([]);
  });

  test("the citation check is red on a citation that has drifted", () => {
    /* The control. `citationDeclaresRadius` returning true for everything is
       indistinguishable from a working check until something has actually
       moved, so point it at a line that certainly declares no radius. */
    const repoRoot = join(dirname(test.info().file), "..", "..");
    expect(
      citationDeclaresRadius(repoRoot, "src/components/ui/CustomCursor.tsx", "1-3"),
      "the first three lines of CustomCursor.tsx are a docblock opening; if the checker "
        + "accepts them it accepts anything",
    ).toBe(false);
    expect(
      citationDeclaresRadius(repoRoot, "src/components/ui/CustomCursor.tsx", "212-225"),
      "and it must still accept the real one",
    ).toBe(true);
  });
});
