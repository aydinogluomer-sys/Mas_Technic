import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Link } from "@/i18n/LocaleLink";
import { useLocaleNavigate as useNavigate } from "@/i18n/hooks";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { prefetchMenuRoutes } from "@/utils/routePrefetch";
import { HERO_SHELL_TEARDOWN_FALLBACK_MS, INTRO_DONE_EVENT, isHeroIntroActive } from "@/lib/hero-shell";
import { accountLink, companyLinks, landingSections, legalLinks, navigationItems, resourceLinks, rfqLink } from "./navigation/ia";
import { NavCategoryPanel } from "./navigation/NavCategoryPanel";
import { NavConversion } from "./navigation/NavConversion";
import { NavFamilyRail } from "./navigation/NavFamilyRail";
import { NavTrigger } from "./navigation/NavTrigger";
import { NAV_MOTION, navRevealVariants, navSheetVariants } from "./navigation/motion";
import "@/styles/navigation.css";
import "@/styles/menu-round2.css";
import "@/styles/i18n.css";
import { useTranslation } from "react-i18next";
import { railLabel } from "@/components/shell/rail-labels";
import { stripLocale } from "@/i18n/locale";
import { upper } from "@/i18n/upper";
import { LanguageSwitch } from "./navigation/LanguageSwitch";

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


/* ── One instance, even mid-transition ───────────────────────────────────────
   Every page module renders `<Header />` itself and each instance portals into
   the single `#shared-header-host`. During a route change `PageTransition`
   keeps the outgoing page mounted while the incoming one mounts, so for the
   length of the curtain the host held TWO headers — two `banner` landmarks,
   two menu triggers, two brand links.

   MEASURED: `page.goBack()` from `/hakkimizda` to `/` resolved
   `[data-menu-trigger]` to 2 elements, one reading "PAFTA 01/14" (landing) and
   one reading "MAS TECHNIC" (the page being left).

   The page must keep deciding WHETHER a header exists — `/giris`,
   `/reset-password` and the 404 deliberately have none, and that contract is
   asserted in `e2e/shared-shell-accessibility.spec.ts`. So ownership is
   arbitrated here instead: the most recently mounted instance renders, every
   other one renders nothing. Newest rather than oldest, so the incoming page's
   header is the one on screen during the transition.
   -------------------------------------------------------------------------- */
let headerSequence = 0;
const mountedHeaders = new Set<number>();
const ownershipListeners = new Set<() => void>();
const currentOwner = () => (mountedHeaders.size ? Math.max(...mountedHeaders) : 0);

function useHeaderOwnership() {
  const idRef = useRef(0);
  if (idRef.current === 0) idRef.current = ++headerSequence;
  const [, bump] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    const id = idRef.current;
    mountedHeaders.add(id);
    ownershipListeners.add(bump);
    ownershipListeners.forEach((listener) => listener());
    return () => {
      mountedHeaders.delete(id);
      ownershipListeners.delete(bump);
      ownershipListeners.forEach((listener) => listener());
    };
  }, []);

  const owner = currentOwner();
  return owner === 0 || owner === idRef.current;
}

/* ── The menu lifecycle, and why no step of it waits for an animation ────────
   `closed → opening → open → closing → closed`. The two transitional phases
   exist so the sheet can wipe in and out; the two settled phases are the only
   ones the rest of the component reasons about.

   MEASURED DEFECT (the reason this is written out rather than delegated to
   `AnimatePresence`): the sheet used to unmount through `AnimatePresence` and
   run its whole teardown — releasing the scroll lock, `inert` and
   `aria-hidden`, restoring focus, performing the pending navigation — inside
   `onExitComplete`. Under `prefers-reduced-motion: reduce` the exit target was
   deliberately identical to the animate target (nothing may move), so Framer
   scheduled no exit animation, `onExitComplete` never fired, and the teardown
   never ran. At 320, 375 and 1280, on `/` and on `/hakkimizda`, the menu then
   could not be closed by Escape (pressed twice, polled 12s), by the close
   button, or by activating a link: `body`/`html` stayed `overflow:hidden`,
   `#root` stayed `inert` + `aria-hidden`, a 1200px wheel was absorbed, and
   only a reload recovered. A permanent modal trap — WCAG 2.1 SC 2.1.2 — on the
   site's only navigation, aimed squarely at the readers the reduced-motion
   path exists to serve.

   The rule that follows, and the same one `src/lib/hero-shell.ts` learned in
   Phase 01: A CLEANUP THAT ONLY RUNS WHEN AN EVENT FIRES WILL EVENTUALLY NOT
   RUN. So correctness never rides on a callback here.

     - The sheet is rendered by `phase`, plain conditional rendering. No
       presence library gets to decide whether it unmounts.
     - `settleClose` is driven by an effect on `phase === "closing"` with a
       timer, so it is scheduled the moment the close is requested and cannot
       be skipped by any motion mode, interrupted transition or dropped frame.
     - `onAnimationComplete` may only make that happen EARLIER. It is an
       accelerator, never the mechanism.
     - `settleClose` is idempotent — it reads `phaseRef`, so the accelerator
       and the net can both fire and the pending navigation still happens once.

   The net is generous on purpose: it is not the schedule, it is the floor. */
type MenuPhase = "closed" | "opening" | "open" | "closing";

/** Longest sheet transition is `NAV_MOTION.open`'s 620ms; this is that + 45%. */
const MENU_SETTLE_FALLBACK_MS = 900;

const groups = navigationItems.filter((item) => item.children?.length || item.links?.length);
/* The landing's sheet register: every band carries its number on
   `data-sheet-no` (ShellBand; the footer is 14), and the header names it.
   Revision 4: all fourteen are read, in order, so the counter never skips. */
const SECTION_IDS: string[] = landingSections.map((section) => section.id);
/* R1 (5 Oct): fourteen sheets again — marquee and manifesto are back; NEXUS
   keeps its place after the references. */
const SHEET_TOTAL = 14;
const SHEET_LABELS: Record<string, string> = {
  "02": "Açılış", "03": "Kanıtlar", "04": "Hizmet şeridi", "05": "Süreç",
  "06": "Projeler", "07": "Sektörler", "08": "Manifesto", "09": "Kalite",
  "10": "Referanslar", "11": "Nexus", "12": "SSS", "13": "Teklif", "14": "Alt bilgi",
};
const shouldCollapseCategories = () =>
  typeof window !== "undefined" && (window.innerWidth < 768 || window.innerHeight <= 680);

export const Header = () => {
  const owns = useHeaderOwnership();
  const [phase, setPhase] = useState<MenuPhase>("closed");
  /* The committed phase, readable from a timer or an animation callback that
     fires long after the render that scheduled it. Synced first, so every
     effect and callback declared below reads the value React just committed. */
  const phaseRef = useRef<MenuPhase>("closed");
  useEffect(() => { phaseRef.current = phase; }, [phase]);
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
  const pendingSectionScroll = useRef<string | null>(null);
  const restoreFocus = useRef(false);
  const location = useLocation();
  /* L01: menu state is decided on the locale-free path (`/en/sss` is `/sss`). */
  const barePath = stripLocale(location.pathname);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  /* The sheet is mounted for every phase but "closed" — including "closing",
     which is what keeps the exit animation on screen without handing the
     unmount decision to a presence library. */
  const modalActive = phase !== "closed";
  const active = groups[activeGroup];
  const onLanding = barePath === "/";

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
      const sheets = document.querySelectorAll<HTMLElement>("main [data-sheet-no], footer[data-sheet-no]");
      for (const node of sheets) {
        if (node.getBoundingClientRect().top <= line) current = node.dataset.sheetNo ?? current;
      }
      /* A short last sheet never reaches the header line: at the foot of the
         page the last one is the one being read. */
      const root = document.documentElement;
      if (sheets.length && window.scrollY + window.innerHeight >= root.scrollHeight - 2) {
        current = sheets[sheets.length - 1].dataset.sheetNo ?? current;
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
  const currentFamily = groups.findIndex((group) =>
    group.children?.some((item) =>
      barePath === item.path || item.links.some((link) => barePath === link.path))
    || group.links?.some((link) => barePath === link.path || barePath.startsWith(`${link.path}/`)));

  useEffect(() => {
    if (currentFamily < 0) return;
    setActiveGroup(currentFamily);
    const categoryIndex = groups[currentFamily].children?.findIndex((item) =>
      barePath === item.path || item.links.some((link) => barePath === link.path)) ?? 0;
    setActiveCategory(Math.max(0, categoryIndex));
  }, [currentFamily, barePath]);

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
    // Lenis clamps to the limit it last measured; a stale one cut deep targets short.
    lenis?.resize();
    if (lenis) lenis.scrollTo(top, { immediate: reducedMotion, force: true });
    else window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  const requestSection = (id: string) => {
    pendingHref.current = null;
    pendingSection.current = id;
    requestClose(false);
  };

  /* The section scroll, ordered after the modal effect's cleanup. React runs
     every cleanup in a commit before every effect in it, so by the time this
     runs the overlay is gone, the scroll lock is released and Lenis has been
     restarted — a scroll issued here is the last word. */
  useEffect(() => {
    if (phase !== "closed") return;
    const id = pendingSectionScroll.current;
    if (!id) return;
    pendingSectionScroll.current = null;
    const frame = window.requestAnimationFrame(() => scrollToSection(id));
    return () => window.cancelAnimationFrame(frame);
  }, [phase, scrollToSection]);

  /* Deep link and back/forward: a `/#surec` URL must still land on the band.
     MEASURED: a single rAF is not enough. On a cold load `index.html`'s
     "Precision Born" intro owns the viewport for up to 7s, `ScrollToTop`
     resets to 0 on mount, and the sheet keeps growing while fonts, images and
     ScrollTrigger settle — the one attempt landed on a stale offset every
     time. So: wait for the intro to hand off, then re-issue on a short ladder,
     and give up the moment the reader takes over with a wheel, a touch or a
     key. Deep links win over the initial scroll, never over the user. */
  useEffect(() => {
    if (!onLanding || !location.hash) return;
    const id = location.hash.slice(1);
    if (!SECTION_IDS.includes(id)) return;

    let cancelled = false;
    let started = false;
    const timers: number[] = [];
    const abort = () => { cancelled = true; };
    const run = () => { if (!cancelled) scrollToSection(id); };
    const start = () => {
      if (cancelled || started) return;
      started = true;
      for (const delay of [0, 120, 400, 900]) timers.push(window.setTimeout(run, delay));
    };

    window.addEventListener("wheel", abort, { passive: true, once: true });
    window.addEventListener("touchstart", abort, { passive: true, once: true });
    window.addEventListener("keydown", abort, { once: true });
    if (isHeroIntroActive()) {
      document.addEventListener(INTRO_DONE_EVENT, start, { once: true });
      timers.push(window.setTimeout(start, HERO_SHELL_TEARDOWN_FALLBACK_MS + 200));
    } else {
      start();
    }

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      document.removeEventListener(INTRO_DONE_EVENT, start);
      window.removeEventListener("wheel", abort);
      window.removeEventListener("touchstart", abort);
      window.removeEventListener("keydown", abort);
    };
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

  /* ── The one teardown, and the only way out of "closing" ────────────────
     Idempotent by the `phaseRef` guard: the timer net below and the animation
     accelerator may both call it, and a re-open mid-close disarms it, because
     only the committed phase decides whether there is still a close to settle.
     Setting `phaseRef` before `setPhase` closes the window between two
     synchronous calls in the same tick. */
  const settleClose = useCallback(() => {
    if (phaseRef.current !== "closing") return;
    phaseRef.current = "closed";
    setPhase("closed");
    const href = pendingHref.current;
    const section = pendingSection.current;
    pendingHref.current = null;
    pendingSection.current = null;
    if (href) { navigate(href); return; }
    if (section) {
      // NOT scrolled here. `setPhase("closed")` is what triggers the modal
      // effect's cleanup — which restores the scroll position the menu was
      // opened at — and React commits that cleanup AFTER this function
      // returns. Scrolling from here was measured to be undone every time: the
      // band moved to 2835 and the cleanup put it straight back to 0. The
      // scroll is handed to the effect above, which React guarantees runs
      // after that cleanup.
      if (onLanding) pendingSectionScroll.current = section;
      else navigate(`/#${section}`);
      return;
    }
    if (!restoreFocus.current) return;
    // The trigger is only rendered once `modalActive` is false, so the first
    // attempt can land before it exists. Retry briefly rather than assume.
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
  }, [navigate, onLanding]);

  /* ── The net: both transitions settle on state, not on an event ──────────
     Under reduced motion there is no animation to wait for at all, so the
     settle is scheduled for the next task. Otherwise the sheet is given its
     full transition plus margin, and `onAnimationComplete` normally gets there
     first — which is the only thing that callback is allowed to affect. */
  useEffect(() => {
    if (phase !== "opening" && phase !== "closing") return;
    const settle = phase === "closing"
      ? settleClose
      : () => setPhase((current) => (current === "opening" ? "open" : current));
    const timer = window.setTimeout(settle, reducedMotion ? 0 : MENU_SETTLE_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [phase, reducedMotion, settleClose]);

  const handleSheetAnimationComplete = () => {
    if (phaseRef.current === "closing") { settleClose(); return; }
    if (phaseRef.current === "opening") setPhase("open");
  };

  const sheetNo = activeSection ?? "02";
  const context = onLanding
    ? `${t("PAFTA")} ${sheetNo}/${SHEET_TOTAL} · ${upper(t(SHEET_LABELS[sheetNo] ?? ""), lang)}`
    : (() => {
        /* The page being read, not the brand the bar already shows at left:
           family › entry on deep routes, the resource/company name elsewhere. */
        const path = barePath;
        const flat = [...resourceLinks, ...companyLinks, ...legalLinks, rfqLink];
        const direct = flat.find((link) => path === link.path || path.startsWith(`${link.path}/`));
        if (currentFamily >= 0) {
          const family = groups[currentFamily];
          const page = family.links?.find((link) => path === link.path || path.startsWith(`${link.path}/`));
          const category = family.children?.find((item) => item.path === path || item.links.some((link) => link.path === path));
          const entry = page ?? category?.links.find((link) => link.path === path) ?? category;
          return upper(`${t(family.label)}${entry ? ` › ${t(entry.label)}` : ""}`, lang);
        }
        return upper(t(direct?.label ?? "Pafta dışı"), lang);
      })();

  return (
    <>
      {owns && headerHost && createPortal(
        <>
        <header
          ref={headerRef}
          id="main-header"
          data-fullscreen-header
          className={`tl-header-band${modalActive ? " is-behind-modal" : ""}`}
        >
          <div className="tl-band-index" aria-hidden="true"><span>01</span><small>{railLabel("HEADER", i18n.language)}</small></div>
          <div className="tl-header">
            <Link className="tl-brand" to="/" aria-label={t("MAS Technic ana sayfa")}>
              <strong>MAS <em>TECHNIC</em></strong>
              <span>PRECISION CNC</span>
            </Link>
            <p className="tl-header-context" aria-hidden="true"><span>{context}</span></p>
            {/* Revision 4 order, left to right: language ▾ · NEXUS sign-in
                (ghost) · quote (primary) · menu. */}
            <div className="tl-header-actions">
              <LanguageSwitch variant="dropdown" className="lang-switch--header" />
              <Link className="tl-nexus-header-link" to={accountLink.path} aria-label={t("NEXUS müşteri girişi")}>
                {t("NEXUS GİRİŞ")}
              </Link>
              <Link className="tl-quote-button" to={rfqLink.path}>
                {upper(t(rfqLink.label), lang)}
              </Link>
              {!modalActive && (
                <NavTrigger open={false} reducedMotion={reducedMotion} onToggle={requestOpen} triggerRef={triggerRef} />
              )}
            </div>
          </div>
        </header>
        {/* The bar is fixed, so its host has no height and page content would
            start underneath it. MEASURED: at 375 the ServiceDetail breadcrumb
            sat at y = -8 and its H1 at y = 56, both behind a 64px bar. The old
            header hid the same defect by being transparent at scroll 0.
            This spacer lives in `#shared-header-host`, so exactly the routes
            that mount the navigation reserve exactly its height — no per-page
            padding, and nothing added to `/giris` or the 404, which mount no
            header at all. */}
        <div className="tl-header-spacer" aria-hidden="true" />
        </>,
        headerHost,
      )}

      {createPortal(
        <>
          {/* Mounted by `phase`, not by a presence library. `AnimatePresence`
              used to own this unmount, and with it the whole teardown; see the
              MenuPhase note above for what that cost under reduced motion. The
              sheet now stays mounted through "closing" because THIS component
              says so, and leaves when `settleClose` says so.

              A non-owning instance never opens: `modalActive` can only become
              true through this instance's own trigger, which it does not
              render. Keeping the portal itself mounted regardless preserves an
              in-flight close if ownership changes mid-transition. */}
          {modalActive && (
            <motion.div
              ref={panelRef}
              id="fullscreen-navigation"
              role="dialog"
              aria-modal="true"
              aria-label={t("Ana menü")}
              data-fullscreen-menu
              className="tl-menu"
              variants={navSheetVariants}
              initial={reducedMotion ? "visible" : "hidden"}
              // Reduced motion holds "visible" through the close too: the sheet
              // must not move, it simply stops being rendered. That is what
              // made the old `exit` a no-op, and it is exactly why the teardown
              // no longer depends on an exit animation existing.
              animate={phase === "closing" && !reducedMotion ? "exit" : "visible"}
              transition={reducedMotion ? NAV_MOTION.reduced : NAV_MOTION.open}
              onAnimationComplete={handleSheetAnimationComplete}
            >
              <div className="tl-menu-sheet">
                <div className="tl-menu-rail" aria-hidden="true"><span>00</span><small>MENU</small></div>
                <div className="tl-menu-body">
                  <div className="tl-menu-top">
                    <Link
                      to="/"
                      onClick={(event) => { event.preventDefault(); requestNavigate("/"); }}
                      className="tl-menu-brand"
                      aria-label={t("MAS Technic ana sayfa")}
                    >
                      <strong>MAS <em>TECHNIC</em></strong>
                    </Link>
                    <p className="tl-menu-meta" aria-hidden="true">
                      <span>{t("NAVİGASYON")}</span>
                      <span>{t("PAFTA")} 00/14</span>
                    </p>
                    <NavTrigger
                      open
                      reducedMotion={reducedMotion}
                      onToggle={() => requestClose(true)}
                      triggerRef={dialogTriggerRef}
                    />
                  </div>

                  <div className="tl-menu-main">
                    <nav className="tl-menu-primary" aria-label={t("Birincil navigasyon")}>
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
                        currentPath={barePath}
                        onCategoryChange={setActiveCategory}
                        onNavigate={requestNavigate}
                        reducedMotion={reducedMotion}
                      />
                    </nav>

                  </div>

                  <NavConversion currentPath={barePath} onNavigate={requestNavigate} />
                </div>
              </div>
            </motion.div>
          )}
        </>,
        document.body,
      )}
    </>
  );
};
