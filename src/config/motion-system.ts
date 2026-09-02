/**
 * THE MOTION SCALE — three levels, one vocabulary.
 * ================================================
 *
 * The site had four sets of timing numbers in circulation: this file, the
 * landing's `landing-motion.ts`, the menu's `navigation/motion.ts`, and the
 * CSS custom properties in `styles/design-tokens.css`. The menu's set was
 * already reconciled with the CSS one in Phase 03. This block finishes the
 * job by naming the three levels those two agree on, so nothing has to invent
 * a fourth.
 *
 *   micro      0.22s  `--tl-dur-micro`, `NAV_MOTION.micro`
 *              A state change on one control: hover, focus, a toggle, a swap
 *              the eye is already looking at. Short enough that it reads as
 *              response, not as animation.
 *
 *   standard   0.35s  `--tl-dur-short`, `NAV_MOTION.close`
 *              The default. One element entering, leaving, or resolving —
 *              a reveal, a panel closing, a preview following the pointer.
 *
 *   cinematic  0.62s  `--tl-in`, `NAV_MOTION.open`
 *              Reserved for the few moments that carry the narrative: the
 *              menu opening, a band's entrance, an award moment. If everything
 *              is cinematic, nothing is.
 *
 *   step       0.065s `--tl-step`
 *              The stagger unit between siblings. Not a duration.
 *
 *   reduced    0        Reduced motion is not "fast", it is off.
 *
 * WHAT IS *NOT* SNAPPED TO THE SCALE
 * ----------------------------------
 * Some numbers below sit between levels because they were measured against
 * each other, not chosen: `ROUTE_TRANSITION.holdDuration` is the clearest
 * case, and its comment says so. Those keep their literal and carry the level
 * they belong to as a band annotation. Retuning them is a choreography
 * decision, not a token decision, and is deliberately left alone here.
 */
export const MOTION_LEVEL = {
  micro: 0.22,
  standard: 0.35,
  cinematic: 0.62,
} as const;

/** The stagger unit between siblings — `--tl-step`. Not a duration. */
export const MOTION_STEP = 0.065;

/**
 * The reduced-motion contract, in one object.
 * `@/components/shell/motion` applies this to every reveal when the user has
 * asked for reduced motion; `NAV_MOTION.reduced` is the same value.
 */
export const MOTION_REDUCED = { duration: 0 } as const;

export type MotionLevel = keyof typeof MOTION_LEVEL;

/**
 * `precision` — the machining curve: hard in, hard out. Cuts and clips.
 * `enter`     — `--tl-ease-out` / `NAV_EASE`. Everything that arrives.
 *
 * There is no third curve. A component that wants one is asking for a
 * different level, not a different easing.
 */
export const MOTION_EASE = {
  precision: [0.76, 0, 0.24, 1],
  enter: [0.16, 1, 0.3, 1],
} as const;

export const ROUTE_TRANSITION = {
  /** standard band, measured against `holdDuration` below. */
  coverDuration: 0.30,
  /** Beş panelin AYNI ANDA kapalı durduğu aralık.
      Stagger yayılımından (4 × panelStagger = .12s) uzun olmak ZORUNDA;
      aksi halde ilk panel açılmaya başlarken sonuncusu henüz kapanmamış olur
      ve perde viewport'u hiçbir karede tam kapatmaz.
      Ölçüldü: .24 → .42 → .62 denendi; .42 en iyi sonucu verdi. Genişletmek
      sezgisel olarak yardımcı görünüyor ama .62'de sonuç KÖTÜLEŞTİ — toplam
      geçiş uzadıkça rota içeriği ve perde arasındaki zamanlama ilişkisi
      bozuluyor. Bu değeri değiştirmeden önce ölç. */
  /** standard band. Measured — see the note above; do not snap it to 0.35. */
  holdDuration: 0.42,
  /** standard band; 0.34 is 0.35 within a frame at 60Hz. */
  revealDuration: MOTION_LEVEL.standard,
  /** Half a `MOTION_STEP`: five panels have to spread inside `holdDuration`. */
  panelStagger: 0.03,
  /** cinematic band, measured: the content must still be moving as the
      curtain lifts, so this outlasts `revealDuration`. */
  contentDuration: 0.48,
  contentOffset: 18,
  blur: 8,
} as const;

export const SECTION_TRANSITION = {
  crossThemeHeight: "clamp(48px, 8vw, 112px)",
  sameThemeHeight: "clamp(32px, 4vw, 64px)",
  seamTravel: 26,
  glowOpacity: 0.18,
} as const;
