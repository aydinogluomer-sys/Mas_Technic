import type { ReactNode } from "react";
import { Link } from "@/i18n/LocaleLink";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageShell } from "@/components/shell";
import { AuthAside } from "./AuthAside";

/* ══════════════════════════════════════════════════════════════════════════
   THE FRAME THE THREE AUTH ROUTES SHARE

   The split, the back link, the compact wordmark and the shell props were
   copy-pasted into `Login.tsx`, `ForgotPassword.tsx` and `ResetPassword.tsx`,
   three times, with the panel column's markup drifting between them. They are
   one component now, so a change to the auth frame is one change.

   `navigation={false}` IS A CONTRACT, NOT A PREFERENCE: a credential step
   must not offer a menu and a run of exits mid-task. UX04 (package 7) gives
   these steps the COMPACT footer — brand, direct line, the three legal links,
   copyright — because the legal texts a sign-in refers to must be one click
   away; `e2e/shared-shell-accessibility.spec.ts` asserts header 0 / footer 1. `surface="graphite"` matches `/teklif-al` and every
   other migrated route, so a reader walking between them does not cross a
   ground change mid-journey.

   THE ASIDE IS RENDERED AFTER THE PANEL and placed left by `grid-column` (see
   `shell.css`, "The auth family"). Source order therefore runs form → aside:
   the page's `<h1>` comes before the aside's `<h2>` instead of after it, and
   the tab order reaches the controls before the marketing column.
   ══════════════════════════════════════════════════════════════════════════ */

export type AuthLayoutProps = {
  /** The aside's own heading and standfirst. */
  asideTitle: string;
  asideLede: string;
  /** The one way out of the flow, at the top of the panel. */
  back: { to: string; label: string };
  children: ReactNode;
};

export function AuthLayout({ asideTitle, asideLede, back, children }: AuthLayoutProps) {
  const { t } = useTranslation();
  return (
    <PageShell navigation={false} footer="compact" layout="bands" className="shell-auth" surface="graphite">
      <div className="shell-auth-split">
        <div className="shell-auth-panel">
          <div className="shell-auth-body">
            <Link className="shell-action shell-action--quiet shell-auth-back" to={back.to}>
              <ArrowLeft className="shell-auth-back-mark" aria-hidden="true" />
              <span>{t(back.label)}</span>
            </Link>

            <div className="shell-auth-mark shell-auth-compact-mark">
              <span className="shell-auth-mark-block" aria-hidden="true">MT</span>
              <span className="shell-auth-mark-name">
                <b>MAS TECHNIC</b>
                <small>{t("Müşteri Portalı")}</small>
              </span>
            </div>

            {children}
          </div>
        </div>

        <AuthAside title={asideTitle} lede={asideLede} />
      </div>
    </PageShell>
  );
}
