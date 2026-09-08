/* QA 09b-1 R2 — reads `matchMedia("(prefers-reduced-motion: reduce)")` in the
 * page for each placement. Writes one line per project to
 * reports/qa/phase-09b1r2/reducedmotion-placement.txt.
 *
 * The assertions are the point: A is asserted FALSE because the claim under
 * audit is that project-level `reducedMotion` is inert. If Playwright ever
 * starts honouring it, this probe goes red and the claim is revisited — which
 * is what a control for an "it does nothing" finding has to do. */
import { test, expect } from "@playwright/test";
import { appendFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";

const OUT = "reports/qa/phase-09b1r2";
const FILE = `${OUT}/reducedmotion-placement.txt`;

test.beforeAll(() => {
  mkdirSync(OUT, { recursive: true });
  if (!existsSync(FILE) || !process.env.QA_APPEND) {
    writeFileSync(
      FILE,
      [
        "QA 09b-1 R2 — WHERE `reducedMotion` ACTUALLY REACHES THE BROWSER",
        "Playwright 1.59.1. Measured in-page via matchMedia, about:blank, no server.",
        "",
        "placement                                              reduce?  expected",
        "",
      ].join("\n") + "\n",
    );
  }
});

test("prefers-reduced-motion as the page sees it", async ({ page }, testInfo) => {
  await page.goto("about:blank");
  if (testInfo.project.name.startsWith("D-")) {
    await page.emulateMedia({ reducedMotion: "reduce" });
  }
  const reduced = await page.evaluate(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const expected = testInfo.project.name.startsWith("B-") || testInfo.project.name.startsWith("D-");
  appendFileSync(
    FILE,
    `${testInfo.project.name.padEnd(54)} ${String(reduced).padEnd(8)} ${String(expected)}\n`,
  );
  expect(
    reduced,
    `${testInfo.project.name}: project-level \`reducedMotion\` is claimed inert; ` +
      `contextOptions and emulateMedia are claimed live. This is the control for that claim.`,
  ).toBe(expected);
});
