# Phase 11 — AMBIGUITY Kararları
Date: 2026-04-18
Status: LOCKED (bu kararlar 11A execution'da FIX-07 tetiklemeden kabul edilir)

## Karar 1 — R3F THREE.Color Literalleri
Kapsam: `CNCModel.tsx`, `IndustryModels.tsx`, `ModelViewer.tsx`, `TeklifAl.tsx` (Three.js sahne içi material color atamaları)
Yaklaşım: `// OK: R3F runtime` exempt comment + ileriki **11A-extended** oturumunda `cssVar.ts` helper ile runtime güncelleme.
Örnek:
```tsx
// OK: R3F runtime — token migration: cssVar.ts useEffect (phase-11A-extended)
material.color.set('#ff6b35')
```
Karar: **EXEMPT** — 11A'da kapsama dahil değil, ayrı faz.

## Karar 2 — Brand SVG Literalleri
Kapsam: Logo SVG, marka SVG asset'leri içindeki `fill`/`stroke` değerleri (Google/LinkedIn vb.).
Yaklaşım: `// OK: brand asset` exempt comment.
Karar: **EXEMPT** — SVG asset içi literal, tokenize edilemez (brand identity).

## Karar 3 — Gizmo XYZ Eksenleri
Kapsam: `ViewportGizmo` veya benzeri bileşendeki X/Y/Z eksen renkleri (`#ef4444`, `#22c55e`, `#3b82f6`).
Yaklaşım: `// OK: XYZ convention` exempt comment.
Karar: **EXEMPT** — Endüstri standardı eksen renkleri, override edilemez.

## Karar 4 — Material Picker
Kapsam: Kullanıcıya sunulan renk seçici bileşeni (`ModelViewer` ve `TeklifAl` `MATERIAL_COLORS` paleti).
Yaklaşım: `// OK: user-facing palette` exempt comment.
Karar: **EXEMPT** — Kullanıcıya gösterilen veri, token ile replace edilemez.

## Karar 5 — NotFound hsla Dinamik Hue
Kapsam: 404 sayfası glitch/animasyon efektindeki runtime-hesaplanan `hsla(${r.hue}, ...)` değeri.
Yaklaşım: `// OK: dynamic hue` exempt comment.
Karar: **EXEMPT** — Runtime hesaplamalı, statik token map'lenebilir değil.

---

## 11A-Extended Planı (cssVar.ts Helper)

Sonraki 11A oturumunda yapılacak:

1. `src/utils/cssVar.ts` oluştur:
```ts
// CSS token'ını runtime'da Three.js Color formatına çevirir
export function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}
```

2. `CNCModel` / `IndustryModels` / `ModelViewer` / `TeklifAl`'da `useEffect` ile:
```ts
useEffect(() => {
  material.color.set(getCSSVar('--heat-molten'));
}, []);
```

Yukarıdaki 5 EXEMPT kararı 11A batch mapping'inde atlanır.
