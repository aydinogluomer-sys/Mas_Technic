import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/shell";
import { AuthAside } from "./AuthAside";

/* ══════════════════════════════════════════════════════════════════════════
   THE FRAME THE THREE AUTH ROUTES SHARE

   The split, the back link, the compact wordmark and the shell props were
   copy-pasted into `Login.tsx`, `ForgotPassword.tsx` and `ResetPassword.tsx`,
   three times, with the panel column's markup drifting between them. They are
   one component now, so a change to the auth frame is one change.

   `navigation={false} footer={false}` IS A CONTRACT, NOT A PREFERENCE. A
   credential step must not offer a menu and a run of exits mid-task, and
   `e2e/shared-shell-accessibility.spec.ts:438-440` asserts header 0 / footer 0
   for all three routes. `surface="graphite"` matches `/teklif-al` and every
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
  return (
    <PageShell navigation={false} footer={false} layout="bands" className="shell-auth" surface="graphite">
      <div className="shell-auth-split">
        <div className="shell-auth-panel">
          <div className="shell-auth-body">
            <Link className="shell-action shell-action--quiet shell-auth-back" to={back.to}>
              <ArrowLeft className="shell-auth-back-mark" aria-hidden="true" />
              <span>{back.label}</span>
            </Link>

            <div className="shell-auth-mark shell-auth-compact-mark">
              <span className="shell-auth-mark-block" aria-hidden="true">MT</span>
              <span className="shell-auth-mark-name">
                <b>MAS TECHNIC</b>
                <small>Müşteri Portalı</small>
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
