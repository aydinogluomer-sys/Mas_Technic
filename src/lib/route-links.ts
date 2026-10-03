import { localeFromPath, localizePath, stripLocale } from "@/i18n/locale";

/** `/en/` → `/en`, `/hizmetler/x/` → `/hizmetler/x`; `/` stays `/`. */
const tidy = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/+$/, "") || "/" : pathname);

/** SEO01 — canonical and the two language alternates for a public path:
    canonical = origin + the localised route, `tr` / `en` = the same record in
    each language. Query and hash never take part. Pure; `usePageMeta` uses it. */
export function routeLinks(pathname: string, origin: string) {
  const path = tidy(pathname);
  const bare = stripLocale(path);
  const locale = localeFromPath(path);
  return {
    canonical: origin + localizePath(bare, locale),
    tr: origin + localizePath(bare, "tr"),
    en: origin + localizePath(bare, "en"),
  };
}
