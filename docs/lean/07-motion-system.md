# 07 · Motion System — Mas Technic

## Temel İlke
Her animasyon işlevsel: yönlendirme, hiyerarşi, geri bildirim. Dekoratif yok.

---

## Scroll: Lenis → GSAP Sync

```typescript
// SmoothScrollProvider.tsx — tek doğru yer
const lenis = new Lenis({ lerp: 0.065, duration: 1.4, wheelMultiplier: 0.75 })
window.__lenis = lenis
lenis.on('scroll', () => ScrollTrigger.update())
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
// Mobile (<768px): Lenis yok, native scroll
// Admin/müşteri panel: Lenis devre dışı
```

## ScrollTrigger Pattern
```typescript
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 80%', scrub: 1 },
      y: 60, opacity: 0, duration: 0.8, ease: 'power3.out'
    })
  }, containerRef)
  return () => ctx.revert()
}, [])
```

---

## Hero 4-Phase Choreography

- **Phase 1 (0–45%):** MAS mask grows, content fades up, header hides
- **Phase 2 (45–60%):** PAUSE — section pinned, no change
- **Phase 3 (60–88%):** Horizontal slide — Hero ←, QuickQuote → (100vw each)
- **Phase 4 (88–100%):** Lava pour (`--lava-fill` 0→100%) + heat distortion

---

## Reveal Primitives

| Pattern | Hook | Detay |
|---------|------|-------|
| Clip-Path | `useClipReveal` | `inset(0 100% 0 0)` → `inset(0)`, 0.9s, industrial ease |
| Split Text | `useSplitTextReveal` | Char-bazlı, stagger 0.035s, rotateY 90→0 |
| Batch Stagger | `useStaggeredReveal` | `ScrollTrigger.batch()`, 3 per batch, 0.08s stagger |

---

## Page Transition

```
Mevcut:  exit 0.6s / enter 0.6s, single overlay
Phase 4: exit 0.4s / enter 0.6s, forge-teal (std) / forge-molten (CTA)
```

---

## Mikro-Etkileşimler

- **MagneticButton:** Mouse follow %30, spring stiffness:120 damping:18
- **Card hover:** `translateY(-4px)` + molten border glow, 0.25s industrial ease
- **brutal-link:** `scaleX(0→1)` underline, 0.4s industrial ease

---

## Reduced Motion (Zorunlu)

```typescript
const prefersReduced = usePrefersReducedMotion()
if (prefersReduced) { gsap.set(el, finalState); return }
```
CSS: `@media (prefers-reduced-motion: reduce) { ... }`

---

## Motion Ritmi (Section Düzeni)

```
Hero/CNCStory/Industries/FinalCTA → HIGH
HowWeWork/Capabilities          → CALM
Services/Materials              → MEDIUM
Testimonials/FAQ                → LOW (silence zone)
```
En az bir silence zone zorunlu.

---

## Performans Kuralları

- Sadece `transform` ve `opacity` animate et
- `width/height/top/left` animate etme (CLS + reflow)
- `will-change: transform` sadece animate edilen elementlerde
- `ScrollTrigger.batch()` — per-element yerine
- Three.js canvas → IntersectionObserver ile lazy
