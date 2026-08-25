# 12 · Folder Structure — Mas Technic

```
precision-dynamics-hub/
├── ROADMAP.md              ← Proje yol haritası (sen okursun)
├── CLAUDE.md               ← AI master loader (otomatik okunur)
├── MASTER_CONTEXT.md       ← 300-satır session özeti
├── ACTIVE_TASK.md          ← Güncel task takibi
├── .env.example            ← Env var şablonu
├── .env                    ← Gerçek değerler (git'e commit edilmez)
├── index.html              ← HTML giriş noktası (Turkish OG tags)
├── package.json
├── vite.config.ts          ← Build: chunks, alias, port 8080
├── tailwind.config.ts      ← Forge palette, Space Grotesk, IBM Plex Mono
├── tsconfig.json
├── components.json         ← shadcn/ui config
│
├── src/
│   ├── App.tsx             ← Router + providers + lazy routes
│   ├── main.tsx            ← createRoot entry
│   ├── index.css           ← Global CSS (832 satır): tokens, utilities
│   │
│   ├── components/
│   │   ├── ui/             ← shadcn/ui primitives (genellikle dokunulmaz)
│   │   │   ├── button.tsx, card.tsx, dialog.tsx, ...
│   │   │   ├── Reveal.tsx, OverlayReveal.tsx
│   │   │   ├── TextScramble.tsx, SparkParticles.tsx
│   │   │   ├── GrainOverlay.tsx, GlowLineDivider.tsx
│   │   │   ├── BrutalSectionHeader.tsx, BrutalListRow.tsx
│   │   │   └── ... (70+ bileşen)
│   │   │
│   │   ├── admin/          ← 23 admin modülü (dokunma kuralı: sadece admin)
│   │   │   ├── AdminSidebar.tsx, MobileSidebar.tsx
│   │   │   ├── DashboardHome.tsx, RFQManager.tsx
│   │   │   └── ...
│   │   │
│   │   ├── musteri/        ← 15 müşteri portal bileşeni (sadece müşteri)
│   │   │   ├── MusteriHeader.tsx, MusteriSidebar.tsx
│   │   │   ├── GenelBakisTab.tsx, SiparislerimTab.tsx
│   │   │   └── ...
│   │   │
│   │   ├── r3f/            ← Three.js / R3F sahneleri
│   │   │   ├── HeroCanvas.tsx     ← Liquid distortion shader
│   │   │   ├── LiquidImage.tsx
│   │   │   ├── CNCModel.tsx       ← Procedural 3D gear
│   │   │   └── IndustryModels.tsx
│   │   │
│   │   ├── providers/
│   │   │   ├── SmoothScrollProvider.tsx  ← Lenis + GSAP ticker
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── CustomerProtectedRoute.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginLeftPanel.tsx
│   │   │   └── FormField.tsx, SocialButtons.tsx
│   │   │
│   │   └── [root level — landing page, ~40 bileşen]
│   │       ├── HeroSection.tsx        ← 4-phase GSAP scroll
│   │       ├── HeadlineStagger.tsx
│   │       ├── CNCScrollStory.tsx
│   │       ├── HowWeWorkSection.tsx
│   │       ├── MaterialMorphScroll.tsx
│   │       ├── LavaTypographyScene.tsx
│   │       ├── CustomCursor.tsx
│   │       ├── BrutalCrosshairCursor.tsx
│   │       ├── PageTransition.tsx
│   │       ├── MagneticButton.tsx
│   │       ├── Header.tsx, Footer.tsx
│   │       └── ...
│   │
│   ├── pages/              ← 23 route sayfası
│   │   ├── Index.tsx       ← Landing page
│   │   ├── AdminDashboard.tsx, AdminLogin.tsx
│   │   ├── MusteriPaneli.tsx
│   │   ├── TeklifAl.tsx    ← CAD wizard
│   │   ├── Malzemeler.tsx, MalzemeKategori.tsx
│   │   ├── ServiceDetail.tsx, CategoryPage.tsx
│   │   ├── Blog.tsx, BlogDetail.tsx
│   │   └── ...
│   │
│   ├── hooks/              ← 14 custom hook
│   │   ├── use-gsap.ts             ← GSAP + ScrollTrigger re-export
│   │   ├── use-reduced-motion.ts   ← prefers-reduced-motion
│   │   ├── use-theme.ts            ← dark/light toggle
│   │   ├── useScrollVelocity.ts    ← scroll hız ölçümü
│   │   ├── useClipReveal.ts        ← clip-path reveal
│   │   ├── useSplitTextReveal.ts   ← character reveal
│   │   ├── useStaggeredReveal.ts   ← stagger entrance
│   │   ├── useTilt.ts              ← 3D mouse tilt
│   │   ├── useAmbientGlow.ts       ← ambient lighting
│   │   ├── useGPUCapability.ts     ← WebGL capability
│   │   └── ...
│   │
│   ├── data/               ← İçerik katmanı
│   │   ├── servicePages.ts       ← 50+ hizmet sayfası
│   │   ├── categoryPages.ts      ← 13 kategori
│   │   ├── materialsData.ts      ← 500+ materyal
│   │   ├── blogPosts.ts          ← 6 blog yazısı
│   │   └── chatFaqData.ts        ← TF-IDF chatbot FAQ
│   │
│   ├── styles/
│   │   └── z-index.ts      ← Z ve SECTION_Z objeleri (tek kaynak)
│   │
│   ├── lib/
│   │   └── utils.ts        ← cn() helper (clsx + tailwind-merge)
│   │
│   ├── utils/
│   │   ├── excelExport.ts  ← xlsx-js-style export
│   │   └── useLocalTexture.ts
│   │
│   ├── assets/             ← Medya dosyaları (src içinde)
│   │   ├── hero-cnc.jpg, cnc-factory-zoom.mp4
│   │   └── ... (~80 görsel/video)
│   │
│   └── integrations/
│       └── supabase/
│           ├── client.ts   ← Supabase client init
│           └── types.ts    ← 23 tablo TypeScript tipleri
│
├── public/                 ← Statik dosyalar (build'e kopyalanır)
│   ├── sequence-cnc/       ← 120 frame WebP
│   ├── sequence-material/  ← 80 frame WebP
│   ├── machine-loop.mp4
│   ├── mas-logo.svg
│   └── robots.txt
│
├── docs/
│   ├── supabase-full-setup.sql  ← Schema migration
│   └── lean/                   ← Phase 1 lean docs (17 dosya)
│
├── snippets/               ← Geçici pattern referansları (Phase 1'de oluşturuldu)
│   ├── gsap/
│   ├── lenis/
│   ├── transitions/
│   ├── motion/
│   └── three/
│
└── supabase/               ← Edge Functions
    ├── functions/
    │   ├── chat/           ← Gemini 2.0 Flash SSE
    │   ├── finance-ai/     ← Gemini 2.5 Flash
    │   ├── ocr-invoice/
    │   └── due-date-reminder/
    └── config.toml
```
