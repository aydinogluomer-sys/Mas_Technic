/**
 * L3 — interface dictionary completeness check for a locale.
 *
 *   npx esbuild scripts/quality/dictionary-check.ts --bundle --platform=node --format=esm \
 *     --alias:@=./src --outfile=/tmp/dictionary-check.mjs && node /tmp/dictionary-check.mjs de
 *
 * The English dictionary (`en` + `en-pages`) is the reference key set: every
 * key a locale's dictionary must translate. For each key the check requires a
 * non-empty string, the same `{{placeholders}}`, the same multiset of numbers
 * as the Turkish source or the English (German writes a decimal comma, so `,`
 * and `.` compare equal), and no letter only Turkish uses. Exit 1 on any gap.
 */
import en from "@/i18n/locales/en";
import de from "@/i18n/locales/de";
import ru from "@/i18n/locales/ru";
import zh from "@/i18n/locales/zh";

const DICTIONARIES: Record<string, Record<string, string>> = { de, ru, zh };

/* Proper names that keep Turkish letters in every language. */
const ALLOW = /(Çiğli|İzmir|Ataşehir|Mas Technic|MAS TECHNIC)/g;
const TR_LETTERS = /[ğĞşŞıİ]/;
/* Deliberate number differences, with the reason. */
const NUMBER_EXCEPTIONS: Record<string, string> = {
  "Akredite 3. taraf CMM (talebe bağlı)": "“3. taraf” is the ordinal of “third party”, not a value: German says “durch Dritte”",
  "Akredite 3. taraf CMM ölçümü, talebe bağlı": "same",
};

const placeholders = (text: string) => (text.match(/\{\{[^}]+\}\}/g) ?? []).sort().join("|");
const numbers = (text: string) => (text.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", ".")).sort().join("|");

const locale = process.argv[2];
const dictionary = DICTIONARIES[locale];
if (!dictionary) throw new Error(`usage: dictionary-check <${Object.keys(DICTIONARIES).join("|")}>`);

const problems: string[] = [];
for (const [key, english] of Object.entries(en)) {
  const value = dictionary[key];
  if (typeof value !== "string" || !value.trim()) { problems.push(`missing    ${key}`); continue; }
  if (placeholders(value) !== placeholders(key)) problems.push(`placeholder ${key} → ${value}`);
  if (!(key in NUMBER_EXCEPTIONS) && numbers(value) !== numbers(key) && numbers(value) !== numbers(english)) {
    problems.push(`numbers    ${key} → ${value}`);
  }
  if (TR_LETTERS.test(value.replace(ALLOW, ""))) problems.push(`turkish    ${key} → ${value}`);
}
const extra = Object.keys(dictionary).filter((key) => !(key in en));
for (const key of extra) problems.push(`extra key  ${key}`);

console.log(`${locale}: ${Object.keys(en).length} reference keys, ${problems.length} problem(s)`);
for (const problem of problems.slice(0, 60)) console.log(`  ${problem}`);
if (problems.length > 60) console.log(`  … ${problems.length - 60} more`);
process.exit(problems.length ? 1 : 0);
