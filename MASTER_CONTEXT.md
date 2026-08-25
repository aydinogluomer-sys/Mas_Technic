# MASTER_CONTEXT.md — Mas Technic
> Her session'da yüklenir. ≤300 satır. Çelişki çıkarsa bu dosya kazanır.
> Son güncelleme: 2026-05-12

---

## Proje Özeti

**Mas Technic** — B2B CNC hassas imalat şirketi, İstanbul.  
Site hem landing page hem müşteri portalı hem yönetim paneli içeriyor.  
Supabase backend üzerinde çalışıyor; 23 tablo, RLS, Edge Functions.  
**Dil:** Türkçe (içerik + UI). **Platform:** Claude Code (Lovable terk edildi).

---

## Tech Stack

| | Teknoloji | Versiyon |
|---|---|---|
| Framework | React | 18.3.1 |
| Dil | TypeScript | 5.8.3 |
| Build | Vite + SWC | 5.4.19 |
| CSS | Tailwind CSS | 3.4.17 |
| UI | shadcn/ui + Radix | Latest |
| Animation | GSAP + ScrollTrigger | 3.14.2 |
| Animation | Framer Motion | 12.34.0 |
| Smooth scroll | Lenis | 1.3.19 |
| 3D | Three.js + @react-three/fiber + Drei | 0.170.0 |
| Backend | Supabase | SDK ^2.95.3 |
| Routing | React Router DOM | 6.30.1 |
| State | TanStack Query | 5.83.0 |
| Forms | React Hook Form + Zod | 7.61.1 |
| CAD | occt-import-js (STEP/STL/OBJ) | 0.0.14 |

---

## Forge Renk Paleti

```css
/* Ana renkler */
--forge-obsidian: #353c46    /* koyu arka plan */
--forge-gunmetal: #424d5e    /* orta koyu */
--forge-iron:     #384050    /* panel bg */
--forge-molten:   #e8610a    /* CTA, vurgu — turuncu */
--forge-amber:    #d4850e    /* ikincil vurgu */
--forge-teal:     #0a7e8c    /* primary, interactive — teal */
--forge-silver:   #a8b2bc    /* açık gri */
--forge-steel:    #3a4a5c    /* accent */
--forge-concrete: #e8e4de    /* açık bg */
--forge-workshop: #f0ede8    /* en açık bg */

/* Renk rolleri */
teal (#0a7e8c)   = primary / interactive
molten (#e8610a) = CTA / vurgu / CTA button
obsidian (#353c46) = dark background
concrete (#e8e4de) = light background
```

---

## Z-Index Sistemi

```typescript
// src/styles/z-index.ts — tek kaynak, dokunmadan önce oku
Z = {
  base: 0, content: 1, ambientGlow: 2, grain: 5,
  scrollVelocity: 8, lavaTypography: 10, moldCast: 11,
  cncStory: 12, marquee: 15, dotNav: 20, header: 50,
  mobileMenu: 60, cursor: 90, pageTransition: 95, preloader: 100
}

SECTION_Z = {
  hero: 1, lavaTypography: 2, moldCast: 3, cncStory: 4,
  /* ... her section 1-25 arası sıralı */
  finalCta: 25
}
```

---

## Animation Mimarisi

```
Hiyerarşi:
  SmoothScrollProvider (root)
    └── Lenis (smooth scroll engine)
         └── gsap.ticker.add(lenis.raf) (GSAP ile sync)
              └── ScrollTrigger.update() (her scroll'da)
                   └── gsap.context (component scope)
                        └── ScrollTrigger instances

Kurallar:
  - Her component: gsap.context() aç → cleanup'ta ctx.revert()
  - Framer Motion: component-level enter/exit (AnimatePresence)
  - Three.js: useFrame hook, IntersectionObserver ile lazy mount
  - Lenis mobile'da (< 768px) DEVRE DIŞI — native scroll
  - gsap.registerPlugin(ScrollTrigger) → tek yer: use-gsap.ts
```

---

## Klasör Haritası

```
src/
  components/
    ui/          ← shadcn/ui primitives (20+ bileşen)
    admin/       ← 23 admin panel modülü (dokunma)
    musteri/     ← 15 müşteri portal bileşeni (dokunma)
    r3f/         ← Three.js: HeroCanvas, LiquidImage, CNCModel
    providers/   ← SmoothScrollProvider, ProtectedRoute
    auth/        ← LoginLeftPanel, FormField, SocialButtons
    [root]       ← Landing page: HeroSection, HeadlineStagger,
                   CNCScrollStory, HowWeWorkSection, vb. (40+)
  pages/         ← 23 route sayfası
  hooks/         ← 14 custom hook
  data/          ← servicePages, materialsData, blogPosts, vb.
  styles/        ← z-index.ts (tek Z kaynağı)
  lib/           ← utils.ts (cn helper)
  assets/        ← hero/industry/material görselleri
  integrations/  ← supabase/client.ts, types.ts

public/
  sequence-cnc/      ← 120 frame WebP (CNC animasyon sekansı)
  sequence-material/ ← 80 frame WebP (material sekansı)
  machine-loop.mp4   ← Hero video (427KB)
```

---

## Route Listesi (23 sayfa)

```
/ → Index.tsx (landing)
/hakkimizda → Hakkimizda.tsx
/iletisim → Iletisim.tsx
/teklif-al → TeklifAl.tsx (CAD upload + 3D viewer)
/malzemeler → Malzemeler.tsx (500+ materyal)
/malzeme/:kategori → MalzemeKategori.tsx
/hizmetler/:slug → ServiceDetail.tsx (50+ hizmet)
/:category → CategoryPage.tsx (13 kategori)
/blog → Blog.tsx
/blog/:slug → BlogDetail.tsx
/sss → SSS.tsx
/login → Login.tsx
/forgot-password → ForgotPassword.tsx
/reset-password → ResetPassword.tsx
/admin → AdminLogin.tsx
/admin/dashboard → AdminDashboard.tsx (korumalı)
/musteri-paneli → MusteriPaneli.tsx (korumalı)
/gizlilik-politikasi → GizlilikPolitikasi.tsx
/cerez-politikasi → CerezPolitikasi.tsx
/kvkk → KVKK.tsx
```

---

## Önemli Bileşenler (Landing)

| Bileşen | Açıklama |
|---------|---------|
| HeroSection | 4-phase GSAP scroll (0–45%, 45–60%, 60–88%, 88–100%) |
| HeadlineStagger | Karakter bazlı stagger, ilk kelime text-stroke |
| CNCScrollStory | Yatay scroll timeline (120 frame sekans) |
| HowWeWorkSection | GSAP ScrollTrigger reveal timeline |
| MaterialMorphScroll | Scroll-triggered material morph |
| LavaTypographyScene | CSS custom prop --lava-fill animasyonu |
| HeroCanvas | R3F canvas, liquid distortion shader |
| SmoothScrollProvider | Lenis root provider |
| CustomCursor | Desktop cursor (>901px, pointer:fine) |
| PageTransition | Clip-path polygon reveal |
| MagneticButton | Mouse-follow magnetic effect |
| GrainOverlay | SVG turbulence film grain (0.035 opacity) |

---

## Supabase Şema Özeti

```
23 tablo: profiles, user_roles, customers, rfqs, orders,
wbs, quality_reports, maintenance_logs, financial_documents,
pipeline_leads, meetings, faq_analytics, notifications,
support_tickets, machine_schedule, raw_materials, tool_inventory,
documents, vb.

Roller: admin | staff | production | quality
RLS: Tüm tablolarda aktif
Edge Functions: chat, finance-ai, ocr-invoice, due-date-reminder
Storage: cad-uploads, customer-files, finance-docs, avatars

⚠️ Schema değiştirme — sadece Supabase dashboard'dan, kodla değil.
```

---

## Forbidden Actions

```
❌ Supabase schema'ya kod ile dokunma
❌ /admin/* ve /musteri-paneli/* silme / büyük değişiklik
❌ Yeni npm package ekleme
❌ SSR context'te GSAP kullanma
❌ Lenis'i mobile'da aktif bırakma (<768px)
❌ Z objesi dışında z-index kullanma
❌ Hardcoded hex/rgb — CSS custom property kullan
❌ Framer Motion ve GSAP'i aynı elemana uygulama
❌ Three.js canvas'ı IntersectionObserver olmadan mount etme
```

---

## Typography

```css
font-family: Space Grotesk (sans), IBM Plex Mono (mono)
border-radius: 0 (tüm UI — sharp industrial)

.typo-h1   → clamp(3.5rem, 8vw, 9rem), line-height: 0.92, letter-spacing: -0.04em
.typo-h2   → clamp(2.5rem, 5.5vw, 6rem), line-height: 1.0, letter-spacing: -0.03em
font-size.display-mega → clamp(6rem, 18vw, 22rem), line-height: 0.82
.typo-technical → IBM Plex Mono, uppercase, tracking-wide
```
