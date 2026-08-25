# Prompt Library — Mas Technic
> Copy-paste prompt'lar (Claude Code için, 2026-05-12'den itibaren).

---

## Session Yönetimi

### Session Başlat
```
CLAUDE.md ve ACTIVE_TASK.md oku.
Aktif constraint'leri ve şu anki task'ı söyle. Onay bekle, sonra başla.
```

### Codebase Doğrula
```
find src/hooks -name "*.ts" | sort
find src/components -name "*.tsx" | sort
find src/lib -name "*.ts" | sort
```

### Mid-Session Anchor
```
Şu ana kadar ne yaptık? Aktif constraint'ler? Bir sonraki adım?
```

### Phase Cleanup
```
Bu phase'de değişen tüm dosyaları listele. Kontrol:
- Duplicate import? Dead code? Hardcoded renk? npm run build temiz?
Sorun varsa düzelt, sonra rapor ver.
```

---

## Animasyon

### GSAP ScrollTrigger Reveal
```
@docs/lean/14-animation-architecture.md yükle.
[Component].tsx'e scroll reveal:
- gsap.context() + containerRef scope
- usePrefersReducedMotion check
- scrub:1, start:'top 80%'
- transform+opacity only
- Mevcut 4-phase hero scroll'u etkileme
```

### Yeni Section
```
@docs/lean/06-design-system.md + @docs/lean/13-forbidden-patterns.md yükle.
[Section] oluştur:
- BrutalSectionHeader, forge palette (hardcoded yok)
- border-radius:0, gsap.context reveal
- Reduced-motion: layout sağlam, anim yok
- 180 satır limit
```

### Hero Cold-Load Entrance
```
@docs/lean/07-motion-system.md yükle.
HeroSection.tsx'e isFirstVisit gated gsap.timeline ekle:
- t=0: grid scaleX 0→1 stagger 0.05s
- t=0.3s: .typo-tag slide up
- t=0.6s: HeadlineStagger
- t=1.0s: CTA clip-path
- t=1.2s: HeroCanvas fade
- 4-phase scroll'u bozma. Reduced-motion: instant state.
```

### Kinetic Typography
```
@docs/lean/07-motion-system.md yükle.
HeadlineStagger.tsx'e useScrollVelocity reaktif skewX (max ±3deg).
Reduced-motion: skew yok.
```

---

## Component

### Yeni Hook
```
@docs/lean/ai-coding-rules.md yükle.
src/hooks/use[Name].ts:
- TypeScript named export, usePrefersReducedMotion check
- gsap.context cleanup (gerekiyorsa)
- 100 satır limit. Önce `find src/hooks` ile duplicate yok mu kontrol et.
```

### Cursor Update
```
@docs/lean/07-motion-system.md + @docs/lean/design-tokens.json yükle.
CustomCursor.tsx:
- useScrollVelocity → scale (slow:1.0, normal:1.2, fast:1.5)
- gsap.quickTo smooth, mix-blend-mode:difference cursor dot
- Reduced-motion: scale yok, blend kalsın
- MagneticButton koordinasyon bozulmasın
```

---

## Snippet Çıkarma

### adrianhajdin pattern
```
/tmp/ref-adrian/src/ analiz et. Animation singleton pattern'i çıkar.
Stack: React 18 + GSAP 3.14 + Lenis 1.3 + TS 5.8.
snippets/gsap/animation-manager-reference.ts'e min snippet (≤50 satır).
```

### ScrollTrigger Batch
```
/tmp/ref-fullstack/src/ analiz et.
ScrollTrigger.batch() pattern → snippets/gsap/scrolltrigger-batch.ts.
Kullanım: card/list reveal, 3 per batch, 0.08s stagger.
```

---

## Supabase

### Yeni Query Hook
```
@src/integrations/supabase/types.ts yükle.
src/hooks/use[Table].ts:
- TanStack useQuery + supabase client '@/integrations/supabase/client'
- Tipler types.ts'den. Schema'ya dokunma.
```

---

## Debug

### ScrollTrigger Sayımı
```
console.log(ScrollTrigger.getAll().length)
Hangi trigger'lar aktif, hangi elementleri hedefliyor?
```

### Build Hatası
```
npm run build çıktısı ver. Sadece ilgili dosyaları düzelt.
Unused import kaldır. Başka dosyalara dokunma.
```

### Lighthouse
```
index.html'deki preload + font-display değerleri.
LCP için above-the-fold elementler. will-change kullanan class'lar.
```
