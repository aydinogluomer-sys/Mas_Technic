# 06 · Design System — Mas Technic

## Temel İlke

**Premium Industrial:** Keskin kenarlar, güçlü tipografi, metalik derinlik.  
Brutalist editorial dilini endüstriyel hassasiyetle birleştir.

---

## Renk Sistemi

### Roller (Katı Kurallar)

| Renk | Hex | Rol |
|------|-----|-----|
| `forge-teal` | #0a7e8c | **Primary / Interactive** — linkler, hover state, fokus ring |
| `forge-molten` | #e8610a | **CTA / Birincil vurgu** — ana button, önemli aksiyon |
| `forge-amber` | #d4850e | **İkincil vurgu** — hover state alternatifi |
| `forge-obsidian` | #353c46 | **Dark background** — dark mode bg, section dark |
| `forge-concrete` | #e8e4de | **Light background** — light mode bg |
| `forge-silver` | #a8b2bc | **Muted / Secondary text** |
| `forge-steel` | #3a4a5c | **Accent** — brushed steel feel |

### Kullanım Kuralları
- **Hardcoded hex yasak.** Her renk CSS custom property üzerinden: `hsl(var(--forge-teal))`
- `forge-molten` sadece CTA ve önemli vurgu için — aşırı kullanım mesajı zayıflatır
- `forge-teal` interactive state için rezerve — dekoratif amaçla kullanılmaz
- Dark mode: `.dark` class selector ile otomatik override

---

## Tipografi Hiyerarşisi

```css
/* Display — Landing hero */
.text-display-mega → clamp(6rem, 18vw, 22rem), lh:0.82, ls:-0.06em, fw:700

/* Başlıklar */
.typo-h1 → clamp(3.5rem, 8vw, 9rem), lh:0.92, ls:-0.04em
.typo-h2 → clamp(2.5rem, 5.5vw, 6rem), lh:1.0, ls:-0.03em
.typo-h3 → clamp(1.75rem, 3vw, 3rem), lh:1.05, ls:-0.02em

/* Teknik */
.typo-technical → IBM Plex Mono, uppercase, tracking-widest
.typo-tag       → IBM Plex Mono, 0.75rem, uppercase
```

### Kurallar
- **Space Grotesk** — display ve body metin
- **IBM Plex Mono** — teknik etiket, index numarası, spec değeri, kod
- Başlıklar `text-balance` veya `text-pretty` ile wrap edilir
- Editorial heading: büyük point size + tight letter-spacing + düşük line-height

---

## Spacing Sistemi

```
Tailwind 8-point grid:
  p-2 = 8px, p-4 = 16px, p-6 = 24px, p-8 = 32px
  p-12 = 48px, p-16 = 64px, p-24 = 96px

Section padding:
  py-24 md:py-32 lg:py-40  ← .section-industrial utility
```

---

## Border Radius

```
--radius: 0rem — Sharp industrial, istisnasız
```
Hiçbir UI element'e border-radius eklenmez. Yuvarlak köşe = forbidden.

---

## Shadow Sistemi

```css
.shadow-industrial         → 8px 8px 0px hsl(var(--forge-obsidian))
.shadow-industrial-primary → 8px 8px 0px hsl(var(--forge-teal) / 0.4)
.shadow-1 → subtle (0 2px 8px rgba(0,0,0,0.08))
.shadow-2 → medium (0 4px 16px rgba(0,0,0,0.12))
.shadow-3 → deep   (0 8px 32px rgba(0,0,0,0.18))
```

---

## Grid Sistemi

- **Kolon:** 8-column grid
- **Gap:** 2rem (32px)
- **Max-width container:** 1400px (`2xl` breakpoint)
- **Container padding:** 2rem her yanda

---

## Derinlik Sistemi (Depth)

```
Katmanlar (altan üste):
  1. Background (video, grain, gradient)
  2. Section content
  3. Ambient glow overlay
  4. Grain overlay (z:5)
  5. Header (z:50)
  6. Cursor (z:90)
  7. Page transition (z:95)
  8. Preloader (z:100)

Phase 3'te eklenecek:
  .depth-layer-1: translateZ(-50px)
  .depth-layer-2: translateZ(-150px)
  .depth-layer-3: translateZ(-300px)
  (perspective container ile birlikte)
```

---

## Cursor Sistemi

```css
/* Desktop only (>901px, pointer:fine) */
cursor: none !important — custom cursor aktif

/* Cursor anatomisi */
.cursor-dot  → forge-molten dolu nokta (hover'da forge-teal)
.cursor-ring → forge-molten / 0.5 border (hover'da forge-teal / 0.6)

/* Phase 4 eklentisi */
mix-blend-mode: difference → dot'a
velocity reactive scale: 1.0 → 1.5 (hızlı scroll'da)
```

---

## Film Grain

```css
.brutalist-grain → SVG turbulence overlay, opacity: 0.035, position:fixed, z:5
.brutalist-scanline → CRT scanline efekt (isteğe bağlı kullanım)
```

---

## Selection Rengi

```css
::selection → forge-molten background
```

---

## Focus States

```css
focus-visible → 2px outline, forge-teal renk, 2px ring offset
```
Klavye navigasyonu her element'te görünür olmalı.
