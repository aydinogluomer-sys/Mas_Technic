/* ══════════════════════════════════════════════════════════════════════════
   PUBLIC LOCALE — THE URL DECIDES (L01)

   Turkish keeps every existing address; English is the same address under
   `/en` with the SAME slugs (`/hizmetler/cnc-frezeleme` ↔
   `/en/hizmetler/cnc-frezeleme`). Slugs are not translated: that would double
   the redirect surface for no reader benefit.

   On a public route the path is the only source of truth for the language — a
   stored preference never overrides it, so a shared link, a crawler and a new
   tab all see the page the URL names. The panel and admin routes keep their
   structure (contract §3); there the remembered preference still applies.

   This module is pure (no React, no i18next) so the router, the meta layer,
   the tests and the route manifest can all share one parser.
   ══════════════════════════════════════════════════════════════════════════ */

/* L1 — one table for every language the site knows. A language is ROUTED
   (has `/xx` addresses) when it is Turkish, English (routed and noindexed
   until `ENGLISH_LIVE`, as before) or listed in `VITE_SITE_LOCALES`. An
   unrouted code behaves exactly as DE / RU / ZH always did: its paths are not
   locale paths and a stored or detected preference for it falls back to
   Turkish. */
export const LOCALE_TABLE = {
  tr: { prefix: "", htmlLang: "tr", ogLocale: "tr_TR", intl: "tr-TR", name: "Türkçe" },
  en: { prefix: "/en", htmlLang: "en", ogLocale: "en_GB", intl: "en-GB", name: "English" },
  de: { prefix: "/de", htmlLang: "de", ogLocale: "de_DE", intl: "de-DE", name: "Deutsch" },
  ru: { prefix: "/ru", htmlLang: "ru", ogLocale: "ru_RU", intl: "ru-RU", name: "Русский" },
  zh: { prefix: "/zh", htmlLang: "zh", ogLocale: "zh_CN", intl: "zh-CN", name: "中文" },
} as const;
export type SiteLocale = keyof typeof LOCALE_TABLE;
export type PublicLocale = SiteLocale;
export const DEFAULT_LOCALE: PublicLocale = "tr";

/* Node (tests, the route manifest) has no `import.meta.env`; there only the
   always-routed Turkish and English exist. */
type LocaleEnv = Partial<Record<"VITE_SITE_LOCALES" | "VITE_SITE_ENGLISH", string>>;
const env: LocaleEnv = (import.meta as ImportMeta & { env?: LocaleEnv }).env ?? {};

/** Languages published to readers and crawlers (Turkish always). */
export const LIVE_LOCALES: readonly PublicLocale[] = parseLiveLocales(env.VITE_SITE_LOCALES, env.VITE_SITE_ENGLISH);

/** Languages that have addresses: the live ones plus English, which is routed as a noindexed preview while unpublished. */
export const PUBLIC_LOCALES: readonly PublicLocale[] = (Object.keys(LOCALE_TABLE) as PublicLocale[])
  .filter((code) => code === "tr" || code === "en" || LIVE_LOCALES.includes(code));

/** `VITE_SITE_LOCALES="en,de"`; the older `VITE_SITE_ENGLISH=live` still publishes English. */
export function parseLiveLocales(list: string | undefined, english: string | undefined): PublicLocale[] {
  const named = (list ?? "").split(",").map((code) => code.trim().toLowerCase());
  if (english === "live") named.push("en");
  return (Object.keys(LOCALE_TABLE) as PublicLocale[]).filter((code) => code === "tr" || named.includes(code));
}

const PREFIXED = PUBLIC_LOCALES.filter((code) => code !== "tr");
const PREFIX = new RegExp(`^\\/(${PREFIXED.join("|")})(?=\\/|$|[?#])`);

/** Routes that never take a locale prefix: their structure stays as it is. */
const UNPREFIXED = [/^\/admin(?:\/|$)/, /^\/musteri-paneli(?:\/|$)/];

export const isPanelPath = (pathname: string): boolean => UNPREFIXED.some((pattern) => pattern.test(pathname));

/** `en` for `/en` and `/en/...` (likewise any routed prefix), otherwise `tr`. */
export function localeFromPath(pathname: string): PublicLocale {
  return (pathname.match(PREFIX)?.[1] as PublicLocale | undefined) ?? "tr";
}

/** The locale-free path: `/en/sss` → `/sss`, `/en` → `/`. */
export function stripLocale(pathname: string): string {
  if (!PREFIX.test(pathname)) return pathname || "/";
  const rest = pathname.replace(PREFIX, "");
  return rest === "" ? "/" : rest.startsWith("/") ? rest : `/${rest}`;
}

/**
 * Prefix an internal destination for a locale. Leaves alone anything that is
 * not an absolute site path (`#anchor`, `mailto:`, `https://`), the panel and
 * admin routes, static files (`/belgeler/x.pdf`) and paths already prefixed.
 */
export function localizePath(to: string, locale: PublicLocale): string {
  if (!to.startsWith("/") || to.startsWith("//")) return to;
  const [, rawPath, suffix] = to.match(/^([^?#]*)(.*)$/) as RegExpMatchArray;
  if (isPanelPath(rawPath)) return to;
  if (/\.[a-z0-9]{2,5}$/i.test(rawPath)) return to;
  const path = stripLocale(rawPath);
  const { prefix } = LOCALE_TABLE[locale];
  if (!prefix) return path + suffix;
  return (path === "/" ? prefix : `${prefix}${path}`) + suffix;
}

/** The same page in another locale — what the language switch opens. */
export function switchLocalePath(pathname: string, search: string, hash: string, target: PublicLocale): string {
  return localizePath(stripLocale(pathname), target) + search + hash;
}

/** A routed locale from anything stored or detected; unrouted codes and unknowns → `tr`. */
export function normalizeLocale(value: string | null | undefined): PublicLocale {
  const code = (value ?? "").toLowerCase().split("-")[0] as PublicLocale;
  return PUBLIC_LOCALES.includes(code) ? code : "tr";
}
