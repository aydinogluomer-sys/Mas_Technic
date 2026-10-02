import { useLocation, useNavigate, type NavigateOptions, type To } from "react-router-dom";
import { localeFromPath, localizePath, type PublicLocale } from "./locale";

/* Locale-aware router hooks (L01). Components live in `LocaleLink.tsx`. */

/** The public locale of the current route. */
export function useLocale(): PublicLocale {
  return localeFromPath(useLocation().pathname);
}

export function localizeTo(to: To, locale: PublicLocale): To {
  if (typeof to === "string") return localizePath(to, locale);
  if (to.pathname) return { ...to, pathname: localizePath(to.pathname, locale) };
  return to;
}

/** `to` as a localized string, for `href`s and comparisons. */
export function useLocalizedPath() {
  const locale = useLocale();
  return (to: string) => localizePath(to, locale);
}

export function useLocaleNavigate() {
  const navigate = useNavigate();
  const locale = useLocale();
  return (to: To | number, options?: NavigateOptions) =>
    typeof to === "number" ? navigate(to) : navigate(localizeTo(to, locale), options);
}
