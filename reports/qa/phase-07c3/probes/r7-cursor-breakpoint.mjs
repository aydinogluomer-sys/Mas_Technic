/* QA round 3 — is "below 901 px the component does not mount" true?
 *
 * e2e/visual/overlays.ts leg 1 and docs/lean/17 §4 both give 901 px as the
 * threshold at which CustomCursor returns null. But the component's guard is
 * `isMobile || !finePointer`, useIsMobile is `width < 768`, and there is no
 * 901 anywhere in the component. 901 is the breakpoint of the `cursor: none`
 * rule in src/index.css — a different thing in a different file.
 *
 * So measure the mount, not the comment: four contexts, one route.
 */
import { launch, goto } from "./lib.mjs";

const CONTEXTS = [
  { label: "375  touch  (visual-375 project shape)",  width: 375,  height: 812,  mobile: true },
  { label: "768  touch  (visual-768 project shape)",  width: 768,  height: 1024, mobile: true },
  { label: "768  MOUSE  (a small laptop)",            width: 768,  height: 1024, mobile: false },
  { label: "900  MOUSE  (one px below the CSS rule)", width: 900,  height: 900,  mobile: false },
  { label: "1280 MOUSE  (visual-1280 project shape)", width: 1280, height: 900,  mobile: false },
];

const browser = await launch();
for (const c of CONTEXTS) {
  const ctxt = await browser.newContext({
    viewport: { width: c.width, height: c.height },
    ...(c.mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}),
    reducedMotion: "reduce",
  });
  const page = await ctxt.newPage();
  await goto(page, "/hakkimizda");
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => ({
    cursorLayers: document.querySelectorAll("[data-custom-cursor]").length,
    finePointer: matchMedia("(pointer: fine)").matches,
    cssRuleActive: matchMedia("(min-width: 901px) and (pointer: fine)").matches,
    bodyCursor: getComputedStyle(document.body).cursor,
    linkCursor: (() => { const a = document.querySelector("a"); return a ? getComputedStyle(a).cursor : "n/a"; })(),
  }));
  console.log(
    `${c.label.padEnd(42)} cursorLayers=${String(r.cursorLayers).padEnd(2)} pointer:fine=${String(r.finePointer).padEnd(5)} ` +
    `cssCursorNoneActive=${String(r.cssRuleActive).padEnd(5)} body.cursor=${r.bodyCursor} a.cursor=${r.linkCursor}`,
  );
  await ctxt.close();
}
await browser.close();
