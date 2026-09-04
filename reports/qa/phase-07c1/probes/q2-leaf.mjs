// QA F1 — leaf-page evidence. For each route, dumps the full visible text and
// scores it against two lists:
//   MUST_BE_GONE  — withheld classes the correction claims to have resolved.
//                   These must be absent from the LEAF page, not only the listing.
//   MUST_SURVIVE  — process specification §0 PRECISION_ENGINEERING asks the pages
//                   to lead with. Over-removal here is a defect too.
import { launch, ctx, goto, log } from "./lib.mjs";
import { writeFileSync } from "node:fs";

const CASES = [
  {
    route: "/kabiliyetler/seri-imalat",
    gone: ["50.000 adet/yıl", "500.000 adet/yıl", "1.000.000 adet/yıl", "adet/yıl"],
    survive: ["±0.01mm", "CT4-CT6", "CT5-CT7"],
  },
  { route: "/endustriyel/robotik", gone: ["100-10K adet/yıl", "adet/yıl"], survive: [] },
  {
    route: "/hizmetler/mekanik-montaj",
    gone: ["1000+ ünite/gün", "ünite/gün"],
    survive: ["M3", "M12", "Nm", "±5%"],
  },
  {
    route: "/hizmetler/anodizasyon",
    gone: ["20+ renk", "20+ Renk"],
    survive: ["ΔE", "60-70 HRC", "MIL-A-8625"],
  },
  { route: "/hizmetler/kimyasal-islemler", gone: [], survive: ["ASTM B117", "saat"] },
  { route: "/malzemeler", gone: ["15+ alüminyum", "+ malzeme ve alaşım"], survive: [] },
];

const browser = await launch();
const c = await ctx(browser, { width: 1280, height: 1200 });
const page = await c.newPage();
const out = [];

for (const cs of CASES) {
  await goto(page, cs.route);
  const info = await page.evaluate(() => ({
    text: document.body.innerText.replace(/\s+/g, " "),
    title: document.title,
    h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()),
    url: location.pathname,
  }));
  out.push({
    route: cs.route,
    url: info.url,
    title: info.title,
    h1: info.h1,
    textLen: info.text.length,
    gone: cs.gone.map((n) => ({ needle: n, present: info.text.includes(n) })),
    survive: cs.survive.map((n) => ({ needle: n, present: info.text.includes(n) })),
  });
}

await browser.close();
writeFileSync(process.argv[2], JSON.stringify(out, null, 2));

let bad = 0;
for (const r of out) {
  console.log(`\n${r.route}  (url=${r.url}, ${r.textLen} chars)`);
  for (const g of r.gone) {
    const ok = !g.present;
    if (!ok) bad++;
    console.log(`  ${ok ? "ok   " : "LEAK "} gone?    "${g.needle}" -> ${g.present ? "PRESENT" : "absent"}`);
  }
  for (const s of r.survive) {
    const ok = s.present;
    if (!ok) bad++;
    console.log(`  ${ok ? "ok   " : "LOST "} survive? "${s.needle}" -> ${s.present ? "present" : "ABSENT"}`);
  }
}
log({ problems: bad });
