import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/* ══════════════════════════════════════════════════════════════════════════
   THE FRAGMENT OVERRIDE — PHASE 09b-2, ITEM 5

   WHAT WAS WRONG
   --------------
   This component destructured only `pathname` and depended only on
   `[pathname]`, then finished with
   `requestAnimationFrame(() => window.scrollTo(0, 0))`. That last line runs
   AFTER the browser's own fragment scroll, so it overrode it — on both entry
   paths, measured in Phase 08 at 2115 px below a 900 px viewport: after an SPA
   click and after a full navigation to a pasted URL.

   It broke the only cross-route hash link in the app, and that link is in a
   privacy affordance: `ChatBot.tsx` renders
   `/gizlilik-politikasi#sohbet-asistani` INSIDE the AI-consent block, so a
   reader deciding whether to send their message to a third party clicked
   "madde 06" and arrived at the top of a seven-clause document.

   The damage reached further than the link. `KVKK.tsx`'s header records that
   its cross-reference to `/gizlilik-politikasi` deliberately carries NO `#`
   fragment "because `ScrollToTop.tsx` overrides native fragment scrolling" —
   an accessibility and IA compromise taken to work around this file.

   WHY IT NEEDS MORE THAN `[pathname, hash]`
   -----------------------------------------
   Restoring the browser's native behaviour is not enough for either path:

     full navigation  the browser resolves the fragment at parse time. Routes
                      are `lazy()` in `src/App.tsx`, so at that moment the
                      clause element does not exist and the native scroll is a
                      no-op. Nothing later re-tries it.
     SPA click        react-router pushes history; the browser never performs
                      a fragment scroll for a pushState at all.

   So the target is resolved on a bounded `requestAnimationFrame` poll that
   stops the instant the element appears, and falls back to the top if it never
   does — a hash naming nothing must not leave the reader at the previous
   route's scroll offset.

   AND IT MUST GO THROUGH LENIS WHEN LENIS IS RUNNING.
   `SmoothScrollProvider` installs `window.__lenis` on desktop widths outside
   `prefers-reduced-motion`, and it owns the scroll position: a native
   `scrollIntoView()` under a running Lenis is corrected back on the next
   frame. `{ immediate: true }` is deliberate — this is a navigation landing,
   not a scroll gesture, so it must not animate, and it behaves identically
   under reduced motion where Lenis is absent.
   ══════════════════════════════════════════════════════════════════════════ */

/** ~1.5 s at 60 Hz. Bounded: a hash that names nothing must not poll forever. */
const HASH_SETTLE_FRAMES = 90;

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

    let frame = 0;
    const targetId = hash ? decodeURIComponent(hash.slice(1)) : "";

    if (!targetId) {
      toTop();
      frame = requestAnimationFrame(() => window.scrollTo(0, 0));
      return () => cancelAnimationFrame(frame);
    }

    let frames = 0;
    const settle = () => {
      const target = document.getElementById(targetId);
      if (target) {
        if (window.__lenis) {
          window.__lenis.scrollTo(target, { immediate: true });
        } else {
          target.scrollIntoView();
        }
        return;
      }
      frames += 1;
      if (frames < HASH_SETTLE_FRAMES) {
        frame = requestAnimationFrame(settle);
        return;
      }
      toTop();
    };
    frame = requestAnimationFrame(settle);
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
};
