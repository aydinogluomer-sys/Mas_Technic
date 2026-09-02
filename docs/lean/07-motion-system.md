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

## Süre Ölçeği — üç seviye, dördüncüsü yok

| Seviye | Süre | TS | CSS | Ne zaman |
|--------|------|----|-----|----------|
| micro | 0.22s | `MOTION_LEVEL.micro` | `--tl-dur-micro` | Tek bir kontrolün yanıtı: hover, focus, toggle |
| standard | 0.35s | `MOTION_LEVEL.standard` | `--tl-dur-short` | Varsayılan: bir öğe girer, çıkar, çözülür |
| cinematic | 0.62s | `MOTION_LEVEL.cinematic` | `--tl-in` | Sadece anlatı anları: menü açılışı, bant girişi |
| (stagger) | 65ms | `MOTION_STEP` | `--tl-step` | Kardeşler arası gecikme — süre değil |
| reduced | 0 | `MOTION_REDUCED` | — | Kapalı, "hızlı" değil |

`NAV_MOTION` (menü) aynı üç değerdir: `micro` / `close` / `open`.
Ölçeğe oturmayan bir süre yeni bir seviye değil, yanlış sınıflanmış bir
seviyedir; istisna ancak ölçülmüş bir gerekçe yorumuyla kalır
(`ROUTE_TRANSITION.holdDuration`).

Eğrisi iki tane: `MOTION_EASE.enter` (`--tl-ease-out`, GSAP'te `power3.out`)
ve `MOTION_EASE.precision` (kesme/klip). Üçüncüsü yok.

---

## Reduced Motion (Zorunlu)

**Framer Motion kullanan her şey `@/components/shell/motion`'dan `motion`
import eder — `framer-motion`'dan DEĞİL.** Bu primitive, kullanıcı reduced
motion istediğinde reveal'i animasyonun biteceği duruma anında çözer
(`initial=false`, `whileInView` → `animate`, `viewport` düşer, süre 0).

Neden: `whileInView` IntersectionObserver'a bağlıdır ve Framer bu kapıyı
reduced-motion için kaldırmaz. Sonuç, bozulmuş animasyon değil, **kaybolmuş
içerik** olur (defect B28: `/hizmetler/cnc-frezeleme` 186 metin öğesi).

```typescript
// GSAP tarafı — değişmedi
const prefersReduced = usePrefersReducedMotion()
if (prefersReduced) { gsap.set(el, finalState); return }
```
CSS: `@media (prefers-reduced-motion: reduce) { ... }`

Doğrulama: `node scripts/motion-audit.mjs --mode=rest` (içerik gizli mi),
`--mode=enabled` (karşı kanıt: reveal'ler hâlâ çalışıyor mu),
`--mode=guard` (kimse primitive'i atlamış mı).

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
