# 13 · Forbidden Patterns — Mas Technic

## Animation

### ❌ gsap.context() olmadan ScrollTrigger
```typescript
// YANLIŞ
useEffect(() => { gsap.from(el, { scrollTrigger: {...} }) }, [])
// DOĞRU
const ctx = gsap.context(() => { gsap.from(el, {...}) }, ref)
return () => ctx.revert()
```

### ❌ FM + GSAP aynı elemana
```typescript
// YANLIŞ — conflict
<motion.div animate={{ x: 100 }} ref={gsapRef}>
// DOĞRU — ayrı elementler
<div ref={gsapRef}><motion.div animate={...} /></div>
```

### ❌ Lenis mobile'da
```typescript
if (window.matchMedia('(max-width: 768px)').matches) return
```

### ❌ Çoklu gsap.registerPlugin
```typescript
// Sadece src/lib/animation-manager.ts'de çağrılır.
// Diğer dosyalar: import { gsap, ScrollTrigger } from '@/lib/animation-manager'
```

### ❌ will-change statik elementlere
```css
/* YANLIŞ */ * { will-change: transform; }
/* DOĞRU */ .hero-panel, .quote-panel { will-change: transform; }
```

### ❌ Layout property animate
```typescript
// YANLIŞ — reflow/CLS
gsap.to(el, { width: '100%', top: '50px' })
// DOĞRU — transform + opacity
gsap.to(el, { x: '100%', scaleY: 1.2, opacity: 0 })
```

---

## Z-Index

### ❌ Magic number
```css
/* YANLIŞ */ .modal { z-index: 9999; }
/* DOĞRU */ style={{ zIndex: Z.header }}  // from @/styles/z-index
```

### ❌ position:fixed z-index'siz
```tsx
// position:fixed/absolute her zaman Z objesinden zIndex alır
```

---

## Renk

### ❌ Hardcoded hex/rgb
```tsx
// YANLIŞ
<div style={{ color: '#e8610a' }}>
// DOĞRU
<div className="text-forge-molten">
// veya style={{ color: 'hsl(var(--forge-molten))' }}
```

---

## Mimari

### ❌ Admin/müşteri component'i landing'de
Landing kendi `src/components/*` bileşenlerini kullanır.
`/admin/*` ve `/musteri/*` import edilmez.

### ❌ Supabase çoklu init
```typescript
// Tek kaynak: import { supabase } from '@/integrations/supabase/client'
```

### ❌ Three.js canvas IntersectionObserver'sız
```tsx
// Canvas her zaman lazy + viewport-aware mount
const HeroCanvas = lazy(() => import('./r3f/HeroCanvas'))
```

---

## İçerik / Kod

### ❌ 180 satırı aşan component
Sub-component'lere veya hook'a çıkar.

### ❌ "What" yorumu
```typescript
// YANLIŞ: // loop through items
// DOĞRU:  // iOS Safari -webkit-fill-available olmadan 100vh yanlış
```
Sadece "why" yorumlanır. Kod kendini anlatır.
