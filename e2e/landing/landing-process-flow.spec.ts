import { expect, test } from "@playwright/test";
import { gotoAndSettle, landingReady, settleRendering } from "../helpers";

/**
 * PROCESS FLOW CONNECTOR CONTRACT.
 *
 * The four `.tl-process li` steps are joined by a drawn flow arrow rendered as
 * `.tl-process li::after`. Which steps carry that arrow is a per-breakpoint
 * decision, and getting it wrong is silent: the arrow is a 26x18px glyph, so a
 * missing one changes almost nothing that a human notices at a glance.
 *
 * WHY THIS SPEC EXISTS (measured defect, Phase 02 QA):
 * The tablet-only "step 02 sits at a row end" exception was authored inside
 * `@media (max-width:1180px)`, which also covers every mobile width. There,
 * `.tl-process li:nth-child(2)::after` (specificity 0,2,2) beats the mobile
 * block's `.tl-process li::after` (0,1,2) REGARDLESS OF SOURCE ORDER, so the
 * vertical mobile list lost its 02 -> 03 arrow entirely. The fix moved the
 * exception into `@media (min-width:768px) and (max-width:1180px)`, a range
 * that cannot intersect the mobile block.
 *
 * Nothing gated that fix. The 375px golden screenshot cannot: Playwright's
 * per-pixel colour threshold let an 80,602-pixel byte-level delta still compare
 * as a match. So the exact regression could return and no check would go red.
 * This spec is that gate, and it asserts COMPUTED STYLE, not pixels.
 *
 * The expectation table below was MEASURED against the shipped stylesheet at
 * ten widths before it was written down (see EXPECTATIONS). It is not derived
 * from reading the CSS, and it is not assumed to be uniform across breakpoints
 * — it is not: tablet and desktop genuinely differ.
 *
 * COVERAGE:
 *   `sweep` resizes one loaded page across every width in EXPECTATIONS, so it
 *   covers 320/375/768/1280/1440 (and the four breakpoint edges) inside ANY
 *   project it runs in — including both `npm run test:e2e:critical` projects.
 *   `native` re-checks the same contract at the project's own emulated
 *   viewport, without a resize, so real device emulation is covered too:
 *   `mobile-320` at 320, `critical-375`/`mobile-375` at 375, `tablet-768` at
 *   768, `critical-1280`/`desktop-1280` at 1280, `desktop-1440` at 1440.
 */

/** `display` of `.tl-process li::after` per step, steps 01..04 in order. */
type ConnectorRow = readonly [string, string, string, string];

/**
 * `::after` also resolves a used `width`/`height` while `display:none`, so box
 * geometry is NOT a usable presence signal here — `display` is. The arrow glyph
 * is asserted alongside it because the same cross-breakpoint leak that removed
 * the mobile arrow would equally have pointed it the wrong way: the mobile list
 * is vertical and needs a DOWN arrow, the tablet/desktop rows are horizontal
 * and need a RIGHT arrow.
 */
type Expectation = {
  readonly band: string;
  readonly widths: readonly number[];
  readonly display: ConnectorRow;
  readonly glyph: string;
  readonly why: string;
};

/**
 * MEASURED 2026-08-31 against the production build of `/`, by reading
 * `getComputedStyle(li, "::after")` for all four steps at 320, 375, 390, 767,
 * 768, 900, 1180, 1181, 1280 and 1440. Recorded exactly as measured:
 *
 *    320  grid down · grid down · grid down · none      1181  grid right · grid right · grid right · none
 *    375  grid down · grid down · grid down · none      1280  grid right · grid right · grid right · none
 *    390  grid down · grid down · grid down · none      1440  grid right · grid right · grid right · none
 *    767  grid down · grid down · grid down · none
 *    768  grid right · none right · grid right · none
 *    900  grid right · none right · grid right · none
 *   1180  grid right · none right · grid right · none
 *
 * The edge widths (767/768 and 1180/1181) are kept in the swept set on purpose:
 * a leaking media query shows up there first.
 */
const EXPECTATIONS: readonly Expectation[] = [
  {
    band: "mobile",
    widths: [320, 375, 390, 767],
    display: ["grid", "grid", "grid", "none"],
    glyph: "↓",
    why: "the vertical list connects every consecutive pair; only step 04 ends the flow",
  },
  {
    band: "tablet",
    widths: [768, 900, 1180],
    display: ["grid", "none", "grid", "none"],
    glyph: "→",
    why: "the 2x2 layout puts steps 02 and 04 at a row end, so neither carries a right-facing arrow",
  },
  {
    band: "desktop",
    widths: [1181, 1280, 1440],
    display: ["grid", "grid", "grid", "none"],
    glyph: "→",
    why: "the single 4-across row connects every consecutive pair; only step 04 ends the flow",
  },
] as const;

const STEP_LABELS = ["01", "02", "03", "04"] as const;

function expectationFor(width: number): Expectation {
  const match = EXPECTATIONS.find((entry) => entry.widths.includes(width));
  if (match) return match;
  // Projects may declare widths that are not in the measured set (e.g.
  // `landscape-844`). Fall back to the band the shipped breakpoints put that
  // width in, rather than skipping the check.
  if (width <= 767) return EXPECTATIONS[0];
  if (width <= 1180) return EXPECTATIONS[1];
  return EXPECTATIONS[2];
}

/** Reads the four connectors as the browser actually resolved them. */
async function readConnectors(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const steps = [...document.querySelectorAll(".tl-process li")];
    return {
      count: steps.length,
      rows: steps.map((step) => {
        const after = getComputedStyle(step, "::after");
        return {
          display: after.display,
          // Computed `content` arrives quoted, e.g. `"→"`.
          glyph: after.content.replace(/^["']|["']$/g, ""),
        };
      }),
    };
  });
}

/**
 * Produces one human-readable line per violation, naming the width and the
 * step, so a future breakpoint refactor gets told what broke and where instead
 * of a bare `false`.
 */
function violations(
  width: number,
  expected: Expectation,
  measured: { display: string; glyph: string }[],
): string[] {
  const out: string[] = [];
  measured.forEach((cell, index) => {
    const label = STEP_LABELS[index] ?? `#${index + 1}`;
    const want = expected.display[index];
    if (cell.display !== want) {
      out.push(
        `${width}px (${expected.band}) · step ${label} connector · `
        + `display expected "${want}", measured "${cell.display}" — ${expected.why}`,
      );
    }
    // A connector that is switched off carries no direction to check.
    if (want !== "none" && cell.glyph !== expected.glyph) {
      out.push(
        `${width}px (${expected.band}) · step ${label} connector · `
        + `arrow expected "${expected.glyph}", measured "${cell.glyph}"`,
      );
    }
  });
  return out;
}

test.describe("process flow connector contract", () => {
  test("the connector matrix holds at every measured width", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);

    const original = page.viewportSize();
    const failures: string[] = [];
    let checkedWidths = 0;

    for (const expected of EXPECTATIONS) {
      for (const width of expected.widths) {
        await page.setViewportSize({ width, height: original?.height ?? 900 });
        await settleRendering(page);

        const { count, rows } = await readConnectors(page);
        // Guard the guard: if the markup ever stops emitting four steps this
        // must fail loudly rather than vacuously pass over an empty list.
        expect(count, `the process band must render 4 steps at ${width}px`).toBe(4);

        failures.push(...violations(width, expected, rows));
        checkedWidths += 1;
      }
    }

    if (original) await page.setViewportSize(original);

    expect(checkedWidths, "every width in the measured table must be exercised")
      .toBe(EXPECTATIONS.reduce((total, entry) => total + entry.widths.length, 0));
    expect(
      failures,
      "each `.tl-process li::after` must be drawn exactly where its breakpoint requires",
    ).toEqual([]);
  });

  test("the connector matrix holds at this project's own viewport", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);

    const width = page.viewportSize()?.width;
    expect(width, "the project must declare a viewport width").toBeGreaterThan(0);

    const expected = expectationFor(width ?? 0);
    const { count, rows } = await readConnectors(page);
    expect(count, `the process band must render 4 steps at ${width}px`).toBe(4);

    expect(
      violations(width ?? 0, expected, rows),
      `the ${expected.band} connector matrix must hold under this project's real emulation`,
    ).toEqual([]);
  });
});
