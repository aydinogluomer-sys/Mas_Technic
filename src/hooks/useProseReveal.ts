import { useEffect } from "react";

/* ══════════════════════════════════════════════════════════════════════════
   PROSE REVEAL — long text arrives as the reader reaches it (round 2, item 8)

   On inner pages, reading-length copy below the fold waits at low opacity and
   comes up to full as it scrolls into the reading zone; it never fades back.
   The dim state exists ONLY under `html[data-prose-reveal="on"]`, which this
   hook sets after it is running — so no text is ever dim without the code
   that will undim it. The CSS side adds `@media (scripting: none)` and
   reduced-motion overrides to full opacity. If the observer is not running
   within FAILSAFE_MS the attribute is removed and everything stays readable.

   Test lanes set `localStorage.mas_prose_reveal = "off"` (playwright.config.ts)
   so full-page audits measure text at its resting contrast;
   e2e/polish/prose-reveal.spec.ts turns it back on and measures the effect.
   ══════════════════════════════════════════════════════════════════════════ */
export const PROSE_REVEAL_SELECTOR = [
  ".shell-prose p",
  ".shell-prose li",
  ".shell-lede",
  ".shell-title-block > p",
  ".shell-index-desc",
  ".shell-faq-answer",
  ".shell-run-detail",
  ".shell-doc-section-body p",
  ".shell-next-lede",
  ".shell-detail-lede",
].join(", ");

const FAILSAFE_MS = 3000;

export function useProseReveal(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (window.localStorage.getItem("mas_prose_reveal") === "off") return;
    } catch { /* storage blocked: reveal still runs */ }
    if (!("IntersectionObserver" in window)) return;

    const root = document.documentElement;
    let running = false;
    const failsafe = window.setTimeout(() => {
      if (!running) root.removeAttribute("data-prose-reveal");
    }, FAILSAFE_MS);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-read", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0 },
    );

    const scan = () => {
      const fold = window.innerHeight * 0.88;
      document.querySelectorAll(PROSE_REVEAL_SELECTOR).forEach((element) => {
        if (element.hasAttribute("data-read") || element.hasAttribute("data-watched")) return;
        element.setAttribute("data-watched", "");
        // Already on screen at load: never dimmed.
        if (element.getBoundingClientRect().top < fold) element.setAttribute("data-read", "");
        else observer.observe(element);
      });
    };

    scan();
    root.setAttribute("data-prose-reveal", "on");
    running = true;

    // Lazily rendered bodies (route chunks, filters) are picked up as they land.
    let frame = 0;
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    const main = document.getElementById("main-content") ?? document.body;
    mutations.observe(main, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(failsafe);
      cancelAnimationFrame(frame);
      observer.disconnect();
      mutations.disconnect();
      root.removeAttribute("data-prose-reveal");
      document.querySelectorAll("[data-watched]").forEach((element) => element.removeAttribute("data-watched"));
    };
  }, [enabled]);
}
