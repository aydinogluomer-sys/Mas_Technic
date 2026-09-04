// QA F1 — rendered evidence. Walks all 15 category routes and records every
// `.shell-index-row`'s title and its `.shell-index-meta` chips, from the DOM
// of the built bundle. Run twice (QA_BASE=4190 after, 4191 pre-correction).
//
// The first band (`02 Bu başlık altında`) is the one entryMeta() feeds; the
// sibling band (`03 AİLE`) is compact and carries no meta. Both are captured
// so a chip appearing anywhere is seen.
import { launch, ctx, goto, log } from "./lib.mjs";
import { writeFileSync } from "node:fs";

const ROUTES = [
  "/hizmetler/kategori/talasli-imalat",
  "/hizmetler/kategori/on-uretim",
  "/hizmetler/kategori/yuzey-islemleri",
  "/hizmetler/kategori/isaretleme-tanimlama",
  "/hizmetler/kategori/montaj-birlestirme",
  "/kabiliyetler/kategori/uretim-altyapisi",
  "/kabiliyetler/kategori/kalite-standartlar",
  "/kabiliyetler/kategori/muhendislik-destegi",
  "/kabiliyetler/kategori/prototipten-seri-uretime",
  "/kabiliyetler/kategori/surec-operasyon",
  "/endustriyel/kategori/yuksek-teknoloji",
  "/endustriyel/kategori/seri-uretim-endustriyel",
  "/endustriyel/kategori/endustriyel-sistemler",
  "/endustriyel/kategori/uretim-cozumleri",
  "/endustriyel/kategori/enerji-altyapi",
];

const out = [];
const browser = await launch();
const c = await ctx(browser, { width: 1280, height: 900 });
const page = await c.newPage();

for (const route of ROUTES) {
  await goto(page, route);
  const data = await page.evaluate(() => {
    const lists = [...document.querySelectorAll("ol.shell-index")];
    return lists.map((ol) => ({
      compact: ol.getAttribute("data-compact") === "true",
      ariaLabel: ol.getAttribute("aria-label"),
      rows: [...ol.querySelectorAll("a.shell-index-row")].map((a) => ({
        href: a.getAttribute("href"),
        title: a.querySelector(".shell-index-title")?.textContent?.trim() ?? "",
        chips: [...a.querySelectorAll(".shell-index-meta > span")].map((s) => s.textContent.trim()),
      })),
    }));
  });
  out.push({ route, lists: data });
}

await browser.close();
writeFileSync(process.argv[2], JSON.stringify(out, null, 2));

const primary = out.flatMap((r) => r.lists.filter((l) => !l.compact).flatMap((l) => l.rows));
const anyChip = out.flatMap((r) => r.lists.flatMap((l) => l.rows)).filter((x) => x.chips.length);
log({
  routes: out.length,
  primaryRows: primary.length,
  rowsWithChips: primary.filter((r) => r.chips.length > 0).length,
  rowsWithoutChips: primary.filter((r) => r.chips.length === 0).length,
  totalChips: anyChip.reduce((n, r) => n + r.chips.length, 0),
});
