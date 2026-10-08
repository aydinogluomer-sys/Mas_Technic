import { PUBLIC_LOCALES, localeFromPath, localizePath, stripLocale, type PublicLocale } from "@/i18n/locale";

/** `/en/` → `/en`, `/hizmetler/x/` → `/hizmetler/x`; `/` stays `/`. */
const tidy = (pathname: string) => (pathname.length > 1 ? pathname.replace(/\/+$/, "") || "/" : pathname);

/** SEO01 — canonical and the language alternates for a public path:
    canonical = origin + the localised route, then the same record in each
    routed language (`tr`, `en`, and any live L1 locale). Query and hash never
    take part. Pure; `usePageMeta` uses it. */
export function routeLinks(pathname: string, origin: string) {
  const path = tidy(pathname);
  const bare = stripLocale(path);
  const locale = localeFromPath(path);
  const alternates = Object.fromEntries(PUBLIC_LOCALES.map((code) => [code, origin + localizePath(bare, code)])) as Partial<Record<PublicLocale, string>>;
  return { canonical: origin + localizePath(bare, locale), ...alternates };
}
