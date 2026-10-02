import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import {
  expectLocatorUnobscured,
  gotoAndSettle,
  hydrateLanding,
  isReducedMotionAuditViewport,
  LEGACY_LANDING_SCENE_IDS,
  expectsNaturalLandingFlow,
  usesNaturalLandingFlow,
  LEGACY_LANDING_PATH,
} from "./legacy-helpers";

const KNOWN_V1_SEMANTIC_VIOLATIONS = [
  "root:test-id", "root:version", "root:order",
  "top:scene-id", "top:label", "top:focus-target",
  "hizmetler:scene-id", "hizmetler:label", "hizmetler:focus-target",
  "endustriler:scene-id", "endustriler:label", "endustriler:focus-target",
  "malzemeler:scene-id", "malzemeler:label", "malzemeler:focus-target",
  "neden-biz:tag", "neden-biz:parent", "neden-biz:scene-id", "neden-biz:height", "neden-biz:label", "neden-biz:focus-target",
  "kabiliyetler:tag", "kabiliyetler:parent", "kabiliyetler:scene-id", "kabiliyetler:height", "kabiliyetler:label", "kabiliyetler:focus-target",
  "referanslar:scene-id", "referanslar:label", "referanslar:focus-target",
  "sss:scene-id", "sss:label", "sss:focus-target",
  "iletisim:scene-id", "iletisim:label", "iletisim:focus-target",
] as const;

const KNOWN_MOBILE_CONTRAST_TARGETS = [
  '.ppc-kicker > span',
  '#process-proof-title > em',
  'article[aria-labelledby="process-stage-title-brief"] > .ppc-stage-copy[data-process-copy="true"] > p:nth-child(1) > span',
  'article[aria-labelledby="process-stage-title-material"] > .ppc-stage-copy[data-process-copy="true"] > p:nth-child(1) > span',
  'article[aria-labelledby="process-stage-title-machining"] > .ppc-stage-copy[data-process-copy="true"] > p:nth-child(1) > span',
  'article[aria-labelledby="process-stage-title-finish"] > .ppc-stage-copy[data-process-copy="true"] > p:nth-child(1) > span',
  '#process-stage-verification > article > .ppc-stage-copy[data-process-copy="true"] > p:nth-child(1) > span',
] as const;

test.describe("Editorial landing flow", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndSettle(page, LEGACY_LANDING_PATH);
    await hydrateLanding(page);
    await page.evaluate(() => window.scrollTo(0, 0));
  });

  test("records nine physical sections as a known production blocker", async ({ page }) => {
    const root = page.locator("main#main-content > :first-child");
    await expect(root).toHaveCount(1);
    for (const id of LEGACY_LANDING_SCENE_IDS) await expect(page.locator(`#${id}`)).toHaveCount(1);

    const physicalSectionCount = await root.locator(":scope > section").count();
    test.fail(physicalSectionCount === 8, "Current landing has exactly eight physical sections; production repair is outside Slice 0.");
    expect(physicalSectionCount).toBe(9);
  });

  test("records the future section semantics as a known production blocker", async ({ page }) => {
    for (const id of LEGACY_LANDING_SCENE_IDS) await expect(page.locator(`#${id}`)).toHaveCount(1);

    const violations = await page.evaluate((ids) => {
      const root = document.querySelector<HTMLElement>("main#main-content > :first-child");
      const directSectionOrder = root
        ? [...root.querySelectorAll<HTMLElement>(":scope > section[id]")].map((section) => section.id)
        : [];
      const rootFailures = [
        root?.dataset.testid === "landing-root" ? null : "root:test-id",
        root?.dataset.landingVersion === "v2" ? null : "root:version",
        JSON.stringify(directSectionOrder) === JSON.stringify(ids) ? null : "root:order",
      ].filter((failure): failure is string => failure !== null);

      const sceneFailures = ids.flatMap((id) => {
        const element = document.getElementById(id) as HTMLElement | null;
        if (!element) return [`${id}:missing`];
        const labelledBy = element.getAttribute("aria-labelledby") ?? "";
        const heading = labelledBy ? element.querySelector<HTMLElement>(`#${CSS.escape(labelledBy)}`) : null;
        const rect = element.getBoundingClientRect();
        const headingRect = heading?.getBoundingClientRect();
        const headingStyle = heading ? getComputedStyle(heading) : null;
        const hasVisibleHeading = !!heading?.textContent?.trim()
          && !!headingRect && headingRect.width > 0 && headingRect.height > 0
          && headingStyle?.display !== "none" && headingStyle?.visibility !== "hidden";
        const failures = [
          element.tagName === "SECTION" ? null : `${id}:tag`,
          element.parentElement === root ? null : `${id}:parent`,
          element.getAttribute("data-scene-id") === id ? null : `${id}:scene-id`,
          rect.height > 44 ? null : `${id}:height`,
          labelledBy && hasVisibleHeading ? null : `${id}:label`,
          element.getAttribute("tabindex") === "-1" ? null : `${id}:focus-target`,
        ];
        return failures.filter((failure): failure is string => failure !== null);
      });
      return [...rootFailures, ...sceneFailures];
    }, LEGACY_LANDING_SCENE_IDS);

    test.fail(
      JSON.stringify(violations) === JSON.stringify(KNOWN_V1_SEMANTIC_VIOLATIONS),
      "Current landing matches the frozen v1 semantic violation signature.",
    );
    expect(violations).toEqual([]);
  });

  test("preserves nine unique anchors and the current content inventory", async ({ page }) => {
    const anchors = await page.evaluate((ids) => ids.map((id) => {
      const nodes = document.querySelectorAll(`#${CSS.escape(id)}`);
      const element = nodes.item(0) as HTMLElement | null;
      return {
        id,
        count: nodes.length,
        top: element ? element.getBoundingClientRect().top + window.scrollY : null,
      };
    }), LEGACY_LANDING_SCENE_IDS);
    expect(anchors.every(({ count }) => count === 1)).toBe(true);
    const tops = anchors.map(({ top }) => top as number);
    for (let index = 1; index < tops.length; index += 1) {
      expect(tops[index]).toBeGreaterThan(tops[index - 1]);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
      .toBeLessThanOrEqual(1);

    await expect(page.locator('#hizmetler nav[aria-label="Hizmet hikâyeleri"] button')).toHaveCount(5);
    await expect(page.locator("#hizmetler article[id]")).toHaveCount(5);
    await expect(page.locator("#endustriler .lf-industry-jump")).toHaveCount(5);
    await expect(page.locator("#endustriler a.lf-industry-card")).toHaveCount(5);
    await expect(page.locator("#malzemeler a.lf-material-card")).toHaveCount(6);
    await expect(page.locator("[data-process-stage]")).toHaveCount(5);
    await expect(page.locator('#sss button[aria-expanded][aria-controls]')).toHaveCount(4);
    await expect(page.locator("#sss .lf-decision-dossier .lf-editorial-list > a:not(.lf-inline-link)")).toHaveCount(3);
    await expect(page.locator("#sss .lf-decision-dossier a.lf-inline-link[href]")).toHaveCount(1);
  });

  test("matches the approved compact and full-motion profile boundary", async ({ page }) => {
    const expectedNaturalFlow = await expectsNaturalLandingFlow(page);
    const observedNaturalFlow = await usesNaturalLandingFlow(page);
    const viewport = page.viewportSize();
    const pinCount = await page.locator(".pin-spacer").count();
    const matchesKnownV7Defect = viewport?.width === 1440
      && viewport.height === 650
      && expectedNaturalFlow
      && !observedNaturalFlow
      && pinCount === 2;

    test.fail(matchesKnownV7Defect, "Frozen V7 defect: 1440x650 renders full motion with exactly two pins.");
    expect(observedNaturalFlow).toBe(expectedNaturalFlow);
  });

  test("full-motion service controls expose one destination at a time", async ({ page }) => {
    test.skip(await usesNaturalLandingFlow(page), "full-motion profile only");

    const section = page.locator("#hizmetler");
    const controls = section.locator('nav[aria-label="Hizmet hikâyeleri"] button');
    const stories = section.locator("article[id]");
    await expect(controls).toHaveCount(5);
    await expect(stories).toHaveCount(5);
    await section.scrollIntoViewIfNeeded();

    await controls.nth(2).focus();
    await expect(controls.nth(2)).toHaveAttribute("aria-current", "step");
    const targetId = await controls.nth(2).getAttribute("aria-controls");
    expect(targetId).toBeTruthy();
    await expect(page.locator(`#${targetId}`)).not.toHaveAttribute("aria-hidden", "true");
    await expect(section.locator('article[aria-hidden="true"]')).toHaveCount(4);
    await expect(section.locator('article[aria-hidden="true"] a[tabindex="-1"]')).toHaveCount(20);
  });

  test("natural-flow profiles expose every service and industry destination", async ({ page }) => {
    test.skip(!(await usesNaturalLandingFlow(page)), "natural-flow profile only");

    const stories = page.locator("#hizmetler article[id]");
    const industries = page.locator("#endustriler a.lf-industry-card");
    await expect(stories).toHaveCount(5);
    await expect(industries).toHaveCount(5);
    await expect(page.locator('#hizmetler article[aria-hidden="true"]')).toHaveCount(0);
    await expect(page.locator('#endustriler a[aria-hidden="true"]')).toHaveCount(0);
    await expect(page.locator('#hizmetler a[tabindex="-1"]')).toHaveCount(0);
    await expect(page.locator('#endustriler a[tabindex="-1"]')).toHaveCount(0);
  });

  test("records the known serious contrast defect instead of treating axe as green", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-375", "one canonical mobile baseline scan");
    test.setTimeout(120_000);

    const results = await new AxeBuilder({ page }).include("body").analyze();
    const severe = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
    expect(severe.filter((violation) => violation.id !== "color-contrast")).toEqual([]);
    const contrast = severe.find((violation) => violation.id === "color-contrast");
    const contrastTargets = (contrast?.nodes ?? [])
      .map((node) => node.target.join(" > "))
      .sort((left, right) => left.localeCompare(right));
    const frozenTargets = [...KNOWN_MOBILE_CONTRAST_TARGETS]
      .sort((left, right) => left.localeCompare(right));
    const matchesKnownDefect = severe.length === 1
      && contrast?.impact === "serious"
      && JSON.stringify(contrastTargets) === JSON.stringify(frozenTargets);

    test.fail(matchesKnownDefect, "Known seven-node copper-on-light contrast signature; production repair requires later authorization.");
    expect(severe).toEqual([]);
  });

  test("active service controls have measurable target size and valid ARIA", async ({ page }) => {
    test.skip(await usesNaturalLandingFlow(page), "full-motion profile only");

    const activeStory = page.locator('#hizmetler article:not([aria-hidden="true"])');
    await expect(activeStory).toHaveCount(1);
    const links = activeStory.locator("a[href]");
    expect(await links.count()).toBeGreaterThan(0);
    const heights = await links.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(24);
    await expect(page.locator('#hizmetler button[aria-current="step"]')).toHaveCount(1);
  });

  test("industry keyboard selection keeps its named destination visible and focusable", async ({ page }) => {
    test.skip(await usesNaturalLandingFlow(page), "full-motion profile only");

    const section = page.locator("#endustriler");
    const controls = section.getByRole("button", { name: /kartını göster/i });
    const cards = section.locator("a.lf-industry-card");
    await expect(controls).toHaveCount(5);
    await expect(cards).toHaveCount(5);

    for (let index = 0; index < 5; index += 1) {
      await controls.nth(index).focus();
      await expect(controls.nth(index)).toHaveAttribute("aria-current", "step");
      await expect(cards.nth(index)).not.toHaveAttribute("aria-hidden", "true");
      await expect(cards.nth(index)).not.toHaveAttribute("tabindex", "-1");
      await expect(section.locator('a.lf-industry-card[aria-hidden="true"][tabindex="-1"]')).toHaveCount(4);

      const visible = await cards.nth(index).evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight;
      });
      expect(visible).toBe(true);
    }
  });

  test("short desktop keeps representative keyboard targets unobscured", async ({ page }) => {
    const viewport = page.viewportSize();
    test.skip(viewport?.width !== 1440 || viewport.height !== 650, "canonical short-desktop profile");
    const currentPinCount = await page.locator(".pin-spacer").count();

    const targets = [
      [page.locator("[data-menu-trigger]"), "primary menu trigger"],
      [page.locator("#top").getByRole("link", { name: /CAD dosyanı yükle/i }), "hero CTA"],
      [page.locator('[data-process-stage="brief"] a[href]').first(), "process stage destination"],
      [page.locator("#sss button[aria-expanded]").first(), "FAQ control"],
      [page.locator("#iletisim").getByRole("link", { name: /Projeni başlat/i }), "contact CTA"],
    ] as const;

    for (const [target, label] of targets) {
      await target.focus();
      await expect(target).toBeFocused();
      await expectLocatorUnobscured(target, label);
    }

    test.fail(currentPinCount === 2, "Current V7 baseline still creates the two legacy landing pins.");
    expect(currentPinCount).toBe(0);
  });
});

test("reduced motion removes pins, marquee, pixels and hidden reveal states", async ({ page }) => {
  test.skip(!isReducedMotionAuditViewport(page), "V2/V8 reduced-motion audit lanes only");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await gotoAndSettle(page, LEGACY_LANDING_PATH);
  await hydrateLanding(page);
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".lf-marquee > div")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".lf-decision-pixels")).toHaveCount(0);

  const reveals = page.locator("[data-lf-reveal]");
  expect(await reveals.count()).toBeGreaterThan(0);
  expect(await reveals.evaluateAll((nodes) => nodes.filter((node) => getComputedStyle(node).opacity === "0").length)).toBe(0);
  await expect(page.locator("[data-process-stage]")).toHaveCount(5);
  await expect(page.locator("[data-process-proof]")).toHaveCount(5);
});

test("cold navigation exposes the hero and primary action without a page lock", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await gotoAndSettle(page, LEGACY_LANDING_PATH);
  await expect(page.getByRole("heading", { level: 1, name: /MAS Technic/i })).toBeVisible();
  await expect(page.locator("#top").getByRole("link", { name: /CAD dosyanı yükle/i })).toBeVisible();
  await expect(page.locator("html")).not.toHaveCSS("overflow", "hidden");
  expect(runtimeErrors).toEqual([]);
});
