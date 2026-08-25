# AI Failure Patterns — Mas Technic

> Daha önce karşılaşılan veya öngörülen AI hata modelleri.
> Her failure → bir önlem. Bu dosyayı yeni AI session'larında yükle.

---

## Animasyon Hataları

### Failure: ScrollTrigger Memory Leak
**Belirti:** Sayfa değişince eski ScrollTrigger instance'ları çalışmaya devam eder.  
**Sebep:** `ctx.revert()` cleanup eksik.  
**Önlem:**
```typescript
useEffect(() => {
  const ctx = gsap.context(() => { /* animations */ }, ref)
  return () => ctx.revert()  // ZORUNLU
}, [])
```

### Failure: Lenis Mobile'da Aktif
**Belirti:** Mobile'da scroll jitter, native scroll snapping bozulur.  
**Sebep:** `isMobile` check unutulmuş.  
**Önlem:** `SmoothScrollProvider.tsx` → `if (isMobile) return`

### Failure: Duplicate Plugin Registration
**Belirti:** Console'da "Plugin already registered" uyarısı, potansiyel conflict.  
**Sebep:** `gsap.registerPlugin(ScrollTrigger)` birden fazla dosyada.  
**Önlem:** Sadece `src/hooks/use-gsap.ts`'de register et.

### Failure: Framer Motion + GSAP Conflict
**Belirti:** Element kaybolur, animation undefined behavior.  
**Sebep:** Aynı DOM element'ine hem FM hem GSAP uygulandı.  
**Önlem:** FM ve GSAP farklı elementlere uygulanır — asla aynısına.

### Failure: Three.js Canvas Always Mount
**Belirti:** Sayfa boş olsa bile GPU yüklü, frame drop.  
**Sebep:** IntersectionObserver olmadan canvas her zaman render.  
**Önlem:** `HeroCanvas.tsx` — IntersectionObserver ile lazy mount.

### Failure: Layout Properties Animation
**Belirti:** CLS yükselir, Lighthouse skoru düşer, scroll FPS düşer.  
**Sebep:** `width`, `height`, `top`, `left` animate edildi.  
**Önlem:** Sadece `transform` ve `opacity` — `x`, `y`, `scaleX`, `opacity`.

---

## Responsive Hataları

### Failure: Mobile Layout Break After Animation
**Belirti:** Mobile'da animasyon sonrası elementler yanlış pozisyonda.  
**Sebep:** GSAP transform mobile'da reset edilmedi.  
**Önlem:** `ScrollTrigger.matchMedia()` ile breakpoint-aware animation.

### Failure: Custom Cursor Mobile'da Render
**Belirti:** Mobile'da cursor katmanı scroll'u engeller.  
**Sebep:** Cursor conditional render eksik.  
**Önlem:** `useEffect` içinde `window.matchMedia('(pointer: fine)')` check.

### Failure: Touch Target Küçük
**Belirti:** Mobile'da butonlar zor tıklanır.  
**Sebep:** Padding eksik, minimum boyut gözetilmedi.  
**Önlem:** Minimum 44x44px — `min-h-[44px] min-w-[44px]` class'ı.

---

## Architecture Drift

### Failure: Admin Bileşeni Landing'de
**Belirti:** Bundle bloat, unexpected sidebar/table render.  
**Sebep:** `import { X } from '@/components/admin/...'` landing'de.  
**Önlem:** Component ownership kuralı — admin/musteri bileşenleri sadece kendi sayfalarında.

### Failure: Z-Index Magic Number
**Belirti:** Elementler üst üste biniyor, beklenmedik z ordering.  
**Sebep:** `z-index: 9999` inline style veya arbitrary Tailwind.  
**Önlem:** `import { Z } from '@/styles/z-index'` — her z-index buradan.

### Failure: Hardcoded Color
**Belirti:** Dark mode'da renk yanlış görünür, design token sistemi bozulur.  
**Sebep:** `color: '#e8610a'` gibi hardcoded değer.  
**Önlem:** `text-forge-molten` class veya `hsl(var(--forge-molten))` CSS var.

### Failure: New Package Without Permission
**Belirti:** package.json şişer, bundle büyür, version conflict.  
**Sebep:** Task için gerekli görülen yeni lib eklendi.  
**Önlem:** Mevcut stack ile çöz (GSAP, Framer, Lenis, Three.js yeterli).

---

## Context ve Hafıza Hataları

### Failure: Plan Varsayımı Doğrulanmadan Uygulandı
**Belirti:** "Bu hook var" diye import edildi ama dosya yok.  
**Sebep:** Codebase doğrulama adımı atlandı.  
**Önlem:** Her phase başında `find src/hooks -name "*.ts" | sort`

### Failure: Aynı Konuyu İki Dosyada Tanımlama
**Belirti:** Çelişen değerler, hangi kaynak doğru belirsiz.  
**Sebep:** motion-tokens.json ve 07-motion-system.md farklı değer söylüyor.  
**Önlem:** Her bilgi tek yerde — cross-reference, duplicate değil.

### Failure: Build'i Kontrol Etmeden Commit
**Belirti:** TypeScript error veya import bug production'a gider.  
**Sebep:** `npm run build` atlandı.  
**Önlem:** Her commit öncesi `npm run build` — başarısız olursa commit yok.

---

## Performance Hataları

### Failure: will-change Her Yerde
**Belirti:** GPU bellek tükenir, bazı cihazlarda crash.  
**Sebep:** `will-change: transform` tüm elementlere eklendi.  
**Önlem:** Sadece aktif animate edilen elementler: `.hero-panel`, `.quote-panel`.

### Failure: Per-Element ScrollTrigger
**Belirti:** 20+ ScrollTrigger instance, scroll performansı düşer.  
**Sebep:** Her element için ayrı scrollTrigger.  
**Önlem:** `ScrollTrigger.batch()` — 3 element per batch, 0.08s stagger.
