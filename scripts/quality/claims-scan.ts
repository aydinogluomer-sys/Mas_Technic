/**
 * T02 — numeric claim inventory over the public data modules.
 *
 *   npx esbuild scripts/quality/claims-scan.ts --bundle --platform=node --format=esm \
 *     --alias:@=./src --outfile=/tmp/claims-scan.mjs --loader:.webp=empty --loader:.png=empty \
 *     --loader:.jpg=empty --loader:.svg=empty && node /tmp/claims-scan.mjs
 *
 * Writes `docs/quality/mas-technic-awwwards/claims-inventory.json`: every
 * string in a public record that carries a number with a unit, an Ra/RPM/HRC
 * style value, a ratio, a duration, a pressure or a percentage, with its route
 * and field. This is an inventory for the register, not a verdict: a regex
 * cannot tell a company capability from a handbook value, so every row is
 * classified by hand in `claims-register.md`.
 */
import { writeFileSync } from "node:fs";
import { servicePages } from "@/data/servicePages";
import { categoryPages } from "@/data/categoryPages";
import { blogPosts } from "@/data/blogData";
import { caseStudies } from "@/content/caseStudies";

const NUMERIC_CLAIM =
  /(?:Ø\s?\d|±\s?\d|\bRa\s?\d|\b\d[\d.,]*\s?(?:mm|µm|um|nm|m\b|kg|ton|kN|N\b|Nm|bar|PSI|psi|MPa|GPa|HRC|HB|HV|Vickers|°C|°|RPM|rpm|dk|sn|saat|gün|yıl|W\b|kW|kV|IACS|%|x\b|×)|\b\d+:\d+\b|%\s?\d|\b\d{1,3}(?:\.\d{3})+\b|\bCT\s?\d|\bIT\s?\d)/;

interface Row {
  route: string;
  field: string;
  text: string;
  firstPerson: boolean;
  /** Register class — see `classify()`. */
  class?: string;
  /** Publication decision for the register. */
  decision?: string;
}

/* Hand-written rules from the T02 review (claims-register.md). Order matters:
   the first matching rule wins; anything unmatched is `REVIEW`. */
function classify(row: Row): Pick<Row, "class" | "decision"> {
  const { route, field, text } = row;
  if (field.endsWith("readTime")) return { class: "NOT_A_CLAIM", decision: "PUBLISHED" };
  if (/±\s?0[.,]010?\s?mm|±0[.,]01\b/.test(text) && !/±\s?0[.,]0[2-9]/.test(text))
    return { class: "CAPABILITY_VERIFIED", decision: "PUBLISHED — USER_INPUTS.md §D MINIMUM_TOLERANCE (claims.ts)" };
  if (/ISO 9001|ISO 14001/.test(text)) return { class: "CERTIFICATE", decision: "PUBLISHED — validity document pending (O03, BLOCKED_DATA)" };
  if (route.startsWith("/blog/")) return { class: "EDITORIAL_REFERENCE", decision: "PUBLISHED — typical/literature value, reviewed in UX05" };
  if (/\b(?:HB|HRC|MPa)\b/.test(text) && (field.startsWith("materials") || /Tipik|malzemelerimiz|Kalıp malzemesi/.test(text) || field.startsWith("comparisonTables")))
    return { class: "MATERIAL_TYPICAL", decision: "PUBLISHED as typical value — sourcing in T03 (O05)" };
  if (field.startsWith("comparisonTables")) return { class: "GENERAL_REFERENCE", decision: "PUBLISHED with table note: not a company capacity" };
  if (/DFM kurallarımız|Ra\) için genel rehber/.test(text)) return { class: "DESIGN_GUIDANCE", decision: "PUBLISHED as guidance, not a capability" };
  if (/GS1-128/.test(text)) return { class: "NOT_A_CLAIM", decision: "PUBLISHED (symbology name)" };
  return { class: "REVIEW", decision: "UNCLASSIFIED — must be reviewed before release" };
}

const FIRST_PERSON = /(?:yoruz|iyoruz|ıyoruz|uyoruz|üyoruz|imiz|ımız|umuz|ümüz|imizle|ımızla|kapasite|sağlar(?:ız)?|sunuyoruz|mevcuttur)/i;
const rows: Row[] = [];

function visit(route: string, field: string, value: unknown) {
  if (typeof value === "string") {
    if (NUMERIC_CLAIM.test(value)) rows.push({ route, field, text: value, firstPerson: FIRST_PERSON.test(value) });
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => visit(route, `${field}[${index}]`, item));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, inner] of Object.entries(value)) visit(route, field ? `${field}.${key}` : key, inner);
  }
}

for (const page of servicePages) {
  const { slug: _slug, category: _category, heroImage: _hero, ...rest } = page;
  visit(`/${page.category}/${page.slug}`, "", rest);
}
for (const category of categoryPages) visit(`/${category.prefix}/kategori/${category.slug}`, "", category);
for (const post of blogPosts) visit(`/blog/${post.slug}`, "", post);
for (const study of caseStudies) visit(`/kabiliyet-profilleri/${study.slug}`, "", study);

for (const row of rows) Object.assign(row, classify(row));
const byClass: Record<string, number> = {};
for (const row of rows) byClass[row.class!] = (byClass[row.class!] ?? 0) + 1;

const byRoute: Record<string, number> = {};
for (const row of rows) byRoute[row.route] = (byRoute[row.route] ?? 0) + 1;

writeFileSync(
  "docs/quality/mas-technic-awwwards/claims-inventory.json",
  `${JSON.stringify({ generatedAt: new Date().toISOString(), generator: "scripts/quality/claims-scan.ts", total: rows.length, firstPerson: rows.filter((row) => row.firstPerson).length, byClass, byRoute, rows }, null, 2)}\n`,
);
console.log(JSON.stringify({ total: rows.length, firstPerson: rows.filter((row) => row.firstPerson).length, routes: Object.keys(byRoute).length, byClass }));
console.log(Object.entries(byRoute).sort((a, b) => b[1] - a[1]).map(([route, count]) => `${count}\t${route}`).join("\n"));
