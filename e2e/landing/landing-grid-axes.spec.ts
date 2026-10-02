import { expect, test } from "@playwright/test";
import { gotoAndSettle, landingReady } from "../helpers";

/**
 * MASTER GRID AXIS CONTRACT.
 *
 * Phase 02 turned the landing's drawn 12-column grid into a structural one.
 * Before that change, `.tl-band` declared `var(--tl-rail) repeat(var(--tl-cols),
 * minmax(0,1fr))` and then almost every band body opted back out of it:
 * `23.8%`, `19.2%` + `4.6%`, `35%/65%`, `48%/52%`, `repeat(6,1fr) 132px`,
 * `7fr/5fr` plus a column gap, `4fr/5fr/5fr` (fourteen units for a twelve-unit
 * grid) and `43fr/77fr`. Each of those agreed with the master grid at no width
 * at all, and the error grew with the viewport.
 *
 * This spec is the regression lock. It does not compare against hardcoded
 * pixel numbers — those would rot the first time a token changed. It reads the
 * master grid's USED track sizes back out of the browser and requires every
 * probed block edge to coincide with one of the resulting boundaries.
 *
 * The full five-width evidence table is produced by
 * `node scripts/grid-axis-probe.mjs`, which uses the same method at
 * 375/768/1280/1440/1600. This spec covers the two critical-gate viewports.
 */

/** 1px. Master columns are fractional ((1598-64)/12 = 127.8333px), so exact
 *  integer coincidence is impossible; 1px absorbs sub-pixel layout rounding.
 *  A band that has left the master grid misses by tens of pixels. */
const TOLERANCE_PX = 1;

const PROBE_TARGETS = [
  { band: "Hero", root: ".tl-hero", blocks: [".tl-hero-copy", ".tl-part-stage", ".tl-part-passport"] },
  { band: "Proof", root: ".tl-proof", blocks: [".tl-proof-grid", ".tl-proof-grid > article"] },
  { band: "Process", root: ".tl-process", blocks: [".tl-process-body", ".tl-process-intro", ".tl-process-body > figure", ".tl-process-body > ol", ".tl-process-body > ol > li"] },
  { band: "Nexus", root: ".tl-nexus", blocks: [".tl-nexus-body", ".tl-nexus-body > header > h2", ".tl-nexus-kpis", ".tl-nexus-rail", ".tl-nexus-main"] },
  { band: "Projects", root: ".tl-projects", blocks: [".tl-projects-body", ".tl-project-grid", ".tl-project-grid > article"] },
  { band: "Sectors", root: ".tl-sectors", blocks: [".tl-sectors-body", ".tl-sector-card"] },
  { band: "Manifesto", root: ".tl-manifesto", blocks: [".tl-manifesto-body", ".tl-manifesto-copy"] },
  { band: "Quality", root: ".tl-quality", blocks: [".tl-quality-body", ".tl-quality-strip", ".tl-quality-strip > .tl-cert"] },
  { band: "References", root: ".tl-references", blocks: [".tl-reference-grid", ".tl-reference-grid > li"] },
  { band: "FAQ", root: ".tl-faq-band", blocks: [".tl-faq-body", ".tl-faq-title", ".tl-faq", ".tl-resource"] },
  { band: "RFQ", root: ".tl-rfq", blocks: [".tl-rfq-body", ".tl-rfq-body > h2", ".tl-cad-drop", ".tl-rfq-body > ol"] },
  { band: "Footer", root: ".tl-footer", blocks: [".tl-footer-body", ".tl-footer-brand", ".tl-footer-body > nav", ".tl-footer-body > nav > div", ".tl-title-block"] },
] as const;

type AxisRow = {
  band: string;
  block: string;
  leftDelta: number;
  rightDelta: number;
  leftAxis: number;
  rightAxis: number;
};

test.describe("master grid axis contract", () => {
  test("every landing band edge sits on a master grid boundary", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);

    const rows = await page.evaluate((targets) => {
      const round = (value: number) => Math.round(value * 1000) / 1000;

      /** Master boundaries of a band, read back from its USED track sizes. */
      function masterAxes(band: Element) {
        const style = getComputedStyle(band);
        const tracks = style.gridTemplateColumns.split(/\s+/).filter(Boolean).map(Number.parseFloat);
        if (tracks.length < 2 || tracks.some(Number.isNaN)) return null;
        const rect = band.getBoundingClientRect();
        const gap = Number.parseFloat(style.columnGap) || 0;
        let x = rect.left
          + (Number.parseFloat(style.borderLeftWidth) || 0)
          + (Number.parseFloat(style.paddingLeft) || 0);
        const trackLeft: number[] = [];
        for (const track of tracks) { trackLeft.push(x); x += track + gap; }
        const columns = tracks.length - 1;
        const axes = [{ index: -1, x: round(trackLeft[0]) }];
        for (let k = 0; k < columns; k += 1) axes.push({ index: k, x: round(trackLeft[k + 1]) });
        axes.push({ index: columns, x: round(x - gap) });
        return axes;
      }

      const nearest = (axes: { index: number; x: number }[], value: number) =>
        axes.reduce((best, axis) =>
          Math.abs(axis.x - value) < Math.abs(best.x - value) ? axis : best, axes[0]);

      const out: AxisRow[] = [];
      for (const target of targets) {
        const band = document.querySelector(target.root);
        if (!band) { out.push({ band: target.band, block: "(band missing)", leftDelta: 9999, rightDelta: 9999, leftAxis: -99, rightAxis: -99 }); continue; }
        const axes = masterAxes(band);
        if (!axes) { out.push({ band: target.band, block: "(tracks unresolved)", leftDelta: 9999, rightDelta: 9999, leftAxis: -99, rightAxis: -99 }); continue; }
        for (const selector of target.blocks) {
          const nodes = [...band.querySelectorAll(selector)];
          nodes.forEach((node, index) => {
            if (getComputedStyle(node).display === "none") return;
            const rect = node.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return;
            /* ROUND 2 — the sector band is a horizontal track of 13 cards.
               A card that is not wholly inside its scroll port is cropped by
               the port (whose own edges are measured as the band body), so
               only the cards fully inside the port are held to the lines. */
            const port = node.parentElement?.closest(".tl-sector-track");
            if (port) {
              const box = port.getBoundingClientRect();
              if (rect.right > box.right + 1 || rect.left < box.left - 1) return;
            }
            const left = nearest(axes, rect.left);
            const right = nearest(axes, rect.right);
            out.push({
              band: target.band,
              block: nodes.length > 1 ? `${selector} #${index + 1}` : selector,
              leftDelta: round(rect.left - left.x),
              leftAxis: left.index,
              rightDelta: round(rect.right - right.x),
              rightAxis: right.index,
            });
          });
        }
      }
      return out;
    }, PROBE_TARGETS as unknown as { band: string; root: string; blocks: string[] }[]);

    // Every probed band must actually have been found and measured.
    expect(rows.length, "the probe must measure at least one block per band").toBeGreaterThan(PROBE_TARGETS.length);
    for (const target of PROBE_TARGETS) {
      expect(rows.some((row) => row.band === target.band && row.leftAxis !== -99),
        `${target.band} must be present and measurable`).toBe(true);
    }

    const offGrid = rows.filter((row) =>
      Math.abs(row.leftDelta) > TOLERANCE_PX || Math.abs(row.rightDelta) > TOLERANCE_PX);
    expect(
      offGrid.map((row) => `${row.band} · ${row.block}: left Δ${row.leftDelta}px (C${row.leftAxis}), right Δ${row.rightDelta}px (C${row.rightAxis})`),
      "every measured block edge must coincide with a master grid boundary",
    ).toEqual([]);
  });

  test("the mobile rail does not consume an excessive share of the viewport", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);

    const width = page.viewportSize()?.width ?? 0;
    test.skip(width >= 768, "mobil ray sözleşmesi");

    const rail = await page.locator(".tl-band-index").first()
      .evaluate((element) => element.getBoundingClientRect().width);

    // mas-grid-system: mobile rail ~40–44px, and it must not eat 15–18% of the
    // viewport as it did while the mobile media query silently inherited 56px.
    expect(rail).toBeGreaterThanOrEqual(38);
    expect(rail).toBeLessThanOrEqual(46);

    // The share bound is 0.14, and that number is derived rather than picked:
    //
    //   shipped rail   42px  →  11.2% at 375  ·  13.1% at 320
    //   the defect     56px  →  14.9% at 375  ·  17.5% at 320  (the tablet
    //                            value silently inherited by mobile)
    //   mas-grid-system forbids the rail "consuming ~15–18% of viewport", so
    //   the ceiling that rule implies is 15%.
    //
    // 0.14 sits above the documented 13.1% at the narrowest supported width and
    // below both the 15% skill ceiling and the 14.9% defect, so it still fails
    // on exactly the regression it was written for, at every mobile viewport in
    // `playwright.config.ts` — 320, 375 and 390 included.
    //
    // It was previously 0.13, which 42/320 = 0.13125 cannot satisfy. That bound
    // contradicted `docs/lean/06-design-system.md` and
    // `docs/lean/09-responsive-rules.md`, which both document 13.1% at 320, and
    // it went unnoticed because 320 is not a critical-gate viewport. The rail
    // geometry is correct; the bound was mis-set.
    expect(rail / width, `rail share of a ${width}px viewport`).toBeLessThan(0.14);
  });
});
