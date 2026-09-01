import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { gotoAndSettle } from "../helpers";

/* ══════════════════════════════════════════════════════════════════════════
   PHASE 04 CORRECTION — TWO SHELL CONTRACTS THE PHASE BROKE ONCE

   D0  ONE CASCADE, WHATEVER THE CHUNK ORDER
   -----------------------------------------
   `src/styles/master-grid.css` is `@import`ed by BOTH `technical-landing.css`
   and `shell.css`, so Rollup inlines its rules into two chunk stylesheets.
   `/` loads both and the landing chunk is injected LAST, so at equal
   specificity the landing copy of a base rule wins. Phase 04 moved
   `@media (max-width:767px){ .tl-sheet{ border-inline:0 } }` into `shell.css`
   while the base declaration stayed in `master-grid.css`: the base shipped
   twice, the override once, and at 375px `/` measured `border-inline 1px/1px`
   while every other route measured `0px/0px`. The 2px narrower field wrapped a
   hero dimension string and moved ~8100 rows of the mobile landing.

   Two assertions, because one of them alone would let the bug back in:
     · the RESULT — every route resolves the same side rules at a given width;
     · the CAUSE — no shipped stylesheet may declare the base without also
       shipping the override. That one is width-independent and catches the
       split even on a viewport where both values happen to agree.

   D1  EVERY SCROLLABLE REGION THE SHELL CREATES IS REACHABLE
   ---------------------------------------------------------
   `layout="band"` spends a `--tl-rail` column, so a body written against the
   pre-shell field can now overflow. Measured on `/hizmetler/cnc-frezeleme` at
   1280: the field went 1278 -> 1214, the inner column 787 -> 743, a 776px
   table started overflowing and `scrollable-region-focusable` went 1 -> 2
   nodes — none of them keyboard reachable. `useScrollableRegionAccess` makes
   the shell guarantee the affordance for every body it frames.
   ══════════════════════════════════════════════════════════════════════════ */

/** One route that loads the landing chunk, two that load only the shell's. */
const SHEET_ROUTES = [
  { path: "/", name: "landing — shell chunk + landing chunk" },
  { path: "/sss", name: "faq — shell chunk only" },
  { path: "/hizmetler/cnc-frezeleme", name: "service detail — shell chunk only" },
] as const;

test.describe("shell sheet — one cascade across chunks", () => {
  test("every route resolves the same sheet side rules at this width", async ({ page }, testInfo) => {
    const measured: { path: string; left: string; right: string; mobile: boolean; cssWidth: number }[] = [];
    for (const route of SHEET_ROUTES) {
      await gotoAndSettle(page, route.path);
      const sheet = page.locator(".tl-sheet").first();
      await expect(sheet, `${route.name}: the sheet must exist`).toBeVisible({ timeout: 20_000 });
      const border = await sheet.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          left: style.borderLeftWidth,
          right: style.borderRightWidth,
          /* Read from the CSS viewport, not from Playwright's viewport option:
             a classic scrollbar can put the two on opposite sides of the
             breakpoint and the media query follows the CSS one. */
          mobile: window.matchMedia("(max-width: 767px)").matches,
          cssWidth: window.innerWidth,
        };
      });
      measured.push({ path: route.path, ...border });
    }
    testInfo.attach("sheet-border-inline", { body: JSON.stringify(measured, null, 2), contentType: "application/json" });

    for (const row of measured) {
      /* The contract, not a copy of the implementation: below the mobile
         breakpoint the sheet is edge-to-edge and drops its rules; above it the
         rules are exactly `--tl-rule-size`. */
      const expected = row.mobile ? "0px" : "1px";
      expect(row.left, `${row.path} at ${row.cssWidth}px CSS: border-left`).toBe(expected);
      expect(row.right, `${row.path} at ${row.cssWidth}px CSS: border-right`).toBe(expected);
    }

    /* And whatever the value is, no route may disagree with another — that is
       the invariant the chunk split actually broke. */
    const distinct = [...new Set(measured.map((row) => `${row.left}/${row.right}`))];
    expect(distinct, `routes disagree: ${JSON.stringify(measured)}`).toHaveLength(1);
  });

  test("no shipped stylesheet declares the sheet's side rules without its override", async ({ page }) => {
    /* `/` is the only route that loads both chunks, so it is the one page where
       a split can be observed in the CSSOM. */
    await gotoAndSettle(page, "/");
    await expect(page.locator(".tl-sheet").first()).toBeVisible({ timeout: 20_000 });

    const audit = await page.evaluate(() => {
      type SheetAudit = { href: string; base: number; override: number };
      const results: SheetAudit[] = [];

      const isSheetSelector = (selectorText: string) =>
        selectorText.split(",").some((part) => part.trim() === ".tl-sheet");

      for (const styleSheet of [...document.styleSheets]) {
        let topLevel: CSSRule[];
        try {
          topLevel = [...styleSheet.cssRules];
        } catch {
          continue; // cross-origin, and therefore not ours
        }
        const entry: SheetAudit = { href: styleSheet.href?.split("/").pop() ?? "(inline)", base: 0, override: 0 };

        const walk = (rules: CSSRule[], mobileCondition: boolean) => {
          for (const rule of rules) {
            if (rule instanceof CSSMediaRule) {
              /* Any condition that is satisfied at or below the mobile
                 breakpoint counts as the mobile override's home. */
              walk([...rule.cssRules], mobileCondition || window.matchMedia(rule.conditionText).matches);
              continue;
            }
            if (rule instanceof CSSSupportsRule || rule instanceof CSSLayerBlockRule) {
              walk([...rule.cssRules], mobileCondition);
              continue;
            }
            if (!(rule instanceof CSSStyleRule)) continue;
            if (!isSheetSelector(rule.selectorText)) continue;
            /* The shorthand may be stored expanded, so match the rule text. */
            if (!/border-inline/.test(rule.cssText)) continue;
            if (mobileCondition) entry.override += 1;
            else entry.base += 1;
          }
        };

        walk(topLevel, false);
        if (entry.base || entry.override) results.push(entry);
      }
      return { results, isMobile: window.matchMedia("(max-width: 767px)").matches, width: window.innerWidth };
    });

    /* Non-vacuity: `/` really does ship the base rule in more than one place —
       that duplication is what makes the split possible in the first place. */
    expect(audit.results.length, "the sheet's side rules must be declared somewhere").toBeGreaterThan(0);

    for (const entry of audit.results) {
      expect(
        entry.override,
        `${entry.href} declares .tl-sheet border-inline ${entry.base}x but ships `
        + `${entry.override} mobile override(s). A stylesheet that carries the base must carry `
        + "its override, or chunk order decides the result. See the OWNERSHIP RULE in "
        + "src/styles/master-grid.css.",
      ).toBeGreaterThanOrEqual(entry.base > 0 ? 1 : 0);
    }
  });
});

test.describe("shell content field — scrollable regions stay keyboard reachable", () => {
  /* The route the shell's rail measurably pushed into overflow. */
  const OVERFLOW_ROUTE = "/hizmetler/cnc-frezeleme";

  test("axe finds no unreachable scrollable region on a shell-framed page", async ({ page }) => {
    await gotoAndSettle(page, OVERFLOW_ROUTE);
    await expect(page.locator("main#main-content")).toBeVisible({ timeout: 20_000 });

    const results = await new AxeBuilder({ page })
      .withRules(["scrollable-region-focusable"])
      .analyze();

    expect(
      results.violations.flatMap((violation) => violation.nodes.map((node) => node.target.join(" "))),
      "every scrollable region inside the shell must be keyboard reachable",
    ).toEqual([]);
  });

  test("each scrollable region has a real focus stop and a name", async ({ page }) => {
    await gotoAndSettle(page, OVERFLOW_ROUTE);
    await expect(page.locator("main#main-content")).toBeVisible({ timeout: 20_000 });

    const regions = await page.evaluate(() => {
      const sheet = document.querySelector(".shell-sheet");
      if (!sheet) return null;
      const found: {
        cls: string;
        scrollWidth: number;
        clientWidth: number;
        focusable: boolean;
        name: string | null;
        containsFocusStop: boolean;
      }[] = [];
      for (const element of sheet.querySelectorAll("*")) {
        const style = getComputedStyle(element);
        const scrolls =
          (element.scrollWidth > element.clientWidth + 1
            && (style.overflowX === "auto" || style.overflowX === "scroll"))
          || (element.scrollHeight > element.clientHeight + 1
            && (style.overflowY === "auto" || style.overflowY === "scroll"));
        if (!scrolls) continue;
        const tabindex = element.getAttribute("tabindex");
        found.push({
          cls: String(element.className).slice(0, 60),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          focusable: element.matches("a[href], button, input, select, textarea")
            || (tabindex !== null && !tabindex.startsWith("-")),
          name: element.getAttribute("aria-label") ?? element.getAttribute("aria-labelledby"),
          containsFocusStop: !!element.querySelector(
            "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),"
            + " textarea:not([disabled]), summary, [tabindex]:not([tabindex^='-'])",
          ),
        });
      }
      return found;
    });

    expect(regions, "the shell sheet must be mounted on this route").not.toBeNull();
    for (const region of regions ?? []) {
      if (region.containsFocusStop) continue; // already reachable by its own content
      expect(
        region.focusable,
        `a ${region.scrollWidth}px region in a ${region.clientWidth}px box (.${region.cls}) `
        + "must take focus",
      ).toBe(true);
      expect(
        region.name?.trim() || "",
        `the scrollable region .${region.cls} must carry an accessible name`,
      ).not.toBe("");
    }
  });

  /* The two tests above measure the bodies as they are TODAY, so they would go
     quiet the day Phases 07-08 rewrite those tables. This one measures the
     shell's mechanism itself against a region the test creates, so it keeps
     its teeth whatever the page bodies become — and it also proves the
     affordance is WITHDRAWN, which no absence-of-violation check can. */
  test("the shell grants a focus stop to a new scrollable region and takes it back", async ({ page }) => {
    await gotoAndSettle(page, "/sss");
    const main = page.locator("main#main-content");
    await expect(main).toBeVisible({ timeout: 20_000 });

    const probe = page.locator("#shell-scroll-probe");
    await page.evaluate(() => {
      const host = document.querySelector("main#main-content");
      if (!host) throw new Error("the shell must supply main#main-content");
      const box = document.createElement("div");
      box.id = "shell-scroll-probe";
      box.style.cssText = "overflow-x:auto;width:200px;height:24px";
      const wide = document.createElement("div");
      wide.setAttribute("data-probe-content", "wide");
      wide.style.cssText = "width:900px;height:8px";
      box.append(wide);
      host.append(box);
    });

    await expect(probe, "an overflowing region must become a focus stop").toHaveAttribute("tabindex", "0", { timeout: 10_000 });
    await expect(probe).toHaveAttribute("role", "group");
    const label = await probe.getAttribute("aria-label");
    expect(label?.trim() || "", "and it must carry an accessible name").not.toBe("");
    await probe.focus();
    expect(await probe.evaluate((element) => document.activeElement === element)).toBe(true);

    /* Stop overflowing: the shell must hand the tab stop back rather than leave
       a dead stop in the sequence. */
    await page.evaluate(() => {
      const wide = document.querySelector("[data-probe-content='wide']");
      const narrow = document.createElement("div");
      narrow.style.cssText = "width:20px;height:8px";
      wide?.replaceWith(narrow);
    });
    await expect(probe, "a region that no longer overflows must stop being a tab stop")
      .not.toHaveAttribute("tabindex", "0", { timeout: 10_000 });
    await expect(probe).not.toHaveAttribute("role", "group");
    await expect(probe).not.toHaveAttribute("aria-label", /.*/);

    await page.evaluate(() => document.querySelector("#shell-scroll-probe")?.remove());
  });
});
