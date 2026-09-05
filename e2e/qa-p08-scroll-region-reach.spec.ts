import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle } from "./helpers";

/* ══════════════════════════════════════════════════════════════════════════
   QA-OWNED — THE GUARD THAT WOULD HAVE CAUGHT R2-1

   WHAT R2-1 WAS
   -------------
   `/cerez-politikasi` madde 02 rendered a 583.875px table inside a 375px
   viewport, and three of its four columns — `DEPO`, `NE İŞE YARAR`, `SÜRE` —
   were unreachable for all five rows, by touch, by keyboard, and by a forced
   `scrollLeft` on every ancestor from `<table>` to `<documentElement>`. A
   reader on a phone could not read the purpose or the lifetime of a single
   record, on the document whose whole job is to publish them. It was found by
   opening the page and looking at it, which is not a test.

   WHY NOTHING IN THE SUITE COULD SEE IT
   -------------------------------------
   Four instruments were green on it, for one shared reason:

     · the reflow assertion measures `documentElement.scrollWidth −
       clientWidth <= 1`, and that measured 0 at 320, 375 AND 390 — because
       `div.shell-root` computes `overflow-x: clip`, which unlike `hidden` is
       not programmatically scrollable either, so nothing ever widens the
       document;
     · axe has no rule for content clipped out of a `clip` ancestor;
     · `e2e/visual/wave-b-golden.spec.ts:37` deliberately covers no legal
       route, so no golden looks at this page at all;
     · `e2e/landing/shell-cascade-contract.spec.ts`'s lane "scrollable regions
       stay keyboard reachable" passed, and could not have failed: at 375 the
       table was not a scrollable region, so there was no missing focus stop to
       find. A test that only checks the regions that exist cannot see a region
       that failed to come into existence.

   AND THE OBVIOUS PREDICATE IS INERT TOO — THIS IS WHY THIS FILE IS SHAPED
   THE WAY IT IS
   -----------------------------------------------------------------------
   The C4 fix comment and the QA packet both propose
   `scrollWidth <= clientWidth + 1 || isScrollable(el)`. MEASURED, live, by
   restoring the pre-C4 markup on the loaded page and re-reading the same
   layout pass (`reports/qa/phase-08/r3/wrapper-ab.json`):

     375   PRE-FIX   region box 584 wide, right edge 627.875, scrollWidth 584
           POST-FIX  region box 331 wide, right edge 375,     scrollWidth 584

   Pre-fix the scroll region FIT ITS OWN BOX, so that expression is TRUE on the
   defect at 320, 375 and 390. The region was never too narrow for its table;
   the region was WIDER THAN THE VIEWPORT, so `overflow-x: auto` had nothing to
   do. The failure sits one level above where that predicate looks.

   SO THIS FILE ASSERTS THE READER'S CONTRACT, NOT A CSS PROPERTY
   -------------------------------------------------------------
   It walks every `<table>` on every public route — not a class, because a
   class-keyed walk cannot see a table whose wrapper changed, and the landing's
   own `.tl-nexus-table-wrap` is already a second wrapper — finds the table's
   nearest scrolling ancestor, and asks:

     1. Does the table already lie inside the viewport? Then it is fine, and
        nothing else matters.
     2. If not, is its container's OWN box inside the viewport? This is the
        rule R2-1 broke, and the only one of the four instruments above that
        could have caught it.
     3. Driven to maximum scroll, does the table's right edge come inside the
        viewport? Proven by assignment, not by computed style: a `clip`
        ancestor or an unconstrained grid track leaves `scrollLeft` at 0, which
        is exactly what round 2 measured on every ancestor.
     4. And can a keyboard user reach it — an author or shell-granted
        `tabindex`, or a focus stop inside? WCAG 2.1.1, and what
        `useScrollableRegionAccess` exists to guarantee. The "focus stop
        inside" branch is deliberate: it is the same rule the production hook
        and axe both apply, and `/malzemeler`'s register qualifies through it.

   Then, separately and empirically, the symptom itself: EVERY HEADER CELL OF
   EVERY TABLE CAN BE BROUGHT FULLY INSIDE THE VIEWPORT. Rules 1-4 are the
   diagnosis; that one is what the reader actually loses, and it is measured on
   its own so a future change that satisfies the rules while still losing a
   column is still red.

   READINESS — THE PART THAT WENT WRONG FIRST
   ------------------------------------------
   The first version of this file walked on `gotoAndSettle` alone
   (`domcontentloaded` + two paint frames) and reported ZERO tables on
   `/malzemeler`, which has one. That is the same vacuous-measurement failure
   the storage spec's first version had, and the same lesson: a comparison
   cannot be trusted until the measurement feeding it is proven non-empty. So
   the walk settles the network per route AND asserts a floor on what it found,
   per route, against a measured census.

   THE CONTROLS
   ------------
   `unreachableTables()` is a pure function over measurement records, so it can
   be fed cases it MUST reject:

     · R2-1's own numbers, transcribed from
       `reports/qa/phase-08/r2/table-clip.json` and
       `reports/qa/phase-08/r3/wrapper-ab.json` — the defect this file exists
       for, kept catchable as a fixture long after the page was fixed;
     · a table that overflows and whose container will not scroll;
     · a table that scrolls but whose container takes no focus;
     · and a LIVE one: the pre-C4 markup restored in the DOM of the real page,
       re-measured by the same collector. That control is the one that matters —
       it proves the guard sees the real defect on the real page, and not only
       a record I typed out by hand.

   SCOPE
   -----
   Public routes only; `/admin/*` and `/musteri-paneli/*` are out of scope
   (§N). Lanes: `mobile-320` and `mobile-375`, where narrow-viewport reach is
   decided, plus `desktop-1280` as the wide control — an overflowing table has
   the same contract at any width.
   ══════════════════════════════════════════════════════════════════════════ */

const LANES = new Set(["mobile-320", "mobile-375", "desktop-1280"]);

/** Every public route template in `src/App.tsx`, one concrete URL each. */
const PUBLIC_ROUTES = [
  "/",
  "/sss",
  "/gizlilik-politikasi",
  "/kvkk",
  "/cerez-politikasi",
  "/hakkimizda",
  "/iletisim",
  "/malzemeler",
  "/malzemeler/aluminyum",
  "/blog",
  "/blog/havacilik-parcalarinda-malzeme-secimi",
  "/kabiliyet-profilleri",
  "/kabiliyet-profilleri/ince-cidarli-aluminyum-govde",
  "/kalite-dosyasi",
  "/hizmetler/kategori/talasli-imalat",
  "/hizmetler/cnc-frezeleme",
  "/kabiliyetler/kalite-kontrol",
  "/endustriyel/havacilik",
  "/giris",
  "/sifremi-unuttum",
  "/reset-password",
  "/teklif-al",
] as const;

/**
 * How many `<table>` elements each route renders once it has settled, measured
 * at 375 (`reports/qa/phase-08/r3/table-classes.json`). Routes not listed here
 * render none. This is a FLOOR, not an equality: a phase that adds a table must
 * not have to edit this file, but a route that silently stops rendering one
 * must not be able to pass this walk by measuring nothing.
 */
const TABLE_CENSUS: Record<string, number> = {
  "/": 4,
  "/cerez-politikasi": 1,
  "/malzemeler": 1,
  "/malzemeler/aluminyum": 1,
  "/blog/havacilik-parcalarinda-malzeme-secimi": 1,
  "/kalite-dosyasi": 1,
  "/hizmetler/cnc-frezeleme": 4,
  "/kabiliyetler/kalite-kontrol": 3,
};

/** One measured table and the box that is supposed to let a reader reach it. */
type TableRecord = {
  route: string;
  index: number;
  label: string;
  viewportWidth: number;
  tableWidth: number;
  tableLeft: number;
  tableRight: number;
  /** the table's right edge after its container is driven to maximum scroll */
  tableRightAtMaxScroll: number;
  container: string | null;
  containerLeft: number | null;
  containerRight: number | null;
  containerClientWidth: number | null;
  containerScrollWidth: number | null;
  containerOverflowX: string | null;
  /** `scrollLeft` after being forced to 9999 — 0 means the box does not scroll */
  forcedScrollLeft: number | null;
  keyboardReachable: boolean;
  affordance: { tabindex: string | null; role: string | null; ariaLabel: string | null };
};

/**
 * THE ONE COMPARISON. The live assertions and every control go through this
 * function, so a control that stops failing means this was hollowed out and
 * every green run above it means nothing.
 */
function unreachableTables(records: readonly TableRecord[]) {
  const problems: string[] = [];
  for (const r of records) {
    const where = `${r.route} table#${r.index} (${r.label})`;

    // 1 — already inside the viewport. Nothing else matters.
    if (r.tableLeft >= -1 && r.tableRight <= r.viewportWidth + 1) continue;

    // 2 — the container's own box must be inside the viewport, or its overflow
    //     can never engage. THIS IS DEFECT R2-1.
    if (r.container === null) {
      problems.push(
        `${where}: ${r.tableWidth}px table runs to ${r.tableRight} in a ${r.viewportWidth}px ` +
        "viewport and has no scrolling ancestor at all.",
      );
      continue;
    }
    if ((r.containerLeft ?? 0) < -1 || (r.containerRight ?? 0) > r.viewportWidth + 1) {
      problems.push(
        `${where}: the scroll container's OWN box runs from ${r.containerLeft} to ` +
        `${r.containerRight} in a ${r.viewportWidth}px viewport, so its overflow never engages ` +
        `and nothing inside it is reachable. Container: ${r.container}. This is defect R2-1's ` +
        "shape exactly.",
      );
      continue;
    }

    // 3 — driven to its maximum, the far edge must come on screen. Assignment,
    //     not computed style: `clip` and an unsized grid track both leave it 0.
    if (r.tableRightAtMaxScroll > r.viewportWidth + 1) {
      problems.push(
        `${where}: at maximum scroll (scrollLeft ${r.forcedScrollLeft} of ` +
        `${(r.containerScrollWidth ?? 0) - (r.containerClientWidth ?? 0)}) the table's right edge ` +
        `is still at ${r.tableRightAtMaxScroll}, outside a ${r.viewportWidth}px viewport ` +
        `(overflow-x: ${r.containerOverflowX}). The overflow is clipped away, not scrolled.`,
      );
      continue;
    }

    // 4 — and a keyboard reader must be able to move it. WCAG 2.1.1.
    if (!r.keyboardReachable) {
      problems.push(
        `${where}: scrolls, but its container has no focus stop — ` +
        `tabindex=${JSON.stringify(r.affordance.tabindex)}, ` +
        `role=${JSON.stringify(r.affordance.role)}, and no focusable descendant. A keyboard ` +
        "reader cannot move it.",
      );
    }
  }
  return problems;
}

/** `domcontentloaded` + two frames is not enough for a route that fetches its rows. */
async function settle(page: Page, route: string) {
  await gotoAndSettle(page, route);
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => { /* long-poll route */ });
  await page.waitForTimeout(400);
}

/** Reads every `<table>` on the current page. Mutates `scrollLeft` and restores it. */
async function collectTables(page: Page, route: string): Promise<TableRecord[]> {
  return page.evaluate((routeName) => {
    const FOCUS_STOP = "a[href], button:not([disabled]), input:not([disabled]),"
      + " select:not([disabled]), textarea:not([disabled]), summary,"
      + " [contenteditable=''], [contenteditable='true'], [tabindex]:not([tabindex^='-'])";
    const px = (n: number) => Number(n.toFixed(3));

    return [...document.querySelectorAll("table")].map((table, index) => {
      let cursor: Element | null = table.parentElement;
      let container: Element | null = null;
      while (cursor) {
        const ox = getComputedStyle(cursor).overflowX;
        if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") { container = cursor; break; }
        cursor = cursor.parentElement;
      }

      const rect = table.getBoundingClientRect();
      let tableRightAtMaxScroll = rect.right;
      let forced: number | null = null;
      let containerBox: DOMRect | null = null;

      if (container) {
        containerBox = container.getBoundingClientRect();
        const before = container.scrollLeft;
        container.scrollLeft = 9999;
        forced = container.scrollLeft;
        tableRightAtMaxScroll = table.getBoundingClientRect().right;
        container.scrollLeft = before;
      }

      const tabindex = container?.getAttribute("tabindex") ?? null;
      const caption = table.querySelector("caption")?.textContent?.trim();

      return {
        route: routeName,
        index,
        label: caption || table.getAttribute("aria-label") || `table ${index}`,
        viewportWidth: window.innerWidth,
        tableWidth: px(rect.width),
        tableLeft: px(rect.left),
        tableRight: px(rect.right),
        tableRightAtMaxScroll: px(tableRightAtMaxScroll),
        container: container
          ? container.tagName.toLowerCase()
            + (typeof container.className === "string" && container.className.trim()
              ? "." + container.className.trim().split(/\s+/).join(".")
              : "")
          : null,
        containerLeft: containerBox ? px(containerBox.left) : null,
        containerRight: containerBox ? px(containerBox.right) : null,
        containerClientWidth: container ? container.clientWidth : null,
        containerScrollWidth: container ? container.scrollWidth : null,
        containerOverflowX: container ? getComputedStyle(container).overflowX : null,
        forcedScrollLeft: forced === null ? null : Number(forced.toFixed(2)),
        keyboardReachable: container === null
          ? false
          : (tabindex !== null && !tabindex.startsWith("-"))
            || container.matches(FOCUS_STOP)
            || container.querySelector(FOCUS_STOP) !== null,
        affordance: {
          tabindex,
          role: container?.getAttribute("role") ?? null,
          ariaLabel: container?.getAttribute("aria-label") ?? null,
        },
      };
    });
  }, route);
}

/**
 * Can every header cell of every table be brought inside the viewport?
 *
 * "Inside" is asked as two questions rather than one, because a cell can be
 * WIDER than its scroll port — `/kabiliyetler/kalite-kontrol` has a 282.6px
 * header inside a 278px port at 320 — and then no scroll position frames the
 * whole cell at once. Demanding that would fail a table that a reader can in
 * fact read, and WCAG 1.4.10 explicitly permits two-dimensional scrolling for
 * tabular data. So: the cell's START must be reachable and its END must be
 * reachable. For every cell narrower than the port those are the same scroll
 * position and this is the strict check; for a wider one it is the honest one.
 *
 * The scroll target is computed from live rects, not from `offsetLeft`: the
 * first version used `cell.offsetLeft - table.offsetLeft`, which assumes the
 * cell and the table share an `offsetParent`, and on the three
 * `/kabiliyetler/kalite-kontrol` tables they do not — it under-scrolled by
 * ~44px and reported reachable columns as lost.
 */
async function collectHeaderReach(page: Page, route: string) {
  return page.evaluate((routeName) => {
    const out: {
      route: string; label: string; header: string;
      reached: boolean; startReached: boolean; endReached: boolean;
      cellWidth: number; portWidth: number; left: number; right: number;
    }[] = [];

    for (const table of document.querySelectorAll("table")) {
      const headers = [...table.querySelectorAll("thead th")];
      if (headers.length === 0) continue;

      let cursor: Element | null = table.parentElement;
      let container: Element | null = null;
      while (cursor) {
        const ox = getComputedStyle(cursor).overflowX;
        if (ox === "auto" || ox === "scroll") { container = cursor; break; }
        if (ox === "hidden" || ox === "clip") break; // a clip box is not a scroller
        cursor = cursor.parentElement;
      }

      const label = table.querySelector("caption")?.textContent?.trim()
        || table.getAttribute("aria-label") || "unnamed table";
      const before = container ? container.scrollLeft : 0;
      const vw = window.innerWidth;

      for (const cell of headers) {
        const scrollTo = (delta: number) => {
          if (!container) return;
          const cellRect = cell.getBoundingClientRect();
          const boxRect = container.getBoundingClientRect();
          container.scrollLeft += delta === 0
            ? cellRect.left - boxRect.left
            : cellRect.right - boxRect.right;
        };

        if (container) container.scrollLeft = before;
        scrollTo(0);
        const atStart = cell.getBoundingClientRect();
        const startReached = atStart.left >= -0.5 && atStart.left <= vw + 0.5;

        if (container) container.scrollLeft = before;
        scrollTo(1);
        const atEnd = cell.getBoundingClientRect();
        const endReached = atEnd.right >= -0.5 && atEnd.right <= vw + 0.5;

        out.push({
          route: routeName,
          label,
          header: (cell.textContent || "").trim(),
          reached: startReached && endReached,
          startReached,
          endReached,
          cellWidth: Number(atStart.width.toFixed(2)),
          portWidth: container ? container.clientWidth : vw,
          left: Number(atStart.left.toFixed(2)),
          right: Number(atEnd.right.toFixed(2)),
        });
      }
      if (container) container.scrollLeft = before;
    }
    return out;
  }, route);
}

test.describe("QA — every table on a public route is reachable at its viewport", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(!LANES.has(testInfo.project.name), "narrow-reach lanes plus one wide control");
  });

  /* 22 routes, one settled load each. Measured at ~90 s on this machine. A
     budget, not a tolerance: no assertion below is loosened by it. */
  const WALK_BUDGET_MS = 420_000;

  test("every table fits its viewport or lives in a real, focusable scroll region", async ({ page }) => {
    test.setTimeout(WALK_BUDGET_MS);
    const all: TableRecord[] = [];
    for (const route of PUBLIC_ROUTES) {
      await settle(page, route);
      all.push(...await collectTables(page, route));
    }

    const found = Object.fromEntries(PUBLIC_ROUTES.map((r) => [r, all.filter((x) => x.route === r).length]));
    console.log(`[qa-p08 table walk] ${all.length} tables — ${JSON.stringify(found)}`);

    /* A walk that measured nothing satisfies every assertion under it. */
    const short = Object.entries(TABLE_CENSUS)
      .filter(([route, expected]) => (found[route] ?? 0) < expected)
      .map(([route, expected]) => `${route}: expected at least ${expected}, found ${found[route] ?? 0}`);
    expect(
      short,
      "a route that is supposed to render tables rendered fewer. Either the route regressed or this " +
      "walk is not waiting long enough — and a walk that measures nothing passes every assertion " +
      "below it, which is how the first version of this file reported /malzemeler as table-free.",
    ).toEqual([]);

    expect(unreachableTables(all), "a table is not reachable at this viewport").toEqual([]);
  });

  test("every table header can be brought fully inside the viewport", async ({ page }) => {
    test.setTimeout(WALK_BUDGET_MS);
    const all: Awaited<ReturnType<typeof collectHeaderReach>> = [];
    for (const route of PUBLIC_ROUTES) {
      await settle(page, route);
      all.push(...await collectHeaderReach(page, route));
    }

    console.log(`[qa-p08 header reach] ${all.length} header cells over ${new Set(all.map((h) => h.route)).size} routes`);
    expect(all.length, "no table header was measured at all — the walk found nothing").toBeGreaterThanOrEqual(12);
    expect(
      all.filter((h) => h.route === "/cerez-politikasi").length,
      "madde 02's four headers were not measured, so this test says nothing about the defect it exists for",
    ).toBe(4);

    const lost = all.filter((h) => !h.reached);
    expect(
      lost.map((h) => `${h.route} · ${h.label} · "${h.header}" (${h.cellWidth}px in a ${h.portWidth}px port) `
        + `start=${h.startReached ? "ok" : `lost at ${h.left}`} end=${h.endReached ? "ok" : `lost at ${h.right}`}`),
      "a table column cannot be brought on screen by scrolling its own region",
    ).toEqual([]);
  });

  /* ── the controls ───────────────────────────────────────────────────────
     Three records the checker MUST reject, and one live one: the real page
     with the defect put back. If any stops failing, the checker is hollow. */

  const fixture = (over: Partial<TableRecord>): TableRecord => ({
    route: "/qa-control",
    index: 0,
    label: "control",
    viewportWidth: 375,
    tableWidth: 583.875,
    tableLeft: 43,
    tableRight: 626.875,
    tableRightAtMaxScroll: 375,
    container: "div.shell-table-scroll",
    containerLeft: 42,
    containerRight: 375,
    containerClientWidth: 331,
    containerScrollWidth: 584,
    containerOverflowX: "auto",
    forcedScrollLeft: 253,
    keyboardReachable: true,
    affordance: { tabindex: "0", role: "group", ariaLabel: "control" },
    ...over,
  });

  test("control — the checker accepts what ships and rejects R2-1's own numbers", () => {
    // sanity: a table that fits, and a table that scrolls, must both pass, or
    // the checker rejects everything and its greens mean nothing either.
    expect(
      unreachableTables([fixture({ tableWidth: 331, tableLeft: 42, tableRight: 373, tableRightAtMaxScroll: 373 })]),
      "a table that already fits the viewport was reported as unreachable",
    ).toEqual([]);
    expect(unreachableTables([fixture({})]), "a genuinely scrollable, focusable table was reported as unreachable").toEqual([]);

    /* DEFECT R2-1, transcribed from reports/qa/phase-08/r2/table-clip.json and
       reports/qa/phase-08/r3/wrapper-ab.json: the container's own box was
       585.875px wide starting at x=42 in a 375 viewport, its content fit it
       exactly (584/584), and a forced scrollLeft stayed at 0. */
    const r21 = unreachableTables([fixture({
      route: "/cerez-politikasi",
      label: "Yerel depo kayıtları",
      container: "div.shell-stack",
      containerLeft: 42, containerRight: 627.875,
      containerClientWidth: 584, containerScrollWidth: 584,
      forcedScrollLeft: 0,
      tableRightAtMaxScroll: 626.875,
      keyboardReachable: false,
      affordance: { tabindex: null, role: null, ariaLabel: null },
    })]);
    expect(r21.length, "the checker did not reject defect R2-1's measured record").toBe(1);
    expect(r21[0]).toContain("OWN box");
  });

  test("control — the checker rejects an overflow that is clipped rather than scrolled", () => {
    const clipped = unreachableTables([fixture({
      containerRight: 375, containerClientWidth: 331, containerScrollWidth: 331,
      containerOverflowX: "clip", forcedScrollLeft: 0, tableRightAtMaxScroll: 626.875,
    })]);
    expect(clipped.length, "a table whose forced scrollLeft stuck at 0 was accepted").toBe(1);
    expect(clipped[0]).toContain("clipped away");

    const noContainer = unreachableTables([fixture({
      container: null, containerLeft: null, containerRight: null,
      containerClientWidth: null, containerScrollWidth: null,
      containerOverflowX: null, forcedScrollLeft: null, keyboardReachable: false,
    })]);
    expect(noContainer.length, "a table with no scrolling ancestor at all was accepted").toBe(1);
    expect(noContainer[0]).toContain("no scrolling ancestor");
  });

  test("control — the checker rejects a scrolling region no keyboard can reach", () => {
    const orphan = unreachableTables([fixture({
      keyboardReachable: false,
      affordance: { tabindex: null, role: null, ariaLabel: null },
    })]);
    expect(orphan.length, "a scrollable table with no focus stop was accepted — WCAG 2.1.1").toBe(1);
    expect(orphan[0]).toContain("no focus stop");
  });

  test("live control — put the R2-1 markup back on the real page and the guard goes red", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "desktop-1280", "R2-1 was a narrow-viewport defect; at 1280 the table fits");

    await settle(page, "/cerez-politikasi");
    const healthy = await collectTables(page, "/cerez-politikasi");
    expect(healthy.length, "no table on /cerez-politikasi — the page did not render madde 02").toBe(1);
    expect(unreachableTables(healthy), "the shipped page is already red, so this control cannot say anything").toEqual([]);

    /* The pre-C4 markup, exactly: what is now `div.shell-doc-table` was
       `<div className="shell-stack" data-gap="sm">` at CerezPolitikasi.tsx:133.
       A DOM-only edit inside this test's own page — no production file is
       touched and nothing is written to disk. */
    await page.evaluate(() => {
      const wrapper = document.querySelector("main table")?.closest("figure.shell-table")?.parentElement;
      if (!wrapper) throw new Error("the figure has no wrapper to revert");
      wrapper.className = "shell-stack";
      wrapper.setAttribute("data-gap", "sm");
    });
    await page.waitForTimeout(500);

    const reverted = await collectTables(page, "/cerez-politikasi");
    const problems = unreachableTables(reverted);
    expect(
      problems.length,
      "THE GUARD DID NOT SEE R2-1 ON THE REAL PAGE. The pre-C4 wrapper was restored in the DOM and " +
      `the checker still passed. Measured: ${JSON.stringify(reverted)}`,
    ).toBe(1);
    expect(problems[0]).toContain("OWN box");

    const lost = (await collectHeaderReach(page, "/cerez-politikasi")).filter((h) => !h.reached);
    expect(
      lost.map((h) => h.header),
      "with the defect restored, the header sweep still reported every column reachable",
    ).not.toEqual([]);
  });
});
