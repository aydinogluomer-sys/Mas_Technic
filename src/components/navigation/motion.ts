/**
 * Menu motion, expressed in the landing's own grammar.
 *
 * `src/components/menu/menu-tokens.ts` used to be a SECOND motion vocabulary
 * (`cubic-bezier(.77,0,.175,1)`, `cubic-bezier(.64,0,.78,0)`, three sliding
 * panels) competing with the technical-landing system. It is gone. The values
 * below are the same numbers `src/styles/design-tokens.css` publishes as
 * `--tl-ease-out`, `--tl-dur-micro`, `--tl-dur-short`, `--tl-in` and
 * `--tl-step`, so the menu opens with the page's own timing rather than an
 * imported one.
 *
 * Motion never changes geometry: every variant here animates opacity and a
 * clip inset only. The open state is the layout; nothing reflows when the
 * animation is skipped, which is what makes the reduced-motion path complete
 * instead of broken.
 */

/** `--tl-ease-out` — the one easing curve of the public system. */
export const NAV_EASE = [0.16, 1, 0.3, 1] as const;

export const NAV_MOTION = {
  /** `--tl-in` */
  open: { duration: 0.62, ease: NAV_EASE },
  /** `--tl-dur-short` */
  close: { duration: 0.35, ease: NAV_EASE },
  /** `--tl-dur-micro` */
  micro: { duration: 0.22, ease: NAV_EASE },
  /** `--tl-step` — 65ms, the landing's stagger unit. */
  step: 0.065,
  /** Reduced motion is not "fast"; it is off. */
  reduced: { duration: 0 },
} as const;

/**
 * The sheet wipe. One rule sweeping down the page, the way a drawing is
 * revealed — not three sliding panels.
 */
export const navSheetVariants = {
  hidden: { clipPath: "inset(0 0 100% 0)" },
  visible: { clipPath: "inset(0 0 0% 0)" },
  exit: { clipPath: "inset(0 0 100% 0)" },
};

/** Column reveal: a hairline lifts, the content resolves under it. */
export const navRevealVariants = {
  hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
  visible: (delay = 0) => ({
    opacity: 1,
    clipPath: "inset(0 0 0% 0)",
    transition: { ...NAV_MOTION.close, delay },
  }),
};
