# 14 · Animation Architecture — Mas Technic

## Katmanlar

```
1. SmoothScrollProvider  → Lenis + gsap.ticker.add + ScrollTrigger.update
2. animation-manager.ts  → Plugin registration (TEK YER) + shared helpers
3. gsap.context (component) → kendi scope'unu açar/kapatır
4. ScrollTrigger (instance) → context içinde yaratılır
5. Framer Motion         → component enter/exit, mouse-driven motion
6. Three.js useFrame     → delta-based 3D, IntersectionObserver lazy
```

---

## Animation Manager Soyutlama Sınırı

Manager fazla soyutlanırsa component-level ownership kaybolur, cleanup çalışmaz.

### Manager sadece şunu yapar
- Plugin registration (bir kez, global)
- Shared defaults (duration, ease, stagger)
- Helper functions (`batchReveal`, `killAll`)
- Route cleanup

### Manager şunu YAPMAZ
- Component-level `gsap.context()` yönetimi
- ScrollTrigger instance ownership

### Doğru pattern
```typescript
// ✅ Component kendi context'ini açar ve kapatır
useEffect(() => {
  const ctx = gsap.context(() => { /* anim */ }, ref)
  return () => ctx.revert()
}, [])

// ❌ Manager'a ownership devretme
animationManager.createScrollAnimation(ref, vars)
```

---

## GSAP Yaşam Döngüsü

```typescript
const ref = useRef<HTMLDivElement>(null)
const prefersReduced = usePrefersReducedMotion()

useEffect(() => {
  if (prefersReduced) { gsap.set(ref.current, finalState); return }
  const ctx = gsap.context(() => {
    gsap.from(target, {
      scrollTrigger: { trigger: ref.current, start: 'top 80%', scrub: 1 },
      y: 60, opacity: 0, duration: 0.8, ease: 'power3.out',
    })
  }, ref)
  return () => ctx.revert()  // zorunlu
}, [prefersReduced])
```

---

## Lenis Entegrasyonu (Tek Kaynak)

```typescript
// src/components/providers/SmoothScrollProvider.tsx
const lenis = new Lenis({
  lerp: 0.065, duration: 1.4, smoothWheel: true,
  wheelMultiplier: 0.75, touchMultiplier: 1.5,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
})
window.__lenis = lenis
lenis.on('scroll', () => ScrollTrigger.update())
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
// Mobile (<768px) ve admin/musteri panel: init etme
```

---

## ScrollTrigger Batch

```typescript
// Per-element ScrollTrigger yerine batch
ScrollTrigger.batch(elements, {
  onEnter: (batch) => gsap.from(batch, {
    opacity: 0, y: 40, stagger: 0.08, duration: 0.6, ease: 'power2.out',
  }),
  start: 'top 85%', once: true,
})
```

---

## Hero 4-Phase (Tek Timeline)

```typescript
const ctx = gsap.context(() => {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: scrollerRef.current, scrub: 1, pin: stickyRef.current }
  })
  tl.to(maskedRef.current, { ... }, 0)        // Phase 1
  tl.to(heroPanelRef.current, { x: '-100%' }, 0.6)  // Phase 3
  tl.to(quotePanelRef.current, { x: '0%' }, 0.6)
  tl.to(lavaRef.current, { '--lava-fill': '100%' }, 0.88)  // Phase 4
}, scrollerRef)
return () => ctx.revert()
```

---

## Framer Motion Kullanım

```typescript
// ✅ AnimatePresence (mount/unmount)
// ✅ useSpring + useTransform (mouse-driven, IndustryStackCard)
// ✅ useScroll passive (read-only)
// ❌ FM ve GSAP aynı elemana uygulanmaz
```

---

## Plugin Registration (Tek Yer)

```typescript
// src/lib/animation-manager.ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
export { gsap, ScrollTrigger }

// src/hooks/use-gsap.ts → sadece re-export
export { gsap, ScrollTrigger } from '@/lib/animation-manager'
```

---

## Three.js Lazy Mount

```typescript
const [visible, setVisible] = useState(false)
useEffect(() => {
  const obs = new IntersectionObserver(
    ([e]) => setVisible(e.isIntersecting),
    { rootMargin: '200px' }
  )
  obs.observe(containerRef.current); return () => obs.disconnect()
}, [])
return visible ? <Canvas>...</Canvas> : null
```
