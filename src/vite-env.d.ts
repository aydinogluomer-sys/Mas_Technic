/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISABLE_LENIS?: string;
  /** Supabase project URL. Required — see src/integrations/supabase/env.ts */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon/publishable key. Required — safe to ship, guarded by RLS. */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SUPABASE_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
