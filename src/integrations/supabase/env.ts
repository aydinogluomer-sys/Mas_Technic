/**
 * Client-visible Supabase configuration, resolved from the environment.
 *
 * Both values are publishable by design: the anon key ships inside every
 * client bundle and access is governed by RLS. They live in `.env` rather
 * than in source so that swapping projects is a configuration change, not a
 * code change — and so a public repository carries no project-specific keys.
 *
 * Missing configuration fails loudly here instead of surfacing later as an
 * opaque `undefined/rest/v1/...` request.
 */
const required = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env and fill in the Supabase values ` +
        "(dashboard → Project Settings → API).",
    );
  }
  return value;
};

export const SUPABASE_URL = required("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL);

export const SUPABASE_PUBLISHABLE_KEY = required(
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
