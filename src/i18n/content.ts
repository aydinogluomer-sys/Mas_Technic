import { useMemo } from "react";
import type { EnContent } from "@/content/en";
import { useLocale } from "./hooks";
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

let cached: EnContent | null = null;
let pending: Promise<EnContent> | null = null;

export function loadEnContent(): Promise<EnContent> {
  if (cached) return Promise.resolve(cached);
  pending ??= import("@/content/en").then((module) => (cached = module.default));
  return pending;
}

export const isEnContentLoaded = () => cached !== null;

/** The English bundle on an `/en` route, else `null`. On `/en` before the
    bundle has arrived it suspends (throws the load promise), so the caller
    must render inside a Suspense boundary — every lazy route does. */
export function useEnContent(): EnContent | null {
  const english = useLocale() === "en";
  if (!english) return null;
  if (!cached) throw loadEnContent();
  return cached;
}

/** `base` in the active locale: on `/en` the matching English overlay is laid
    over the Turkish record (`mergeText`); on a Turkish route `base` itself. */
export function useLocalized<T>(base: T, pick: (en: EnContent) => TextOverlay<T> | undefined): T {
  const en = useEnContent();
  // `pick` is an inline selector; the bundle and the base decide the result.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (en ? mergeText(base, pick(en)) : base), [en, base]);
}

/** Non-hook form for code that already holds the bundle (lists, matchers). */
export function localized<T>(en: EnContent | null, base: T, pick: (en: EnContent) => TextOverlay<T> | undefined): T {
  return en ? mergeText(base, pick(en)) : base;
}
