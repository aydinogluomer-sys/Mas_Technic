import { useEffect, useState } from "react";
import type { EnContent } from "@/content/en";
import { useLocale } from "./hooks";

/* The English content bundle (`src/content/en`) is ONE lazily loaded chunk:
   a Turkish visitor never downloads it, an English visitor downloads it once.

   `useEnContent()` returns `{ ready, en }`:
     · Turkish route → `{ ready: true, en: null }` immediately;
     · English route → `{ ready: false }` until the chunk has arrived, then
       `{ ready: true, en }`. A page renders its loader while `!ready`, so an
       English address never shows a Turkish body. */

let cached: EnContent | null = null;
let pending: Promise<EnContent> | null = null;

export function loadEnContent(): Promise<EnContent> {
  if (cached) return Promise.resolve(cached);
  pending ??= import("@/content/en").then((module) => (cached = module.default));
  return pending;
}

export function useEnContent(): { ready: boolean; en: EnContent | null } {
  const locale = useLocale();
  const [bundle, setBundle] = useState<EnContent | null>(cached);
  useEffect(() => {
    if (locale !== "en" || bundle) return;
    let live = true;
    void loadEnContent().then((loaded) => { if (live) setBundle(loaded); });
    return () => { live = false; };
  }, [locale, bundle]);
  if (locale !== "en") return { ready: true, en: null };
  return bundle ? { ready: true, en: bundle } : { ready: false, en: null };
}
