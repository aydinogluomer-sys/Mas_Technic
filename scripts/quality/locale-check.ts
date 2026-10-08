/**
 * L01/L3 — content overlay completeness and number check for one language.
 *
 *   npx esbuild scripts/quality/locale-check.ts --bundle --platform=node --format=esm \
 *     --alias:@=./src --outfile=/tmp/locale-check.mjs --loader:.webp=empty --loader:.png=empty \
 *     --loader:.jpg=empty --loader:.svg=empty && node /tmp/locale-check.mjs [en|de] [section…]
 *
 * The language defaults to `en`; naming sections (`services`, `categories`, …)
 * checks only those, for a bundle that is translated section by section.
 * For every Turkish record that has an overlay: every reader-facing string must
 * have a counterpart at the same path, arrays must keep their length, the
 * multiset of numbers must be identical (a translation never changes a value
 * or adds one; German writes a decimal comma, so `,` and `.` compare equal),
 * and no Turkish-only letter may survive.
 */
import en from "@/content/en";
import de from "@/content/de";
import type { EnContent } from "@/content/en";
import { servicePages } from "@/data/servicePages";
import { categoryPages } from "@/data/categoryPages";
import { materialCategories, materialsData } from "@/data/materialsData";
import { blogPosts } from "@/data/blogData";
import { caseStudies } from "@/content/caseStudies";
import { staticEntries } from "@/data/chatFaqData";

/* Keys that are identifiers, not reader text. */
const SKIP = new Set(["slug", "category", "prefix", "path", "id", "image", "heroImage", "href", "date", "featured",
  "key", "code", "subcategoryKey", "relatedCategories", "kind", "subcategory", "gradeTemper", "productForm", "source",
  "density", "tensileStrength", "hardness", "maxTemperature", "thermalConductivity", "machinability",
  "corrosionResistance", "priceCategory", "isPopular", "highlight", "keywords", "permission", "verdict"]);
/* Per language: the bundle, words that legitimately keep Turkish letters, and
   the letters that must not survive (German has its own ö and ü). */
const LOCALES: Record<string, { bundle: EnContent; allow: RegExp; letters: RegExp; dropped?: Record<string, string[]> }> = {
  en: { bundle: en, allow: /(Çiğli|İzmir|Ataşehir|Mas Technic|MAS TECHNIC|ü?retim|Gıda)/g, letters: /[ğĞşŞıİçÇöÖüÜ]/ },
  de: {
    bundle: de, allow: /(Çiğli|İzmir|Ataşehir|Mas Technic|MAS TECHNIC)/g, letters: /[ğĞşŞıİçÇ]/,
    /* Numbers a record may drop, with the reason: “3. taraf” is the ordinal
       of “third party”, not a value; German says “durch Dritte”. */
    dropped: { "services:kalite-kontrol": ["3", "3"] },
  },
};
const [locale = "en", ...sections] = process.argv.slice(2);
const target = LOCALES[locale];
if (!target) throw new Error(`usage: locale-check [${Object.keys(LOCALES).join("|")}] [section…]`);
const { bundle, allow: ALLOW, letters: TR_LETTERS, dropped = {} } = target;
const SECTIONS = ["services", "categories", "families", "materials", "blog", "cases", "chat"];
const unknown = sections.filter((name) => !SECTIONS.includes(name));
if (unknown.length) throw new Error(`unknown section(s): ${unknown.join(", ")} — expected ${SECTIONS.join(", ")}`);

type Problem = { record: string; path: string; issue: string };
const problems: Problem[] = [];
const nums = (s: string) => (s.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", "."));

function walk(record: string, tr: unknown, ov: unknown, path: string, trNums: string[], enNums: string[]) {
  if (typeof tr === "string") {
    if (typeof ov !== "string") { problems.push({ record, path, issue: `missing ${locale} string` }); return; }
    trNums.push(...nums(tr)); enNums.push(...nums(ov));
    if (TR_LETTERS.test(ov.replace(ALLOW, ""))) problems.push({ record, path, issue: `Turkish letters: ${ov.slice(0, 80)}` });
    return;
  }
  if (Array.isArray(tr)) {
    if (!Array.isArray(ov)) { problems.push({ record, path, issue: "missing array" }); return; }
    if (ov.length !== tr.length) problems.push({ record, path, issue: `length ${ov.length} ≠ ${tr.length}` });
    tr.forEach((item, i) => walk(record, item, ov[i], `${path}[${i}]`, trNums, enNums));
    return;
  }
  if (tr && typeof tr === "object") {
    for (const [k, v] of Object.entries(tr)) {
      if (SKIP.has(k) || v === null || typeof v === "number" || typeof v === "boolean") continue;
      walk(record, v, (ov as Record<string, unknown> | undefined)?.[k], path ? `${path}.${k}` : k, trNums, enNums);
    }
  }
}

function check(name: string, records: { key: string; tr: unknown }[], overlays: Record<string, unknown>) {
  if (sections.length && !sections.includes(name)) return;
  let covered = 0;
  for (const { key, tr } of records) {
    const ov = overlays[key];
    if (!ov) { problems.push({ record: `${name}:${key}`, path: "", issue: "no overlay" }); continue; }
    covered++;
    const t: string[] = []; const e: string[] = [];
    walk(`${name}:${key}`, tr, ov, "", t, e);
    for (const n of dropped[`${name}:${key}`] ?? []) {
      const at = t.indexOf(n);
      if (at < 0) problems.push({ record: `${name}:${key}`, path: "", issue: `stale number exception: no ${n} left to drop` });
      else t.splice(at, 1);
    }
    const a = [...t].sort().join(" "), b = [...e].sort().join(" ");
    if (a !== b) {
      const missing = t.filter((n) => { const i = e.indexOf(n); if (i >= 0) { e.splice(i, 1); return false; } return true; });
      problems.push({ record: `${name}:${key}`, path: "", issue: `numbers differ — only in TR: [${missing.join(", ")}] only in ${locale.toUpperCase()}: [${e.join(", ")}]` });
    }
  }
  console.log(`${name}: ${covered}/${records.length} overlays`);
}

check("services", servicePages.map((p) => ({ key: p.slug, tr: p })), bundle.services);
check("categories", categoryPages.map((c) => ({ key: `${c.prefix}/${c.slug}`, tr: c })), bundle.categories);
check("families", materialCategories.map((f) => ({ key: f.slug, tr: f })), bundle.families);
check("materials", materialsData.map((m) => ({ key: m.id, tr: { name: m.name, propertyConditions: m.propertyConditions, description: m.description, applications: m.applications, advantages: m.advantages, limitations: m.limitations } })), bundle.materials);
check("blog", blogPosts.map((p) => ({ key: p.slug, tr: p })), bundle.blog);
check("cases", caseStudies.map((c) => ({ key: c.slug, tr: c })), bundle.cases);
check("chat", staticEntries.map((c, i) => ({ key: String(i), tr: { question: c.question, answer: c.answer } })), bundle.chat);

for (const p of problems) console.log(`✗ ${p.record} ${p.path} — ${p.issue}`);
console.log(problems.length ? `${problems.length} problem(s)` : "OK — overlays complete, numbers identical");
process.exitCode = problems.length ? 1 : 0;
