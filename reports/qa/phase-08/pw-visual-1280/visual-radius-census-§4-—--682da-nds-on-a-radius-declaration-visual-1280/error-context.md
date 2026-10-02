# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual\radius-census.spec.ts >> §4 — the radius register is the census >> §4's source column still lands on a radius declaration
- Location: e2e\visual\radius-census.spec.ts:108:3

# Error details

```
Error: a cited line no longer declares a radius. A citation that has drifted is worse than no citation: it is what made the second version of this register look checkable.

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "src/components/ChatBot.tsx:225",
+ ]
```

# Test source

```ts
  17  | } from "./radius-census";
  18  | 
  19  | /* ══════════════════════════════════════════════════════════════════════════
  20  |    §4's REGISTER IS RE-DERIVED, NOT RE-TYPED — PHASE 07 CORRECTION #3
  21  | 
  22  |    `docs/lean/17-inner-page-composition.md` §4 says, in its own last paragraph,
  23  |    "the way to add a row is to re-run the census, not to read a file". Three
  24  |    versions later that instruction was still only an instruction: nothing ran
  25  |    the census, and nothing noticed when the table drifted from the browser.
  26  | 
  27  |    This test runs it. Six routes × three widths, fine pointer, reduced motion,
  28  |    after a full scroll pass, and every cell of the document's table has to come
  29  |    back out of the measurement. It also checks the SOURCE column: a citation
  30  |    that no longer lands on a radius declaration is how v2 of the register
  31  |    convinced three readers it was complete.
  32  | 
  33  |    IT TAKES NO SCREENSHOT AND TOUCHES NO GOLDEN.
  34  |    ══════════════════════════════════════════════════════════════════════════ */
  35  | 
  36  | const GATE_PROJECT = "visual-1280";
  37  | 
  38  | test.describe("§4 — the radius register is the census", () => {
  39  |   test.beforeEach(() => {
  40  |     test.skip(
  41  |       test.info().project.name !== GATE_PROJECT,
  42  |       `builds its own contexts; runs once, in ${GATE_PROJECT}`,
  43  |     );
  44  |   });
  45  | 
  46  |   test("every number in docs/lean/17 §4 comes back out of the browser", async ({
  47  |     browser,
  48  |     baseURL,
  49  |   }, testInfo) => {
  50  |     /* 18 page loads, each with a full scroll pass. The default 60 s is for a
  51  |        single capture, not for a census. */
  52  |     test.setTimeout(420_000);
  53  | 
  54  |     const cells: CensusCell[] = [];
  55  |     for (const width of CENSUS_WIDTHS) {
  56  |       const context = await browser.newContext({
  57  |         baseURL,
  58  |         viewport: { width, height: 900 },
  59  |         reducedMotion: "reduce",
  60  |       });
  61  |       try {
  62  |         const page = await context.newPage();
  63  |         for (const route of CENSUS_ROUTES) {
  64  |           await gotoAndSettle(page, route);
  65  |           /* Two of the six rows are the lazily-mounted cursor layers, so the
  66  |              census has to give them the same chance to appear at every width
  67  |              before it counts — see `awaitCursorOpportunity`. The 375 cells
  68  |              spend the whole budget returning zero, which is the price of the
  69  |              measurement not being told in advance where to look. */
  70  |           await awaitCursorOpportunity(page);
  71  |           await scrollWholeDocument(page);
  72  |           await settleRendering(page);
  73  |           cells.push({ width, route, groups: await censusOfPage(page) });
  74  |         }
  75  |       } finally {
  76  |         await context.close();
  77  |       }
  78  |     }
  79  | 
  80  |     const measured = foldRegister(cells).map((row) => renderRow(row, CENSUS_WIDTHS));
  81  | 
  82  |     const repoRoot = join(dirname(testInfo.file), "..", "..");
  83  |     const documented = parseRegisterTable(
  84  |       readFileSync(join(repoRoot, "docs", "lean", "17-inner-page-composition.md"), "utf8"),
  85  |     );
  86  | 
  87  |     expect(
  88  |       measured,
  89  |       "docs/lean/17 §4's register no longer matches what the browser paints on the six "
  90  |         + "rebuilt routes. Do not edit the table to match the diff by hand — read the diff, "
  91  |         + "decide whether the PAGES changed or the REGISTER rotted, and say which in the "
  92  |         + "document. Every previous version of this table was wrong because somebody typed "
  93  |         + "it instead of measuring it.",
  94  |     ).toEqual(documented);
  95  | 
  96  |     /* Both directions of the label map, so a new radius source cannot hide
  97  |        behind a table that still adds up. (`foldRegister` throws on an
  98  |        unlabelled signature; this is the other half.) */
  99  |     const labelled = new Set(foldRegister(cells).map((row) => row.label));
  100 |     expect(
  101 |       RADIUS_SOURCES.map((source) => source.label).filter((label) => !labelled.has(label)),
  102 |       "a RADIUS_SOURCES entry matched nothing. Either the element stopped painting a radius "
  103 |         + "— in which case delete its row here and in §4 — or its class list changed and the "
  104 |         + "matcher no longer finds it.",
  105 |     ).toEqual([]);
  106 |   });
  107 | 
  108 |   test("§4's source column still lands on a radius declaration", () => {
  109 |     const repoRoot = join(dirname(test.info().file), "..", "..");
  110 |     const rotten = RADIUS_SOURCES
  111 |       .filter((source) => !citationDeclaresRadius(repoRoot, source.file, source.lines))
  112 |       .map((source) => `${source.file}:${source.lines}`);
  113 |     expect(
  114 |       rotten,
  115 |       "a cited line no longer declares a radius. A citation that has drifted is worse than "
  116 |         + "no citation: it is what made the second version of this register look checkable.",
> 117 |     ).toEqual([]);
      |       ^ Error: a cited line no longer declares a radius. A citation that has drifted is worse than no citation: it is what made the second version of this register look checkable.
  118 |   });
  119 | 
  120 |   test("the citation check is red on a citation that has drifted", () => {
  121 |     /* The control. `citationDeclaresRadius` returning true for everything is
  122 |        indistinguishable from a working check until something has actually
  123 |        moved, so point it at a line that certainly declares no radius. */
  124 |     const repoRoot = join(dirname(test.info().file), "..", "..");
  125 |     expect(
  126 |       citationDeclaresRadius(repoRoot, "src/components/ui/CustomCursor.tsx", "1-3"),
  127 |       "the first three lines of CustomCursor.tsx are a docblock opening; if the checker "
  128 |         + "accepts them it accepts anything",
  129 |     ).toBe(false);
  130 |     expect(
  131 |       citationDeclaresRadius(repoRoot, "src/components/ui/CustomCursor.tsx", "194-207"),
  132 |       "and it must still accept the real one",
  133 |     ).toBe(true);
  134 |   });
  135 | });
  136 | 
```