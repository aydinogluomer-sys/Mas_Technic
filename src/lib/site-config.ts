/* ══════════════════════════════════════════════════════════════════════════
   PUBLIC SITE CONFIG (SEO01)

   The ONE place the public origin and the indexing mode come from. Both are
   build-time values and neither is a secret:

     VITE_SITE_ORIGIN     https origin the site is served from, e.g.
                          `https://www.example.com` — no path, no slash.
     VITE_SITE_INDEXING   `public` → pages may be indexed;
                          anything else / unset → `preview` (noindex).

   The origin is never guessed. Without it there is no canonical, no og:url
   and no hreflang — a relative or invented absolute URL would be worse than
   none — and the build is `preview`. A `public` build without a valid origin
   fails in `vite.config.ts` (`mas-site-meta`), so an indexable build always
   states where it lives.
   ══════════════════════════════════════════════════════════════════════════ */

import { normalizeOrigin } from "./site-origin";

export { normalizeOrigin };

export const SITE_ORIGIN: string | null = normalizeOrigin(import.meta.env.VITE_SITE_ORIGIN);

export const SITE_INDEXING: "public" | "preview" =
  import.meta.env.VITE_SITE_INDEXING === "public" && SITE_ORIGIN ? "public" : "preview";
