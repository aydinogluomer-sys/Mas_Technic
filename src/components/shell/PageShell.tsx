import { useRef, type ReactNode, type RefObject } from "react";
import { Header } from "@/components/Header";
import { SiteFooter } from "./SiteFooter";
import { railLabel } from "./rail-labels";
import { useScrollableRegionAccess } from "./useScrollableRegionAccess";
import "@/styles/shell.css";
import "@/styles/polish.css";

/* ══════════════════════════════════════════════════════════════════════════
   THE GLOBAL PUBLIC PAGE SHELL

   One frame for every public route: sheet, rail, master columns, navigation,
   footer, surface and top rhythm. A page supplies its BODY and nothing else.

   WHAT IT REPLACES
   ----------------
   `reports/baseline/shell-inventory.md` counted three mutually incompatible
   public shells plus one route with no shell at all:

     A  `/` — the technical sheet: `.tl-sheet`, a 64px rail, 12 master
        columns, its own footer.
     B  every inner page — `<div class="min-h-screen bg-background">` +
        `<main class="pt-24 pb-16">` + `container-industrial`, ending in the
        1398px mega footer. No sheet, no rail, no master columns, and after
        Phase 03 reserved the fixed bar in flow, `pt-24` became a second,
        duplicate 96px offset on top of `.tl-header-spacer`.
     C  `404` and the auth routes — no header, no footer, a third palette.
     —  `/teklif-al` — imported `Footer` and never rendered it.

   All four now come through here.

   THE TOP RHYTHM, SETTLED IN ONE PLACE
   ------------------------------------
   The fixed bar is reserved exactly once, by `.tl-header-spacer` inside
   `#shared-header-host` (`src/components/Header.tsx`). Pages therefore must
   NOT add their own top padding; `--shell-page-top` below is the shell's
   single editorial breathing space above the first band, and it is the only
   place that value exists.

   SURFACES
   --------
   `graphite` is the field — the landing's ground. `paper` is the evidence
   ground and the default for inner pages, because their bodies are still
   written against the light theme tokens; flipping them to graphite in Phase
   04 would invert dozens of `text-muted-foreground` / `bg-card` pairs and
   manufacture contrast failures in bodies that Phases 07–08 own. The surface
   is a token switch, so those phases change one prop, not a stylesheet.
   ══════════════════════════════════════════════════════════════════════════ */

export type PageShellProps = {
  children: ReactNode;
  /** `paper` (inner pages, default) or `graphite` (the landing's field). */
  surface?: "paper" | "graphite";
  /**
   * `band` gives `<main>` the master grid (rail + `--tl-cols` columns) and
   * drops every direct child into the content field, so a page body that
   * knows nothing about the grid still lands on it.
   * `bands` means the page composes its own `ShellBand`s and `<main>` stays a
   * plain block — the landing.
   */
  layout?: "band" | "bands";
  /** Mount the global navigation. `false` only for surfaces that must not
   *  offer a way out mid-task (the auth flow). */
  navigation?: boolean;
  /** Mount the site footer. */
  footer?: boolean;
  /** Rail index + caption for `layout="band"`. */
  rail?: { no: string; label: string };
  className?: string;
  rootRef?: RefObject<HTMLDivElement>;
  testId?: string;
  /** `data-*` attributes for `<main>`. Used by surfaces whose contracts are
   *  written against the main element itself (the dev-only legacy landing). */
  mainData?: Record<string, string>;
};

export function PageShell({
  children,
  surface = "paper",
  layout = "band",
  navigation = true,
  footer = true,
  rail,
  className = "",
  rootRef,
  testId,
  mainData,
}: PageShellProps) {
  /* The shell spends a rail column, so the field it hands a page body is
     narrower than the body was written against and boxes that used to fit can
     overflow. Every scrollable region inside the sheet therefore gets a focus
     stop and a name — see `useScrollableRegionAccess.ts`. */
  const sheetRef = useRef<HTMLDivElement>(null);
  useScrollableRegionAccess(sheetRef);

  return (
    <div
      ref={rootRef}
      className={`shell-root ${className}`.trim()}
      data-shell-surface={surface}
      data-testid={testId}
    >
      {navigation && <Header />}
      <div ref={sheetRef} className="tl-sheet shell-sheet">
        <main id="main-content" className="shell-main" data-shell-layout={layout} {...mainData}>
          {layout === "band" && (
            <div className="shell-rail" aria-hidden="true">
              <span>{rail?.no ?? "02"}</span>
              <small>{railLabel(rail?.label ?? "PAGE")}</small>
            </div>
          )}
          {children}
        </main>
        {footer && <SiteFooter />}
      </div>
    </div>
  );
}
