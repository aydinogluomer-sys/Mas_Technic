export const Z = {
  base: 0,
  content: 1,
  ambientGlow: 2,
  grain: 5,
  scrollVelocity: 8,
  cncStory: 12,
  marquee: 15,
  dotNav: 20,
  header: 50,
  mobileMenu: 60,
  pageTransition: 95,
  preloader: 100,
  /* I3. `cursor` used to be 90 — BELOW `pageTransition` (95) and `preloader`
     (100). Since the stylesheet hides the native cursor while a replacement is
     mounted, a replacement that disappears behind the route curtain is a
     pointer the user has lost for the length of the transition, and behind the
     preloader is a pointer they never had. The pointer is the topmost thing on
     the screen by definition: nothing is ever drawn on top of a cursor.

     It therefore moves to the top of the stack, which is also where
     `CustomCursor` had already independently put it — that file derives
     `Z.preloader + 1` locally because it could not edit this one, and 101 is
     that same number, so the two now agree instead of merely coinciding. */
  cursor: 101,
} satisfies Record<string, number>;

export type ZLayer = keyof typeof Z;

/** Section stacking order — ascending so each section covers the previous.
 *  NOTE: gaps are intentional (e.g. moldCast=2 removed in v3.0). Do NOT renumber. */
export const SECTION_Z = {
  hero:                    1,
  // moldCast:             2,  ← removed v3.0
  cncStory:                3,
  nexus:                   4,
  bridgeNexusHww:          5,
  howWeWork:               6,
  bridgeHwwCert:           7,
  certifications:          8,
  videoScroll:             9,
  bridgeVideoCert:         10,
  services:                11,
  glowLine:                11,
  industries:              12,
  bridgeIndProject:        13,
  projectShowcase:         14,
  materialMorph:           15,
  materials:               16,
  bridgeMaterialsWhy:      17,
  whyUs:                   18,
  bridgeWhyCap:            19,
  capabilities:            20,
  testimonials:            21,
  faqBlog:                 22,
  bridgeFaqCta:            23,
  finalCta:                24,
} satisfies Record<string, number>;
