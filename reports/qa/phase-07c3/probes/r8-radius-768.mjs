/* QA round 3 — the band docs/lean/17 §4 and e2e/visual/overlays.ts both say
 * cannot exist. The register promises to list "anything a mounted component
 * paints, at every width where it mounts", and excludes 768 on the stated
 * ground that CustomCursor "returns null below 901 px". Census the six routes
 * at 768 in BOTH context shapes, so the claim is settled by measurement. */
import { launch, goto } from "./lib.mjs";
import { writeFileSync } from "node:fs";

const ROUTES = ["/hakkimizda", "/iletisim", "/malzemeler", "/hizmetler/kategori/talasli-imalat", "/hizmetler/cnc-frezeleme", "/endustriyel/otomotiv"];
const SHAPES = [
  { label: "768 touch (visual-768 project shape)", mobile: true },
  { label: "768 mouse (fine pointer)", mobile: false },
];
const browser = await launch();
const out = [];
for (const s of SHAPES) {
  const c = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    ...(s.mobile ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}),
    reducedMotion: "reduce",
  });
  const page = await c.newPage();
  const sigs = new Map();
  for (const route of ROUTES) {
    await goto(page, route);
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.8);
      for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)); }
      window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 150));
    });
    const rows = await page.evaluate(() => {
      const res = [];
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        const rad = [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius];
        if (rad.every((r) => r === "0px" || r === "0%" || r === "")) continue;
        if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).join(".") : "";
        res.push({ sig: el.tagName.toLowerCase() + (cls ? "." + cls : ""), size: `${Math.round(r.width)}x${Math.round(r.height)}`, rect: `${Math.round(r.x)},${Math.round(r.y)}`, cursor: !!el.closest("[data-custom-cursor]") });
      }
      return res;
    });
    for (const r of rows) {
      const k = `${r.sig} @ ${r.size}`;
      const g = sigs.get(k) ?? { key: k, n: 0, rects: new Set(), cursor: r.cursor, routes: new Set() };
      g.n++; g.rects.add(r.rect); g.routes.add(route); sigs.set(k, g);
    }
  }
  const list = [...sigs.values()].map((g) => ({ ...g, rects: [...g.rects].slice(0, 3), routes: [...g.routes].length }));
  out.push({ shape: s.label, signatures: list.length, cursorSignatures: list.filter((g) => g.cursor).length, list });
  console.log(`\n${s.label}: ${list.length} distinct (class,size) signatures, ${list.filter((g) => g.cursor).length} of them cursor layers`);
  for (const g of list) console.log(`   ${g.cursor ? "CURSOR " : "       "}${g.key.slice(0, 70).padEnd(72)} x${String(g.n).padEnd(3)} routes=${g.routes} rect=${g.rects.join(" ")}`);
  await c.close();
}
await browser.close();
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
