import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { prefetchMenuRoutes } from "@/utils/routePrefetch";
import { landingSections, navigationItems, rfqLink } from "./navigation/ia";
import { NavCategoryPanel } from "./navigation/NavCategoryPanel";
import { NavConversion } from "./navigation/NavConversion";
import { NavDirectory } from "./navigation/NavDirectory";
import { NavFamilyRail } from "./navigation/NavFamilyRail";
import { NavTrigger } from "./navigation/NavTrigger";
import { NAV_MOTION, navRevealVariants, navSheetVariants } from "./navigation/motion";
import "@/styles/navigation.css";

/* ══════════════════════════════════════════════════════════════════════════
   THE SITE'S ONE PUBLIC NAVIGATION

   WHAT THIS FILE REPLACES
   -----------------------
   Until Phase 03 this file was a single line —
   `export { HeaderFullscreen as Header } from "./HeaderFullscreen";` — and the
   public site shipped THREE headers: that alias, the 301-line
   `HeaderFullscreen` (dark-on-light, teal accent, "MT" mark, three sliding
   Framer panels, ~40 real destinations) on every inner page, and the 79-line
   landing-only `TechnicalHeader` (drawing band, IBM Plex Mono, six hash
   anchors and nothing else) on `/`. From the home page no service, sector,
   material, blog, FAQ, about or contact page was reachable through the header
   at all (`reports/baseline/known-blockers.md` B14).

   This is a synthesis, not a survivor: the ROUTE COVERAGE and the overlay
   machinery come from the fullscreen menu; the VISUAL LANGUAGE, grid and
   typography come from the landing. `USER_INPUTS.md` keeps the landing's art
   direction, so the sheet wins on appearance and the menu wins on
   information. `HeaderFullscreen.tsx`, `TechnicalHeader.tsx` and
   `src/components/menu/**` are deleted; nothing aliases anything.

   WHY THE BAR CARRIES NO LINKS
   ----------------------------
   The trigger is the third tabbable element of every public page (skip link →
   brand → trigger) and `e2e/fullscreen-menu.spec.ts` locks that. A row of
   header links would either push the trigger down the Tab order or force DOM
   order to diverge from visual order. One navigation surface, reachable in
   three keystrokes, is the better trade — and it is the same surface on a
   320px phone and on a 1600px sheet.

   GEOMETRY
   --------
   The bar is band 01 of the master sheet: `--tl-rail + repeat(--tl-cols,1fr)`,
   the same tokens `src/styles/master-grid.css` gives every other band, at the
   same 1600px sheet width. `scripts/grid-axis-probe.mjs` measures its outer
   AND its interior edges — with the inert EN/TR switch removed the interior
   now divides on master columns, so band 01 is no longer a documented
   content-measured exception.
   ══════════════════════════════════════════════════════════════════════════ */

interface HeaderProps {
  /** Kept for `src/pages/TestHowWeWork.tsx` (dev-only) which still passes it. */
  isFirstVisit?: boolean;
}

type MenuPhase = "closed" | "opening" | "open" | "closing";

const groups = navigationItems.filter((item) => item.children?.length);
const SECTION_IDS: string[] = landingSections.map((section) => section.id);
const shouldCollapseCategories = () =>
  typeof window !== "undefined" && (window.innerWidth < 768 || window.innerHeight <= 680);

export const Header = ({ isFirstVisit: _isFirstVisit = false }: HeaderProps) => {
  const [phase, setPhase] = useState<MenuPhase>("closed");
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeCategory, setActiveCategory] = useState(() => (shouldCollapseCategories() ? -1 : 0));
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [headerHost, setHeaderHost] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const familyRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pendingHref = useRef<string | null>(null);
  const pendingSection = useRef<string | null>(null);
  const restoreFocus = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  const isVisible = phase === "opening" || phase === "open";
  const modalActive = phase !== "closed";
  const active = groups[activeGroup];
  const onLanding = location.pathname === "/";

  useLayoutEffect(() => {
    setHeaderHost(document.getElementById("shared-header-host"));
  }, []);

  /* ── Active landing section ────────────────────────────────────────────
     Only on `/`, and only for the seven real anchors.

     The rule is "which band is under the header line", not "which band is most
     visible". Ratio-based selection was measured to be wrong at the top of the
     page: at scroll 0 on a 1440x900 viewport band 05 already pokes into the
     last 130px of the viewport, so it won the ratio contest while the reader
     was still looking at the hero.

     One rAF-throttled passive scroll listener, seven rects per frame at most,
     mounted only on the landing. It replaces the previous header's scroll
     sampler, which read every `[data-surface]` zone on the page in order to
     invert its own contrast — the bar is opaque graphite now, so that whole
     mechanism is gone. */
  useEffect(() => {
    if (!onLanding) { setActiveSection(null); return; }
    let frame = 0;
    const pick = () => {
      frame = 0;
      const line = (headerRef.current?.getBoundingClientRect().height ?? 0) + 8;
      let current: string | null = null;
      for (const id of SECTION_IDS) {
        const node = document.getElementById(id);
        if (node && node.getBoundingClientRect().top <= line) current = id;
      }
      setActiveSection((previous) => (previous === current ? previous : current));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(pick); };
    pick();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [onLanding, location.key]);

  /* ── Which family owns the current route ──────────────────────────────── */
  const currentFamily = groups.findIndex((group) => group.children?.some((item) =>
    location.pathname === item.path || item.links.some((link) => location.pathname === link.path)));

  useEffect(() => {
    if (currentFamily < 0) return;
    setActiveGroup(currentFamily);
    const categoryIndex = groups[currentFamily].children?.findIndex((item) =>
      location.pathname === item.path || item.links.some((link) => location.pathname === link.path)) ?? 0;
    setActiveCategory(Math.max(0, categoryIndex));
  }, [currentFamily, location.pathname]);

  const requestOpen = useCallback(() => {
    pendingHref.current = null;
    pendingSection.current = null;
    restoreFocus.current = false;
    setPhase("opening");
    // Resolve the likely destinations while the sheet wipes in, so a click
    // does not pay for chunk parsing on the main thread.
    prefetchMenuRoutes();
  }, []);

  const requestClose = useCallback((restore = true) => {
    restoreFocus.current = restore;
    setPhase((current) => (current === "closed" ? current : "closing"));
  }, []);

  const requestNavigate = (path: string) => {
    pendingHref.current = path;
    pendingSection.current = null;
    requestClose(false);
  };

  const scrollToSection = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const offset = headerRef.current?.getBoundingClientRect().height ?? 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(top, { immediate: reducedMotion, force: true });
    else window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  const requestSection = (id: string) => {
    pendingHref.current = null;
    pendingSection.current = id;
    requestClose(false);
  };

  /* Deep link and back/forward: a `/#surec` URL must still land on the band. */
  useEffect(() => {
    if (!onLanding || !location.hash) return;
    const id = location.hash.slice(1);
    if (!SECTION_IDS.includes(id)) return;
    const frame = window.requestAnimationFrame(() => scrollToSection(id));
    return () => window.cancelAnimationFrame(frame);
  }, [onLanding, location.hash, location.key, scrollToSection]);

  /* A history move while the menu is open must close it, rather than leave a
     modal floating over a page the user did not open it from. */
  useEffect(() => {
    setPhase((current) => (current === "closed" ? current : "closing"));
    restoreFocus.current = false;
  }, [location.key]);

  /* ── Modal behaviour: scroll lock, inert background, focus trap ───────── */
  useEffect(() => {
    if (!modalActive) return;
    const scrollY = window.scrollY;
    const lenis = window.__lenis;
    const shouldRestartLenis = !!lenis && !lenis.isStopped;
    const overflow = [document.body.style.overflow, document.documentElement.style.overflow];
    const background = [document.getElementById("root"), headerRef.current]
      .filter((node): node is HTMLElement => !!node);
    const prior = background.map((node) => ({ node, inert: node.inert, hidden: node.getAttribute("aria-hidden") }));
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    background.forEach((node) => { node.inert = true; node.setAttribute("aria-hidden", "true"); });

    const getFocusable = () => [...(panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
    ) ?? [])].filter((element) => {
      if (element.tabIndex < 0 || element.closest("[hidden],[inert],[aria-hidden='true']")) return false;
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
    });

    window.setTimeout(() => dialogTriggerRef.current?.focus({ preventScroll: true }), 0);
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        pendingHref.current = null;
        pendingSection.current = null;
        requestClose(true);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!panelRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", keydown, true);
    return () => {
      document.body.style.overflow = overflow[0];
      document.documentElement.style.overflow = overflow[1];
      prior.forEach(({ node, inert, hidden }) => {
        node.inert = inert;
        if (hidden === null) node.removeAttribute("aria-hidden");
        else node.setAttribute("aria-hidden", hidden);
      });
      const restoreScroll = () => {
        window.scrollTo(0, scrollY);
        lenis?.scrollTo(scrollY, { immediate: true, force: true });
      };
      restoreScroll();
      if (shouldRestartLenis) lenis.start();
      if (restoreFocus.current) window.requestAnimationFrame(restoreScroll);
      window.removeEventListener("keydown", keydown, true);
    };
  }, [modalActive, requestClose]);

  const finishExit = () => {
    setPhase("closed");
    const href = pendingHref.current;
    const section = pendingSection.current;
    pendingHref.current = null;
    pendingSection.current = null;
    if (href) { navigate(href); return; }
    if (section) {
      if (onLanding) window.requestAnimationFrame(() => scrollToSection(section));
      else navigate(`/#${section}`);
      return;
    }
    if (!restoreFocus.current) return;
    let attempts = 0;
    const focusTrigger = () => {
      const trigger = triggerRef.current;
      if (trigger) {
        trigger.focus({ preventScroll: true });
        if (document.activeElement === trigger) return;
      }
      attempts += 1;
      if (attempts < 6) window.setTimeout(focusTrigger, 40);
    };
    window.setTimeout(focusTrigger, 0);
  };

  const activeSectionEntry = landingSections.find((section) => section.id === activeSection);
  const context = onLanding
    ? activeSectionEntry
      ? `§${activeSectionEntry.index} ${activeSectionEntry.label.toLocaleUpperCase("tr-TR")}`
      : "PAFTA 01/14"
    : currentFamily >= 0
      ? groups[currentFamily].label.toLocaleUpperCase("tr-TR")
      : "MAS TECHNIC";

  return (
    <>
      {headerHost && createPortal(
        <header
          ref={headerRef}
          id="main-header"
          data-fullscreen-header
          className={`tl-header-band${modalActive ? " is-behind-modal" : ""}`}
        >
          <div className="tl-band-index" aria-hidden="true"><span>01</span><small>HEADER</small></div>
          <div className="tl-header">
            <Link className="tl-brand" to="/" aria-label="MAS Technic ana sayfa">
              <strong>MAS <em>TECHNIC</em></strong>
              <span>PRECISION CNC</span>
            </Link>
            <p className="tl-header-context" aria-hidden="true"><span>{context}</span></p>
            <div className="tl-header-actions">
              {!modalActive && (
                <NavTrigger open={false} reducedMotion={reducedMotion} onToggle={requestOpen} triggerRef={triggerRef} />
              )}
              <Link className="tl-quote-button" to={rfqLink.path}>
                {rfqLink.label.toLocaleUpperCase("tr-TR")}
              </Link>
            </div>
          </div>
        </header>,
        headerHost,
      )}

      {createPortal(
        <AnimatePresence onExitComplete={finishExit}>
          {isVisible && (
            <motion.div
              ref={panelRef}
              id="fullscreen-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Ana menü"
              data-fullscreen-menu
              className="tl-menu"
              variants={navSheetVariants}
              initial={reducedMotion ? "visible" : "hidden"}
              animate="visible"
              exit={reducedMotion ? "visible" : "exit"}
              transition={reducedMotion ? NAV_MOTION.reduced : NAV_MOTION.open}
              onAnimationComplete={() => phase === "opening" && setPhase("open")}
            >
              <div className="tl-menu-sheet">
                <div className="tl-menu-rail" aria-hidden="true"><span>00</span><small>MENÜ</small></div>
                <div className="tl-menu-body">
                  <div className="tl-menu-top">
                    <Link
                      to="/"
                      onClick={(event) => { event.preventDefault(); requestNavigate("/"); }}
                      className="tl-menu-brand"
                      aria-label="MAS Technic ana sayfa"
                    >
                      <strong>MAS <em>TECHNIC</em></strong>
                    </Link>
                    <p className="tl-menu-meta" aria-hidden="true">
                      <span>NAVİGASYON</span>
                      <span>PAFTA 00/14</span>
                    </p>
                    <NavTrigger
                      open
                      reducedMotion={reducedMotion}
                      onToggle={() => requestClose(true)}
                      triggerRef={dialogTriggerRef}
                    />
                  </div>

                  <div className="tl-menu-main">
                    <nav className="tl-menu-primary" aria-label="Birincil navigasyon">
                      <NavFamilyRail
                        groups={groups}
                        activeIndex={activeGroup}
                        currentIndex={currentFamily}
                        onSelect={(index) => {
                          setActiveGroup(index);
                          setActiveCategory(shouldCollapseCategories() ? -1 : 0);
                        }}
                        buttonRefs={familyRefs}
                        reducedMotion={reducedMotion}
                      />
                      <NavCategoryPanel
                        group={active}
                        activeCategory={activeCategory}
                        currentPath={location.pathname}
                        onCategoryChange={setActiveCategory}
                        onNavigate={requestNavigate}
                        reducedMotion={reducedMotion}
                      />
                    </nav>

                    <motion.div
                      className="tl-menu-directory-reveal"
                      custom={NAV_MOTION.step * 3}
                      variants={navRevealVariants}
                      initial={reducedMotion ? false : "hidden"}
                      animate="visible"
                    >
                      <NavDirectory
                        currentPath={location.pathname}
                        activeSection={activeSection}
                        onNavigate={requestNavigate}
                        onSection={requestSection}
                      />
                    </motion.div>
                  </div>

                  <NavConversion currentPath={location.pathname} onNavigate={requestNavigate} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};
