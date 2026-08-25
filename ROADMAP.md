# ROADMAP.md
> Tek kaynak. Tüm dokümantasyon kararları burada izlenir.
> Bir madde tamamlanınca → ilgili lean doc'a compact özet eklenir → burada işaretlenir.
> AI bu dosyayı okumaz. Sen okursun.

---

## PHASE 1 — Çekirdek (Önce Bunlar)

### Root
- [ ] README.md
- [x] CLAUDE.md / AGENTS.md — master AI loader
- [x] MASTER_CONTEXT.md — her session'da yüklenen 300 satır özet
- [x] ACTIVE_TASK.md — şu an ne yapıyoruz, session hafızası
- [x] .env.example

### Proje Temeli
- [x] 00 · project-brief — proje özeti, hedefler, kısıtlar, paydaşlar
- [x] 01 · product-requirements — fonksiyonel, teknik, içerik gereksinimleri
- [x] 02 · success-metrics — KPI'lar, conversion, performans hedefleri

### Tasarım Sistemi (JSON önce, prose sonra)
- [x] design-tokens.json — renkler, spacing, shadows, z-index (inline JSON)
- [x] motion-tokens.json — duration, easing, stagger, scroll değerleri (inline JSON)
- [x] 06 · design-system — color, spacing, radius, shadow, grid, depth sistemi
- [x] 07 · motion-system — scroll, transitions, hover, loading, reveal, cinematic
- [x] 09 · responsive-rules — mobile, tablet, desktop, ultrawide, overflow kuralları

### Mühendislik Çekirdeği
- [x] 10 · tech-stack — frontend, animation, hosting, AI tooling, forbidden tech
- [x] 11 · app-architecture — routing, feature, rendering, state, component ownership
- [x] 12 · folder-structure — app, components, features, services, utils, shared
- [x] 13 · forbidden-patterns — animation spaghetti, z-index chaos, hardcoded values
- [x] 14 · animation-architecture — GSAP ownership, ScrollTrigger lifecycle, cleanup

### AI Sistemi
- [x] ai-coding-rules — file editing, forbidden actions, testing, refactor, animation kuralları
- [x] ai-failure-patterns — responsive, animation, architecture drift, dependency chaos
- [x] context-loading-order — L0/L1/L2 yükleme protokolü, token budget kuralları
- [x] prompt-library — gerçek copy-paste Claude Code prompt'ları (teori değil)

### Operasyon
- [x] decision-log — tarihli kararlar, gerekçeler
- [x] task-backlog — phase 1/2/3 görevleri
- [x] release-checklist — pre-release, build, content, SEO, post-release

---

## KOD FAZLARI — Tamamlanan

### Faz 5 — Performance & Awwwards Criteria ✅ TAMAMLANDI (2026-05-12)
- [x] `src/index.css` — body::after grain'den will-change: auto kaldırıldı (contain: strict yeterli)
- [x] `src/components/BlurImage.tsx` — priority prop (eager/lazy) + decoding="async"
- [x] `index.html` — Supabase CDN preconnect eklendi
- [x] ScrollTrigger batching: HeroSection/HowWeWork scrub-choreography batch'lenemez; useStaggeredReveal zaten batch'liyor
- [x] font-display:swap Google Fonts URL'sinde zaten mevcuttu
- [x] Build: `npm run build` temiz

### Faz 4 — Interaction Polish ✅ TAMAMLANDI (2026-05-12)
- [x] `src/components/ui/CustomCursor.tsx` — velocity-reactive ring scale (hoverScaleRef × velocityMultRef)
- [x] `src/components/ui/BrutalCrosshairCursor.tsx` — velocity-reactive dot scale (inline scroll listener)
- [x] `src/index.css` — hover transition baseline: a/button/[role=button] cubic-bezier(0.76,0,0.24,1)
- [x] `src/components/PageTransition.tsx` — exit 0.5s→0.4s + forge-molten/forge-teal route colors
- [x] Build: `npm run build` temiz

### Faz 3 — Visual Elevation ✅ TAMAMLANDI (2026-05-12)
- [x] `src/hooks/useHeroEntrance.ts` — cinematic cold-load entrance (grid, tags, headline gate, CTA, canvas)
- [x] `src/components/HeroSection.tsx` — showHeadline state gate + heroCanvasRef + ctaButtonRef
- [x] `src/components/HeadlineStagger.tsx` — velocity-reactive skewX (±3deg, useScrollVelocity)
- [x] `src/index.css` — section-pin, depth-layer-{1,2,3}, reveal-clip-vertical, text-balance
- [x] Build: `npm run build` temiz

### Faz 2 — Animation Architecture ✅ TAMAMLANDI (2026-05-12)
- [x] `src/lib/animation-manager.ts` — singleton registerPlugin, batchReveal, killAll
- [x] `src/hooks/use-gsap.ts` — animation-manager'dan re-export only
- [x] `src/hooks/useScrollAnimation.ts` — universal scroll hook, reduced-motion, gsap.context cleanup
- [x] `SmoothScrollProvider.tsx` — duplicate registerPlugin kaldırıldı + Lenis tuning (lerp:0.065, wheelMultiplier:0.75, exponential easing)
- [x] `useStaggeredReveal.ts` + `LavaTypographyScene.tsx` + `MoldCastScene.tsx` — duplicate registerPlugin kaldırıldı
- [x] Build: `npm run build` temiz

---

## PHASE 2 — İhtiyaç Çıkınca Ekle

### UX & IA
- [ ] 03 · ux-ia-flows — user personas, flows, information architecture
  - [ ] 004.1 primary-persona
  - [ ] 004.2 secondary-persona
  - [ ] 004.3 edge-case-personas
  - [ ] 004.4 buyer-persona
  - [ ] 004.5 user-motivations
  - [ ] 004.6 user-frustrations
  - [ ] 004.7 behavior-patterns
  - [ ] 005.1 entry-flow
  - [ ] 005.2 navigation-flow
  - [ ] 005.3 conversion-flow
  - [ ] 005.4 contact-flow
  - [ ] 005.5 mobile-flow
  - [ ] 005.6 fallback-flow
  - [ ] 006.1 site-hierarchy
  - [ ] 006.2 content-grouping
  - [ ] 006.3 navigation-logic
  - [ ] 006.4 page-relationships
  - [ ] 006.5 content-priority

### Screen Map
- [ ] 007.1 homepage-map
- [ ] 007.2 about-map
- [ ] 007.3 services-map
- [ ] 007.4 case-study-map
- [ ] 007.5 contact-map

### Navigasyon
- [ ] 008.1 desktop-navigation
- [ ] 008.2 mobile-navigation
- [ ] 008.3 footer-navigation
- [ ] 008.4 hidden-navigation-patterns

### Bileşen Sistemi
- [ ] 08 · component-system
  - [ ] 010.1 button-components
  - [ ] 010.2 card-components
  - [ ] 010.3 navigation-components
  - [ ] 010.4 form-components
  - [ ] 010.5 modal-components
  - [ ] 010.6 layout-components
- [ ] component-spec-template — props, states, motion, content slots, breakpoints
- [ ] page-spec-template — per-page contract

### Tasarım Detayları
- [ ] 013 · ui-pattern-library
  - [ ] 013.1 hero-patterns
  - [ ] 013.2 feature-patterns
  - [ ] 013.3 cta-patterns
  - [ ] 013.4 gallery-patterns
  - [ ] 013.5 dashboard-patterns
- [ ] 014 · accessibility
  - [ ] 014.1 color-contrast
  - [ ] 014.2 keyboard-navigation
  - [ ] 014.3 screen-reader-rules
  - [ ] 014.4 motion-accessibility
  - [ ] 014.5 focus-management
- [ ] 018 · component-inventory
  - [ ] 018.1 active-components
  - [ ] 018.2 deprecated-components
  - [ ] 018.3 shared-components
  - [ ] 018.4 page-specific-components
- [ ] 021 · ui-state-rules
  - [ ] 021.1 loading-states
  - [ ] 021.2 empty-states
  - [ ] 021.3 error-states
  - [ ] 021.4 success-states
  - [ ] 021.5 disabled-states
- [ ] 025 · media-asset-guidelines
  - [ ] 025.1 image-ratios
  - [ ] 025.2 video-guidelines
  - [ ] 025.3 compression-rules
  - [ ] 025.4 color-grading
  - [ ] 025.5 thumbnail-strategy

### Animasyon Detayları
- [ ] 031 · microinteraction-spec
  - [ ] 031.1 button-hover
  - [ ] 031.2 card-hover
  - [ ] 031.3 link-animations
  - [ ] 031.4 cursor-behavior
- [ ] 038 · motion-fallback-system
  - [ ] 038.1 low-end-devices
  - [ ] 038.2 reduced-motion
  - [ ] 038.3 mobile-fallbacks
  - [ ] 038.4 performance-fallbacks
- [ ] 057 · animation-performance-budget
  - [ ] 057.1 max-active-animations
  - [ ] 057.2 scrolltrigger-limits
  - [ ] 057.3 mobile-reductions
  - [ ] 057.4 blur-limits
  - [ ] 057.5 video-limits

### Mühendislik Detayları
- [ ] 042 · code-style-guide
  - [ ] 042.1 typescript-rules
  - [ ] 042.2 react-rules
  - [ ] 042.3 tailwind-rules
  - [ ] 042.4 animation-rules
  - [ ] 042.5 naming-rules
  - [ ] 042.6 file-organization
- [ ] 043 · state-management
  - [ ] 043.1 global-state
  - [ ] 043.2 server-state
  - [ ] 043.3 local-state
  - [ ] 043.4 form-state
  - [ ] 043.5 animation-state
  - [ ] 043.6 cache-state
- [ ] 051 · performance-budget
  - [ ] 051.1 lighthouse-targets
  - [ ] 051.2 animation-budget
  - [ ] 051.3 image-budget
  - [ ] 051.4 js-budget
  - [ ] 051.5 font-budget
  - [ ] 051.6 mobile-budget
- [ ] 053 · dependency-policy
  - [ ] 053.1 approved-packages
  - [ ] 053.2 forbidden-packages
  - [ ] 053.3 version-policy
  - [ ] 053.4 update-policy
- [ ] 056 · frontend-performance-rules
  - [ ] 056.1 transform-animations
  - [ ] 056.2 gpu-usage
  - [ ] 056.3 scroll-performance
  - [ ] 056.4 layout-optimization
  - [ ] 056.5 mobile-optimization
- [ ] 058 · deployment-architecture
  - [ ] 058.1 vercel-setup
  - [ ] 058.2 cloudflare-rules
  - [ ] 058.3 cdn-strategy
  - [ ] 058.4 edge-functions
  - [ ] 058.5 deployment-pipeline
- [ ] 060 · rendering-strategy
  - [ ] 060.1 ssr
  - [ ] 060.2 csr
  - [ ] 060.3 isr
  - [ ] 060.4 streaming
  - [ ] 060.5 hydration-boundaries
- [ ] 061 · asset-loading-strategy
  - [ ] 061.1 image-loading
  - [ ] 061.2 video-loading
  - [ ] 061.3 font-loading
  - [ ] 061.4 sequence-loading
  - [ ] 061.5 priority-rules
- [ ] 063 · anti-pattern-library
  - [ ] 063.1 performance-antipatterns
  - [ ] 063.2 motion-antipatterns
  - [ ] 063.3 layout-antipatterns
  - [ ] 063.4 accessibility-antipatterns
  - [ ] 063.5 maintainability-antipatterns

### Brand & Strateji
- [ ] 02 · brand-strategy
  - [ ] 088.1 market-position
  - [ ] 088.2 premium-positioning
  - [ ] 088.3 differentiation
  - [ ] 089.1 personality-traits
  - [ ] 089.2 brand-archetype
  - [ ] 089.3 emotional-tone
  - [ ] 090.1 voice-principles
  - [ ] 090.2 tone-range
  - [ ] 090.3 copy-rules
  - [ ] 090.4 forbidden-phrases
  - [ ] 090.5 example-copy
  - [ ] 091.1 primary-value
  - [ ] 091.2 secondary-value
  - [ ] 091.3 proof-points
  - [ ] 092.1 social-proof
  - [ ] 092.2 case-proof
  - [ ] 092.3 technical-proof
  - [ ] 094.1 buyer-fears
  - [ ] 094.2 buyer-desires
  - [ ] 094.3 decision-triggers
  - [ ] 094.4 objection-map

### İçerik & Kopya
- [ ] 04 · content-copy-system
  - [ ] 103.1 content-pillars
  - [ ] 103.2 page-content
  - [ ] 103.3 case-study-content
  - [ ] 104.1 headline-rules
  - [ ] 104.2 body-copy-rules
  - [ ] 104.3 cta-copy-rules
  - [ ] 104.4 editorial-tone
  - [ ] 104.5 forbidden-copy
  - [ ] 110.1 hero-copy
  - [ ] 110.2 problem-copy
  - [ ] 110.3 solution-copy
  - [ ] 110.4 proof-copy
  - [ ] 110.5 cta-copy
- [ ] content.md — gerçek copy, headlines, body text (AI için)

### SEO & Analytics
- [ ] 108 · seo-metadata-system
  - [ ] 108.1 title-rules
  - [ ] 108.2 description-rules
  - [ ] 108.3 opengraph-rules
  - [ ] 108.4 structured-data
  - [ ] 108.5 canonical-rules
- [ ] 105 · analytics-events
  - [ ] 105.1 page-events
  - [ ] 105.2 click-events
  - [ ] 105.3 scroll-events
  - [ ] 105.4 form-events
  - [ ] 105.5 conversion-events

### Operasyon Detayları
- [ ] 128 · testing-strategy
  - [ ] 128.1 unit-testing
  - [ ] 128.2 ui-testing
  - [ ] 128.3 motion-testing
  - [ ] 128.4 mobile-testing
  - [ ] 128.5 performance-testing
- [ ] 133 · definition-of-done
  - [ ] 133.1 design-done
  - [ ] 133.2 engineering-done
  - [ ] 133.4 performance-done
  - [ ] 133.5 release-done
- [ ] 138 · design-critique-checklist
  - [ ] 138.1 hierarchy-check
  - [ ] 138.2 spacing-check
  - [ ] 138.3 typography-check
  - [ ] 138.4 motion-check
  - [ ] 138.5 premium-feel-check
- [ ] 139 · awwwards-evaluation-checklist
  - [ ] 139.1 design-score
  - [ ] 139.2 usability-score
  - [ ] 139.3 creativity-score
  - [ ] 139.4 content-score
  - [ ] 139.5 developer-score
- [ ] 140 · pre-launch-audit
  - [ ] 140.1 lighthouse-audit
  - [ ] 140.2 accessibility-audit
  - [ ] 140.3 responsive-audit
  - [ ] 140.4 animation-audit
  - [ ] 140.5 seo-audit
- [ ] buglog — ui, animation, responsive, production hataları
- [ ] changelog — feature, bugfix, design, architecture değişiklikleri

### Referanslar & Snippet'lar
- [ ] 20 · reference-index — awwwards, dribbble, motion, typography, layouts
- [ ] /references klasörü — binary assets (screenshot, video, gif)
  - [ ] /awwwards
  - [ ] /dribbble
  - [ ] /motion
  - [ ] /typography
  - [ ] /color
  - [ ] /layouts
  - [ ] /interactions
- [ ] /snippets klasörü — çalışan kod parçaları ← **OLUŞTURULDU**
  - [x] /gsap
  - [x] /lenis
  - [x] /transitions
  - [x] /motion
  - [x] /three

---

## DEFER — Şimdi Değil

> Bu maddeler gerçek ihtiyaç doğana kadar açılmaz.

### Backend (CMS/API gerektiren projelerde aç)
- [ ] 064 · backend-architecture
- [ ] 065 · api-architecture
- [ ] 066 · database-architecture
- [ ] 067 · orm-schema-rules
- [ ] 068 · authentication-flow
- [ ] 069 · authorization-rbac
- [ ] 070 · file-storage-system
- [ ] 071 · cache-strategy
- [ ] 072 · background-jobs
- [ ] 073 · websocket-events
- [ ] 074 · rate-limiting
- [ ] 075 · security-hardening
- [ ] 076 · api-response-format
- [ ] 077 · validation-rules
- [ ] 078 · error-response-system
- [ ] 079 · logging-monitoring
- [ ] 080 · backend-folder-structure
- [ ] 081 · environment-variables
- [ ] 082 · migration-strategy
- [ ] 083 · backup-recovery
- [ ] 084 · third-party-integrations
- [ ] 085 · billing-subscription-system
- [ ] 086 · feature-flags
- [ ] 087 · backend-testing-strategy

### Strateji (İlk site ship edildikten sonra aç)
- [ ] 096 · business-objectives
- [ ] 097 · user-intent-map
- [ ] 098 · conversion-psychology
- [ ] 099 · perception-strategy
- [ ] 100 · market-category-positioning
- [ ] 101 · brand-archetype-system
- [ ] 106 · growth-loop
- [ ] 107 · monetization-strategy
- [ ] 109 · client-editing-boundaries
- [ ] 111 · lead-generation-flow
- [ ] 112 · cms-content-model
- [ ] 113 · narrative-architecture
- [ ] 114 · cms-governance

### Felsefe Dosyaları (Prose, asla AI'a yükleme)
- [ ] 000 · system-vision
- [ ] 012 · design-direction (prose versiyon)
- [ ] 019 · visual-rules
- [ ] 022 · art-direction-system
- [ ] 023 · motion-storytelling-map
- [ ] 024 · interaction-philosophy
- [ ] 026 · layout-composition-rules
- [ ] 027 · typography-philosophy
- [ ] 028 · color-emotion-system
- [ ] 029 · scroll-behavior-spec
- [ ] 030 · cinematic-language-system
- [ ] 032 · sensory-density-rules
- [ ] 033 · visual-hierarchy-matrix
- [ ] 034 · mobile-experience-philosophy
- [ ] 035 · emotional-pacing-system
- [ ] 036 · creative-direction-bible
- [ ] 037 · interaction-density-map
- [ ] 088 · positioning-strategy (prose versiyon)
- [ ] 089 · brand-personality (prose versiyon)
- [ ] 093 · competitive-landscape
- [ ] 095 · perception-engineering

### Research (İhtiyaç çıktığında bak, doc açma)
- [ ] 115 · competitor-analysis → /references klasörüne ekle
- [ ] 116 · interaction-research → /references klasörüne ekle
- [ ] 117 · motion-research → /references klasörüne ekle
- [ ] 118 · typography-research → /references klasörüne ekle
- [ ] 119 · user-behavior-insights
- [ ] 120 · ai-tooling-experiments → prompt-library'e damıt
- [ ] 121 · emerging-design-trends → /references klasörüne ekle

### Open Source (Referans, doc değil)
- [ ] 142 · open-source-reference-index → /references'a taşı
- [ ] 143 · animation-repo-analysis → /snippets'e damıt
- [ ] 144 · awwwards-clone-analysis → /references'a taşı
- [ ] 145 · motion-pattern-library → /snippets'e damıt
- [ ] 146 · scroll-storytelling-analysis → /snippets'e damıt
- [ ] 147 · page-transition-analysis → /snippets'e damıt
- [ ] 148 · component-pattern-analysis → /snippets'e damıt
- [ ] 149 · webgl-experiment-log → /snippets'e damıt
- [ ] 150 · premium-ui-patterns → /snippets'e damıt
- [ ] 151 · codebase-architecture-analysis

### Postmortem (Ship ettikten sonra aç)
- [ ] 134 · tech-debt-log
- [ ] 136 · decision-log (extended versiyon)
- [ ] 141 · postmortem-template
  - [ ] 141.1 what-worked
  - [ ] 141.2 what-failed
  - [ ] 141.3 ai-failures
  - [ ] 141.4 technical-lessons
  - [ ] 141.5 next-project-improvements

---

## TAMAMLANAN — Buraya Taşı

> Bir madde tamamlanınca, ilgili lean doc'a compact özet eklenir,
> madde buraya kopyalanır, oradan silinir.

- [x] örnek: design-tokens.json — Heat/Precision/Material temaları kilitlendi (2026-05-12)
- [x] Phase 1 dokumentasyon — 22 dosya oluşturuldu, docs/lean/ + root (2026-05-12)
- [x] snippets/ klasör yapısı — gsap/lenis/transitions/motion/three (2026-05-12)

---

*Son güncelleme: 2026-05-12*
*Toplam madde: ~420 (700 dosyadan collapse edilmiş)*
*Phase 1: 22 madde — Phase 2: ~180 madde — Defer: ~220 madde*
