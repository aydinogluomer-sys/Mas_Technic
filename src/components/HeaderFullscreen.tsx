import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { navigationItems } from "./navigation-data";
import { ThemeToggle } from "./ThemeToggle";
import { SoundToggle } from "./SoundToggle";
import { MenuCategoryPanel } from "./menu/MenuCategoryPanel";
import { MenuConversionRail } from "./menu/MenuConversionRail";
import { MenuFamilyRail } from "./menu/MenuFamilyRail";
import { MenuTrigger } from "./menu/MenuTrigger";
import { MENU_MOTION, menuConversionRevealVariants, menuPanelVariants, menuRevealVariants } from "./menu/menu-tokens";
import { prefetchMenuRoutes } from "@/utils/routePrefetch";

interface HeaderFullscreenProps { isFirstVisit?: boolean }
type MenuPhase = "closed" | "opening" | "open" | "closing";

const groups = navigationItems.filter((item) => item.children?.length);
const directLinks = [...navigationItems.filter((item) => !item.children?.length), { label: "Hakkımızda", path: "/hakkimizda" }];
const shouldCollapseCategories = () =>
  typeof window !== "undefined" && (window.innerWidth < 768 || window.innerHeight <= 680);

export const HeaderFullscreen = ({ isFirstVisit: _isFirstVisit = false }: HeaderFullscreenProps) => {
  const [phase, setPhase] = useState<MenuPhase>("closed");
  const [activeGroup, setActiveGroup] = useState(0);
  const [activeCategory, setActiveCategory] = useState(() => shouldCollapseCategories() ? -1 : 0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [surface, setSurface] = useState<"dark" | "light" | null>(null);
  const [headerHost, setHeaderHost] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const familyRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pendingHref = useRef<string | null>(null);
  const restoreFocus = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  const isVisible = phase === "opening" || phase === "open";
  const modalActive = phase !== "closed";
  const active = groups[activeGroup];

  useLayoutEffect(() => {
    setHeaderHost(document.getElementById("shared-header-host"));
  }, []);

  // Landing bölümleri koyu/açık arasında geçiyor. Header'ın altındaki yüzeyi
  // örnekleyip kontrastı ona göre çeviriyoruz; [data-surface] işaretli bölüm
  // yoksa (diğer sayfalar) tema tabanlı varsayılan görünüm korunur.
  useEffect(() => {
    const HEADER_BAND = 32;
    let frame = 0;
    let lastY = -1;

    const sample = () => {
      frame = 0;
      const y = window.scrollY;
      if (lastY >= 0 && Math.abs(y - lastY) < 8) return;
      lastY = y;
      const zones = document.querySelectorAll<HTMLElement>("[data-surface]");
      if (!zones.length) { setSurface(null); return; }
      let next: "dark" | "light" | null = null;
      zones.forEach((zone) => {
        const rect = zone.getBoundingClientRect();
        if (rect.top <= HEADER_BAND && rect.bottom > HEADER_BAND) {
          next = zone.dataset.surface === "light" ? "light" : "dark";
        }
      });
      setSurface((prev) => (prev === next ? prev : next));
    };

    const schedule = () => { if (!frame) frame = requestAnimationFrame(sample); };
    sample();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [location.pathname]);

  const requestOpen = useCallback(() => {
    pendingHref.current = null;
    restoreFocus.current = false;
    setPhase("opening");
    // Menü açılır açılmaz hedef rotaları boşta çöz: gezinme anında chunk
    // ayrıştırması ana thread'i bloklamasın. Görünür etkisi: perde ve ilk
    // boyama duraklamadan ilerler.
    prefetchMenuRoutes();
  }, []);
  const requestClose = useCallback((restore = true) => {
    restoreFocus.current = restore;
    setPhase((current) => current === "closed" ? current : "closing");
  }, []);
  const requestNavigate = (path: string) => {
    pendingHref.current = path;
    requestClose(false);
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const groupIndex = groups.findIndex((group) => group.children?.some((item) =>
      location.pathname === item.path || item.links.some((link) => location.pathname === link.path)));
    if (groupIndex >= 0) {
      setActiveGroup(groupIndex);
      const categoryIndex = groups[groupIndex].children?.findIndex((item) =>
        location.pathname === item.path || item.links.some((link) => location.pathname === link.path)) ?? 0;
      setActiveCategory(Math.max(0, categoryIndex));
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!modalActive) return;
    const scrollY = window.scrollY;
    const lenis = window.__lenis;
    const shouldRestartLenis = !!lenis && !lenis.isStopped;
    const overflow = [document.body.style.overflow, document.documentElement.style.overflow];
    const background = [document.getElementById("root"), headerRef.current].filter((node): node is HTMLElement => !!node);
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
      if (event.key === "Escape") { event.preventDefault(); pendingHref.current = null; requestClose(true); return; }
      if (event.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!panelRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
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

  const panels = useMemo(() => [0, 1, 2], []);
  const finishExit = () => {
    setPhase("closed");
    const href = pendingHref.current;
    pendingHref.current = null;
    if (href) navigate(href);
    else if (restoreFocus.current) {
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
    }
  };

  const surfaceSkin =
    surface === "light" ? "header-skin-light"
      : surface === "dark" ? "header-skin-dark"
        : "border-border/60 bg-background/90 shadow-sm";

  return (
    <>
      {headerHost && createPortal(<header ref={headerRef} id="main-header" data-fullscreen-header className={`shared-public-header fixed inset-x-0 top-0 z-[10000] ${modalActive ? "opacity-0" : ""}`}>
        <div className={`mx-auto flex max-w-[1600px] items-center justify-between border-b transition-all duration-300 ${isScrolled ? `h-16 px-3 backdrop-blur-xl md:px-5 ${surfaceSkin}` : "h-20 border-white/20 text-white"}`}>
          <Link to="/" className="flex items-center gap-3" aria-label="MAS Technic ana sayfa">
            <span className="grid size-9 place-items-center bg-primary font-mono text-sm font-black text-primary-foreground">MT</span>
            <span><b className="block text-sm tracking-[-.02em]">MAS TECHNIC</b><small className="block font-mono text-[9px] uppercase tracking-[.24em] opacity-80">Precision CNC</small></span>
          </Link>
          <div className="flex items-center gap-2">
            {!modalActive && <MenuTrigger open={false} reducedMotion={reducedMotion} onToggle={requestOpen} triggerRef={triggerRef} />}
            <div className="hidden items-center gap-1 md:flex"><SoundToggle /><ThemeToggle /></div>
          </div>
        </div>
      </header>, headerHost)}

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
              className="menu-overlay"
              initial={{ opacity: reducedMotion ? 0 : 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reducedMotion ? MENU_MOTION.reduced : MENU_MOTION.close}
              onAnimationComplete={() => phase === "opening" && setPhase("open")}
            >
              <div className="menu-trigger-dock fixed right-4 z-[10030] text-white md:right-8">
                <MenuTrigger open reducedMotion={reducedMotion} onToggle={() => requestClose(true)} triggerRef={dialogTriggerRef} />
              </div>
              <div className="menu-panels" aria-hidden="true">
                {panels.map((panel) => (
                  <motion.i
                    key={panel}
                    initial={menuPanelVariants.closed(panel)}
                    animate={{
                      ...menuPanelVariants.open,
                      transition: reducedMotion
                        ? MENU_MOTION.reduced
                        : { ...MENU_MOTION.open, delay: panel * MENU_MOTION.panelStagger },
                    }}
                    exit={{
                      ...menuPanelVariants.closed(panel),
                      transition: reducedMotion
                        ? MENU_MOTION.reduced
                        : { ...MENU_MOTION.close, delay: (2 - panel) * 0.02 },
                    }}
                  />
                ))}
              </div>
              <div className="menu-grid" aria-hidden="true" />
              <motion.div
                className="menu-shell"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reducedMotion ? MENU_MOTION.reduced : { duration: 0.2, delay: MENU_MOTION.shellDelay }}
              >
                <motion.div
                  className="menu-top"
                  custom={MENU_MOTION.shellDelay}
                  variants={menuRevealVariants}
                  initial={reducedMotion ? false : "hidden"}
                  animate="visible"
                >
                  <Link to="/" onClick={(event) => { event.preventDefault(); requestNavigate("/"); }} className="flex items-center gap-3" aria-label="MAS Technic ana sayfa">
                    <span className="grid size-9 place-items-center bg-primary font-mono text-sm font-black text-primary-foreground">MT</span><b>MAS TECHNIC</b>
                  </Link>
                </motion.div>
                <nav className="menu-main" aria-label="Ana navigasyon">
                  <div className="menu-left">
                    <MenuFamilyRail groups={groups} activeIndex={activeGroup} onSelect={(index) => {
                      setActiveGroup(index);
                      setActiveCategory(shouldCollapseCategories() ? -1 : 0);
                    }} buttonRefs={familyRefs} reducedMotion={reducedMotion} />
                  </div>
                  <MenuCategoryPanel group={active} activeCategory={activeCategory} onCategoryChange={setActiveCategory} onNavigate={requestNavigate} reducedMotion={reducedMotion} />
                </nav>
                <motion.div
                  className="menu-conversion-reveal"
                  custom={MENU_MOTION.shellDelay + 0.18}
                  variants={menuConversionRevealVariants}
                  initial={reducedMotion ? false : "hidden"}
                  animate="visible"
                >
                  <MenuConversionRail links={directLinks} onNavigate={requestNavigate} />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};
