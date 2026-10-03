/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISABLE_LENIS?: string;
  /** Supabase project URL. Required — see src/integrations/supabase/env.ts */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon/publishable key. Required — safe to ship, guarded by RLS. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_PROJECT_ID?: string;
  /** Public https origin, no path (SEO01) — see src/lib/site-config.ts. */
  readonly VITE_SITE_ORIGIN?: string;
  /** `public` to allow indexing; anything else builds a noindex preview. */
  readonly VITE_SITE_INDEXING?: string;
  /** `live` publishes the English surface (switch, /en pages, hreflang). */
  readonly VITE_SITE_ENGLISH?: string;
  /** `on` enables multi-attachment RFQ (model + PDF). Off until the backend contract lands (RFQ01/O06). */
  readonly VITE_RFQ_ATTACHMENTS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
