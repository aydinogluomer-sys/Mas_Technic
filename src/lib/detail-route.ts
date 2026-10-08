/**
 * Detail-route contract for `/hizmetler/:slug`, `/kabiliyetler/:slug` and
 * `/endustriyel/:slug` (R01).
 *
 * A detail record lives in exactly one family. The three routes used to look a
 * slug up across ALL families, so `/hizmetler/medikal` rendered the medical
 * sector page under the services URL — two addresses for one page, and the
 * wrong breadcrumb on one of them. Resolution is now family + slug:
 *
 *   - slug exists in the family in the URL      → render it
 *   - slug exists, but in another family        → client redirect (replace) to
 *                                                 the canonical family URL
 *   - slug exists nowhere                       → the existing not-found view
 *
 * The redirect is a React Router `replace`, not an HTTP 301. A host-level
 * redirect is a release-phase task (RELEASE01).
 *
 * A leading locale segment (e.g. `/en`) is parsed and carried through so the
 * same rule keeps the reader's locale once locale prefixes exist (L01).
 */
import { PUBLIC_LOCALES } from "@/i18n/locale";
export const DETAIL_FAMILIES = ["hizmetler", "kabiliyetler", "endustriyel"] as const;
export type DetailFamily = (typeof DETAIL_FAMILIES)[number];

const LOCALE_PREFIXES = PUBLIC_LOCALES.filter((code) => code !== "tr");

export interface DetailPath {
  /** `""` for the default (TR) locale, otherwise e.g. `"/en"`. */
  localePrefix: string;
  family: DetailFamily;
  slug: string;
}

const DETAIL_PATH = new RegExp(
  `^(?:/(${LOCALE_PREFIXES.join("|")}))?/(${DETAIL_FAMILIES.join("|")})/([^/]+)/?$`,
);

/** Parses a detail pathname. Category listings (`/<family>/kategori/<slug>`)
    and anything else return `null`. */
export function parseDetailPath(pathname: string): DetailPath | null {
  const match = DETAIL_PATH.exec(pathname);
  if (!match) return null;
  const [, locale, family, rawSlug] = match;
  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {
    slug = rawSlug;
  }
  if (slug === "kategori") return null;
  return { localePrefix: locale ? `/${locale}` : "", family: family as DetailFamily, slug };
}

export function detailPath(family: DetailFamily, slug: string, localePrefix = ""): string {
  return `${localePrefix}/${family}/${slug}`;
}

export type DetailResolution<T> =
  | { kind: "found"; family: DetailFamily; record: T }
  | { kind: "redirect"; family: DetailFamily; to: string; record: T }
  | { kind: "not-found"; family: DetailFamily };

/**
 * Resolves a detail pathname against the record set. `findBySlug` returns the
 * single record for a slug regardless of family (slugs are unique across the
 * three families; `e2e/detail-route-family.spec.ts` guards that).
 */
export function resolveDetailRoute<T extends { slug: string; category: DetailFamily }>(
  pathname: string,
  findBySlug: (slug: string) => T | undefined,
): DetailResolution<T> {
  const parsed = parseDetailPath(pathname);
  if (!parsed) {
    const family = DETAIL_FAMILIES.find((item) => pathname.includes(`/${item}/`)) ?? "hizmetler";
    return { kind: "not-found", family };
  }
  const record = findBySlug(parsed.slug);
  if (!record) return { kind: "not-found", family: parsed.family };
  if (record.category !== parsed.family) {
    return {
      kind: "redirect",
      family: record.category,
      to: detailPath(record.category, record.slug, parsed.localePrefix),
      record,
    };
  }
  return { kind: "found", family: parsed.family, record };
}
