import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { gotoAndSettle } from "./helpers";

/* ══════════════════════════════════════════════════════════════════════════
   QA 09b-1 — "NOTHING CAUGHT IT AND NOTHING COULD HAVE"

   `e224364` fixed a real defect: `.shell-field > label` is a child combinator,
   `AuthField` nests the label inside `.shell-auth-label-row`, so on three
   routes every form label rendered at the browser default while `tsc`,
   eslint, axe, a contrast census and every golden stayed green. The commit
   message concludes that nothing could have caught it and that a screenshot
   was the only instrument.

   THAT CONCLUSION IS WRONG, AND THE COUNTER-EXAMPLE IS ONE SENTENCE:

     a component the design system defines must compute the same typography
     everywhere it appears.

   `.shell-field` is such a component. Its label is styled by exactly one rule.
   So every `<label>` inside a `.shell-field`, on every route, must resolve the
   same (family, size, weight, letter-spacing, transform). If two groups come
   back, one instance of the component is outside the system — which is the
   defect, stated without naming it, without a baseline, without a screenshot
   and without knowing in advance which selector broke.

   It costs one page visit per route and no stored artefact. It does not care
   WHY the divergence happened: a child combinator that stopped matching, a
   specificity loss, a page that reached for a Tailwind class, a component
   copied instead of imported. All of them are the same failure — a component
   rendering two ways — and all of them are invisible to type checking, to
   linting, to axe and to a golden that does not photograph the route.

   THE PROOF IS THE SECOND TEST. The fix is neutralised at runtime — the four
   declarations `e224364` added are reverted on the live page — and the census
   must go RED. A check that is green on the fixed build proves nothing on its
   own; a check that is green on the fixed build and red on the broken one is
   the answer to the question.
   ══════════════════════════════════════════════════════════════════════════ */

const OUT = "reports/qa/phase-09b1";

/* Routes chosen so the component appears on BOTH sides of the defect: three
   auth routes where the label is nested, three shell routes where it is not. */
const ROUTES = [
  "/giris",
  "/sifremi-unuttum",
  "/reset-password",
  "/iletisim",
  "/malzemeler",
  "/teklif-al",
];

/* The component roots the shell defines, and the slot inside each whose
   treatment is a single rule. Adding a row here extends the census; nothing
   else changes. */
const SLOTS = [
  { component: ".shell-field", slot: "label" },
  { component: ".shell-field", slot: "input" },
  { component: ".shell-form", slot: ".shell-field-hint" },
] as const;

type Row = { route: string; component: string; slot: string; count: number; style: string; sample: string };

const rows: Row[] = [];

async function census(page: import("@playwright/test").Page, route: string) {
  return page.evaluate((slots) => {
    const out: { component: string; slot: string; count: number; style: string; sample: string }[] = [];
    for (const { component, slot } of slots) {
      const found: { style: string; sample: string }[] = [];
      for (const root of Array.from(document.querySelectorAll(component))) {
        for (const el of Array.from(root.querySelectorAll(slot))) {
          const r = (el as HTMLElement).getBoundingClientRect();
          if (r.width < 1 && r.height < 1) continue;
          const s = getComputedStyle(el as HTMLElement);
          found.push({
            style: [s.fontFamily.split(",")[0].replace(/["']/g, ""), s.fontSize, s.fontWeight, s.letterSpacing, s.textTransform].join(" / "),
            sample: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 24) || (el as HTMLInputElement).name || el.tagName,
          });
        }
      }
      const byStyle = new Map<string, string[]>();
      for (const f of found) {
        if (!byStyle.has(f.style)) byStyle.set(f.style, []);
        byStyle.get(f.style)!.push(f.sample);
      }
      for (const [style, samples] of byStyle) {
        out.push({ component, slot, count: samples.length, style, sample: samples.slice(0, 3).join(", ") });
      }
    }
    return out;
  }, SLOTS as unknown as { component: string; slot: string }[]);
}

test.describe("QA 09b-1 — one component, one typography, everywhere", () => {
  /* `reducedMotion` is a CONTEXT option, not a test-fixture option, in
     Playwright 1.59: it appears nowhere in `playwright/lib/**` and is not in
     `PlaywrightTestOptions`. At the top level of `test.use()` it was a type
     error AND a no-op — the intent never reached the browser. Passing it
     through `contextOptions` puts it where `_combinedContextOptions` reads it
     (`playwright/lib/index.js:215`, `{ ...contextOptions, ...options }`), so
     this restores the reduced-motion census condition rather than removing
     it. Same viewport, same intent, now actually applied. */
  test.use({ viewport: { width: 1280, height: 900 }, contextOptions: { reducedMotion: "reduce" } });
  test.describe.configure({ mode: "serial" });

  test("every design-system slot resolves one treatment across every route", async ({ page }) => {
    test.skip(test.info().project.name !== "desktop-1280", "one project; this is a census, not a matrix");
    for (const route of ROUTES) {
      await gotoAndSettle(page, route);
      await expect(page.locator(".shell-root")).toBeVisible({ timeout: 20_000 });
      for (const r of await census(page, route)) rows.push({ route, ...r });
    }

    const groups = new Map<string, Map<string, { routes: Set<string>; count: number; sample: string }>>();
    for (const r of rows) {
      const key = `${r.component} ${r.slot}`;
      if (!groups.has(key)) groups.set(key, new Map());
      const g = groups.get(key)!;
      if (!g.has(r.style)) g.set(r.style, { routes: new Set(), count: 0, sample: r.sample });
      const e = g.get(r.style)!;
      e.routes.add(r.route);
      e.count += r.count;
    }

    const split = [...groups.entries()].filter(([, g]) => g.size > 1);
    const report = [
      "QA 09b-1 — DESIGN-SYSTEM SLOT TYPOGRAPHY CENSUS",
      "",
      "A slot that resolves more than one treatment across the site is a component",
      "rendering two ways. That is what `.shell-field > label` did on the three auth",
      "routes, and it is what this census is for.",
      "",
    ];
    for (const [key, g] of groups) {
      report.push(`${key}   — ${g.size} treatment(s)${g.size > 1 ? "   *** SPLIT ***" : ""}`);
      for (const [style, e] of g) {
        report.push(`    ${String(e.count).padStart(3)}x  ${style.padEnd(58)} on ${[...e.routes].join(", ")}`);
        report.push(`          e.g. ${e.sample}`);
      }
      report.push("");
    }
    mkdirSync(OUT, { recursive: true });
    writeFileSync(`${OUT}/type-slot-census.txt`, report.join("\n") + "\n");

    expect(
      split.map(([k, g]) => `${k}: ${[...g.keys()].join("  ||  ")}`),
      "a design-system slot resolving more than one typography",
    ).toEqual([]);
  });

  test("the census goes RED when the fix is reverted — so the green above means something", async ({ page }) => {
    test.skip(test.info().project.name !== "desktop-1280", "one project; this is a census, not a matrix");
    await gotoAndSettle(page, "/giris");
    await expect(page.locator(".shell-root")).toBeVisible({ timeout: 20_000 });
    const healthy = await census(page, "/giris");
    const labelStylesBefore = new Set(healthy.filter((r) => r.slot === "label").map((r) => r.style));

    /* NEUTRALISE `e224364` AT RUNTIME. The commit added exactly four
       declarations to `.shell-auth-label-row > label`; reverting them to
       their inherited values reproduces the pre-fix render without touching
       a production file or rebuilding. */
    await page.addStyleTag({
      content: `.shell-auth-label-row > label {
        color: revert !important;
        font: revert !important;
        letter-spacing: revert !important;
        text-transform: revert !important;
      }`,
    });
    await page.waitForTimeout(300);
    const broken = await census(page, "/giris");
    const labelStylesAfter = new Set(broken.filter((r) => r.slot === "label").map((r) => r.style));

    /* On `/iletisim` the same slot still resolves the system treatment, so the
       cross-route comparison the first test performs would now see two groups.
       Here the same divergence is visible on a single route, because `/giris`
       renders both the nested label and (in the sign-up form) more of them. */
    const before = [...labelStylesBefore].join(" || ");
    const after = [...labelStylesAfter].join(" || ");
    writeFileSync(
      `${OUT}/type-slot-census-negative.txt`,
      [
        "QA 09b-1 — THE NEGATIVE CONTROL",
        "",
        "The four declarations `e224364` added are reverted at runtime on /giris.",
        "",
        `.shell-field label, fix in place : ${before}`,
        `.shell-field label, fix reverted : ${after}`,
        "",
        after === before
          ? "*** NO CHANGE — this census would NOT have caught the defect. ***"
          : "The treatment changes, so the cross-route census in the first test reports a",
        after === before ? "" : "SPLIT and the defect is caught without a screenshot, a baseline or a guess.",
      ].join("\n") + "\n",
    );

    expect(after, "reverting the fix must change what the slot resolves — otherwise this census is blind to it")
      .not.toEqual(before);
  });
});
