# AI Coding Rules — Mas Technic

## Pre-flight Ritual (Her Batch Başında Zorunlu)

```
1. ACTIVE_TASK.md'yi oku
2. Aktif constraint'leri yüksek sesle tekrar et
3. Success criteria'yı listele
4. Onay geldikten sonra yaz
```

Onay gelmeden kod yazmaya başlama.

---

## Codebase Doğrulama

Phase başlamadan önce, plan'ın iddia ettiği dosyaların gerçekten var olduğunu doğrula:

```bash
find src/hooks -name "*.ts" | sort
find src/components -name "*.tsx" | sort
find src/lib -name "*.ts" | sort
```

"Bu hook zaten var" gibi plan varsayımlarını körü körüne kabul etme.  
Olmayan dosya için önce oluştur, sonra planı uygula.

---

## Dosya Düzenleme Kuralları

```
✅ Surgical edit — sadece değişmesi gereken satırlar
✅ Mevcut dosyaları düzenle — yeni dosya sadece gerçekten gerekiyorsa
✅ 180 satır limit — aşıyorsa sub-component çıkar
✅ Named export — default export yerine tercih et
✅ forwardRef + displayName — ref gereken bileşenler için
❌ Tüm dosyayı yeniden yaz — diff minimale indir
❌ Çalışan kodu refactor et — sadece görevi tamamla
❌ Yeni abstraction ekle — task gerektirmiyorsa
❌ Yorum ekle — sadece WHY non-obvious ise
```

---

## Forbidden Actions

```
❌ supabase/ ve docs/supabase-full-setup.sql — schema değişikliği
❌ /admin/* route ve bileşenleri — büyük değişiklik
❌ /musteri-paneli/* route ve bileşenleri — büyük değişiklik
❌ Yeni npm package ekleme — package.json değiştirme
❌ SSR context'te GSAP — bu CSR-only proje
❌ Lenis mobile'da aktif — <768px native scroll
❌ Z objesi dışında z-index
❌ Hardcoded hex/rgb renk
❌ border-radius > 0 — sharp industrial istisnasız
❌ --no-verify ile git commit — hook'ları atlatma
```

---

## Animasyon Kuralları

```typescript
// ✅ gsap.context zorunlu
useEffect(() => {
  const ctx = gsap.context(() => { /* */ }, ref)
  return () => ctx.revert()
}, [])

// ✅ Her animasyonda reduced-motion check
const prefersReduced = usePrefersReducedMotion()
if (prefersReduced) {
  gsap.set(el, { opacity: 1, y: 0 })  // final state
  return
}

// ✅ Sadece transform + opacity animate et
gsap.to(el, { x: 100, opacity: 0 })  // OK
gsap.to(el, { width: '100%', top: 0 })  // ❌ reflow

// ✅ ScrollTrigger.batch — birden fazla element
ScrollTrigger.batch(elements, { onEnter: batch => gsap.from(batch, {...}) })
```

---

## Test Gereksinimleri

```bash
# Her değişiklikten sonra zorunlu
npm run build  # TypeScript hata yok, bundle başarılı

# Önerilen (sonuç etkiliyorsa)
npm run lint   # ESLint clean
```

Build başarısız → commit yok.

---

## Refactor Kuralları

```
180 satır aşılırsa → sub-component veya hook çıkar
Hook > 100 satır → ikiye böl
Data file → limit yok (materialsData 500+ item)
Component birden fazla sorumluluk → sorumlulukları ayır
```

---

## Naming Conventions

```typescript
// Component: PascalCase
HeroSection, BrutalListRow, MagneticButton

// Hook: camelCase, use prefix
useScrollVelocity, useClipReveal, usePrefersReducedMotion

// File: kebab-case
hero-section.tsx (ama mevcut codebase PascalCase.tsx kullanıyor — tutarlılık öncelik)

// CSS class: kebab-case
.brutal-link, .forge-molten, .reveal-clip-vertical

// GSAP context ref: containerRef veya component-specific ref
const containerRef = useRef<HTMLDivElement>(null)
```

---

## Context Yönetimi

```
Her major task = yeni /clear session
10+ mesajdan sonra mid-session anchor:
  "Şu ana kadar ne yaptık, aktif constraint'ler neler?"
Aynı konuyu iki dosyada tanımlama — çelişki üretir
Çelişki varsa MASTER_CONTEXT.md kazanır
```

---

## Snippet Kullanımı

```typescript
// Plan snippets referans veriyorsa:
// 1. /snippets klasörünü oku (sen okursun, AI okumaz)
// 2. Pattern'i anla
// 3. Mas Technic stack'ine uyarla
// 4. Implement et
// 5. Snippet'i sil + ROADMAP.md'de işaretle

// Snippet direkt copy-paste edilmez — her zaman uyarlanır
```

---

## Her Phase'in 3 Zorunlu Adımı

### 1. Snippet Damıtma (phase başında)
- İlgili repoları `/tmp/ref-*`'a clone'la
- Pattern analiz et
- `/snippets/[kategori]/[isim].ts`'e damıt

### 2. Cleanup (phase bittikten sonra)
- Duplicate kod sil
- Dead import kaldır
- `npm run build` temiz mi kontrol et
- TypeScript error check

### 3. Doc Temizleme (cleanup sonrası)
- Snippet implement edildiyse `/snippets`'ten sil
- Lean doc MASTER_CONTEXT'e damıtıldıysa sil
- ROADMAP.md'de TAMAMLANAN'a taşı
- ACTIVE_TASK.md'yi bir sonraki phase için güncelle

**Bu 3 adım atlanırsa phase tamamlanmış sayılmaz.**

---

## Doc Lifecycle Kuralı

```
Lean doc içeriği MASTER_CONTEXT.md'ye damıtıldı → lean doc silinir
Snippet bir component'e implement edildi      → snippet silinir
Her ikisi ROADMAP.md TAMAMLANAN'a taşınır
```

Sistem zamanla kendi kendini şişirmemeli.  
Her phase sonunda repo daha küçük olmalı, daha büyük değil.
