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

    const targetId = hash ? decodeURIComponent(hash.slice(1)) : "";

    if (!targetId) {
      toTop();
      const frame = requestAnimationFrame(() => window.scrollTo(0, 0));
      return () => cancelAnimationFrame(frame);
    }

    const land = (target: HTMLElement) => {
      if (window.__lenis) {
        window.__lenis.scrollTo(target, { immediate: true });
      } else {
        target.scrollIntoView();
      }
    };

    const tryLand = (): boolean => {
      const target = document.getElementById(targetId);
      if (!target) return false;
      land(target);
      return true;
    };

    if (tryLand()) return;

    let observer: MutationObserver | null = null;
    let timer = 0;
    const cleanup = () => {
      observer?.disconnect();
      observer = null;
      window.clearTimeout(timer);
    };

    observer = new MutationObserver(() => {
      if (tryLand()) cleanup();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    timer = window.setTimeout(() => {
      cleanup();
      toTop();
    }, HASH_SETTLE_TIMEOUT_MS);

    return cleanup;
  }, [pathname, hash]);

  return null;
};
