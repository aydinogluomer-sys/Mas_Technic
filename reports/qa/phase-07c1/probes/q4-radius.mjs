// QA F5 — fresh, COMPLETE computed-radius census over the six rebuilt routes.
// Not "is the register non-empty" but "does the register list everything".
// Every visible element is read after a full scroll pass; anything with a
// non-zero computed border-radius on any corner is grouped by class signature.
//
// The cursor layers are deliberately included: they are pointer:fine /
// >901px components, which a headless desktop context DOES satisfy, so an
// audit that runs only at 375 would miss them.
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
    // Full scroll pass, so lazily-revealed layers are mounted, then back to top.
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.8);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 120));
    });
    // Move the pointer only when QA_POINTER=1, so the register's claim can be
    // checked BOTH ways: what a golden capture sees (no pointer ever moves) and
    // what a real desktop reader sees (a pointer always has).
    if (process.env.QA_POINTER === "1") {
      await page.mouse.move(Math.round(vp.width / 2), Math.round(vp.height / 2));
      await page.mouse.move(Math.round(vp.width / 2) + 40, Math.round(vp.height / 2) + 40);
      await page.waitForTimeout(250);
    } else {
      await page.waitForTimeout(250);
    }

    const found = await page.evaluate(() => {
      const groups = new Map();
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        const radii = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius];
        if (radii.every((r) => r === "0px" || r === "0%" || r === "")) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        const sig = el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : "");
        const key = sig + " | " + radii.join(",");
        const g = groups.get(key) || { sig, radii: radii.join(","), count: 0, sizes: new Set(), pos: cs.position };
        g.count += 1;
        g.sizes.add(`${Math.round(r.width)}x${Math.round(r.height)}`);
        groups.set(key, g);
      }
      return [...groups.values()].map((g) => ({ ...g, sizes: [...g.sizes].slice(0, 4) }));
    });
    out.push({ viewport: `${vp.width}`, route, groups: found });
  }
  await c.close();
}
await browser.close();
writeFileSync(process.argv[2], JSON.stringify(out, null, 2));

// Distinct radius SOURCES across everything measured.
const sources = new Map();
for (const r of out) {
  for (const g of r.groups) {
    const s = sources.get(g.sig) || { sig: g.sig, radii: g.radii, pos: g.pos, where: new Set(), total: 0, sizes: new Set() };
    s.where.add(`${r.route}@${r.viewport}`);
    s.total += g.count;
    for (const z of g.sizes) s.sizes.add(z);
    sources.set(g.sig, s);
  }
}
console.log(`DISTINCT RADIUS SOURCES: ${sources.size}\n`);
for (const s of [...sources.values()].sort((a, b) => b.total - a.total)) {
  console.log(`  ${s.sig}`);
  console.log(`     radii=${s.radii}  position=${s.pos}  instances=${s.total}  sizes=${[...s.sizes].join(" ")}`);
  console.log(`     seen on ${s.where.size} route/viewport pairs: ${[...s.where].slice(0, 4).join(", ")}${s.where.size > 4 ? " …" : ""}`);
}
log({ distinctSources: sources.size });
