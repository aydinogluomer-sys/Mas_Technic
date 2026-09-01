import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

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

export function ShellRouteError({
  label = "ROTA HATASI",
  title = "Bu sayfa yüklenemedi",
  detail = "Sayfayı yeniden deneyebilir veya ana sayfaya dönebilirsiniz.",
  onRetry,
}: {
  label?: string;
  title?: string;
  detail?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="shell-state shell-state-error" data-shell-state="error" data-full>
      <p className="shell-state-label" role="alert">{label}</p>
      <p className="shell-state-title">{title}</p>
      <p className="shell-state-detail">{detail}</p>
      <div className="shell-state-actions">
        {onRetry && (
          <button type="button" className="shell-state-action" onClick={onRetry}>
            Yeniden dene
          </button>
        )}
        <Link className="shell-state-action" to="/">Ana sayfa</Link>
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
