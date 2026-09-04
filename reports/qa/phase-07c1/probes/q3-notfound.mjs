// QA F3 — the six not-found bodies plus the global 404, measured in the DOM.
// Asserts: exactly one <h1>; the h1 is not the generic string; the rail family
// is right; document.title is route-specific; the URL is not swapped for an index.
import { launch, ctx, goto, log } from "./lib.mjs";
import { writeFileSync } from "node:fs";

const ROUTES = [
  { path: "/hizmetler/kategori/qa-yok-boyle-bir-sey", family: "03", label: "HİZMET" },
  { path: "/kabiliyetler/kategori/qa-yok-boyle-bir-sey", family: "04", label: "KABİLİYET" },
  { path: "/endustriyel/kategori/qa-yok-boyle-bir-sey", family: "05", label: "SEKTÖR" },
  { path: "/hizmetler/qa-yok-boyle-bir-sey", family: "03", label: "HİZMET" },
  { path: "/endustriyel/qa-yok-boyle-bir-sey", family: "05", label: "SEKTÖR" },
  { path: "/kabiliyetler/qa-yok-boyle-bir-sey", family: "04", label: "KABİLİYET" },
  { path: "/malzemeler/qa-yok-boyle-bir-sey", family: null, label: null },
  { path: "/qa-bogus-route", family: null, label: null },
];

// Real detail routes, to prove the found branch's titles did not regress.
const REAL = [
  "/hizmetler/cnc-frezeleme",
  "/hizmetler/anodizasyon",
  "/kabiliyetler/seri-imalat",
  "/endustriyel/otomotiv",
  "/malzemeler/aluminyum",
  "/hizmetler/kategori/talasli-imalat",
];

const browser = await launch();
const c = await ctx(browser, { width: 1280, height: 1000 });
const page = await c.newPage();
const out = { notFound: [], real: [] };

for (const r of ROUTES) {
  await goto(page, r.path);
  const d = await page.evaluate(() => ({
    url: location.pathname,
    title: document.title,
    h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()),
    headings: [...document.querySelectorAll("h1,h2,h3")].map((h) => h.tagName + ":" + h.textContent.trim().slice(0, 60)),
    railNos: [...document.querySelectorAll(".tl-band-index > span")].map((e) => e.textContent.trim()),
    railLabels: [...document.querySelectorAll(".tl-band-index > small")].map((e) => e.textContent.trim()),
    heroRail: (() => {
      const hero = document.querySelector(".shell-hero .tl-band-index, .tl-band.shell-hero .tl-band-index");
      return hero ? [...hero.children].map((e) => e.textContent.trim()) : null;
    })(),
    bodyText: document.body.innerText.replace(/\s+/g, " ").slice(0, 400),
  }));
  out.notFound.push({ ...r, ...d });
}

for (const path of REAL) {
  await goto(page, path);
  const d = await page.evaluate(() => ({
    url: location.pathname,
    title: document.title,
    h1: [...document.querySelectorAll("h1")].map((h) => h.textContent.trim()),
  }));
  out.real.push({ path, ...d });
}

await browser.close();
writeFileSync(process.argv[2], JSON.stringify(out, null, 2));

const GENERIC = /^(Sayfa|Yazı) Bulunamadı$/;
let bad = 0;
console.log("=== NOT-FOUND BODIES ===");
for (const r of out.notFound) {
  const problems = [];
  if (r.h1.length !== 1) problems.push(`h1 count = ${r.h1.length}`);
  if (r.h1.some((h) => GENERIC.test(h))) problems.push(`h1 matches /^(Sayfa|Yazı) Bulunamadı$/`);
  if (r.url !== r.path) problems.push(`URL swapped: ${r.path} -> ${r.url}`);
  // RETIRED: an earlier version of this probe asserted the rail NUMBER equalled
  // the family number (03/04/05). That was my own inference from a summary, not
  // from the code: CategoryPage/ServiceDetail pass no="01" for the hero and
  // no="02" for the band, and carry the family in the LABEL. The family label is
  // the thing F3 was about — /endustriyel/<unknown> used to read HİZMET.
  const bandLabels = r.railLabels.filter((l) => l !== "HEADER" && l !== "FOOTER");
  if (r.label && bandLabels.length === 0) problems.push("no band rail label at all");
  if (r.label && bandLabels.some((l) => l !== r.label)) problems.push(`wrong family label: expected all ${r.label}, saw ${JSON.stringify(bandLabels)}`);
  bad += problems.length;
  console.log(`\n${problems.length ? "PROBLEM" : "ok     "} ${r.path}`);
  console.log(`   url   : ${r.url}`);
  console.log(`   title : ${r.title}`);
  console.log(`   h1    : ${JSON.stringify(r.h1)}`);
  console.log(`   rail  : ${JSON.stringify(r.railNos)} / ${JSON.stringify(r.railLabels)}`);
  for (const p of problems) console.log(`   !! ${p}`);
}

const titles = out.notFound.map((r) => r.title);
console.log(`\ndistinct not-found titles: ${new Set(titles).size} of ${titles.length}`);

console.log("\n=== REAL DETAIL ROUTES (found branch) ===");
for (const r of out.real) {
  const generic = /^MAS TECHNIC/.test(r.title) && !r.title.includes("—") && !r.title.includes("|");
  if (generic) bad++;
  console.log(`${generic ? "PROBLEM" : "ok     "} ${r.path}\n   title: ${r.title}\n   h1: ${JSON.stringify(r.h1)}`);
}
log({ problems: bad });
