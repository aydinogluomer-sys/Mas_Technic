export const LANDING_MOTION = {
  scrub: 0.8,
  revealDistance: 40,
  revealDuration: 0.72,
  hoverDuration: 0.2,
  featuredScroll: 1250,
  industryScroll: 900,
  ease: "power3.out",
  previewSwap: 0.28,
  previewFollow: 0.35,
  rowDrift: 16,
  cardTilt: 7,
  metricParallax: 8,
  processScrub: 0.7,
  processMediaScale: 1.04,
  processRailOffset: 42,
  processSwapDuration: 0.42,
  processHeadingBlur: 10,
  processHeadingDuration: 0.72,
  processStageCount: 5,
  decisionPixelColumns: 10,
  decisionPixelRows: 8,
  decisionCoverDuration: 0.22,
  decisionRevealDuration: 0.28,
  decisionStagger: 0.004,
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
