# 13 · Forbidden Patterns — Mas Technic

## Public master grid

> Sözleşme: `docs/lean/06-design-system.md` · `src/styles/master-grid.css`.
> Bu kalıplar Phase 02'de ölçülerek kaldırıldı; geri gelirse
> `e2e/landing/landing-grid-axes.spec.ts` kırmızıya düşer.

### ❌ Bant gövdesinde master ızgarayı yeniden kurmak
```css
/* YANLIŞ — dolgulu kutu içindeki 12 track master track'lerden dardır,
   her iç sınır kayar ve hata görüntü genişliğiyle büyür */
.tl-x-body{grid-template-columns:repeat(12,minmax(0,1fr));padding:24px 16px}
/* DOĞRU — bandın GERÇEK track'lerini devral, dolguyu çocuğa ver */
.tl-x-body{grid-column:2/-1;display:grid;grid-template-columns:subgrid;padding-block:24px}
```

### ❌ Subgrid'e yatay dolgu / kenarlık / kenar boşluğu
CSS Grid L2'ye göre bunlar ilk ve son track'i kısaltır: iç hatlar yerinde
kalırken dış kenarlar master ızgaradan çıkar. `padding-inline: 0` sözleşmedir.

### ❌ Master ızgaradan türemeyen yerleşim oranı
`23.8%`, `19.2%`, `4.6%`, `35% 65%`, `48% 52%`, `repeat(6,1fr) 132px`,
`4fr 5fr 5fr` (14 birim), `43fr 77fr` — hiçbiri hiçbir genişlikte bir master
hatta çözülmüyordu. Yerleşim `span N` ile yazılır.

**Kuralın tam ifadesi.** Yasak, bir bloğun DIŞ kenarlarına ilişkindir:
*her yapısal bloğun dış kenarları master eksenlere oturur; bir bloğun İÇ
bölünmesi içerik ölçülü olabilir ve nerede olduğu ADIYLA yazılmak zorundadır.*
Sayfa ritmini aşağı doğru taşımaya devam eden iç bloklar `.tl-subgrid`'dir ve
master hatlarda bölünür. Kendi içinde kapalı bir bileşen olan bloklar (ölçüm
aleti, bitiş şeridi, veri plakası) içeride içeriğe göre bölünebilir — ama dış
kenarları yine master eksendedir ve `scripts/grid-axis-probe.mjs` ile ölçülür.

İzin, listenin kendisidir. Şu an belgeli DÖRT iç bölünme var:
`.tl-nexus-kpis`, `.tl-rfq-body > ol`, `.tl-title-block` ve tablet
`.tl-part-passport`. Gerekçeleri ve ölçülen dış kenarları
`docs/lean/06-design-system.md` → *Documented content-measured interiors*
tablosunda. **Listede olmayan içerik ölçülü bir iç bölünme kusurdur**; yeni bir
giriş eklemek, bloğun dış kenarlarını da probe'a eklemeyi gerektirir.

`.tl-header` bu listeden ÇIKARILDI (Faz 03). İstisna yeniden adlandırılmadı,
ortadan kaldırıldı: bandı içerik ölçülü olmaya zorlayan atıl TR/EN anahtarı
kaldırıldı, eylem kümesi üç master sütuna sığdı ve bant `subgrid` oldu. İç
bloklar (`.tl-brand`, `.tl-header-context`, `.tl-header-actions`) artık probe
hedefidir; ölçülen sapmalar 0.00–0.13px.

### ❌ Bant medya sorgusunda ızgara token'ı ezmek
```css
/* YANLIŞ */ @media (max-width:767px){.tl-root{--tl-cols:4}}
```
`--tl-rail` / `--tl-cols` / `--tl-gap` yalnız `design-tokens.css` içinde
kırılıma göre değişir. Yukarıdaki kalıp tam olarak mobil rayın tablet
değerini (56px = 375px'in %14.9'u) miras almasına yol açmıştı.

### ❌ Dekoratif bir öğeye yapısal track vermek
Mühür, rozet, filigran gibi süsler master track tüketmez.

### ❌ Public stylesheet'te sabit renk / yazı tipi / köşe yarıçapı
`--tl-*` token'ı kullan. Köşe yarıçapı sıfırdır; `50%` yalnız gerçekten
daire olan öğe için (`--tl-radius-round`).

---

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
