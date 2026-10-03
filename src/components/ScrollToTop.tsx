import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/* ══════════════════════════════════════════════════════════════════════════
   FRAGMENT-AWARE SCROLL RESET — PHASE 09b-2 ITEM 5, BOUND FIXED IN 09b-3

   Without a hash: reset to the top on every route change (the pre-09b-2
   behaviour). With a hash: land on the clause it names, on both entry paths.

     full navigation  routes are `lazy()`, so the clause element does not
                      exist when the browser resolves the fragment; the
                      native scroll is a no-op and nothing retries it.
     SPA click        react-router pushes history; the browser never performs
                      a fragment scroll for a pushState at all.

   The target is therefore awaited, not polled. A `MutationObserver` on
   `document.body` lands the reader the moment the element appears, and a
   wall-clock cap falls back to the top if it never does — a hash naming
   nothing must not leave the reader at the previous route's offset.

   09b-3 replaced a 90-frame `requestAnimationFrame` poll: a frame count is a
   clock in disguise, and at 4× CPU the lazy chunk had not rendered the target
   before it ran out. The observer is bound by the event, not by time.

   Lenis owns the scroll position on desktop outside `prefers-reduced-motion`
   (`window.__lenis`), and a native `scrollIntoView()` under it is corrected
   back on the next frame — so landings go through Lenis with
   `{ immediate: true }`: a navigation landing, not a gesture.
   ══════════════════════════════════════════════════════════════════════════ */

/** Wall-clock cap for a hash whose target never appears. Generous by design:
 *  it is a fallback for a missing element, not a budget for a slow chunk. */
const HASH_SETTLE_TIMEOUT_MS = 8000;

/** How long a landing is held while the page above the target is still
 *  laying out. Ends earlier on the reader's first scroll input. */
const LANDING_HOLD_MS = 4000;
const USER_SCROLL_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.overflow = "";

    const toTop = () => {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
    };

    /* A malformed escape (`#%`, `#%E0%A4`) makes `decodeURIComponent` throw,
       and this component sits outside the route boundary — so it is treated
       as a fragment with no target instead of taking the whole site down. */
    let targetId = "";
    try {
      targetId = hash ? decodeURIComponent(hash.slice(1)) : "";
    } catch {
      targetId = "";
    }

    if (!targetId) {
      toTop();
      const frame = requestAnimationFrame(() => window.scrollTo(0, 0));
      return () => cancelAnimationFrame(frame);
    }

    const land = (target: HTMLElement) => {
      if (window.__lenis) {
        /* Lenis clamps a scroll target to the scroll limit it measured last.
           Created while the route was still short, it held a limit of 72 px
           and landed every deep target there — the 09b-2 flake. Re-measure
           before landing. */
        window.__lenis.resize();
        window.__lenis.scrollTo(target, { immediate: true });
      } else {
        target.scrollIntoView();
      }
    };

    /* HOLD THE LANDING WHILE THE PAGE ABOVE IT SETTLES (09b-2 flake, B2).
       The target can exist before what precedes it has laid out — the rest of
       the route, images, fonts. Measured on /gizlilik-politikasi#sohbet-asistani:
       in 6 of 8 cold loads Lenis landed at y=72 and the clause was then pushed
       to 2806 px below the top as the page grew. A one-shot landing cannot
       know that, so after landing, every change in the document's size lands
       again — until the reader scrolls (their input wins at once) or the hold
       ends. */
    let resizeObserver: ResizeObserver | null = null;
    let holdTimer = 0;
    const releaseHold = () => {
      resizeObserver?.disconnect();
      resizeObserver = null;
      window.clearTimeout(holdTimer);
      USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, releaseHold, true));
    };
    const holdLanding = (target: HTMLElement) => {
      if (typeof ResizeObserver === "undefined") return;
      resizeObserver = new ResizeObserver(() => {
        if (!target.isConnected) return releaseHold();
        if (Math.abs(target.getBoundingClientRect().top) > 2) land(target);
      });
      resizeObserver.observe(document.body);
      holdTimer = window.setTimeout(releaseHold, LANDING_HOLD_MS);
      USER_SCROLL_EVENTS.forEach((type) => window.addEventListener(type, releaseHold, { capture: true, passive: true }));
    };

    const tryLand = (): boolean => {
      const target = document.getElementById(targetId);
      if (!target) return false;
      land(target);
      holdLanding(target);
      return true;
    };

    if (tryLand()) return releaseHold;

    let observer: MutationObserver | null = null;
    let timer = 0;
    const stopWaiting = () => {
      observer?.disconnect();
      observer = null;
      window.clearTimeout(timer);
    };

    observer = new MutationObserver(() => {
      if (tryLand()) stopWaiting();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    timer = window.setTimeout(() => {
      stopWaiting();
      toTop();
    }, HASH_SETTLE_TIMEOUT_MS);

    return () => {
      stopWaiting();
      releaseHold();
    };
  }, [pathname, hash]);

  return null;
};
