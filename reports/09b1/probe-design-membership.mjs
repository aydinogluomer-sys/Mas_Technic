/* 09b-1 — DESIGN MEMBERSHIP, measured in the RENDERED DOM.
   ------------------------------------------------------------------------
   Phase 08 measured `/giris` at 92 legacy-teal tokens and `/sifremi-unuttum`
   and `/reset-password` at 0 shell primitives. This re-measures the same four
   quantities on the same three routes so "before" and "after" in this phase
   are the same instrument, not two different ones.

   TEAL is `rgb(10, 125, 138)` — the light-theme value of `--primary`
   (`hsl(186 87% 29%)`, src/index.css:22). Counted as NODES, over every paint
   property a token can reach: colour, background, the four borders, outline,
   fill, stroke and box-shadow.

   RADIX is any element carrying a `data-radix-*` attribute or a
   `[data-state]` + `[data-orientation]` pair, which is how the Radix
   primitives announce themselves in the DOM.

   SHELL PRIMITIVES are elements whose class list contains a `shell-*` token,
   counted inside `<main>` only: the root and the sheet always carry theirs, so
   counting document-wide would report membership a page body has not earned.

   Run behind the abort guard: no request leaves the machine. */
import { writeFileSync } from "node:fs";
import { launch, guard, canary, open, BASE } from "./probe-lib.mjs";

const ROUTES = ["/giris", "/sifremi-unuttum", "/reset-password", "/teklif-al"];
const TEAL = "rgb(10, 125, 138)";
const OUT = process.env.PROBE_OUT ?? "reports/09b1/design-membership-before.json";

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const traffic = await guard(context, []);

const result = { base: BASE, teal: TEAL, routes: {} };

for (const route of ROUTES) {
  const page = await open(context, route);
  await canary(page, (m) => console.log(`${route} ${m}`));

  const measured = await page.evaluate((teal) => {
    const paint = (el) => {
      const s = getComputedStyle(el);
      return [
        s.color, s.backgroundColor,
        s.borderTopColor, s.borderRightColor, s.borderBottomColor, s.borderLeftColor,
        s.outlineColor, s.fill, s.stroke, s.boxShadow,
      ];
    };
    const all = Array.from(document.querySelectorAll("*"));
    const main = document.querySelector("main");
    const mainNodes = main ? Array.from(main.querySelectorAll("*")) : [];

    const tealNodes = all.filter((el) => paint(el).some((v) => v && v.includes(teal)));
    const tealInMain = mainNodes.filter((el) => paint(el).some((v) => v && v.includes(teal)));

    const isRadix = (el) =>
      Array.from(el.attributes).some((a) => a.name.startsWith("data-radix"))
      || (el.hasAttribute("data-state") && el.hasAttribute("data-orientation"));
    const radix = all.filter(isRadix);

    const shellIn = (nodes) =>
      nodes.filter((el) =>
        Array.from(el.classList).some((c) => c.startsWith("shell-")));

    const sampleTeal = tealNodes.slice(0, 12).map((el) => ({
      tag: el.tagName.toLowerCase(),
      cls: el.className && el.className.baseVal !== undefined
        ? el.className.baseVal
        : String(el.className ?? "").slice(0, 90),
      text: (el.textContent ?? "").trim().slice(0, 40),
    }));

    /* Anything painted from a literal hex/rgb in a style attribute. */
    const inlineColour = all.filter((el) => {
      const s = el.getAttribute("style") ?? "";
      return /#[0-9a-f]{3,8}\b|rgba?\(/i.test(s);
    }).map((el) => el.getAttribute("style").slice(0, 120));

    /* Every stacking context the page creates. */
    const zNodes = all
      .map((el) => ({ el, z: getComputedStyle(el).zIndex }))
      .filter(({ z }) => z && z !== "auto")
      .map(({ el, z }) => ({
        z,
        tag: el.tagName.toLowerCase(),
        cls: String(el.className && el.className.baseVal !== undefined
          ? el.className.baseVal : el.className ?? "").slice(0, 70),
      }));

    return {
      nodesTotal: all.length,
      nodesInMain: mainNodes.length,
      teal: tealNodes.length,
      tealInMain: tealInMain.length,
      sampleTeal,
      radix: radix.length,
      shellPrimitivesInMain: shellIn(mainNodes).length,
      shellPrimitiveClassesInMain: [...new Set(shellIn(mainNodes)
        .flatMap((el) => Array.from(el.classList).filter((c) => c.startsWith("shell-"))))].sort(),
      inlineColour,
      zNodes,
      h1: Array.from(document.querySelectorAll("h1")).map((h) => h.textContent.trim()),
      mainText: (document.querySelector("main")?.innerText ?? "").replace(/\s+/g, " ").trim(),
    };
  }, TEAL);

  result.routes[route] = measured;
  await page.close();
  console.log(`${route}  teal=${measured.teal} (main ${measured.tealInMain})  radix=${measured.radix}  shell=${measured.shellPrimitivesInMain}`);
}

result.blockedRequests = [...new Set(traffic.blocked)].sort();
result.allowedRequests = [...new Set(traffic.allowed)].sort();
writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log(`\nblocked non-loopback requests: ${result.blockedRequests.length}`);
console.log(`allowed  non-loopback requests: ${result.allowedRequests.length}`);
console.log(`wrote ${OUT}`);

await context.close();
await browser.close();
