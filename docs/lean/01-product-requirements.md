# 01 · Product Requirements — Mas Technic

## Fonksiyonel Gereksinimler

### Landing Page
- Hero: Video arka plan + 4-phase GSAP scroll choreography
- Sections: HowWeWork, CNCScrollStory, Services, Industries, Materials, Capabilities, Testimonials, FAQ, FinalCTA
- Smooth scroll: Lenis (desktop), native (mobile)
- Custom cursor: Desktop (>901px, pointer:fine)
- Film grain overlay: global, sabit
- Page transitions: clip-path polygon reveal

### RFQ Akışı (Teklif Al)
- 4-adım wizard: dosya yükleme → 3D preview → form → onay
- CAD format desteği: STEP, STL, OBJ (occt-import-js)
- 3D viewer: pan, zoom, wireframe, grid, measurement toolbar
- Supabase storage: cad-uploads bucket
- Rate limiting: rfq-rate-limit Edge Function

### Müşteri Portalı (/musteri-paneli)
- 10 sekme: Genel Bakış, Tekliflerim, Siparişlerim, Üretim, Teknik Arşiv, Kalite, Ödeme, Finans, Destek, Bildirimler
- Supabase Realtime: canlı sipariş güncelleme
- Sayfalama: PAGE_SIZE=20
- URL-based tab routing
- Korumalı route: CustomerProtectedRoute

### Yönetim Paneli (/admin/dashboard)
- 15 modül: Dashboard, RFQ, Siparişler, WBS, Çizelgeleme, Finans, Pipeline, TPM, Chatbot Analytics, Sorunlar, Müşteriler, Ayarlar
- Excel export: xlsx-js-style (pivot + KPI + raw data)
- Admin sidebar + mobil sidebar
- Korumalı route: ProtectedRoute

### AI Chatbot
- Gemini 2.0 Flash (SSE streaming)
- TF-IDF FAQ engine (25+ giriş)
- Türkçe tokenizasyon
- Rate limit handling
- Domain knowledge: Mas Technic ürün/hizmet bilgisi

### Blog & İçerik
- 6 tam makale + 5 kategori
- Slug-based routing
- View counter, read time, featured flag
- Markdown render

## Teknik Gereksinimler

### Frontend
- React 18 + TypeScript 5 + Vite 5 + SWC
- Tailwind CSS 3 + shadcn/ui
- CSR-only (SSR yok, Next.js yok)
- React Router 6 (23 route)
- TanStack Query 5 (server state)
- Lazy-loaded pages (React.lazy + Suspense)

### Animation
- GSAP 3.14 + ScrollTrigger (scroll-driven)
- Framer Motion 12 (component-level)
- Lenis 1.3 (smooth scroll, desktop-only)
- Three.js + R3F (3D canvas scenes)

### Backend
- Supabase PostgreSQL (23 tablo, RLS)
- Supabase Auth (email + magic link)
- Supabase Storage (4 bucket)
- 6 Edge Function (Deno runtime)

### Performance
- Lighthouse Performance ≥90
- LCP <2.5s
- CLS <0.1
- INP <200ms
- Bundle splitting: three, fiber, gsap, framer, recharts, xlsx ayrı chunk

### Güvenlik
- RLS tüm tablolarda aktif
- Service role key asla client'a expose edilmez
- hCaptcha: RFQ formu
- Rate limiting: Edge Function seviyesinde

## İçerik Gereksinimleri

- **Dil:** Türkçe (UI, copy, hata mesajları)
- **Malzeme:** 500+ materyal, 12 kategori (Alüminyum, Çelik, Paslanmaz, Titanyum, vb.)
- **Hizmet:** 50+ dinamik sayfa (FAQ, makine bilgisi, karşılaştırma tablosu)
- **Kategori:** 13 grup (Talaşlı İmalat, Yüzey İşlemleri, İşaretleme, vb.)
- **Sertifikalar:** ISO, CE ve diğer kalite sertifikaları
- **SEO:** JSON-LD schema, OG tags, Turkish keyword targeting
