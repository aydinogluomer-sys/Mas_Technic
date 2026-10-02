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

export const PUBLIC_LOCALES = ["tr", "en"] as const;
export type PublicLocale = (typeof PUBLIC_LOCALES)[number];
export const DEFAULT_LOCALE: PublicLocale = "tr";

const EN_PREFIX = /^\/en(?=\/|$|[?#])/;

/** Routes that never take a locale prefix: their structure stays as it is. */
const UNPREFIXED = [/^\/admin(?:\/|$)/, /^\/musteri-paneli(?:\/|$)/];

export const isPanelPath = (pathname: string): boolean => UNPREFIXED.some((pattern) => pattern.test(pathname));

/** `en` for `/en` and `/en/...`, otherwise `tr`. */
export function localeFromPath(pathname: string): PublicLocale {
  return EN_PREFIX.test(pathname) ? "en" : "tr";
}

/** The locale-free path: `/en/sss` → `/sss`, `/en` → `/`. */
export function stripLocale(pathname: string): string {
  if (!EN_PREFIX.test(pathname)) return pathname || "/";
  const rest = pathname.replace(EN_PREFIX, "");
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
  if (locale === "tr") return path + suffix;
  return (path === "/" ? "/en" : `/en${path}`) + suffix;
}

/** The same page in another locale — what the language switch opens. */
export function switchLocalePath(pathname: string, search: string, hash: string, target: PublicLocale): string {
  return localizePath(stripLocale(pathname), target) + search + hash;
}

/** `tr` / `en` from anything stored or detected; DE, RU, ZH and unknowns → `tr`. */
export function normalizeLocale(value: string | null | undefined): PublicLocale {
  const code = (value ?? "").toLowerCase().split("-")[0];
  return code === "en" ? "en" : "tr";
}
