import { MOTION_LEVEL } from "@/config/motion-system";

/**
 * Landing choreography constants, classified against the three motion levels
 * in `@/config/motion-system` (micro 0.22 / standard 0.35 / cinematic 0.62).
 *
 * Every duration here now either IS a level or carries the band it belongs to
 * and the reason it does not sit exactly on it. Values that are not durations
 * — distances, scrub factors, scroll lengths, counts, scales — are not on the
 * scale at all and are grouped separately.
 *
 * `ease: "power3.out"` is GSAP's spelling of `MOTION_EASE.enter`
 * (`cubic-bezier(.16, 1, .3, 1)` / `--tl-ease-out`). GSAP will not take the
 * array form, so it is the same curve under another name, not a fourth one.
 */
export const LANDING_MOTION = {
  /* ── durations, on the scale ─────────────────────────────────────────── */
  /** cinematic band. A band's entrance is one of the narrative moments. */
  revealDuration: 0.72,
  /** micro. Hover is response, not animation. (0.2 -> 0.22, snapped.) */
  hoverDuration: MOTION_LEVEL.micro,
  /** standard band: one preview image resolving into another. */
  previewSwap: 0.28,
  /** standard. */
  previewFollow: MOTION_LEVEL.standard,
  /** standard band, measured against `processScrub`. */
  processSwapDuration: 0.42,
  /** cinematic band — the process heading is an award moment. */
  processHeadingDuration: 0.72,
  /** micro — one pixel cell flipping. */
  decisionCoverDuration: MOTION_LEVEL.micro,
  /** standard band. */
  decisionRevealDuration: 0.28,

  /* ── stagger, not a duration ─────────────────────────────────────────── */
  /** Far below `MOTION_STEP` because ~80 cells fire: the unit is per cell and
      the perceived stagger is 10 columns x 0.004, i.e. about one step. */
  decisionStagger: 0.004,

  /* ── geometry and scroll, off the scale ──────────────────────────────── */
  scrub: 0.8,
  revealDistance: 40,
  featuredScroll: 1250,
  industryScroll: 900,
  ease: "power3.out",
  rowDrift: 16,
  cardTilt: 7,
  metricParallax: 8,
  processScrub: 0.7,
  processMediaScale: 1.04,
  processRailOffset: 42,
  processHeadingBlur: 10,
  processStageCount: 5,
  decisionPixelColumns: 10,
  decisionPixelRows: 8,
} as const;

export type LandingSceneId =
  | "top"
  | "hizmetler"
  | "endustriler"
  | "malzemeler"
  | "neden-biz"
  | "kabiliyetler"
  | "referanslar"
  | "sss"
  | "iletisim";

export interface FeaturedStory {
  id: string;
  index: string;
  title: string;
  summary: string;
  image: string;
  categoryPath: string;
  detailLinks: Array<{ label: string; path: string }>;
}

export const LANDING_SECTIONS = [
  { id: "top", label: "Başlangıç" },
  { id: "hizmetler", label: "Hizmetler" },
  { id: "endustriler", label: "Endüstriler" },
  { id: "malzemeler", label: "Malzemeler" },
  { id: "neden-biz", label: "Neden Biz" },
  { id: "kabiliyetler", label: "Kabiliyetler" },
  { id: "referanslar", label: "Referanslar" },
  { id: "sss", label: "SSS" },
  { id: "iletisim", label: "İletişim" },
] satisfies Array<{ id: LandingSceneId; label: string }>;
