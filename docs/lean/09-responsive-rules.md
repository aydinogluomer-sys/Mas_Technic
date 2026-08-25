# 09 · Responsive Rules — Mas Technic

## Breakpoint Sistemi

```
Mobile:    < 768px  → native scroll, snap sections, no Lenis, no custom cursor
Tablet:    768–1024px → reduced animation, Lenis active, no custom cursor
Desktop:   > 1024px → full GSAP, Lenis, custom cursor
Ultrawide: > 1400px → container bounded (max-width: 1400px)
Custom:    > 901px + pointer:fine → custom cursor aktif
```

---

## Mobile (<768px)

### Scroll
- **Lenis:** DEVRE DIŞI — native browser scroll kullanılır
- `SmoothScrollProvider.tsx` mobile detect ile başlatmaz
- `scroll-behavior: smooth` class ile temel smooth scroll (Lenis yokken)

### Snap Sections
```css
.snap-section {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
}
.snap-section > section {
  scroll-snap-align: start;
  height: 100vh;
}
```

### Animasyon
- GSAP ScrollTrigger: sınırlı kullanım — karmaşık pinned sections yok
- Framer Motion: bileşen-düzeyinde preserve et, scroll-driven kaldır
- Stagger süresi kısalt: char:0.02s (0.035'ten düşür)
- Horizontal scroll sections: mobile'da dikey stack'e çevir

### Cursor
- Custom cursor yok — `cursor: auto !important`
- BrutalCrosshairCursor render edilmez

### Typography
- `clamp()` ile fluid scale zaten responsive
- `display-mega` mobile'da clamp lower bound: 6rem → yeterli

### Hero
- 4-phase scroll choreography → mobile'da basitleştirilmiş versiyon
- Video arka plan: `<source>` mobile'da düşük çözünürlük
- QuickQuote horizontal slide → mobile'da statik, scroll-on reveal

### Touch Hedefleri
- Minimum 44x44px — tüm interactive elementler
- Padding ile büyüt: `py-3 px-4` minimum button

---

## Tablet (768–1024px)

### Scroll
- Lenis aktif (768px üzeri)
- lerp değerleri korunur

### Animasyon
- ScrollTrigger aktif ama hero phases basitleştirilir
- Stagger değerleri desktop ile aynı

### Cursor
- Custom cursor yok (pointer:fine kontrolü)

### Layout
- 8-column → 4-column grid geçişi
- Sidebar bileşenleri `MobileSidebar` versiyonu

---

## Desktop (>1024px)

### Full feature set:
- Lenis smooth scroll
- Tüm GSAP ScrollTrigger phases
- Custom cursor (>901px + pointer:fine)
- BrutalCrosshairCursor (landing page)
- Three.js canvas
- Horizontal scroll sections
- Parallax depth

---

## Overflow ve iOS Safari

```css
/* iOS Safari 100vh fix */
@supports (-webkit-touch-callout: none) {
  .hero-section { height: -webkit-fill-available; }
}

/* Horizontal overflow gizle */
body { overflow-x: hidden; }
```

---

## Ekran Boyutu Edge Cases

### 901px sınırı (custom cursor)
```css
@media (min-width: 901px) and (pointer: fine) {
  html, body, a, button, [role="button"] { cursor: none !important; }
}
```

### Ultrawide (>1400px)
```css
.container { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }
```
Tasarım container'ı aşmaz. Full-bleed sadece video/sekans elementler için.

### Print
```css
@media print {
  .no-print { display: none; }  /* cursor, grain, animations */
}
```

---

## Responsive Test Kontrol Listesi

- [ ] iPhone SE (375px) — hero kırılmıyor mu?
- [ ] iPhone 14 Pro (430px) — touch target ≥44px
- [ ] iPad Air (820px) — Lenis aktif, cursor yok
- [ ] MacBook 1280px — full feature
- [ ] 4K 2560px — container bounded, taşma yok
- [ ] Reduced motion cihaz — animasyon yok, layout sağlam
