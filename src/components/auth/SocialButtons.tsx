import { GoogleIcon, LinkedInIcon } from "./SocialIcons";

/* ══════════════════════════════════════════════════════════════════════════
   GOOGLE AND LINKEDIN — RESTYLED, AND DELIBERATELY NOT REMOVED

   Two hairline boxes on the field ground, the same shape as
   `.shell-action--ghost` with room for a brand mark. The marks keep their own
   colours: a Google "G" recoloured to this site's palette is not the Google
   mark, and `SocialIcons.tsx` carries the one sanctioned `no-restricted-syntax`
   exception in this folder for exactly that reason.

   ── WHAT IS KNOWN ABOUT THESE TWO BUTTONS, AND WHAT IS NOT ───────────────
   `Login.tsx` hands them `supabase.auth.signInWithOAuth`. Read statically from
   the installed SDK (`@supabase/auth-js` `GoTrueClient._handleProviderSignIn`,
   line 1854), that call:

     · makes NO network request. It builds
       `{SUPABASE_URL}/auth/v1/authorize?provider=…&redirect_to=…` as a string
       and hands the browser to it with `window.location.assign`;
     · returns `{ data: { provider, url }, error: null }` — `error` is a
       literal `null` on every path.

   The second point is a defect the caller cannot fix from here and the caller
   must not pretend to: an `if (error)` branch after this call is unreachable
   code, so there is no failure these buttons can report. If a provider is not
   enabled on the project, the reader is navigated away to the auth server's
   own error page and this site never learns.

   WHETHER THEY ARE ENABLED IS NOT ESTABLISHED. `supabase/config.toml` carries
   no `[auth]` block at all, so the repository says nothing; the only thing
   that can answer is the project, and asking it is a network call this phase
   does not make. The buttons therefore stay exactly as they were — removing a
   working sign-in path on a guess is the same class of error as leaving a
   broken one, and the guess would be in the more destructive direction. The
   question is written up in `reports/09b1/` for whoever is allowed to ask it.

   `pending` disables BOTH buttons while a redirect is in flight, so a second
   click cannot start a second navigation.
   ══════════════════════════════════════════════════════════════════════════ */

export type SocialButtonsProps = {
  pending: "google" | "linkedin_oidc" | null;
  onSocial: (provider: "google" | "linkedin_oidc") => void;
};

export function SocialButtons({ pending, onSocial }: SocialButtonsProps) {
  return (
    <div className="shell-auth-social">
      <button
        type="button"
        onClick={() => onSocial("google")}
        disabled={!!pending}
        data-pending={pending === "google" || undefined}
      >
        <GoogleIcon aria-hidden="true" focusable="false" />
        <span>{pending === "google" ? "Yönlendiriliyor…" : "Google"}</span>
      </button>
      <button
        type="button"
        onClick={() => onSocial("linkedin_oidc")}
        disabled={!!pending}
        data-pending={pending === "linkedin_oidc" || undefined}
      >
        <LinkedInIcon aria-hidden="true" focusable="false" />
        <span>{pending === "linkedin_oidc" ? "Yönlendiriliyor…" : "LinkedIn"}</span>
      </button>
    </div>
  );
}
