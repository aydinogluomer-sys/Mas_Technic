import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { localeFromPath, type PublicLocale } from "@/i18n/locale";
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

export const DEFAULT_TITLE: Record<PublicLocale, string> = {
  tr: "Mas Technic | Yüksek Hassasiyetli CNC Üretim & Talaşlı İmalat",
  en: "Mas Technic | High-Precision CNC Manufacturing & Machining",
};

const OG_LOCALE: Record<PublicLocale, string> = { tr: "tr_TR", en: "en_GB" };
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
  for (const lang of ["tr", "en", "x-default"]) setLink("alternate", null, lang);
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
    setMeta("property", "og:locale", OG_LOCALE[locale]);
    setMeta("property", "og:locale:alternate", OG_LOCALE[locale === "tr" ? "en" : "tr"]);

    const indexable = SITE_INDEXING === "public" && !noindex;
    setMeta("name", "robots", indexable ? INDEX_ROBOTS : NOINDEX_ROBOTS);

    const links = SITE_ORIGIN && !noindex ? routeLinks(pathname, SITE_ORIGIN) : null;
    setLink("canonical", links?.canonical ?? null);
    setMeta("property", "og:url", links?.canonical ?? null);
    setLink("alternate", links?.tr ?? null, "tr");
    setLink("alternate", links?.en ?? null, "en");
    setLink("alternate", links?.tr ?? null, "x-default");
  }, [title, description, noindex, fullTitle, pathname]);
};

export { usePageMeta };
