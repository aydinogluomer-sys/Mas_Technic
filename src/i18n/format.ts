import { LOCALE_TABLE, type SiteLocale } from "./locale";

/* The reader's language from an i18next code ("de", "en-GB" …); Turkish for anything unknown. */
const base = (language: string | undefined): SiteLocale => {
  const code = (language ?? "tr").slice(0, 2);
  return code in LOCALE_TABLE ? (code as SiteLocale) : "tr";
};

const AND: Record<SiteLocale, string> = { tr: "ve", en: "and", de: "und", ru: "и", zh: "和" };

/* "A, B ve C" / "A, B and C" / "A, B und C" — a prose list in the reader's language. */
export function joinList(parts: readonly string[], language: string | undefined): string {
  if (parts.length < 2) return parts.join("");
  const locale = base(language);
  /* Chinese: the enumeration comma and no spaces — "A、B和C". */
  if (locale === "zh") return `${parts.slice(0, -1).join("、")}${AND.zh}${parts[parts.length - 1]}`;
  return `${parts.slice(0, -1).join(", ")} ${AND[locale]} ${parts[parts.length - 1]}`;
}

const TURKISH_MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const ENGLISH_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* The corpus stores display dates in Turkish ("15 Ocak 2024"). On an English
   route the month name is swapped and the day and year stay as written; other
   languages write the whole date their own way ("15. Januar 2024"). */
export function localDate(date: string, language: string | undefined): string {
  const locale = base(language);
  if (locale === "tr") return date;
  if (locale === "en") return date.replace(/\p{L}+/u, (month) => ENGLISH_MONTHS[TURKISH_MONTHS.indexOf(month)] ?? month);
  const parts = date.match(/^(\d{1,2}) (\p{L}+) (\d{4})$/u);
  const month = parts ? TURKISH_MONTHS.indexOf(parts[2]) : -1;
  if (!parts || month < 0) return date;
  return new Intl.DateTimeFormat(LOCALE_TABLE[locale].intl, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(Date.UTC(Number(parts[3]), month, Number(parts[1])));
}

/* Decimal figures (`2.70 g/cm³`, `2.65–2.83`) are authored with the point,
   which is also the site's convention in Turkish and English (one separator
   per page). Languages that write a decimal comma get it here. */
const DECIMAL_COMMA = new Set<SiteLocale>(["de", "ru"]);
export function localDecimals(text: string, language: string | undefined): string {
  return DECIMAL_COMMA.has(base(language)) ? text.replace(/(\d)\.(\d)/g, "$1,$2") : text;
}

/* The inline `{ tr, en, de, ru }` pairs (pilot modules, schema captions, category
   matrix, journal modules): the reader's language where a pair carries it,
   Turkish otherwise. */
export type PairLocale = "tr" | "en" | "de" | "ru";
export function pairLocale(language: string | undefined): PairLocale {
  const locale = base(language);
  return locale === "en" || locale === "de" || locale === "ru" ? locale : "tr";
}
