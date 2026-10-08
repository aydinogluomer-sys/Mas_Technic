import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LIVE_LOCALES, LOCALE_TABLE, localeFromPath, type PublicLocale } from "@/i18n/locale";
import { routeLinks } from "@/lib/route-links";
import { SITE_INDEXING, SITE_ORIGIN } from "@/lib/site-config";

/* ══════════════════════════════════════════════════════════════════════════
   ROUTE METADATA (SEO01)

   Every public page calls `usePageMeta` with its OWN title and description
   (from the route's content, in the route's language). The hook then writes,
   for the address actually shown — after a redirect too, because the router
   path is a dependency:

     <title>, meta description, og:title/description, twitter:title/description,
     og:locale (+ alternate), robots,
     and — only when `VITE_SITE_ORIGIN` is configured and the page is
     indexable — canonical, og:url and hreflang tr / en / x-default (tr).

   Canonical = origin + the localised route (`/en/...` for English, the bare
   path for Turkish), without query or hash. `noindex: true` (not-found,
   sign-in family) drops canonical and hreflang and writes `noindex`; a
   `preview` build writes `noindex` everywhere (`src/lib/site-config.ts`).
   ══════════════════════════════════════════════════════════════════════════ */

interface PageMetaOptions {
  title: string;
  description?: string;
  /** Not-found and sign-in pages: never indexed, no canonical or hreflang. */
  noindex?: boolean;
  /** Use `title` as the whole document title (the home page). */
  fullTitle?: boolean;
}

const TITLES: Partial<Record<PublicLocale, string>> = {
  tr: "Mas Technic | Yüksek Hassasiyetli CNC Üretim & Talaşlı İmalat",
  en: "Mas Technic | High-Precision CNC Manufacturing & Machining",
  de: "Mas Technic | Hochpräzise CNC-Fertigung & Zerspanung",
  ru: "Mas Technic | Высокоточное производство и механообработка с ЧПУ",
};
/** The home title; a language without its own yet reads the English one. */
export const defaultTitle = (locale: PublicLocale): string => TITLES[locale] ?? (TITLES.en as string);
const INDEX_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const NOINDEX_ROBOTS = "noindex, nofollow";

function setMeta(attribute: "name" | "property", key: string, content: string | null) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (content === null) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setLink(rel: string, href: string | null, hreflang?: string) {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (href === null) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    if (hreflang) element.hreflang = hreflang;
    document.head.appendChild(element);
  }
  element.href = href;
}

/** Panel / admin routes: no canonical, no hreflang, never indexed. */
export function applyPrivateRouteMeta() {
  setMeta("name", "robots", NOINDEX_ROBOTS);
  setLink("canonical", null);
  setMeta("property", "og:url", null);
  for (const lang of [...Object.keys(LOCALE_TABLE), "x-default"]) setLink("alternate", null, lang);
}

/** One `og:locale:alternate` per other live language (one element while there is one, as before). */
function setLocaleAlternates(locales: string[]) {
  const existing = document.head.querySelectorAll('meta[property="og:locale:alternate"]');
  if (locales.length <= 1) {
    /* Extras from a page with more alternates go; the first is updated in
       place, so a two-language build's head keeps its order. */
    existing.forEach((element, index) => { if (index > 0) element.remove(); });
    setMeta("property", "og:locale:alternate", locales[0] ?? null);
    return;
  }
  existing.forEach((element) => element.remove());
  for (const locale of locales) {
    const element = document.createElement("meta");
    element.setAttribute("property", "og:locale:alternate");
    element.setAttribute("content", locale);
    document.head.appendChild(element);
  }
}

const usePageMeta = ({ title, description, noindex = false, fullTitle = false }: PageMetaOptions) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const locale = localeFromPath(pathname);
    const documentTitle = fullTitle ? title : `${title} | Mas Technic`;
    document.title = documentTitle;

    setMeta("name", "description", description ?? null);
    setMeta("property", "og:title", documentTitle);
    setMeta("property", "og:description", description ?? null);
    setMeta("name", "twitter:title", documentTitle);
    setMeta("name", "twitter:description", description ?? null);
    /* C3 — while a language is unpublished its pages are never indexed and no
       page advertises a language pair that does not ship. */
    const unpublished = !LIVE_LOCALES.includes(locale);
    setMeta("property", "og:locale", LOCALE_TABLE[locale].ogLocale);
    setLocaleAlternates(unpublished ? [] : LIVE_LOCALES.filter((code) => code !== locale).map((code) => LOCALE_TABLE[code].ogLocale));
    const indexable = SITE_INDEXING === "public" && !noindex && !unpublished;
    setMeta("name", "robots", indexable ? INDEX_ROBOTS : NOINDEX_ROBOTS);

    const links = SITE_ORIGIN && !noindex && !unpublished ? routeLinks(pathname, SITE_ORIGIN) : null;
    const pairs = LIVE_LOCALES.length > 1 ? links : null;
    setLink("canonical", links?.canonical ?? null);
    setMeta("property", "og:url", links?.canonical ?? null);
    for (const code of Object.keys(LOCALE_TABLE) as PublicLocale[]) {
      setLink("alternate", pairs && LIVE_LOCALES.includes(code) ? pairs[code] ?? null : null, code);
    }
    setLink("alternate", pairs?.tr ?? null, "x-default");
  }, [title, description, noindex, fullTitle, pathname]);
};

export { usePageMeta };
