import { useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { ROUTE_TRANSITION } from "@/config/motion-system";
import { Z } from "@/styles/z-index";

/* ══════════════════════════════════════════════════════════════════════════
   THE ROUTE TRANSITION

   A measured curtain: five panels close from the top, hold while the sheet
   number of the destination is read out, then open from the bottom. It is
   decoration over a navigation that has already happened.

   ─────────────────────────────────────────────────────────────────────────
   B25 — WHY THERE IS EXACTLY ONE ROUTE SUBTREE MOUNTED AT ANY TIME
   ─────────────────────────────────────────────────────────────────────────
   This component used to wrap `{children}` in an `AnimatePresence`, keyed on
   `location.pathname`, so the OUTGOING page stayed mounted and animated out
   while the incoming one mounted. Two route subtrees were alive at once for
   ~480ms of every navigation.

   Every public page mounts `<Header/>`, and the open menu is a MODAL: it puts
   `overflow:hidden` on `<html>` and `<body>`, `inert` + `aria-hidden` on
   `#root`, and it releases all of that from one effect cleanup. That cleanup
   belongs to a component inside the routed subtree. With two subtrees alive,
   which instance holds the lock — and whether it is told the route changed
   before it is discarded — depended on AnimatePresence's exit scheduling.

   MEASURED, against the production preview build at 1280x800: open the menu on
   `/#sektorler` and press Forward to `/hakkimizda`. 8 runs out of 8 ended with
   the URL at `/hakkimizda`, exactly one page tree (`h1` = "Hakkımızda", no
   `technical-landing-root`, one `<main>`), one header — and an open
   `[data-fullscreen-menu]`, `#root[inert]` and `html{overflow:hidden}` that
   never cleared, polled for 8 seconds. The modal lock had outlived the page
   that owned it. The same probe also produced, on other runs, two
   `[data-menu-trigger]` elements after a Back, and a trigger click that opened
   nothing — the other two symptoms of the same cause.

   THE FIX IS STRUCTURAL, NOT A NEW LISTENER
   Adding "close the menu when the route changes" somewhere else would be one
   more cleanup that only runs when an event fires — precisely the class of bug
   Phase 03 removed from the menu itself, and Phase 01 from the hero shell.
   So the outgoing subtree is not kept alive at all: `<Routes>` swaps it in the
   same commit as the location change, React unmounts it there, and React runs
   its effect cleanups as part of that commit. The scroll lock, `inert`,
   `aria-hidden` and focus restoration are released by the unmount itself.
   There is no event to miss on any path — client navigation, Back, Forward,
   a repeated click, a slow chunk, reduced motion or a hard refresh.

   WHAT THAT COSTS AND WHY IT IS WORTH IT
   The outgoing page no longer fades out. It could not be watched anyway: the
   curtain is opaque and fully closed across the swap. `mas-motion-system` is
   explicit that a page transition must not delay functional navigation — this
   makes the swap immediate instead of 480ms late.

   NO STUCK STATE IS REACHABLE
   The curtain is a fixed, `pointer-events:none` layer OUTSIDE the routed
   subtree, driven entirely by CSS keyframes that end at `scaleY(0)`. It never
   gates rendering, never blocks input, and holds no state a second click could
   interrupt: a new navigation remounts it, which restarts the keyframes from
   zero. Rapid repeated clicks re-arm the animation; they cannot strand it.
   ══════════════════════════════════════════════════════════════════════════ */

const ROUTE_NAMES: Record<string, string> = {
  "/": "ANASAYFA",
  "/hakkimizda": "HAKKIMIZDA",
  "/iletisim": "İLETİŞİM",
  "/teklif-al": "TEKLİF",
  "/malzemeler": "MALZEMELER",
  "/sss": "SSS",
  "/blog": "BLOG",
};

const PANEL_COUNT = 5;

const getPageName = (pathname: string) => {
  if (ROUTE_NAMES[pathname]) return ROUTE_NAMES[pathname];
  if (pathname.startsWith("/hizmetler/")) return "HİZMET";
  if (pathname.startsWith("/kabiliyetler/")) return "KABİLİYET";
  if (pathname.startsWith("/endustriyel/")) return "ENDÜSTRİ";
  if (pathname.startsWith("/malzemeler/")) return "MALZEME";
  if (pathname.startsWith("/blog/")) return "İÇGÖRÜ";
  return "MAS TECHNIC";
};

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const pageName = getPageName(location.pathname);

  /* UX01 — NO CURTAIN ON ARRIVAL. The curtain used to run on the first page
     load too; the removed entry sequence covered it, so nobody saw a ~1 s
     full-screen layer close and open over the page they had just opened. The
     contract says nothing may make the page wait, so the curtain now plays
     only for a real route change, never for the arrival itself. */
  const initialPath = useRef(location.pathname);
  const navigated = useRef(false);
  if (location.pathname !== initialPath.current) navigated.current = true;

  const { coverDuration, holdDuration, revealDuration, panelStagger } = ROUTE_TRANSITION;
  const total = coverDuration + holdDuration + revealDuration;

  return (
    <>
      {/* Keyed on the PATHNAME, not on `location.key`: an in-page anchor
          (`/#surec`) is not a route change and must not pull a curtain over
          the page the reader is already on. A real route change remounts this
          wrapper in one commit, which restarts every keyframe from zero. */}
      {!prefersReducedMotion && navigated.current && (
        <div key={location.pathname} aria-hidden="true" data-route-curtain>
          {Array.from({ length: PANEL_COUNT }, (_, index) => (
            <div
              key={index}
              className="route-curtain-panel fixed inset-y-0 pointer-events-none overflow-hidden border-r border-white/[0.05]"
              data-route-curtain-panel
              style={{
                zIndex: Z.pageTransition,
                left: `${index * (100 / PANEL_COUNT)}%`,
                width: `${100 / PANEL_COUNT + 0.08}%`,
                backgroundColor: "var(--bg-dark-obsidian)",
                ["--curtain-index" as string]: String(index),
                ["--curtain-duration" as string]: `${total}s`,
                ["--curtain-stagger" as string]: `${panelStagger}s`,
              }}
            >
              <span className="absolute inset-y-0 right-0 w-px bg-primary/25" />
              <span className="absolute bottom-8 right-4 font-mono text-[9px] tracking-[0.3em] text-white/20">
                0{index + 1}
              </span>
            </div>
          ))}

          {/* The read-out, on the same CSS clock as the panels. It used to be a
              framer-motion child of the `AnimatePresence`; nothing about the
              route depends on it, so it has no reason to cost main-thread work
              while the destination chunk is being parsed. */}
          <div
            className="route-curtain-label fixed inset-0 flex items-center justify-center pointer-events-none"
            data-route-curtain-label
            style={{
              zIndex: Z.pageTransition + 1,
              ["--curtain-duration" as string]: `${total}s`,
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.48em] text-primary">
                MAS / PRECISION
              </span>
              <span className="font-mono text-[clamp(2rem,7vw,6rem)] font-semibold tracking-[-0.06em] text-white">
                {pageName}
              </span>
              <span className="h-px w-24 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
          </div>
        </div>
      )}

      {/* One node, always. Not keyed: `<Routes>` already replaces the routed
          element, and a key here would remount the wrapper for a hash change
          too. `[data-route-transition]` therefore resolves to exactly 1 on
          every path, including mid-navigation. */}
      <div className="relative min-h-screen" data-route-transition>
        {children}
      </div>
    </>
  );
};
