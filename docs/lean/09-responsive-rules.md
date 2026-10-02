# 09 · Responsive Rules — Mas Technic

## 0 · Public sheet breakpoints (bağlayıcı)

> Aşağıdaki "Breakpoint Sistemi" bölümü ve devamı **eski landing / iç yüzey**
> davranışını (Lenis, custom cursor, 8 sütunluk ızgara, 1400px container)
> anlatır ve tarihsel referans olarak korunur. **Yayınlanan public sayfa**
> (`/` → `TechnicalLanding`) farklı bir sözleşme kullanır; çelişki hâlinde bu
> bölüm kazanır. Kaynak: `src/styles/design-tokens.css`.

| Kırılım | Medya sorgusu | `--tl-rail` | `--tl-cols` | Rayın ekran payı |
|---|---|---|---|---|
| Masaüstü | varsayılan | 64px | 12 | %4.0 @1600 · %5.0 @1280 |
| Tablet | `max-width: 1180px` | 56px | 6 | %7.3 @768 |
| Mobil | `max-width: 767px` | 42px | 4 | %11.2 @375 · %13.1 @320 |

- Sayfa tabakası her genişlikte `min(100%, 1600px)`, ortalanmış, 1px yan kural.
- Master boşluk her kırılımda `0`. Nefes payı çocuk dolgusundan gelir.
- Bu üç token **yalnızca** `design-tokens.css` içinde kırılıma göre değişir;
  bir bant kendi medya sorgusunda ızgarayı yeniden tanımlayamaz.
- Sütun aralıkları master sütun cinsinden yazıldığı için çoğu bant kendi
  kendine akar: `span 2` hücreler 6→3→2/satır, `span 3` hücreler 4→2/satır.
- Mobilde teknik açıklama yoğunluğu bilinçli düşer: ray bant NUMARASINI
  taşır, bant ADINI taşımaz; hero ölçümlendirmesi beş etiketten üçe iner.
- **Mobil ray payı sınırı: `< %14`.** Sayı türetilmiştir, seçilmemiştir:
  `mas-grid-system` rayın ekranın "~%15–18"ini yemesini yasaklar, yani örtük
  tavan %15'tir; yayınlanan 42px ray en dar desteklenen genişlikte (%13.1 @320)
  bunun altındadır; kaldırılan kusur olan 56px ise %14.9 @375 ve %17.5 @320
  ile sınırın üstünde kalır. Bu yüzden %14 hem yayınlanan geometriyi geçirir
  hem de tam olarak yazıldığı regresyonu yakalar.
  Uygulayan iddia: `e2e/landing/landing-grid-axes.spec.ts` →
  "the mobile rail does not consume an excessive share of the viewport".
- Doğrulama: `node scripts/grid-axis-probe.mjs` (375/768/1280/1440/1600) ve
  `e2e/landing/landing-grid-axes.spec.ts`. Ray payı iddiası her mobil
  `playwright.config.ts` görünüm penceresinde çalışır — `mobile-320` dahil.

Ayrıntı: `docs/lean/06-design-system.md`.

---

## Breakpoint Sistemi

```
Mobile:    < 768px  → native scroll, snap sections, no Lenis, no custom cursor
Tablet:    768–1024px → reduced animation, Lenis active, custom cursor (pointer:fine ise)
Desktop:   > 1024px → full GSAP, Lenis, custom cursor
Ultrawide: > 1400px → container bounded (max-width: 1400px)

Cursor — iki AYRI eşik, 133 px arayla (ölçüldü; `e2e/visual/cursor-overlay-guard.spec.ts`):
  ≥ 768px + pointer:fine → `CustomCursor` mount olur (768 = MOBILE_BREAKPOINT)
  ≥ 901px + pointer:fine → yerleşik imleç `cursor: none` ile gizlenir
  Aradaki 768–900 aralığında İKİ imleç birden çizilir.
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
- Custom cursor (gerçek eşik: ≥768px + pointer:fine)
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

### 901px sınırı (yerleşik imleci gizleyen kural — mount eşiği DEĞİL)

`CustomCursor` 768px'ten itibaren mount olur; aşağıdaki kural yalnızca yerleşik
imleci gizler ve bunu ancak yerine geçen katman gerçekten mount olduysa yapar
(`:has()` kapısı, `src/index.css`).

```css
@media (min-width: 901px) and (pointer: fine) {
  html:has([data-custom-cursor]),
  html:has([data-custom-cursor]) body,
  html:has([data-custom-cursor]) :is(a, button, [role="button"]) {
    cursor: none !important;
  }
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
