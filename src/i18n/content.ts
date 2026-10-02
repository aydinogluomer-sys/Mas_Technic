import { useMemo } from "react";
import type { EnContent } from "@/content/en";
import { useLocale } from "./hooks";
import { mergeText, type TextOverlay } from "./localize";

/* The English content bundle (`src/content/en`) is ONE lazily loaded chunk:
   a Turkish visitor never downloads it, an English visitor downloads it once.

   The route language gate (`applyLanguage("en")` in `./index`) awaits
   `loadEnContent()` before an `/en` page renders, so by the time a page asks
   for its text the bundle is already here and `useLocalized()` can merge
   synchronously: an English address never shows a Turkish body, not even for
   a frame. */

let cached: EnContent | null = null;
let pending: Promise<EnContent> | null = null;

export function loadEnContent(): Promise<EnContent> {
  if (cached) return Promise.resolve(cached);
  pending ??= import("@/content/en").then((module) => (cached = module.default));
  return pending;
}

export const isEnContentLoaded = () => cached !== null;

/** The English bundle on an `/en` route (loaded by the gate), else `null`. */
export function useEnContent(): EnContent | null {
  return useLocale() === "en" ? cached : null;
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
