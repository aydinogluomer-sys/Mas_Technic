# 10 · Tech Stack — Mas Technic

## Frontend

| Katman | Teknoloji | Versiyon | Notlar |
|--------|-----------|---------|--------|
| Framework | React | 18.3.1 | Concurrent features, lazy loading |
| Dil | TypeScript | 5.8.3 | Strict mode, path alias `@/` |
| Build | Vite | 5.4.19 | SWC transpiler, port 8080 |
| Transpiler | @vitejs/plugin-react-swc | ^3.11.0 | Babel yerine SWC |
| CSS | Tailwind CSS | 3.4.17 | JIT, dark mode: class |
| UI Library | shadcn/ui + Radix | Latest | 23+ primitive bileşen |
| Style Utils | clsx + tailwind-merge | 2.1.1 / 2.6.0 | cn() helper |

## Animation & Motion

| Teknoloji | Versiyon | Kullanım |
|-----------|---------|---------|
| GSAP + ScrollTrigger | 3.14.2 | Scroll-driven animations, timeline |
| Framer Motion | 12.34.0 | Component enter/exit, springs |
| Lenis | 1.3.19 | Smooth scroll (desktop-only) |
| Three.js | 0.170.0 | 3D scene rendering |
| @react-three/fiber | 8.18.0 | React + Three.js bridge |
| @react-three/drei | 9.122.0 | Three.js helpers |

## Backend & Data

| Teknoloji | Versiyon | Kullanım |
|-----------|---------|---------|
| Supabase | SDK ^2.95.3 | PostgreSQL + Auth + Storage + Realtime |
| TanStack Query | 5.83.0 | Server state, cache |
| React Router DOM | 6.30.1 | CSR routing, 23 route |
| React Hook Form | 7.61.1 | Form state |
| Zod | 3.25.76 | Schema validation |

## Özel Araçlar

| Teknoloji | Versiyon | Kullanım |
|-----------|---------|---------|
| occt-import-js | 0.0.14 | STEP/STL/OBJ CAD parsing |
| xlsx-js-style | 1.2.0 | Excel export (pivot + KPI) |
| Recharts | 2.15.4 | Admin dashboard grafikleri |
| lucide-react | 0.462.0 | İkon seti |
| Sonner | 1.7.4 | Toast bildirimleri |
| @hcaptcha/react-hcaptcha | ^2.0.2 | RFQ form bot koruması |

## Test

| Teknoloji | Versiyon | Kullanım |
|-----------|---------|---------|
| Vitest | 3.2.4 | Unit test runner |
| @testing-library/react | 16.0.0 | Component testing |
| jsdom | 20.0.3 | DOM environment |

## Bundle Stratejisi

```javascript
// vite.config.ts — manual chunks
manualChunks: {
  three:   ['three', '@react-three/fiber', '@react-three/drei'],
  gsap:    ['gsap'],
  framer:  ['framer-motion'],
  recharts: ['recharts'],
  xlsx:    ['xlsx-js-style']
}
```

---

## Forbidden Tech (Yasak)

```
❌ Next.js / SSR / SSG — CSR-only proje, SSR context GSAP'i kırar
❌ CSS-in-JS (styled-components, emotion) — Tailwind kullan
❌ jQuery — modern React pattern yeterli
❌ GSAP 2.x — 3.x ile uyumsuz API
❌ Redux / Zustand — TanStack Query + local state yeterli
❌ Lottie — GSAP ile çakışır, büyük bundle
❌ Anime.js — GSAP ile çakışır
❌ React 17 legacy patterns — concurrent mode kullan
```

---

## Hosting & Deploy

```
Primary deploy: Lovable.dev (preview URL: mas-technic-precision.lovable.app)
Geliştirme:    Claude Code + Vite dev server (localhost:8080)
Supabase:      zdqiujpeewtyhtcqhdcj.supabase.co
```

---

## AI Tooling

```
Chatbot:    Google Gemini 2.0 Flash (SSE streaming via Edge Function)
Finance AI: Gemini 2.5 Flash (Lovable gateway, multi-turn)
OCR:        Gemini Vision (invoice/receipt → JSON)
Dev:        Claude Code (primary development platform)
```
