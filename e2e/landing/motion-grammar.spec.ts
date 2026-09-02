import { expect, test } from "@playwright/test";
import { gotoAndSettle, landingReady, settleRendering } from "../helpers";

/* ══════════════════════════════════════════════════════════════════════════
   MOTION GRAMMAR — the four claims of Phase 05b that a screenshot cannot make

   `landing-reduced-motion.spec.ts` already pins the reduced-motion path, and
   the golden captures pin the resting picture. Neither can see any of this,
   because all four claims are about what happens BETWEEN two resting states,
   and three of them are about motion being ABSENT where it should be.

     1. Nothing re-hides on scroll-back.        (defect I4)
     2. Mobile arms fewer elements than desktop, rather than the same
        choreography played slower.
     3. Nothing animates while it is off screen.
     4. Content types do not share one generic reveal.

   Claim 1 is the one that would be a live content defect if it broke, so it
   is asserted the strict way: the heading must be opaque at EVERY scroll
   offset where it is on screen, not merely at the start and the end.
   ══════════════════════════════════════════════════════════════════════════ */

/** Effective opacity, multiplied down the ancestor chain — a transparent
    section makes its opaque paragraph invisible just the same. */
const EFFECTIVE_OPACITY = (selector: string) => {
  const el = document.querySelector(selector);
  if (!el) return -1;
  let node: Element | null = el;
  let opacity = 1;
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node);
    if (style.visibility === "hidden" || style.display === "none") return -1;
    opacity *= Number.parseFloat(style.opacity);
    node = node.parentElement;
  }
  return opacity;
};

test.describe("motion grammar", () => {
  test("I4 — scroll position never takes opacity away from the service-detail heading", async ({ page }) => {
    /* WHAT THIS ASSERTS, AND WHAT IT DELIBERATELY DOES NOT
       ----------------------------------------------------
       The motion defect was a scroll-linked `useTransform(progress, [0, 0.6],
       [1, 0])` on the block holding the breadcrumb, the eyebrow and the h1.
       Scroll position runs both ways, so the page title dissolved under the
       reader and came back when they scrolled up. That binding is gone, and
       what pins it gone is the shape of the curve: opacity must be MONOTONIC
       NON-DECREASING as you scroll away. A reveal may finish; nothing may
       un-finish.

       It does NOT assert that the heading is visible, because at 375 it is
       not, and that is a LAYOUT defect this phase must not paper over.
       Measured at 375: the hero is 320px (viewport y 96..416) but the
       `absolute bottom-0` block inside it is 424px tall, so it spans y
       -8..416 and its top 104px — the eyebrow and the whole h1, at y 32..92 —
       are clipped away by the hero's `overflow: hidden`. Being clipped, the
       block never intersects, so its `whileInView` never fires either and it
       also sits at `opacity: 0`. At 1280 the same block is 229px inside a
       440px hero and everything works.

       Verified pre-existing: the identical measurement on base commit a2b4c20
       reports the same two hidden elements. Asserting visibility here would
       either fail on a defect this packet may not touch, or tempt someone to
       force `opacity: 1` on text that is still clipped — a number that looks
       fixed over a title the reader still cannot see. Phase 07 owns this
       page's body; the layout is its to correct, and when it is, this test
       keeps the motion half honest. */
    await gotoAndSettle(page, "/hizmetler/cnc-frezeleme");
    const heading = page.locator("h1").first();

    const readings: Array<{ y: number; opacity: number }> = [];
    for (let y = 0; y <= 400; y += 20) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(90);
      readings.push({
        y,
        opacity: await heading.evaluate((el) => {
          let node: Element | null = el;
          let opacity = 1;
          while (node && node !== document.documentElement) {
            opacity *= Number.parseFloat(getComputedStyle(node).opacity);
            node = node.parentElement;
          }
          return opacity;
        }),
      });
    }

    expect(readings.length).toBeGreaterThan(10);
    const regressions = readings.filter((r, i) => i > 0 && r.opacity < readings[i - 1].opacity - 0.01);
    expect(
      regressions,
      `scrolling must never reduce the heading's opacity — readings: ${JSON.stringify(readings)}`,
    ).toEqual([]);

    // And scrolling far past it and back leaves it no worse than it was.
    const before = readings[readings.length - 1].opacity;
    await page.evaluate(() => window.scrollTo(0, 2400));
    await page.waitForTimeout(250);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);
    const after = await page.evaluate(EFFECTIVE_OPACITY, "h1");
    expect(after, "the heading must not be dimmer after a round trip").toBeGreaterThanOrEqual(before - 0.01);
  });

  test("no landing band un-arrives once it has arrived", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    const arrived = await page.locator(".tl-band.tl-inview").count();

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    const stillArrived = await page.locator(".tl-band.tl-inview").count();

    /* `.tl-inview` is deliberately one-way. If it were two-way, scrolling back
       up would re-hide bands the reader had already read — I4's defect, spread
       across the whole landing. */
    expect(stillArrived, "an entrance must not re-arm on scroll-back").toBe(arrived);
    expect(arrived).toBeGreaterThan(0);
  });

  test("nothing animates while it is off screen", async ({ page }) => {
    await gotoAndSettle(page, "/");
    await landingReady(page);

    const trackState = () => page.locator(".tl-marquee-track").first()
      .evaluate((el) => getComputedStyle(el).animationPlayState);

    await page.evaluate(() => {
      document.querySelector(".tl-marquee")?.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(500);
    const whenVisible = await trackState();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(700);
    const whenOffScreen = await trackState();

    /* The capability marquee is `linear infinite`. Without a two-way gate it
       composites a `max-content`-wide track for the whole session, including
       while the reader is thousands of pixels below it. */
    test.skip(whenVisible === "paused", "reduced motion or hover pause — the running state is not observable here");
    expect(whenVisible, "the marquee should run while it is on screen").toBe("running");
    expect(whenOffScreen, "the marquee must not run while it is off screen").toBe("paused");
  });

  test("mobile arms fewer elements than desktop", async ({ page }) => {
    /* Deliberately measured inside ONE test at two widths rather than as two
       per-project assertions with hardcoded thresholds. The claim is a
       COMPARISON — "mobile is not the desktop layer scaled down" — and a
       threshold per project would drift into passing while the two converged. */
    const armed = async (width: number, height: number) => {
      await page.setViewportSize({ width, height });
      await gotoAndSettle(page, "/");
      await landingReady(page);
      await settleRendering(page);
      return page.evaluate(() => {
        let transitioned = 0;
        let animated = 0;
        for (const el of document.querySelectorAll(".tl-root *")) {
          const box = el.getBoundingClientRect();
          if (box.width <= 0 && box.height <= 0) continue;
          const style = getComputedStyle(el);
          if (style.transitionDuration.split(",").some((v) => Number.parseFloat(v) > 0)) transitioned += 1;
          if (style.animationName !== "none") animated += 1;
        }
        return { transitioned, animated };
      });
    };

    const desktop = await armed(1280, 900);
    const mobile = await armed(375, 812);

    test.skip(desktop.transitioned === 0, "motion layer is off (reduced motion) — nothing to compare");
    expect(
      mobile.transitioned,
      `mobile should arm materially fewer elements (desktop=${desktop.transitioned} mobile=${mobile.transitioned})`,
    ).toBeLessThan(desktop.transitioned * 0.75);
  });

  test("content types do not share one generic reveal", async ({ page }) => {
    /* Read at the PROJECT's own viewport rather than resizing to 1280.
       The first version resized, and it passed in isolation and failed inside
       the full suite: a resize plus a reload is two more things that have to
       settle, and under load they did not. The claim is width-dependent by
       design — the rich grammars live in `min-width: 768px` — so each width
       asserts its own half instead of one of them faking the other's. */
    await gotoAndSettle(page, "/");
    await landingReady(page);
    await settleRendering(page);

    // Every element read below must exist before anything is concluded from
    // it, so a missing node fails loudly instead of reading as "no transition".
    for (const selector of [".tl-proof-grid article", ".tl-cert", ".tl-nexus-app", ".tl-sector-card"]) {
      await expect(page.locator(selector).first(), `${selector} should be in the DOM`).toBeAttached();
    }

    const { width, grammars } = await page.evaluate(() => {
      /* What each band's entrance actually MOVES, read off the resting
         declarations rather than off the stylesheet source. A curtain shows up
         as a transform on a pseudo-element. */
      const read = (selector: string, pseudo?: string) => {
        const el = document.querySelector(selector);
        if (!el) return "missing";
        const style = getComputedStyle(el, pseudo);
        return style.transitionProperty
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p !== "none" && p !== "all")
          .sort()
          .join("+") || "-";
      };
      return {
        width: window.innerWidth,
        grammars: {
          proof: read(".tl-proof-grid article"),
          paperCurtain: read(".tl-cert", "::after"),
          panelCurtain: read(".tl-nexus-app", "::after"),
          tableVerify: read(".tl-nexus td span[data-status]"),
          imagery: read(".tl-sector-card"),
          paperContainer: read(".tl-quality-strip"),
          panelContainer: read(".tl-nexus-app"),
        },
      };
    });

    test.skip(grammars.proof === "-", "motion layer is off (reduced motion) — nothing to compare");
    const seen = JSON.stringify(grammars);

    if (width >= 768) {
      // The quiet default is opacity; the other content types must not be it.
      expect(grammars.proof, seen).toBe("opacity");
      expect(grammars.paperCurtain, `paper evidence prints — a curtain transform · ${seen}`).toContain("transform");
      expect(grammars.panelCurtain, `the dark panel exposes — a curtain transform · ${seen}`).toContain("transform");
      expect(grammars.tableVerify, `a status cell is written into — clip-path · ${seen}`).toContain("clip-path");
      expect(grammars.imagery, `imagery is revealed — clip-path curtain · ${seen}`).toContain("clip-path");
      expect(new Set(Object.values(grammars)).size, `every band moved the same way · ${seen}`).toBeGreaterThan(2);
      return;
    }

    /* Below 768 the animated UNIT is the container, not its children — the
       concrete form of "mobile is not the desktop layer scaled down". The
       curtains must be absent, and the containers must carry the transition
       the children no longer have. */
    expect(grammars.paperCurtain, `no paper curtain below 768 · ${seen}`).toBe("-");
    expect(grammars.panelCurtain, `no panel curtain below 768 · ${seen}`).toBe("-");
    expect(grammars.paperContainer, `the container carries it instead · ${seen}`).toBe("opacity");
    expect(grammars.panelContainer, `the container carries it instead · ${seen}`).toBe("opacity");
  });
});
