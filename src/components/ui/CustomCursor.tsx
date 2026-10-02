/**
 * THE CURSOR — kept, but only the half that says something.
 * =========================================================
 *
 * `mas-motion-system` lets a custom cursor stay only if it encodes
 * measurement or interaction semantics. Phase 04 deleted `ScrollProgress` on
 * that test. This one passes it, but only in part, so only that part stays.
 *
 * WHAT EARNS ITS PLACE
 * --------------------
 * The label. Hovering a family says "Seç", a category says "Aç", a project
 * says "Keşfet", a material says "Çevir", a testimonial says "Oku". The cursor
 * names the KIND of interaction the thing under it supports, before the click
 * — the same job a probe does when it tells you what it is about to measure.
 * That is interaction semantics, and it is content-typed rather than generic.
 *
 * WHAT DID NOT EARN ITS PLACE, AND IS GONE
 * ----------------------------------------
 *   - A blanket `a[href], .nav-link, button` rule that scaled the ring 1.3x
 *     with an EMPTY label. It fired on every link and button on the page and
 *     said nothing: the generic awards-site cursor, i.e. decoration.
 *   - `mixBlendMode: difference` on the dot — a blend mode on a fixed overlay
 *     repainting on every pointer move, bought nothing but a look.
 *   - A "tick" sound on every hover. Audio on pointer entry is not
 *     measurement. (`use-sound` keeps three other consumers —
 *     `MagneticButton`, `BracketButton`, `HeroSection` — so the hook stays.)
 *
 * WHY IT NOW RENDERS UNDER REDUCED MOTION
 * ---------------------------------------
 * `src/index.css` sets `cursor: none !important` on html/body/a/button inside
 * `@media (min-width: 901px) and (pointer: fine)` — unconditionally, with no
 * reduced-motion escape and no dependency on a replacement existing. This
 * component used to return `null` for `prefers-reduced-motion` users, which
 * left them with NO POINTER AT ALL on desktop. Measured before this change,
 * `node scripts/motion-audit.mjs --mode=cursor` reported, at 1280 under
 * `reduce`: `body=none link=none button=none replacementNodes=0`.
 *
 * So under reduced motion it still renders, and it is still not animated: the
 * ring is written straight to the pointer position with no easing, no trailing
 * lag and no scale tween, and the label appears instantly instead of fading.
 * Nothing moves that the pointer is not already moving.
 *
 * (The better long-term fix is to scope that `cursor: none` rule to the case
 * where a replacement is actually mounted. `src/index.css` is outside this
 * packet's write allowlist, so it is reported rather than edited.)
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "@/hooks/use-gsap";
import { usePrefersReducedMotion } from "@/hooks/use-reduced-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Z } from "@/styles/z-index";
import { MOTION_LEVEL } from "@/config/motion-system";

interface CursorLabel {
  text: string;
  scale: number;
}

/**
 * Every entry must name the interaction. An entry with an empty `text` is
 * decoration and does not belong in this list.
 */
const SELECTORS: Array<{ selector: string; label: CursorLabel }> = [
  { selector: "[data-cursor='family']", label: { text: "Seç", scale: 1.65 } },
  { selector: "[data-cursor='category']", label: { text: "Aç", scale: 1.65 } },
  { selector: "[data-cursor='open']", label: { text: "Git", scale: 1.65 } },
  { selector: ".gsap-project-card, [data-cursor='kesfet']", label: { text: "Keşfet", scale: 2 } },
  { selector: ".material-card, [data-cursor='cevir']", label: { text: "Çevir", scale: 1.8 } },
  { selector: ".hww-card, [data-cursor='detail']", label: { text: "Detay", scale: 1.8 } },
  { selector: ".testimonial-stack-card", label: { text: "Oku", scale: 1.6 } },
  { selector: ".service-item, [data-cursor='hizmet']", label: { text: "Detay", scale: 1.8 } },
  { selector: "[data-cursor='zoom']", label: { text: "Zoom", scale: 2 } },
  { selector: "[data-cursor='teklif']", label: { text: "Teklif", scale: 2 } },
];

/**
 * The pointer is the topmost thing on the screen. It used to sit at 101 inside
 * `#root`, BELOW the fixed header (10000) and the fullscreen menu (10010,
 * portaled to `body`) — while `src/index.css` kept the native cursor hidden,
 * so over the header and the menu there was no pointer at all. The layers are
 * now portaled to `body` at `Z.cursor`, above both.
 *
 * Being on top, the layers must not paint before a pointer exists: they start
 * transparent and arm on the first `pointermove`, and disarm when the pointer
 * leaves the document. A page captured with no pointer moved therefore contains
 * no cursor pixel — see `e2e/visual/cursor-overlay-guard.spec.ts`.
 */
const CURSOR_Z = Z.cursor;

export const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const [finePointer, setFinePointer] = useState(false);
  const quickToX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const quickToY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const ringQuickToX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const ringQuickToY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  // The stylesheet hides the native cursor on `(pointer: fine)` only, so the
  // replacement must exist under exactly that condition and no other.
  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    const sync = () => setFinePointer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const armed = useRef(false);
  const setArmed = useCallback((next: boolean) => {
    if (armed.current === next) return;
    armed.current = next;
    for (const node of [dotRef.current, ringRef.current]) {
      if (node) node.dataset.armed = next ? "true" : "false";
    }
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      setArmed(true);
      if (prefersReduced) {
        // No easing, no trail: the ring IS the pointer, written directly.
        const place = (node: HTMLElement | null) => {
          if (node) {
            node.style.transform =
              `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;
          }
        };
        place(dotRef.current);
        place(ringRef.current);
        return;
      }
      quickToX.current?.(event.clientX);
      quickToY.current?.(event.clientY);
      ringQuickToX.current?.(event.clientX);
      ringQuickToY.current?.(event.clientY);
    },
    [prefersReduced, setArmed],
  );

  const handlePointerOver = useCallback(
    (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      const ring = ringRef.current;
      const label = labelRef.current;
      if (!ring || !label) return;

      const match = SELECTORS.find(({ selector }) => target.closest(selector));

      if (prefersReduced) {
        // A state change, not a transition: the label appears, the ring holds.
        label.textContent = match?.label.text ?? "";
        label.style.opacity = match ? "1" : "0";
        return;
      }

      if (match) {
        gsap.to(ring, { scale: match.label.scale, duration: MOTION_LEVEL.micro, ease: "power2.out" });
        label.textContent = match.label.text;
        gsap.to(label, { opacity: 1, duration: MOTION_LEVEL.micro });
        return;
      }

      gsap.to(ring, { scale: 1, duration: MOTION_LEVEL.micro, ease: "power2.out" });
      gsap.to(label, { opacity: 0, duration: MOTION_LEVEL.micro });
    },
    [prefersReduced],
  );

  useEffect(() => {
    if (isMobile || !finePointer) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring) return;

    if (!prefersReduced) {
      quickToX.current = gsap.quickTo(dot, "x", { duration: 0.08, ease: "none" });
      quickToY.current = gsap.quickTo(dot, "y", { duration: 0.08, ease: "none" });
      ringQuickToX.current = gsap.quickTo(ring, "x", { duration: MOTION_LEVEL.micro, ease: "power2.out" });
      ringQuickToY.current = gsap.quickTo(ring, "y", { duration: MOTION_LEVEL.micro, ease: "power2.out" });
    }

    const disarm = () => setArmed(false);
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerover", handlePointerOver);
    document.documentElement.addEventListener("pointerleave", disarm);

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerover", handlePointerOver);
      document.documentElement.removeEventListener("pointerleave", disarm);
      armed.current = false;
      gsap.killTweensOf([dot, ring, label].filter(Boolean) as Element[]);
      quickToX.current = null;
      quickToY.current = null;
      ringQuickToX.current = null;
      ringQuickToY.current = null;
    };
  }, [prefersReduced, isMobile, finePointer, handlePointerMove, handlePointerOver, setArmed]);

  if (isMobile || !finePointer) return null;

  return createPortal(
    <>
      {/* The dot: where the pointer actually is. */}
      <div
        ref={dotRef}
        data-custom-cursor="dot"
        data-armed="false"
        aria-hidden="true"
        className="mas-cursor fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: CURSOR_Z,
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: "var(--tl-bronze)",
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* The ring: what the thing under the pointer is offering. */}
      <div
        ref={ringRef}
        data-custom-cursor="ring"
        data-armed="false"
        aria-hidden="true"
        className="mas-cursor fixed top-0 left-0 pointer-events-none flex items-center justify-center"
        style={{
          zIndex: CURSOR_Z - 1,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1px solid var(--tl-bronze)",
          transform: "translate(-50%, -50%)",
        }}
      >
        <span
          ref={labelRef}
          className="text-[7px] uppercase tracking-[0.12em] font-mono font-semibold select-none"
          style={{ color: "var(--tl-bronze)", opacity: 0 }}
        />
      </div>
    </>,
    document.body,
  );
};
