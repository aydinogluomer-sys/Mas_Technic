import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { FileQuestion, HelpCircle, Home, Search } from "lucide-react";
import { PageShell } from "@/components/shell/PageShell";
import { ShellMetaRow } from "@/components/shell/ShellPrimitives";

/* ══════════════════════════════════════════════════════════════════════════
   404 — A ROUTE-ERROR SHELL STATE, NOT A THIRD VISUAL LANGUAGE

   WHAT THIS PAGE USED TO BE (`reports/baseline/shell-inventory.md` §4/§5)
     · no header and no footer — a dead end with four hand-picked links;
     · its own light/teal canvas: six animated `hsla(190..210, 80%, 45%)`
       ribbons with a 30px glow shadow, plus a grid overlay, scanlines and a
       vignette, all `position:fixed` over the whole viewport;
     · its own brand mark, duplicating the header's;
     · a 15-second countdown that then set `window.location.href = "/"`.

   WHAT CHANGED HERE, AND WHY IT BELONGS TO THIS PHASE
     · The page renders inside `PageShell`, so it has the site's navigation,
       grid, rail, typography and footer. That is acceptance criterion 4: no
       public page needs the old shell to function.
     · The fixed full-viewport canvas and its three overlay layers are gone.
       They are `position:fixed`, so inside a shell they would paint over the
       header and the footer; and a glowing teal ribbon field is the
       "glow/neon" and "decorative gradient" `mas-design-language` rules out.
     · THE AUTO-REDIRECT IS GONE. An unannounced timer that rewrites
       `window.location` after 15 seconds is a route-behaviour defect, not a
       feature: it discards the reader's history position, cannot be paused,
       extended or turned off (WCAG 2.2.1), and it makes the wrong URL
       unshareable and undebuggable. The status readout stays; the hijack does
       not.

   CONTENT IS NOT THIS PHASE'S. The wording, the four suggested destinations
   and the search affordance belong to Phase 08 (requirement IDs 680–687);
   every string below is the one that was already here.
   ══════════════════════════════════════════════════════════════════════════ */

const SUGGESTED = [
  { label: "Ana Sayfa", to: "/", icon: Home },
  { label: "Hizmetlerimiz", to: "/#hizmetler", icon: Search },
  { label: "Teklif Al", to: "/teklif-al", icon: FileQuestion },
  { label: "SSS", to: "/sss", icon: HelpCircle },
];

/**
 * `shell={false}` is for the PANEL branch only (`src/App.tsx` `panelRoutes`).
 * `/admin*` and `/musteri-paneli` are out of this run's scope per
 * `USER_INPUTS.md` §N and carry their own chrome; dropping the public
 * navigation and the site footer onto an admin 404 would be this phase
 * reaching into that shell. The body is identical either way, so both error
 * pages still say the same thing in the same language.
 */
export const NotFound = ({ shell = true }: { shell?: boolean }) => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  const body = (
      <div className="shell-notfound">
        <p className="shell-eyebrow">ERR::PAGE_NOT_FOUND</p>
        <p className="shell-notfound-code" aria-hidden="true">404</p>
        <h1 className="shell-notfound-title">
          Aradığınız sayfa <em>bulunamadı</em>
        </h1>
        <p className="shell-lede">Bu koordinatlarda işlenecek parça yok.</p>

        <ShellMetaRow
          className="shell-notfound-meta"
          items={[
            { label: "DURUM", value: "404" },
            { label: "İSTENEN YOL", value: location.pathname },
            { label: "YÖNLENDİRME", value: "YOK" },
          ]}
        />

        <nav className="shell-notfound-links" aria-label="Önerilen sayfalar">
          {SUGGESTED.map((link) => (
            <Link key={link.to} to={link.to}>
              <link.icon size={16} aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
  );

  if (!shell) return <div className="shell-root shell-notfound-bare" data-shell-surface="paper">{body}</div>;
  return <PageShell rail={{ no: "404", label: "HATA" }}>{body}</PageShell>;
};
