import { useMemo } from "react";
import type { EnContent } from "@/content/en";
import { useLocale } from "./hooks";
import type { PublicLocale } from "./locale";
import { mergeText, type TextOverlay } from "./localize";

/* The English content bundle (`src/content/en`) is ONE lazily loaded chunk:
   a Turkish visitor never downloads it, an English visitor downloads it once
   — and, since PERF01, only on a page that reads records.

   It used to be awaited by the route language gate for EVERY `/en` page,
   which put 72 KiB gzip on `/en` although the landing, the header and the
   footer read no record (measured with `capture-requests.mjs`). Now a page
   that needs it SUSPENDS on it: `useEnContent()` throws the load promise
   while the bundle is missing, the route's Suspense boundary keeps its
   loader up, and the page renders once with English text. An English
   address still never shows a Turkish body, not even for a frame. */

/* L1 — one bundle per language, each its own lazy chunk, all the same shape
   (the English one is the reference). A language without a bundle yet reads
   the Turkish records, exactly as Turkish does. */
type LocaleContent = EnContent;
const BUNDLES: Partial<Record<PublicLocale, () => Promise<{ default: LocaleContent }>>> = {
  en: () => import("@/content/en"),
  de: () => import("@/content/de"),
};
const cached = new Map<PublicLocale, LocaleContent>();
const pending = new Map<PublicLocale, Promise<LocaleContent | null>>();

export function loadLocaleContent(locale: PublicLocale): Promise<LocaleContent | null> {
  const load = BUNDLES[locale];
  if (!load) return Promise.resolve(null);
  const ready = cached.get(locale);
  if (ready) return Promise.resolve(ready);
  if (!pending.has(locale)) {
    pending.set(locale, load().then(({ default: bundle }) => {
      cached.set(locale, bundle);
      return bundle;
    }));
  }
  return pending.get(locale) as Promise<LocaleContent | null>;
}

/** The active language's bundle, or `null` on a Turkish route (or a language
    without one). Before the bundle has arrived it suspends (throws the load
    promise), so the caller must render inside a Suspense boundary — every
    lazy route does. */
export function useLocaleContent(): LocaleContent | null {
  const locale = useLocale();
  if (!BUNDLES[locale]) return null;
  const bundle = cached.get(locale);
  if (!bundle) throw loadLocaleContent(locale);
  return bundle;
}

/** `base` in the active locale: on `/en` the matching English overlay is laid
    over the Turkish record (`mergeText`); on a Turkish route `base` itself. */
export function useLocalized<T>(base: T, pick: (en: EnContent) => TextOverlay<T> | undefined): T {
  const en = useLocaleContent();
  // `pick` is an inline selector; the bundle and the base decide the result.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (en ? mergeText(base, pick(en)) : base), [en, base]);
}

/** Non-hook form for code that already holds the bundle (lists, matchers). */
export function localized<T>(en: EnContent | null, base: T, pick: (en: EnContent) => TextOverlay<T> | undefined): T {
  return en ? mergeText(base, pick(en)) : base;
}
