# Reference motion fit — MAS TECHNIC

This is a fit assessment, not a claim that the reference sites use a particular
framework internally. It maps the interaction ideas supplied for this review
onto the existing MAS TECHNIC system and its 12 numbered landing bands (02–13).

## Selected architecture

| Reference quality | MAS TECHNIC placement | Treatment |
|---|---|---|
| Flexis modular product chapters | 05 process, 06 capability profiles, 07 sectors | Keep the native vertical story and usable sector scroller; no pinned horizontal takeover. |
| CKI process and strengths narrative | 05 process, 06 capability profiles, 09 quality file | Four-step process and verified evidence remain the content spine. |
| Boldium typographic authorship | 02 hero, 08 manifesto | Keep the existing Space Grotesk / Newsreader / IBM Plex Mono roles; reserve kinetic emphasis for the hero and manifesto. |
| Terminal Industries' operational interface | 11 NEXUS | Keep the five-step, user-selected demo; preserve its DEMO disclosure and real RFQ/account routes. |
| MWDT capability and industry taxonomy | 06 capability profiles, 07 sectors | Keep the evidence-led profile tables and keyboard/touch usable sector carousel. |
| bb&b process-to-proof narrative | 05 process, 06 capability profiles, 10 references | Use process and public-approved references; do not invent client projects or measurement results. |

## Chosen motion grammar

- The landing retains its existing 12-band sequence and its 2–3 motion peaks.
- A compositor-scaled, left-to-right technical-plate wipe now joins the shared
  reading reveal on public inner pages. It is triggered only when the plate is
  reached; the observer fail-safe and reduced-motion path leave the image fully
  visible.
- The graphite surfaces move from near-black to balanced graphite. Warm paper,
  the hairline grid, restrained bronze, and the supplied/local type system stay
  intact. This addresses the heavy first impression without changing the site's
  technical editorial identity.
- Responsive AVIF/WebP delivery, lazy offscreen media, IntersectionObserver
  gating, desktop-only Lenis, native mobile scroll, and `prefers-reduced-motion`
  remain the performance/accessibility boundaries.

## Deliberately not selected

| Technique | Decision |
|---|---|
| Persistent WebGL canvas and spline camera across routes | The public site is a measurement-led document; persistent cinematic 3D would compete with navigation and evidence. |
| FBO particle simulation, bloom, chromatic aberration, film grain shader | No meaningful machining measurement is communicated by these effects; cost and visual noise outweigh value. |
| Scroll lag such as `scrub: 1.5` | Adds input latency; keep the existing measured desktop Lenis and native mobile scroll. |
| Velocity-skewed headings and blanket split-text animation | Risks legibility and makes every band perform; keep kinetic type to the existing hierarchy peaks. |
| Audio linked to scroll or cursor | Unrequested sound is intrusive and adds accessibility and control requirements. |
| Site-wide magnetic cursor | The cursor remains a desktop-only affordance; do not make basic controls harder to target. |

## Acceptance evidence

- Landing band order and count: `e2e/landing/landing-structure.spec.ts`.
- Grid axes and responsive overflow: `e2e/landing/landing-grid-axes.spec.ts`,
  `e2e/landing/landing-process-flow.spec.ts`.
- Motion and reduced motion: `e2e/landing/motion-grammar.spec.ts`,
  `e2e/landing/landing-reduced-motion.spec.ts`, and `e2e/polish/prose-reveal.spec.ts`.
- Navigation, functional routes, and visual shell: critical E2E, cross-browser
  smoke, visual regression, and accessibility checks.
