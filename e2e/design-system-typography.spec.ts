import { expect, test, type Page } from "@playwright/test";
import { gotoAndSettle, settleRendering } from "./helpers";

/* ══════════════════════════════════════════════════════════════════════════
   THE GATE PHASE 09b-1 SAID COULD NOT EXIST

   `e224364` fixed a real defect and drew the wrong conclusion from it.
   `.shell-field > label` is a child combinator; `AuthField` nests the label
   inside `.shell-auth-label-row`; so on three auth routes every form label
   rendered at the browser default — Space Grotesk 16px 400 — while `tsc`,
   eslint, axe, a contrast census and every golden stayed green. That commit
   concluded that nothing could have caught it and that opening a screenshot
   was the only instrument. THE FIRST HALF WAS TRUE AND THE SECOND WAS NOT,
   and QA falsified it with a running test rather than an argument.

   THE INVARIANT, IN ONE SENTENCE:

       a component the design system defines must compute the same typography
       everywhere it appears.

   It needs no baseline, no stored image, and no advance knowledge that a
   child combinator was involved. It does not care WHY two instances diverge —
   a selector that stopped matching, a specificity loss, a page that reached
   for a utility class, a component copied instead of imported. All of those
   are the same failure: one component rendering two ways.

   ── WHICH AXES ARE HELD CONSTANT, AND WHICH ARE FREE ─────────────────────
   This is the part that decides whether the check is a gate or a nuisance,
   and it is stated rather than implied.

     HELD CONSTANT — ROUTE and GROUND. `.shell-field label` must resolve the
       same treatment on `/giris` as on `/iletisim`, and the same on a paper
       band as on graphite. The design system varies COLOUR by ground and
       nothing else; a component whose SIZE moves with its ground is a defect
       by the system's own rule.

     FREE — VIEWPORT. The type ramp is responsive by contract, so every
       comparison happens inside one project at one width. Eight regression
       projects means the invariant is checked at eight widths, never across
       them.

     FREE — COLOUR. Excluded from the fingerprint for the reason above.
       `--sf-ink` on graphite and `--tl-ink` on paper are the same component
       behaving correctly.

   ── WHY IT IS UNIVERSAL RATHER THAN A LIST OF SLOTS ──────────────────────
   The obvious version of this check enumerates the components it trusts. That
   would have been over-reach in the other direction: an enumerated list only
   ever catches what its author already suspected, which is the failure mode
   `.shell-field > label` walked through. So the scope was MEASURED first.
   `scripts/qa-probes/09b1c1-type-slots.mjs` walked every element carrying a
   `shell-*` or `tl-*` class across eleven routes including the landing:

     1280   256 components, 1730 observations, SPLITS: 0
      375   237 components, 1591 observations, SPLITS: 0

   The invariant holds everywhere in this codebase today, so the gate asserts
   it everywhere and carries an EXEMPTION REGISTER that is empty. A future
   phase that genuinely needs a component to vary by context has two honest
   moves — give the variant its own modifier class, which makes it a different
   component and needs no exemption at all, or add a row here with a reason.
   What it cannot do is diverge silently, which is exactly what happened last
   time.
   ══════════════════════════════════════════════════════════════════════════ */

const ROUTES = [
  "/",
  "/giris",
  "/sifremi-unuttum",
  "/reset-password",
  "/iletisim",
  "/teklif-al",
  "/malzemeler",
  "/sss",
  "/hakkimizda",
  "/blog",
  "/404-this-route-does-not-exist",
];

/**
 * Components allowed to resolve more than one typography, each with the
 * reason. EMPTY BY MEASUREMENT, not by optimism — see the census figures in
 * the note above. A row here is a design decision on the record.
 */
const EXEMPT: { component: string; why: string }[] = [];

type Row = { route: string; key: string; style: string; ground: string; sample: string };

/* Runs in the page. Two passes: every element carrying a design-system class,
   then the slots INSIDE `.shell-field`, which is where the historical defect
   lived — a bare `<label>` has no class of its own and is defined entirely by
   the component that contains it. */
const CENSUS = () => {
  const out: { key: string; style: string; ground: string; sample: string }[] = [];
  const fingerprint = (el: Element) => {
    const s = getComputedStyle(el);
    return [
      s.fontFamily.split(",")[0].replace(/["']/g, ""),
      s.fontSize,
      s.fontWeight,
      s.fontStyle,
      s.letterSpacing,
      s.textTransform,
    ].join(" / ");
  };
  const keyOf = (el: Element) => {
    const classes = Array.from(el.classList).filter((c) => /^(shell-|tl-)/.test(c)).sort();
    return classes.length ? `${el.tagName.toLowerCase()}.${classes.join(".")}` : null;
  };
  const groundOf = (el: Element) => {
    const band = el.closest(".tl-band[data-band-tone]");
    const root = el.closest("[data-shell-surface]");
    return band?.getAttribute("data-band-tone")
      ?? root?.getAttribute("data-shell-surface")
      ?? (el.closest(".tl-root") ? "tl-landing" : "none");
  };
  const visible = (el: Element) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width >= 1 || r.height >= 1;
  };
  const push = (key: string, el: Element) => {
    out.push({
      key,
      style: fingerprint(el),
      ground: groundOf(el),
      sample: (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 30)
        || el.getAttribute("name") || el.tagName.toLowerCase(),
    });
  };
  for (const el of Array.from(document.querySelectorAll("*"))) {
    const key = keyOf(el);
    if (key && visible(el)) push(key, el);
  }
  for (const root of Array.from(document.querySelectorAll(".shell-field"))) {
    for (const el of Array.from(root.querySelectorAll("label, input, select, textarea"))) {
      if (visible(el)) push(`.shell-field ${el.tagName.toLowerCase()}`, el);
    }
  }
  return out;
};

/* ── TWO PRECONDITIONS, AND THEY EXIST BECAUSE THIS GATE LIED ONCE ────────
   A stray second Playwright run overlapped this one on an 8 GB machine; the
   preview server started refusing connections, and this gate reported:

     p.shell-state-label   → IBM Plex Mono / 10px / 600 on /giris+/teklif-al
                          || Space Grotesk / 16px / 400 on /sifremi-unuttum+/sss

   which reads exactly like a design-system defect and was nothing of the kind.
   `/sifremi-unuttum` and `/sss` were stuck on `App.tsx`'s `.shell-boot` route
   fallback with the stylesheet not applied, so the only two elements in the
   document were the loading state's own label and detail, unstyled. A census
   cannot tell "this component is outside the system" from "this page never
   arrived" — unless it is made to, so it is:

     1. THE ROUTE LEFT ITS LOADING STATE. `.shell-boot` is the route-level
        suspense fallback and nothing else uses it; while it is present the
        page is not the page.
     2. THE STYLESHEET IS APPLIED. `--tl-rail` is declared on `:root` in
        `design-tokens.css` and is `64px` on every public surface. An empty
        value means the stylesheet did not load, which is a delivery failure
        and must be named as one rather than counted as a split.

   Both fail with their own message. A gate that reports the wrong cause is
   worse than one that reports nothing, because the next reader acts on it. */
async function arriveAt(page: Page, route: string): Promise<void> {
  await gotoAndSettle(page, route);
  await expect(page.locator("#root")).toBeVisible({ timeout: 20_000 });
  await expect(
    page.locator(".shell-boot"),
    `${route} never left its route loading state — a delivery failure, not a typography split`,
  ).toHaveCount(0, { timeout: 20_000 });
  const rail = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--tl-rail").trim());
  expect(
    rail,
    `${route} rendered without the stylesheet applied — a delivery failure, not a typography split`,
  ).not.toEqual("");
}

async function censusOf(page: Page, route: string): Promise<Row[]> {
  await arriveAt(page, route);
  return (await page.evaluate(CENSUS)).map((r) => ({ route, ...r }));
}

/** Components resolving more than one treatment, exemptions removed. */
function splits(rows: Row[]) {
  const groups = new Map<string, Map<string, { routes: Set<string>; n: number; grounds: Set<string>; sample: string }>>();
  for (const r of rows) {
    if (!groups.has(r.key)) groups.set(r.key, new Map());
    const g = groups.get(r.key)!;
    if (!g.has(r.style)) g.set(r.style, { routes: new Set(), n: 0, grounds: new Set(), sample: r.sample });
    const e = g.get(r.style)!;
    e.routes.add(r.route);
    e.grounds.add(r.ground);
    e.n += 1;
  }
  const exempt = new Set(EXEMPT.map((e) => e.component));
  return [...groups.entries()]
    .filter(([key, g]) => g.size > 1 && !exempt.has(key))
    .map(([key, g]) => `${key}  →  ${[...g.entries()]
      .map(([style, e]) => `${style} (${e.n}x on ${[...e.routes].join("+")}, grounds ${[...e.grounds].join("+")}, e.g. "${e.sample}")`)
      .join("   ||   ")}`);
}

test.describe("design system — one component, one typography", () => {
  test("no design-system component resolves two typographies across routes and grounds", async ({ page }) => {
    test.setTimeout(180_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const rows: Row[] = [];
    for (const route of ROUTES) rows.push(...await censusOf(page, route));

    /* A census that measured nothing would pass silently, which is the one
       way this gate could become decorative. */
    expect(rows.length, "the census must actually observe components").toBeGreaterThan(300);

    expect(
      splits(rows),
      "a design-system component resolving more than one typography — see the note at the top of this file",
    ).toEqual([]);
  });

  /* ──────────────────────────────────────────────────────────────────────
     THE NEGATIVE CONTROLS. A check that is green on a healthy tree proves
     nothing on its own. Two are run, and they fail differently on purpose.
     ────────────────────────────────────────────────────────────────────── */

  test("RED on the historical defect: reverting e224364 at runtime splits the label", async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: "reduce" });

    /* `/giris` renders the nested label the defect lived in; `/iletisim`
       renders the same design-system slot un-nested. Two routes are the
       minimum that can show a SPLIT rather than merely a change. */
    const healthy = [
      ...await censusOf(page, "/giris"),
      ...await censusOf(page, "/iletisim"),
    ];
    expect(splits(healthy.filter((r) => r.key === ".shell-field label")), "the tree must be green before it can be broken")
      .toEqual([]);

    await arriveAt(page, "/giris");
    /* THE ANCHOR IS ASSERTED, NOT ASSUMED. If a later phase renames
       `.shell-auth-label-row` this control must go red and be re-anchored —
       silently measuring nothing is how the original defect survived. */
    expect(
      await page.locator(".shell-auth-label-row > label").count(),
      "the historical defect's selector no longer matches — re-anchor this control rather than deleting it",
    ).toBeGreaterThan(0);

    /* The four declarations `e224364` added, reverted on the live page. No
       production file is touched and nothing is rebuilt. */
    await page.addStyleTag({
      content: `.shell-auth-label-row > label {
        color: revert !important;
        font: revert !important;
        letter-spacing: revert !important;
        text-transform: revert !important;
      }`,
    });
    await settleRendering(page);
    const broken = [
      ...(await page.evaluate(CENSUS)).map((r) => ({ route: "/giris", ...r })),
      ...healthy.filter((r) => r.route === "/iletisim"),
    ];

    expect(
      splits(broken.filter((r) => r.key === ".shell-field label")),
      "reverting the historical fix must make this gate RED — otherwise the green above means nothing",
    ).not.toEqual([]);
  });

  test("RED on a defect it has never seen: one instance of any slot pushed off the system", async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: "reduce" });

    /* Anchor-free, and that is the point. The control above proves the gate
       catches the defect we already know about; this one proves it catches a
       divergence introduced somewhere it has never looked, with no selector
       from history in it. */
    const control = await censusOf(page, "/iletisim");
    expect(splits(control), "/iletisim must be green before it is broken").toEqual([]);

    const target = await page.evaluate(() => {
      const el = document.querySelectorAll(".shell-field label")[1] as HTMLElement | undefined;
      if (!el) return null;
      el.setAttribute("data-09b1c2-mutant", "");
      return el.textContent?.trim() ?? "";
    });
    expect(target, "/iletisim must render at least two `.shell-field` labels for this control").not.toBeNull();

    await page.addStyleTag({
      content: `[data-09b1c2-mutant] { font-size: 13px !important; letter-spacing: normal !important; }`,
    });
    await settleRendering(page);
    const mutated = (await page.evaluate(CENSUS)).map((r) => ({ route: "/iletisim", ...r }));

    expect(
      splits(mutated),
      "one instance pushed off the system, on one route, must be enough to make this gate RED",
    ).not.toEqual([]);
  });

  /* ──────────────────────────────────────────────────────────────────────
     THE PRECONDITIONS ARE CONTROLS TOO. Both were added after this gate
     reported a design-system defect that was really a page that never
     arrived; a guard that has never been seen to fire is a comment. Each is
     provoked here and must fail with ITS OWN message, not with a split.
     ────────────────────────────────────────────────────────────────────── */
  test("a page that never arrives is reported as a delivery failure, not a split", async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: "reduce" });

    /* (2) the stylesheet never lands. `--tl-rail` comes from `:root` in the
       bundled CSS, so with the stylesheet gone every component in the document
       reads at the browser default — which is precisely the shape of a split
       and is not one. */
    await page.route("**/*.css", (route) => route.abort());
    await expect(arriveAt(page, "/giris"))
      .rejects.toThrow(/rendered without the stylesheet applied/);
    await page.unroute("**/*.css");

    /* (1) the route chunk is HELD, not aborted, and the difference is the
       whole control. Aborting it was tried first and the guard did NOT fire:
       the rejected dynamic import reaches an error boundary, `.shell-boot`
       comes down, and the page "arrives" at an error state. Only a request
       that never answers leaves `Suspense` pending, which is the condition
       this precondition exists for — a page that is still loading when the
       census reads it.

       Named by its own chunk so it cannot silently stop blocking anything: if
       the build stops emitting a `Login-*.js` chunk the page arrives,
       `arriveAt` resolves, and this control goes red. */
    await page.route("**/assets/Login-*.js", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 30_000));
      await route.abort().catch(() => { /* the page is already gone */ });
    });
    await expect(arriveAt(page, "/giris"))
      .rejects.toThrow(/never left its route loading state/);
    await page.unroute("**/assets/Login-*.js");
  });

  /* ──────────────────────────────────────────────────────────────────────
     AND THE OTHER HALF OF "A COMPONENT RENDERS ONE WAY": the attribute that
     SELECTS a component's ground. `ShellBand` used to write
     `data-band-tone="graphite"` into the DOM with no rule anywhere matching
     it — a no-op, and a loaded selector. Only tones the stylesheet binds may
     reach the DOM, so this is enforced rather than described.
     ────────────────────────────────────────────────────────────────────── */
  test("only a band tone the stylesheet binds reaches the DOM", async ({ page }) => {
    test.setTimeout(180_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const seen = new Set<string>();
    let bands = 0;
    for (const route of ROUTES) {
      await arriveAt(page, route);
      const tones = await page.evaluate(() =>
        Array.from(document.querySelectorAll("[data-band-tone]"))
          .map((el) => el.getAttribute("data-band-tone") ?? ""));
      bands += tones.length;
      for (const t of tones) seen.add(t);
    }
    expect(bands, "at least one toned band must render, or this proves nothing").toBeGreaterThan(0);
    expect(
      [...seen].sort(),
      "`paper` is the only tone `shell.css` binds a `--sf-*` role set for; any other value is a selector with no rules behind it",
    ).toEqual(["paper"]);
  });
});
