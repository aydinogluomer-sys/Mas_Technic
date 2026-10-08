/* ══════════════════════════════════════════════════════════════════════════
   PUBLIC SITE CONFIG (SEO01)

   The ONE place the public origin and the indexing mode come from. Both are
   build-time values and neither is a secret:

     VITE_SITE_ORIGIN     https origin the site is served from, e.g.
                          `https://www.example.com` — no path, no slash.
     VITE_SITE_INDEXING   `public` → pages may be indexed;
                          anything else / unset → `preview` (noindex).
     VITE_SITE_ENGLISH    `live` → the English surface is published: the
                          language switch, the prerendered /en pages,
                          hreflang pairs and /en in the sitemap. Unset → off,
                          which is `USER_INPUTS.md` §B (ENGLISH_LIVE_NOW: NO).
                          The English code stays in the build either way.

   The origin is never guessed. Without it there is no canonical, no og:url
   and no hreflang — a relative or invented absolute URL would be worse than
   none — and the build is `preview`. A `public` build without a valid origin
   fails in `vite.config.ts` (`mas-site-meta`), so an indexable build always
   states where it lives.
   ══════════════════════════════════════════════════════════════════════════ */

import { normalizeOrigin } from "./site-origin";
import { LIVE_LOCALES } from "@/i18n/locale";

export { normalizeOrigin };

export const SITE_ORIGIN: string | null = normalizeOrigin(import.meta.env.VITE_SITE_ORIGIN);

export const SITE_INDEXING: "public" | "preview" =
  import.meta.env.VITE_SITE_INDEXING === "public" && SITE_ORIGIN ? "public" : "preview";

/** English is published (`VITE_SITE_ENGLISH=live`, or `en` in `VITE_SITE_LOCALES`). */
export const ENGLISH_LIVE: boolean = LIVE_LOCALES.includes("en");
