/* QA round 3 — F5-R. An INDEPENDENT radius census over the six rebuilt routes.
 *
 * The question is not "is the register non-empty" and not "is it bigger than
 * last time"; it is "is it COMPLETE". So this probe:
 *   - runs at 375 AND 1280, because CustomCursor returns null below 901 px and
 *     a 375-only census finds four sources and thinks it is finished — the
 *     trap that produced the two previous wrong versions of the register;
 *   - applies exactly the register's stated exclusions (display:none,
 *     visibility:hidden, opacity:0) AND records what those exclusions cost, so
 *     the criteria cannot quietly shrink the answer;
 *   - reads shadow roots and, separately, records whether each radius is an
 *     INLINE style or a stylesheet one, since an inline `borderRadius: "50%"`
 *     is invisible to any `rounded-` grep;
 *   - never moves the pointer, and re-checks with QA_POINTER=1.
 */
import { launch, ctx, goto, log } from "./lib.mjs";
import { writeFileSync } from "node:fs";

const ROUTES = [
  "/hakkimizda",
  "/iletisim",
  "/malzemeler",
  "/hizmetler/kategori/talasli-imalat",
  "/hizmetler/cnc-frezeleme",
  "/endustriyel/otomotiv",
];
const VIEWPORTS = [
  { width: 375, height: 812, mobile: true },
  { width: 1280, height: 900, mobile: false },
];

const browser = await launch();
const out = [];

for (const vp of VIEWPORTS) {
  const c = await ctx(browser, { ...vp, reduce: true });
  const page = await c.newPage();
  for (const route of ROUTES) {
    await goto(page, route);
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.8);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 70));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 150));
    });
    if (process.env.QA_POINTER === "1") {
      await page.mouse.move(Math.round(vp.width / 2), Math.round(vp.height / 2));
      await page.mouse.move(Math.round(vp.width / 2) + 40, Math.round(vp.height / 2) + 40);
      await page.waitForTimeout(300);
    } else {
      await page.waitForTimeout(300);
    }

    const found = await page.evaluate(() => {
      /** every element, including inside open shadow roots */
      const all = [];
      const dig = (root) => {
        for (const el of root.querySelectorAll("*")) {
          all.push(el);
          if (el.shadowRoot) dig(el.shadowRoot);
        }
      };
      dig(document);
      const rows = [];
      for (const el of all) {
        const cs = getComputedStyle(el);
        const radii = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius];
        if (radii.every((r) => r === "0px" || r === "0%" || r === "")) continue;
        const r = el.getBoundingClientRect();
        const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).join(".") : "";
        rows.push({
          sig: el.tagName.toLowerCase() + (cls ? "." + cls : ""),
          radii: radii.join(","),
          size: `${Math.round(r.width)}x${Math.round(r.height)}`,
          rect: `${Math.round(r.x)},${Math.round(r.y)}`,
          position: cs.position,
          opacity: cs.opacity,
          display: cs.display,
          visibility: cs.visibility,
          zeroBox: r.width === 0 && r.height === 0,
          inlineRadius: /border-radius|borderRadius/i.test(el.getAttribute("style") ?? ""),
          cursorAttr: el.hasAttribute("data-custom-cursor") || !!el.closest?.("[data-custom-cursor]"),
          launcherAttr: el.hasAttribute("data-chat-launcher") || !!el.closest?.("[data-chat-launcher]"),
        });
      }
      return rows;
    });
    out.push({ viewport: String(vp.width), route, rows: found });
  }
  await c.close();
}
await browser.close();
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));

/* ── analysis ──────────────────────────────────────────────────────────── */
const REGISTER_EXCLUDES = (r) => r.display === "none" || r.visibility === "hidden" || r.opacity === "0" || r.zeroBox;

const kept = [], dropped = [];
for (const o of out) for (const r of o.rows) (REGISTER_EXCLUDES(r) ? dropped : kept).push({ ...r, route: o.route, viewport: o.viewport });

const group = (list, keyFn) => {
  const m = new Map();
  for (const r of list) {
    const k = keyFn(r);
    const g = m.get(k) ?? { key: k, count: 0, sizes: new Set(), radii: new Set(), where: new Set(), inline: false, cursor: false, launcher: false, positions: new Set() };
    g.count++; g.sizes.add(r.size); g.radii.add(r.radii); g.where.add(`${r.route}@${r.viewport}`);
    g.positions.add(r.position);
    g.inline ||= r.inlineRadius; g.cursor ||= r.cursorAttr; g.launcher ||= r.launcherAttr;
    m.set(k, g);
  }
  return [...m.values()];
};

const bySig = group(kept, (r) => r.sig);
const bySigSize = group(kept, (r) => `${r.sig} @ ${r.size}`);
const at375 = group(kept.filter((r) => r.viewport === "375"), (r) => r.sig);
const at1280 = group(kept.filter((r) => r.viewport === "1280"), (r) => r.sig);

console.log(`ROUTES=${ROUTES.length}  VIEWPORTS=375,1280  POINTER_MOVED=${process.env.QA_POINTER === "1"}`);
console.log(`elements with a non-zero computed radius: kept ${kept.length}, excluded by the register's own criteria ${dropped.length}`);
console.log(`DISTINCT (class) signatures: ${bySig.length}`);
console.log(`DISTINCT (class, size) signatures: ${bySigSize.length}`);
console.log(`  at 375 only: ${at375.length} class signatures   |   at 1280 only: ${at1280.length}`);
console.log("");
for (const g of bySig.sort((a, b) => b.count - a.count)) {
  console.log(`  ${g.key}`);
  console.log(`     radii=${[...g.radii].join(" | ")}  position=${[...g.positions].join(",")}  instances=${g.count}  inlineRadius=${g.inline}  cursorLayer=${g.cursor}  launcher=${g.launcher}`);
  console.log(`     sizes=${[...g.sizes].join(" ")}`);
  console.log(`     seen on ${g.where.size}: ${[...g.where].join(", ")}`);
}
if (dropped.length) {
  console.log("\nEXCLUDED BY THE REGISTER'S CRITERIA (these are what the census does not report):");
  for (const g of group(dropped, (r) => r.sig).sort((a, b) => b.count - a.count)) {
    console.log(`  ${g.key}  x${g.count}  radii=${[...g.radii].join("|")}  sizes=${[...g.sizes].join(" ")}  where=${[...g.where].slice(0, 6).join(", ")}`);
  }
}
log({ distinctClassSignatures: bySig.length, distinctClassSizeSignatures: bySigSize.length, at375: at375.length, at1280: at1280.length, excluded: dropped.length });
