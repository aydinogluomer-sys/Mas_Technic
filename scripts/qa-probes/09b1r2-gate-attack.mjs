/* QA 09b-1 R2 — THE TYPOGRAPHY GATE, ATTACKED FROM BOTH SIDES
   ==========================================================================
   `09b1r2-gate-scope.mjs` reproduced the gate's own figures exactly (256
   components / 1730 observations / 0 splits at 1280) and established that
   1973 bare text observations in 136 (component > bare child) buckets are
   outside its census entirely. This probe turns that into demonstrations.

     FN-1  A bare child of a design-system component OTHER than `.shell-field`
           is pushed off the system on one route. The gate stays GREEN. This
           is the historical defect's exact shape, relocated by one component.
     FN-2  CONTROL for FN-1: the same mutation applied to the CLASSED parent
           makes the gate RED. So FN-1's green is the key rule, not a mutation
           that failed to apply.
     FN-3  A split introduced inside the fullscreen menu is invisible: 34
           `tl-menu-*` keys exist only while the menu is open and the gate
           never opens it.
     FP-1  The design system ALREADY ships three positional typography rules
           (`:first-child`). All three target unclassed elements, which is the
           only reason the gate is silent. Give those elements a class - the
           most ordinary refactor there is - and the gate reports a SPLIT on
           deliberate, shipped design. Demonstrated on all three.

   NETWORK: guard() at allowHosts=[], canary first. Read-only.
   ========================================================================== */
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";
import { guard, canary, chromiumExecutable } from "./probe-lib.mjs";
import { preview, URL_BASE, CENSUS_SRC, splits } from "./09b1r2-lib.mjs";

const OUT = "reports/qa/phase-09b1r2";
mkdirSync(OUT, { recursive: true });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const results = [];
const record = (id, claim, pass, detail) => {
  results.push({ id, claim, pass, detail });
  log(`${pass ? "CONFIRMED" : "NOT CONFIRMED"}  ${id}  ${claim}`);
  if (detail) log(`    ${detail}`);
  log("");
};

async function arriveAt(page, route) {
  await page.goto(`${URL_BASE}${route}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#root", { state: "visible", timeout: 20_000 });
  const deadline = Date.now() + 20_000;
  let boot = await page.locator(".shell-boot").count();
  while (boot !== 0 && Date.now() < deadline) { await page.waitForTimeout(200); boot = await page.locator(".shell-boot").count(); }
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  const rail = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--tl-rail").trim());
  if (boot !== 0) throw new Error(`${route} never left its route loading state`);
  if (rail === "") throw new Error(`${route} rendered without the stylesheet applied`);
}

const census = async (page, route) =>
  (await page.evaluate(new Function(`return (${CENSUS_SRC})()`))).map((r) => ({ route, ...r }));

const run = async () => {
  const stop = await preview();
  const browser = await chromium.launch(chromiumExecutable() ? { executablePath: chromiumExecutable() } : {});
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    await guard(ctx, []);
    const page = await ctx.newPage();
    await page.goto(`${URL_BASE}/`, { waitUntil: "domcontentloaded" });
    await canary(page, log);
    log("");

    /* ── FN-1 / FN-2 ──────────────────────────────────────────────────────
       `header.shell-title-block > h2` renders on six routes and has NO class
       of its own, so `keyOf` returns null for it and it is censused only if
       it happens to live inside `.shell-field`, which it does not. */
    await arriveAt(page, "/hakkimizda");
    const healthyAbout = await census(page, "/hakkimizda");
    log(`baseline: /hakkimizda census = ${healthyAbout.length} observations, ${new Set(healthyAbout.map((r) => r.key)).size} keys, ${splits(healthyAbout).length} splits`);
    await arriveAt(page, "/iletisim");
    const anchored = await page.locator("header.shell-title-block > h2").count();

    /* the bare child, pushed off the system on ONE route only */
    await page.addStyleTag({ content: `header.shell-title-block > h2 { font-size: 11px !important; font-weight: 300 !important; letter-spacing: 4px !important; text-transform: lowercase !important; }` });
    await page.waitForTimeout(200);
    const changed = await page.evaluate(() => {
      const el = document.querySelector("header.shell-title-block > h2");
      if (!el) return null;
      const s = getComputedStyle(el);
      return `${s.fontSize} / ${s.fontWeight} / ${s.letterSpacing} / ${s.textTransform}`;
    });
    const brokenBare = [...await census(page, "/iletisim"), ...healthyAbout];
    const fn1 = splits(brokenBare);
    record(
      "FN-1",
      "a bare child of a component other than `.shell-field`, pushed off the system on one route, is INVISIBLE to the gate",
      fn1.length === 0,
      `anchor \`header.shell-title-block > h2\` matched ${anchored} element(s); after the mutation it computes ${changed}; the gate reports ${fn1.length} split(s): ${JSON.stringify(fn1)}`,
    );

    /* CONTROL for FN-1. Same route, same push, same magnitude — the only
       difference is that the element CARRIES a design-system class. The key
       is chosen from the data rather than guessed: any key present on both
       /iletisim and /hakkimizda with one treatment today. */
    await arriveAt(page, "/iletisim");
    const healthyContact = await census(page, "/iletisim");
    const onBoth = [...new Set(healthyContact.map((r) => r.key))]
      .filter((k) => healthyAbout.some((r) => r.key === k))
      .filter((k) => !k.startsWith(".shell-field"));
    const fn2key = onBoth.find((k) => k.startsWith("header.shell-title-block")) ?? onBoth[0];
    const fn2n = await page.evaluate((key) => {
      const [tag, ...cls] = key.split(".");
      const sel = tag + cls.map((c) => `.${CSS.escape(c)}`).join("");
      const els = Array.from(document.querySelectorAll(sel));
      for (const el of els) {
        el.style.setProperty("font-size", "11px", "important");
        el.style.setProperty("font-weight", "300", "important");
        el.style.setProperty("letter-spacing", "4px", "important");
        el.style.setProperty("text-transform", "lowercase", "important");
      }
      return els.length;
    }, fn2key);
    await page.waitForTimeout(200);
    const brokenClassed = [...await census(page, "/iletisim"), ...healthyAbout];
    const fn2 = splits(brokenClassed);
    record(
      "FN-2",
      "CONTROL: the identical push applied to a CLASSED element makes the gate RED, so FN-1's green is the key rule and not a failed mutation",
      fn2.length > 0,
      `key \`${fn2key}\` (present on both routes), ${fn2n} element(s) mutated; ${fn2.length} split(s); first: ${(fn2[0] ?? "-").slice(0, 220)}`,
    );

    /* ── FN-3 — the menu ────────────────────────────────────────────────── */
    await arriveAt(page, "/");
    /* A stylesheet rule cannot reach these until they exist, so the split is
       injected by a MutationObserver that pushes every second
       `a.tl-menu-route-link` off the system the moment the menu mounts it.
       Inline `!important`, so nothing about CSS specificity is being tested. */
    await page.evaluate(() => {
      const push = () => {
        const els = Array.from(document.querySelectorAll("a.tl-menu-route-link"));
        els.forEach((el, i) => {
          if (i % 2 === 1) {
            el.style.setProperty("font-size", "27px", "important");
            el.style.setProperty("letter-spacing", "9px", "important");
          }
        });
      };
      new MutationObserver(push).observe(document.body, { childList: true, subtree: true });
      push();
    });
    const closedSplits = splits(await census(page, "/"));
    const trigger = page.locator("button.tl-menu-trigger").first();
    let openSplits = [];
    let openCount = 0;
    if (await trigger.count()) {
      await trigger.click();
      await page.waitForTimeout(1400);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const open = await census(page, "/");
      openCount = open.filter((r) => r.key === "a.tl-menu-route-link").length;
      openSplits = splits(open);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }
    record(
      "FN-3",
      "a split inside the fullscreen menu is invisible to the gate, which never opens it",
      closedSplits.length === 0 && openSplits.some((s) => s.startsWith("a.tl-menu-route-link")),
      `menu closed (what the gate sees): ${closedSplits.length} split(s). menu open: ${openSplits.length} split(s) over ${openCount} \`a.tl-menu-route-link\` observations; ` +
        `first: ${(openSplits.find((s) => s.startsWith("a.tl-menu-route-link")) ?? "-").slice(0, 200)}`,
    );

    /* ── FP-1 — the three positional rules the design system ships ───────── */
    const FP = [
      { route: "/hakkimizda", parent: ".shell-prose[data-lead]", child: "p", cls: "shell-prose-para", rule: ".shell-prose[data-lead]>p:first-child { font-size: clamp(18px,1.6vw,23px) }" },
      { route: "/sss", parent: ".shell-contents a", child: "span", cls: "shell-contents-part", rule: ".shell-contents a>span:first-child { font: 500 10px/1.6 var(--tl-font-mono) }" },
      { route: "/blog", parent: ".shell-lead-sections a", child: "span", cls: "shell-lead-part", rule: ".shell-lead-sections a>span:first-child { font: 500 10px/1.6 var(--tl-font-mono) }" },
    ];
    for (const fp of FP) {
      await arriveAt(page, fp.route);
      const before = splits(await census(page, fp.route));
      const n = await page.evaluate(({ parent, child, cls }) => {
        const els = Array.from(document.querySelectorAll(`${parent} > ${child}`));
        for (const el of els) el.classList.add(cls);
        return els.length;
      }, fp);
      const after = splits(await census(page, fp.route));
      const fired = after.filter((s) => s.includes(fp.cls));
      record(
        `FP-1 ${fp.route}`,
        `giving a class to the elements the SHIPPED rule \`${fp.rule}\` deliberately varies makes the gate call intentional design a violation`,
        before.length === 0 && fired.length > 0 && n > 1,
        `${n} element(s) classed \`${fp.cls}\`; before: ${before.length} split(s); after: ${after.length} split(s); ` +
          `${(fired[0] ?? "-").slice(0, 260)}`,
      );
    }

    writeFileSync(`${OUT}/gate-attack.json`, JSON.stringify(results, null, 1));
    log(`RESULT: ${results.filter((r) => r.pass).length}/${results.length} demonstrations confirmed`);
  } finally {
    await browser.close();
    await stop();
    writeFileSync(`${OUT}/gate-attack.txt`, lines.join("\n") + "\n");
  }
};

run().catch((e) => {
  lines.push(`PROBE ERROR: ${e && e.stack}`);
  writeFileSync(`${OUT}/gate-attack.txt`, lines.join("\n") + "\n");
  console.error(e);
  process.exit(1);
});
