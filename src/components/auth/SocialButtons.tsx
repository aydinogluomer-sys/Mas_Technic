import { useTranslation } from "react-i18next";
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

   The second point means an `if (error)` branch after this call is
   unreachable code, and there is none. It does NOT mean these buttons cannot
   report failure — it means the outbound leg is the wrong place to look.

   ── WHERE THE FAILURE IS NOW REPORTED ────────────────────────────────────
   `./oauth-return.ts`. An OAuth failure comes back on the redirect with
   `error`, `error_code` and `error_description`, the SDK throws them away
   without telling anyone, and until this phase nothing in the app read them.
   `Login.tsx` now reads them on mount and renders a branded `ShellNotice`
   above these two buttons — including through the protected-route bounce that
   erases `location.hash`, which is the path a real failure actually takes.
   The same notice covers the one failure the return leg cannot describe: a
   handoff that never leaves this document at all.

   WHETHER THEY ARE ENABLED IS STILL NOT ESTABLISHED. `supabase/config.toml`
   carries no `[auth]` block at all, so the repository says nothing; the only
   thing that can answer is the project, and asking it is a network call this
   phase does not make. The buttons therefore stay — removing a working
   sign-in path on a guess is the same class of error as leaving a broken one,
   and the guess would be in the more destructive direction. What has changed
   is that a reader who presses one and comes back empty-handed is now told
   so, whichever of the two answers turns out to be true.

   `pending` disables BOTH buttons while a redirect is in flight, so a second
   click cannot start a second navigation.
   ══════════════════════════════════════════════════════════════════════════ */

import type { OAuthProvider } from "./oauth-return";

export type SocialButtonsProps = {
  pending: OAuthProvider | null;
  onSocial: (provider: OAuthProvider) => void;
};

export function SocialButtons({ pending, onSocial }: SocialButtonsProps) {
  const { t } = useTranslation();
  return (
    <div className="shell-auth-social">
      <button
        type="button"
        onClick={() => onSocial("google")}
        disabled={!!pending}
        data-pending={pending === "google" || undefined}
      >
        <GoogleIcon aria-hidden="true" focusable="false" />
        <span>{pending === "google" ? t("Yönlendiriliyor…") : "Google"}</span>
      </button>
      <button
        type="button"
        onClick={() => onSocial("linkedin_oidc")}
        disabled={!!pending}
        data-pending={pending === "linkedin_oidc" || undefined}
      >
        <LinkedInIcon aria-hidden="true" focusable="false" />
        <span>{pending === "linkedin_oidc" ? t("Yönlendiriliyor…") : "LinkedIn"}</span>
      </button>
    </div>
  );
}
