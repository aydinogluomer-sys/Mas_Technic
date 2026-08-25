export const MENU_MOTION = {
  open: { duration: 0.62, ease: [0.77, 0, 0.175, 1] as const },
  close: { duration: 0.34, ease: [0.64, 0, 0.78, 0] as const },
  panelStagger: 0.035,
  itemStagger: 0.04,
  swap: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  reduced: { duration: 0 },
  parallax: 7,
  shellDelay: 0.16,
  railStagger: 0.035,
} as const;

export const menuRevealVariants = {
  hidden: { opacity: 0, y: 18, clipPath: "inset(0 0 100% 0)" },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    clipPath: "inset(0 0 0% 0)",
    transition: { ...MENU_MOTION.swap, delay },
  }),
};

// The conversion rail sits against the bottom safe area. Keep its reveal on
// the block axis so the animated start state never enters the home-indicator
// inset on compact viewports.
export const menuConversionRevealVariants = {
  hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)" },
  visible: (delay = 0) => ({
    opacity: 1,
    clipPath: "inset(0 0 0% 0)",
    transition: { ...MENU_MOTION.swap, delay },
  }),
};

export const MENU_LAYOUT = {
  desktopColumns: "repeat(12,minmax(0,1fr))",
  desktopGap: "clamp(1rem,1.65vw,1.5rem)",
  maxWidth: 1600,
  mobileCtaHeight: 64,
} as const;

export const menuPanelVariants = {
  closed: (index: number) => ({
    x: index === 0 ? "-102%" : index === 1 ? "102%" : 0,
    y: index === 2 ? "102%" : 0,
  }),
  open: { x: 0, y: 0 },
};
