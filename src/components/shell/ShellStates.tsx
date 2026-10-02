import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "@/i18n/LocaleLink";

/* ══════════════════════════════════════════════════════════════════════════
   LOADING · EMPTY · ROUTE ERROR

   Three states the site used to leave to whatever library happened to be
   nearest: a bare `<div class="w-8 h-8 border-2 border-primary animate-spin">`
   for every route, nothing at all for an empty list, and a white
   `ErrorBoundary` card for a route crash. None of them belonged to the design
   language and none of them told the reader anything.

   The grammar here is the site's own: a hairline frame, a mono status line,
   and — for loading — a datum sweep along a rule. Measurement, not a spinner.
   Under `prefers-reduced-motion` the sweep stops and the rule simply sits
   there; the status text carries the whole message, so nothing is lost.
   ══════════════════════════════════════════════════════════════════════════ */

export function ShellLoading({
  label = "YÜKLENİYOR",
  detail,
  fullHeight = true,
}: {
  label?: string;
  detail?: string;
  fullHeight?: boolean;
}) {
  return (
    <div className="shell-state shell-state-loading" data-shell-state="loading" data-full={fullHeight || undefined}>
      <p className="shell-state-label" role="status">{label}</p>
      <span className="shell-state-scan" aria-hidden="true"><i /></span>
      {detail && <p className="shell-state-detail">{detail}</p>}
    </div>
  );
}

export function ShellEmpty({
  label = "KAYIT YOK",
  title,
  detail,
  action,
}: {
  label?: string;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="shell-state shell-state-empty" data-shell-state="empty">
      <p className="shell-state-label">{label}</p>
      <p className="shell-state-title">{title}</p>
      {detail && <p className="shell-state-detail">{detail}</p>}
      {action && <div className="shell-state-actions">{action}</div>}
    </div>
  );
}

/**
 * THE GENERAL / 500-CLASS ERROR STATE (Phase 08).
 *
 * `ShellEmpty` above renders its title as a `<p>` because it is a FRAGMENT: it
 * appears inside a page that has already published an `<h1>` from
 * `ShellPageHero`. Phase 07's correction F3 established that split, after an
 * earlier version used `ShellEmpty` as a whole not-found BODY and so shipped
 * three routes with no `<h1>` at all.
 *
 * This one is the opposite case, and it had the same defect. `ShellRouteBoundary`
 * renders it INSTEAD OF the entire routed body, so while it is on screen it is
 * the only content the document has — and a document whose only content is a
 * `<p>` has no `<h1>`. The title is an `<h1>` now. `role="alert"` stays on the
 * status label, so the failure is announced rather than merely drawn.
 *
 * `reason` is the shell's own mono status readout. An exception message or a
 * stack trace is deliberately NOT offered to the reader; `componentDidCatch`
 * below logs those to the console, which is where they belong.
 */
export function ShellRouteError({
  label = "ROTA HATASI",
  title = "Bu sayfa yüklenemedi",
  detail = "Sayfa çizilirken beklenmeyen bir hata oluştu. Yeniden deneyebilir, ana sayfaya dönebilir veya bize bildirebilirsiniz.",
  reason = "ERR::ROUTE_RENDER_FAILED",
  onRetry,
}: {
  label?: string;
  title?: string;
  detail?: string;
  /** Mono status readout, e.g. `ERR::ROUTE_RENDER_FAILED`. */
  reason?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="shell-state shell-state-error" data-shell-state="error" data-full>
      <p className="shell-state-label" role="alert">{label}</p>
      <h1 className="shell-state-title">{title}</h1>
      <p className="shell-state-detail">{detail}</p>
      {reason && <p className="shell-state-reason">{reason}</p>}
      <div className="shell-state-actions">
        {onRetry && (
          <button type="button" className="shell-state-action" onClick={onRetry}>
            Yeniden dene
          </button>
        )}
        <Link className="shell-state-action" to="/">Ana sayfa</Link>
        <Link className="shell-state-action" to="/iletisim">İletişim</Link>
      </div>
    </div>
  );
}

/* ── Route error boundary ─────────────────────────────────────────────────
   Scoped to the routed subtree so one page's crash cannot take the header,
   the footer or the navigation down with it. Reset is keyed on the route by
   the caller (`resetKey`), so leaving a broken page is enough to recover —
   the reader never has to reload. */
type BoundaryProps = { children: ReactNode; resetKey: string };
type BoundaryState = { error: Error | null };

export class ShellRouteBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidUpdate(previous: BoundaryProps) {
    if (previous.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[shell] route render failed", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return <ShellRouteError onRetry={() => this.setState({ error: null })} />;
    }
    return this.props.children;
  }
}
