# MAS Technic — Industrial Precision Landing & Operations Platform

> Awwwards-grade B2B landing + admin/customer operations için React 18 SPA.
> CNC, döküm ve premium imalat sektörü için **endüstriyel-luxe** dijital deneyim.

**Live:** [mas-technic-precision.lovable.app](https://mas-technic-precision.lovable.app)

---

## Tech Stack

| Katman | Teknoloji |
|---|---|
| Frontend | **React 18** + **Vite 5** + **TypeScript 5** (strict) |
| Styling | **Tailwind CSS 3** — semantic token system, `border-radius: 0` global |
| Animation | **GSAP** + **ScrollTrigger** + **Framer Motion** |
| Smooth scroll | **Lenis** (panel & mobil hariç) |
| 3D | **Three.js** + **React Three Fiber** (HeroCanvas, CAD viewer) |
| Backend | **Supabase** — auth, Postgres + RLS, Edge Functions, Storage |
| UI primitives | **shadcn/ui** |

**Yeni paket eklenmez** (locked). Mevcut `lenis`, `gsap`, `three`, `framer-motion` sürümleri sabittir.

---

## Design System v2.0 — Unified Color System

Üç eksenli token mimarisi: **Heat / Precision / Material**.

### Solid + RGB Triplet Pattern

Her renk iki formda tanımlı:

```css
:root {
  --heat-molten: #e8610a;
  --heat-molten-rgb: 232 97 10;       /* alpha için ZORUNLU */

  --precision-ice: #0688ad;
  --precision-ice-rgb: 6 136 173;

  --surface-base: #0a0a0a;
  --surface-base-rgb: 10 10 10;

  --text-primary: #ffffff;
  --text-primary-rgb: 255 255 255;
  /* … */
}
```

### Kullanım kuralları

| Durum | DOĞRU | YANLIŞ |
|---|---|---|
| Solid | `color: var(--heat-molten)` | `color: #e8610a` |
| Alpha overlay | `background: rgb(var(--heat-molten-rgb) / 0.25)` | `rgba(232,97,10,0.25)` |
| Tailwind arbitrary | `bg-[rgb(var(--heat-molten-rgb)/0.25)]` | `bg-[rgba(232,97,10,0.25)]` |
| ❌ YASAK | — | `rgba(var(--heat-molten), 0.25)` (sessizce transparent) |

### Type-safe accessor — `src/lib/tokens.ts`

```ts
import { T, alpha } from "@/lib/tokens";

style={{ color: T.heatMolten }}                 // typo → TS error
style={{ background: alpha("heatMolten", 0.25) }}
```

**ESLint guardrail:** Hardcoded color literal (`#hex`, `rgba()`, `hsla()`) ve numeric `zIndex` literal kullanımı warn seviyesinde flag edilir. Muafiyet: token tanım dosyaları, test/stories, config'ler.

---

## Scroll Architecture

### Lenis (Smooth Scroll)

- `SmoothScrollProvider` ile sarılır.
- `gsap.ticker`'a bind edilir → ScrollTrigger ile tam senkron.
- `/admin/*`, `/musteri-paneli/*`, ve mobil (<768px) hariç AKTİF.
- Mobilde devre dışı → native CSS `scroll-snap-type` kullanılır.

### Scene vs FlowScene

İki tip stacking-scroll wrapper:

| Wrapper | Davranış | Kullanım |
|---|---|---|
| `Scene` | `sticky top-0`, viewport-locked | Standart section'lar (Hero, Stats, Footer) |
| `FlowScene` | Genişleyen scroll alanı | Cinematic scrub'lar (CNCStory, MaterialMorph) |

### Stacking Z-Index — `src/styles/z-index.ts`

Section z-index'leri `SECTION_Z[key]` üzerinden alınır. Numeric literal yasak.

```ts
export const SECTION_Z = {
  hero: 1,
  cncStory: 2,
  materialMorph: 4,        // moldCast (3) v3.0'da kaldırıldı, gap korundu
  videoScroll: 5,
  /* … */
  footer: 25,
} satisfies Record<string, number>;
```

Ayrıca: Header `50`, Cursor `90`, Preloader `100`.

### Section Transitions — `TransitionBridge`

İki section arasına yerleştirilen bridge:
- `dark→dark`: 40px fade
- `dark→light` veya `light→dark`: 120px gradient fade + radial glow

---

## Component Tree (Landing — `src/pages/Index.tsx`)

```
HeroSection
  → CNCScrollStory          (FlowScene, scrub canvas, 120 frame)
  → MaterialMorphScroll     (FlowScene, scrub canvas, 80 frame)
  → VideoScrollSection
  → ServicesSection
  → CapabilitiesSection
  → IndustriesSection
  → MaterialsSection
  → ProjectShowcase
  → StatsSection
  → TestimonialsSection
  → HowWeWorkSection
  → WhyUsSection
  → CertificationsSection
  → NexusPromoSection
  → QuickQuoteSection
  → FAQBlogSection
  → FinalCTASection
  → Footer (reveal-from-behind)
```

Her section arasına gerektikçe `TransitionBridge` yerleşir.

**v3.0'da kaldırılan sahneler:** `LavaTypographyScene`, `MoldCastScene`. Detay: `docs/v3-changelog.md`.

---

## Locked Zones (DO NOT TOUCH)

Refactor / migration sırasında dokunulmayan alanlar:

- `src/pages/admin/**` + `src/components/admin/**`
- `src/pages/musteri-paneli/**` + `src/components/musteri/**`
- `src/integrations/supabase/**` + `src/integrations/supabase/types.ts`
- `src/hooks/useAuth*`
- `package.json` (no new deps without explicit approval)
- `tailwind.config.ts` → `borderRadius: { DEFAULT: "0" }`, font stack
- `supabase/migrations/`

---

## Engineering Constraints

1. `border-radius: 0` global. Tüm yeni stiller dahil.
2. Font stack: **IBM Plex Sans** + **IBM Plex Mono**. Başka font eklenmez.
3. Scroll mekanizması: **yalnızca Lenis**. `scroll-behavior: smooth` yasak.
4. Animasyon: GSAP + Framer Motion. CSS `@keyframes` yalnızca pulse/loader.
5. Hardcoded renk YASAK (`#hex`, `rgba()`, `hsl()` literal). Yalnızca token tanım dosyaları muaf.
6. `z-index` numeric literal YASAK. `SECTION_Z[key]` zorunlu.
7. Component max 180 satır. Üzerinde → split.
8. **Named exports only.** Default exports YASAK.
9. `console.log` production'da yasak — logger utility kullan.
10. `tsc --noEmit` her commit'te 0 error.

---

## Dev Workflow

```bash
npm run dev          # Vite dev server
npx tsc --noEmit     # Type-check
npx eslint src/      # Lint (guardrails dahil)
npm run build        # Production build
```

### Bundle baseline

`docs/perf-baseline-v3.md` — son ölçüm sonuçları + red flag'ler.

---

## Supabase

- **Auth:** email/password + hCaptcha (müşteri tarafı)
- **Postgres + RLS:** her tabloda
- **Storage buckets:** `customer-files`, `cad-uploads`, `finance-docs` (signed URL only)
- **Edge Functions:** `chat`, `finance-ai`, `ocr-invoice`, `parasut-sync`, `rfq-rate-limit`, `due-date-reminder`

Detay: `docs/supabase-full-setup.sql`.

---

## Documentation

- `docs/v3-changelog.md` — v3.0 architecture cleanup özeti
- `docs/perf-baseline-v3.md` — bundle baseline + öneriler
- `.lovable/plan.md2` — historical phase plan (Faz 1-10) + final durumu
- `.lovable/assets.md` — external asset spec (sequences, machine loop)
- `.lovable/memory/index.md` — Lovable AI memory rules

---

## License

Proprietary — © Mas Technic Industrial.
