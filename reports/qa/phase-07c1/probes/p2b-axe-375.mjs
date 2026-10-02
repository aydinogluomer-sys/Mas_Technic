/* PROBE 2 — B24 contrast, both buckets.
 *
 * The Phase 04 failure mode this exists to catch: 28 `color-contrast` nodes
 * moved from `violations` into `incomplete` without being repaired, and the
 * headline count "improved" while the defect stood. So this records BOTH
 * buckets and every node's colours, and it does so identically on whichever
 * tree it is pointed at (QA_BASE), so before/after are the same instrument.
 */
import AxeBuilder from "@axe-core/playwright";
import { launch, ctx, goto, BASE } from "./lib.mjs";

const ROUTES = process.env.QA_ROUTES
  ? process.env.QA_ROUTES.split(",")
  : [
      "/hizmetler/cnc-frezeleme",
      "/hakkimizda",
      "/iletisim",
      "/malzemeler",
      "/malzemeler/aluminyum",
      "/hizmetler/kategori/talasli-imalat",
      "/endustriyel/havacilik-uzay",
      "/",
    ];

const browser = await launch();
const c = await ctx(browser, { width: 375, height: 812, mobile: true, reduce: true });
const page = await c.newPage();
const out = { base: BASE, routes: {} };

for (const route of ROUTES) {
  await goto(page, route);
  await page.waitForTimeout(600);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const shrink = (nodes) =>
    nodes.map((n) => ({
      target: n.target,
      html: (n.html || "").slice(0, 160),
      data: (n.any || []).concat(n.all || [], n.none || []).map((chk) => ({
        id: chk.id,
        message: (chk.message || "").slice(0, 200),
        data: chk.data,
      })),
    }));

  out.routes[route] = {
    violations: results.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
    violationTotalNodes: results.violations.reduce((a, v) => a + v.nodes.length, 0),
    seriousCritical: results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, nodes: v.nodes.length })),
    incomplete: results.incomplete.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
    incompleteTotalNodes: results.incomplete.reduce((a, v) => a + v.nodes.length, 0),
    contrastViolationNodes: shrink(
      (results.violations.find((v) => v.id === "color-contrast") || { nodes: [] }).nodes,
    ),
    contrastIncompleteNodes: shrink(
      (results.incomplete.find((v) => v.id === "color-contrast") || { nodes: [] }).nodes,
    ),
  };
  process.stderr.write(
    `${route}: violations ${out.routes[route].violationTotalNodes} nodes / `
    + `incomplete ${out.routes[route].incompleteTotalNodes} nodes\n`,
  );
}

await c.close();
await browser.close();
process.stdout.write(JSON.stringify(out, null, 1) + "\n");
