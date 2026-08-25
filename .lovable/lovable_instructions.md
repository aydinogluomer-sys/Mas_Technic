# Mas Technic — Lovable Uygulama Talimatları

Bu dosya Lovable'a verilecek prompt'ların tam sırasını, her prompt'ta hangi dosyaların
oluşturulacağını/değiştirileceğini ve klasör yerleşimini tanımlar.

**Altın Kural:** Her prompt sonrası PIN at. Bir sonrakine geçme.  
**Dokunulmaz:** `/admin/*` ve `/musteri-paneli/*` içinde hiçbir değişiklik yapma.  
**Tek ek paket:** `lenis` (npm adı: `lenis` — `@studio-freight/react-lenis` değil)

---

## BAŞLAMADAN ÖNCE — Asset Kontrolü

Prompt 5, 9, 10 için şu dosyalar `public/` klasöründe mevcut olmalı:

```
public/
├── sequence-cnc/
│   ├── frame_0001.webp
│   ├── frame_0002.webp
│   └── ... frame_0120.webp     ← 120 dosya
├── sequence-material/
│   ├── frame_0001.webp
│   └── ... frame_0080.webp     ← 80 dosya
└── machine-loop.mp4            ← <2MB, 720p, loop-ready
```

Bu asset'ler hazır olmadan Prompt 5, 9, 10'u başlatma.
Prompt 1–4, 6–8, 11 asset bağımsız çalışır.

---

## PROMPT 1 — Lenis Smooth Scroll + Framer Motion Sync

**Yeni dosyalar:**
```
src/components/providers/SmoothScrollProvider.tsx   ← YENİ
```

**Değiştirilen dosyalar:**
```
src/App.tsx
src/index.css     (scroll-behavior: smooth satırını kaldır)
```

**Prompt metni:**

```
Projeye lenis paketini ekle (npm install lenis — @studio-freight/react-lenis değil).

src/components/providers/SmoothScrollProvider.tsx oluştur:
  lerp: 0.08, duration: 1.4, smoothWheel: true,
  wheelMultiplier: 0.8, touchMultiplier: 1.5

ZORUNLU — Framer Motion sync:
Lenis instance oluştuktan sonra scroll event'i dinle ve
window'a scroll event dispatch et ki Framer Motion'ın
useScroll hook'u doğru çalışsın:
  lenis.on("scroll", () => {
    window.dispatchEvent(new Event("scroll"));
  });
Bu olmadan HowWeWorkSection ve CapabilitiesSection'daki
scrollYProgress değerleri hatalı hesaplanır.

App.tsx içinde:
- useLocation() ile path kontrolü yap
- /admin ve /musteri-paneli prefix'li path'lerde Lenis DEVRE DIŞI
- Diğer tüm sayfalarda SmoothScrollProvider ile sar
- /admin veya /musteri-paneli path'ine geçişte lenis.destroy() çağır,
  geri dönüşte yeniden init et

index.css içinde:
- html { scroll-behavior: smooth } satırını kaldır (Lenis ile çakışır)

Admin ve müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 2 — Industrial Cursor

**Değiştirilen dosyalar:**
```
src/components/CursorFollower.tsx   ← mevcut dosya üzerine yaz, yeni dosya oluşturma
```

**Prompt metni:**

```
src/components/CursorFollower.tsx dosyasını üzerine yaz (yeni dosya oluşturma):

Yapı:
  1. İç dot: 12px, forge-molten (#e8610a), position: fixed, pointer-events: none
     - Direkt mouse position takibi, spring yok, anında
  2. Dış ring: 40px, 1.5px border forge-molten/50, lagging spring
     - stiffness: 150, damping: 15
  3. Hover state (a, button, [role=button]):
     - ring 60px'e genişler
     - Renk forge-teal'e geçer (transition: 0.3s)

Aktif olduğu path'ler (CURSOR_PATHS):
  ["/", "/hakkimizda", "/hizmetler", "/malzemeler", "/teklif-al",
   "/blog", "/kabiliyetler", "/endustriyel", "/sss", "/iletisim"]
  ve bu path'lerin tüm alt path'leri (/hizmetler/*, /blog/*, vb.)

Devre dışı olduğu path'ler:
  /admin/*, /musteri-paneli/*, /giris, /sifremi-unuttum, /sifre-sifirla

Kurallar:
  - mobile (pointer: coarse) → render null
  - prefers-reduced-motion → render null
  - body { cursor: none } sadece aktif path'lerde, useEffect ile CSS class toggle
  - useLocation() ile path kontrolü

Admin ve müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 3 — Page Transitions

**Değiştirilen dosyalar:**
```
src/App.tsx
```

**Prompt metni:**

```
App.tsx içindeki AnimatePresence geçişini güncelle:

initial:  { opacity: 0, y: 12 }
animate:  { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] } }
exit:     { opacity: 0, y: -8, transition: { duration: 0.2 } }

/admin/* ve /musteri-paneli/* route'larını AnimatePresence'ın dışında tut,
bu path'lerde geçiş animasyonu çalışmasın (gereksiz re-render önlenir).

Admin ve müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 4 — Reveal Component + SectionHeader Entegrasyonu

**Yeni dosyalar:**
```
src/components/ui/Reveal.tsx   ← YENİ
```

**Değiştirilen dosyalar:**
```
src/components/SectionHeader.tsx
```

**Prompt metni:**

```
src/components/ui/Reveal.tsx oluştur:

Props:
  children: ReactNode
  direction?: "up" | "down" | "left" | "right"   (default: "up")
  variant?: "clip" | "word-stagger"               (default: "clip")
  delay?: number                                   (default: 0)
  duration?: number                                (default: 0.7)
  className?: string

clip variant:
  "up":    clipPath inset(0 0 100% 0) → inset(0 0 0% 0) + opacity 0→1
  "down":  clipPath inset(100% 0 0 0) → inset(0 0 0% 0) + opacity 0→1
  "left":  clipPath inset(0 100% 0 0) → inset(0 0 0 0)  + opacity 0→1
  "right": clipPath inset(0 0 0 100%) → inset(0 0 0 0)  + opacity 0→1

word-stagger variant:
  Metni kelimelerine böl
  Her kelime: opacity 0→1, y 20→0
  Stagger: 50ms kelimeler arası
  Font: Space Grotesk 700, tracking-tight

Tetikleme:
  whileInView, viewport={{ once: true, amount: 0.3 }}
  usePrefersReducedMotion true → animasyonsuz render
  Ease: [0.76, 0, 0.24, 1]

SectionHeader.tsx içindeki mevcut motion.div'i <Reveal> ile değiştir.
Landing page'deki tüm section başlıkları otomatik reveal alacak.

Admin ve müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 5 — useImagePreloader Hook + CNCScrollStory

> ⚠️ Bu prompt için `public/sequence-cnc/frame_0001.webp` ... `frame_0120.webp`
> mevcut olmalı. Asset'ler hazır değilse bu prompt'u atlayıp Prompt 6'ya geç.

**Yeni dosyalar:**
```
src/hooks/useImagePreloader.ts            ← YENİ
src/components/sections/CNCScrollStory.tsx  ← YENİ
```

**Değiştirilen dosyalar:**
```
src/pages/Index.tsx
```

**Prompt metni:**

```
1) src/hooks/useImagePreloader.ts oluştur:
   Parametreler: basePath: string, count: number
   Döndürür: { frames: HTMLImageElement[], progress: number, ready: boolean }

   Yükleme stratejisi:
   - İlk 10 frame eager yükle (hızlı başlangıç)
   - Kalan frame'ler requestIdleCallback ile arka planda lazy yükle
   - img.onerror → frame'i atla, sonraki frame'e geç (hata toleransı)
   - useEffect cleanup: abort controller ile tüm yükleme iptali

2) src/components/sections/CNCScrollStory.tsx oluştur:

Layout:
  <section style={{ height: "500vh" }}>
    <div style={{ position: "sticky", top: 0, height: "100vh" }}>
      <canvas ref={canvasRef} />
      <div className="absolute inset-0">text overlay'ler</div>
    </div>
  </section>

Canvas — ZORUNLU retina desteği:
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = containerWidth  * dpr;
  canvas.height = containerHeight * dpr;
  canvas.style.width  = containerWidth  + "px";
  canvas.style.height = containerHeight + "px";
  ctx.scale(dpr, dpr);

Canvas çizim:
  useScroll({ target: containerRef }) → scrollYProgress
  useMotionValueEvent → her değişimde:
    frameIndex = Math.floor(scrollYProgress * (120 - 1))
    ctx.drawImage(frames[frameIndex], 0, 0, containerWidth, containerHeight)
  Arka plan: #0f0f0f

Text overlay'ler (scroll % → metin → hizalama → font):
  0-15%:   "Ham malzeme. / Sonsuz olasılık." → merkez → Space Grotesk 700, text-5xl
  20-40%:  "±0.005mm tolerans."              → sol    → IBM Plex Mono, text-white/70
  45-65%:  "Ti-6Al-4V. AS9100D."             → sağ    → IBM Plex Mono, text-white/70
  70-85%:  "Prototipten 50.000 adete."       → sol    → Space Grotesk 700, text-white/70
  88-100%: "Teklif Al →" CTA                 → merkez → forge-molten bg
  Her overlay: useTransform ile opacity 0→1→0

Loading state:
  - ready false: forge-obsidian bg + forge-molten spinner
  - Metin: "%{Math.round(progress * 100)} yükleniyor..." (IBM Plex Mono, text-sm)
  - ready true → canvas fade-in (opacity 0→1, 0.5s)

Mobil:
  - height: "300vh"
  - Canvas: object-fit contain (cover değil — parça kesilmemeli)

Reduced Motion:
  - usePrefersReducedMotion true → sadece ilk frame, animasyon yok

ÖNEMLİ — Suspense/React.lazy KULLANMA:
  useImagePreloader kendi loading state'ini yönetiyor.
  React.lazy + Suspense, loading state'i ile çakışır.
  Normal import kullan.

3) Index.tsx'e entegre et:
  HeroSection'dan SONRA, HowWeWorkSection'dan ÖNCE yerleştir.

Admin ve müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 6 — Skeleton Loader + Export Progress Bar

**Yeni dosyalar:**
```
src/components/ui/IndustrialSkeleton.tsx   ← YENİ
src/components/ui/ExportProgress.tsx       ← YENİ
```

**Değiştirilen dosyalar:**
```
src/lib/excelExport.ts
src/components/admin/*.tsx   (tüm "Yükleniyor..." text'leri skeleton ile değişir)
```

**Prompt metni:**

```
1) src/components/ui/IndustrialSkeleton.tsx oluştur:

Props:
  variant: "table" | "card" | "list"
  rows?: number      (default: 5)
  columns?: number   (default: 4, sadece table için)

Tasarım:
  - forge-gunmetal arka plan
  - forge-steel shimmer: CSS keyframe
    background: linear-gradient(90deg, transparent, forge-steel/30, transparent)
    background-size: 200% 100%
    animation: shimmer 1.5s ease infinite
    @keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
  - table variant: farklı genişliklerde barlar (doğal görünüm için)
  - card variant: büyük dikdörtgen + 3 satır metin placeholder
  - list variant: tekrarlayan satır barları

2) src/components/ui/ExportProgress.tsx oluştur:
  position: fixed, bottom: 0, left: 0, right: 0, z-50
  h-10, forge-obsidian bg
  İç bar: forge-molten → forge-amber gradient, Framer Motion layout animation
  Metin: "Rapor hazırlanıyor... {fileName}" — IBM Plex Mono text-xs

3) excelExport.ts içindeki exportExcelReport() fonksiyonuna:
  - Fonksiyon başında ExportProgress göster
  - Promise resolve/reject → 1 saniye sonra fade-out ile gizle

4) Admin modüllerindeki tüm "Yükleniyor...", spinner ve loading text'lerini
   IndustrialSkeleton component'i ile değiştir.

Admin panelinin işlevselliğini bozma, sadece UI iyileştirme yap.
Müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 7 — Mikro-İnteraksiyonlar

**Yeni dosyalar:**
```
src/components/ui/ScrollProgress.tsx   ← YENİ
```

**Değiştirilen dosyalar:**
```
src/components/MagneticButton.tsx
src/components/StatsSection.tsx
src/index.css
```

**Prompt metni:**

```
1) MagneticButton.tsx güncelle:
   - Hover'da iç metin ters yönde kayma (parallax efekti)
   - Border glow: box-shadow: 0 0 20px rgba(232, 97, 10, 0.3) hover'da
   - Click: scale(0.95) → scale(1) spring bounce

2) index.css'e card-industrial hover ekle:
   .card-industrial:hover {
     border-color: hsl(var(--forge-molten));
     transform: translateY(-4px);
     box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
   }
   .card-industrial:hover .card-icon {
     transform: scale(1.1) rotate(5deg);
   }

3) src/components/ui/ScrollProgress.tsx oluştur:
   position: fixed, top: 0, z-50, w-full, h-[2px]
   Renk: forge-molten → forge-amber gradient (soldan sağa)
   Width: scrollYProgress * 100% (Framer Motion)
   useLocation() ile /admin/* ve /musteri-paneli/* path'lerinde gizle

4) StatsSection.tsx içindeki sayısal değerlere:
   font-variant-numeric: tabular-nums
   font-family: IBM Plex Mono zorunlu

Admin ve müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 8 — Tipografi & Spacing Cilalanması

**Değiştirilen dosyalar:**
```
src/index.css
src/components/sections/*.tsx   (spacing güncellemeleri)
src/pages/Index.tsx             (section arka plan döngüsü)
```

**Prompt metni:**

```
1) Tipografi hiyerarşisini standardize et (index.css + bileşenler):

   h1 (Hero):    Space Grotesk 700, text-6xl md:text-8xl, tracking-tighter, leading-[0.9]
   h2 (Section): Space Grotesk 700, text-3xl md:text-5xl, tracking-tight, leading-[1.1]
   h3 (Card):    Space Grotesk 600, text-xl md:text-2xl, tracking-tight
   Body:         Space Grotesk 400, text-base, leading-relaxed
   Technical:    IBM Plex Mono 400, text-sm, tracking-wide
   Tag/Label:    IBM Plex Mono 500, text-[10px], uppercase, tracking-[0.5em]

2) Tüm landing page section'larının spacing'ini güncelle:
   Mevcut: py-20 md:py-28
   Yeni:   py-24 md:py-32 lg:py-40
   İç container: max-w-7xl mx-auto px-6 lg:px-8

3) Landing page section arka plan döngüsünü uygula (Index.tsx):
   Light → forge-obsidian → Light → forge-gunmetal → Light
   (Monotonluk kırılır, derinlik artar)

4) Renk kurallarını uygula:
   CTA butonları:   forge-molten (#e8610a)
   Linkler:         forge-teal (#0a7e8c)
   Badge/tag:       forge-teal bg, white text
   Teknik değerler: IBM Plex Mono + forge-molten accent

Admin ve müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 9 — Machine Loop Video Background

> ⚠️ Bu prompt için `public/machine-loop.mp4` mevcut olmalı.

**Değiştirilen dosyalar:**
```
src/components/sections/ServiceDetail.tsx
src/components/ParallaxSection.tsx
```

**Prompt metni:**

```
1) ServiceDetail.tsx — hizmet detay sayfaları hero alanına ghost video ekle:
   <video
     src="/machine-loop.mp4"
     autoPlay loop muted playsInline
     preload="none"
     className="absolute inset-0 w-full h-full object-cover opacity-15"
     style={{ mixBlendMode: "luminosity" }}
   />
   - İçerik z-10, video z-0
   - IntersectionObserver: viewport'a girince play(), çıkınca pause()
   - Mobil cihazlarda (pointer: coarse) video render edilmez

2) ParallaxSection.tsx — depth-3d variant'a videoBg prop ekle:
   videoBg?: string   (isteğe bağlı video path'i)
   Bu prop verilirse z-0 katmanına video yerleşir
   opacity-10 + mix-blend-mode: luminosity

Admin ve müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 10 — Material Morph Scroll

> ⚠️ Bu prompt için `public/sequence-material/frame_0001.webp` ... `frame_0080.webp`
> mevcut olmalı.

**Yeni dosyalar:**
```
src/components/sections/MaterialMorphScroll.tsx   ← YENİ
```

**Değiştirilen dosyalar:**
```
src/pages/Malzemeler.tsx
```

**Prompt metni:**

```
src/components/sections/MaterialMorphScroll.tsx oluştur:

CNCScrollStory ile aynı canvas + sticky pattern:
  height: "300vh", 80 frame, basePath: "/sequence-material"
  useImagePreloader hook'unu kullan (basePath: "/sequence-material", count: 80)

Scroll %50'de sağda floating card:
  Malzeme özellikleri göster: machinability ve corrosionResistance
  SVG stroke-dasharray ile dairesel progress ring (1-5 skalası)
  Card: forge-gunmetal bg, border forge-teal, IBM Plex Mono font

Canvas kurulumu CNCScrollStory ile aynı (devicePixelRatio retina desteği zorunlu).
Loading state aynı pattern (spinner + yüzde).

Malzemeler.tsx içine entegre et:
  Malzeme listesinden önce, sayfanın üst kısmına ekle.

Admin ve müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 11 — Performans Optimizasyonu

**Değiştirilen dosyalar:**
```
src/index.html
src/pages/Index.tsx
src/App.tsx
```

**Prompt metni:**

```
1) index.html font loading optimizasyonu:
   IBM Plex Mono Google Fonts link'i mevcut mu kontrol et.
   Yoksa ekle:
   <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
   Preconnect link'lerinin varlığını doğrula:
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

2) Lazy import (React.lazy) ile code splitting:
   MaterialMorphScroll
   TestimonialsSection (recharts bağımlılığı)
   VideoScrollSection (varsa)

   ÖNEMLİ: CNCScrollStory'yi lazy import YAPMA.
   useImagePreloader kendi loading state'ini yönetiyor,
   Suspense ile çakışır.

3) Tüm video elementlerinde:
   preload="none"
   IntersectionObserver ile viewport'a girince play(), çıkınca pause()
   Mobil (pointer: coarse): video render edilmez

4) App.tsx içinde Lenis panel destroy kontrolü:
   /admin veya /musteri-paneli'ne geçişte lenis?.destroy()
   Public path'e geri dönüşte yeniden init

Admin ve müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 12 — SEO & Erişilebilirlik

**Değiştirilen dosyalar:**
```
src/components/JsonLdSchema.tsx
src/components/Header.tsx
src/index.html
src/pages/*.tsx    (meta tag güncellemeleri)
```

**Prompt metni:**

```
1) JsonLdSchema.tsx genişlet:
   Mevcut şemalara Product, Service, FAQPage şemaları ekle.
   Her hizmet detay sayfasında ilgili schema otomatik inject edilsin.

2) Header.tsx'e "skip to content" link ekle:
   <a href="#main-content" className="sr-only focus:not-sr-only">
     İçeriğe geç
   </a>
   Keyboard navigasyonu için.

3) Erişilebilirlik düzeltmeleri:
   - CursorFollower: aria-hidden="true"
   - CNCScrollStory canvas: role="img" aria-label="CNC üretim süreci animasyonu"
   - HexWipe: aria-hidden="true"
   - Tüm görsellerde anlamlı alt text
   - Tüm buton/link'lerde focus-visible ring göster
   - prefers-reduced-motion: tüm animasyonlar devre dışı
     (usePrefersReducedMotion mevcut — kontrol et, eksik yerlere ekle)

4) Color contrast kontrolü:
   forge-silver on forge-obsidian → WCAG AA (4.5:1) sağlanıyor mu kontrol et.
   Sağlanmıyorsa forge-silver'ı daha açık bir tona çek.

5) Sayfa bazlı meta tags:
   Her sayfaya title ve description
   Open Graph ve Twitter card meta'ları

Admin ve müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 13 — HexWipe + Section Geçişleri

**Yeni dosyalar:**
```
src/components/ui/HexWipe.tsx   ← YENİ
```

**Değiştirilen dosyalar:**
```
src/components/ParallaxSection.tsx
src/components/sections/IndustriesSection.tsx (veya endüstri geçişlerinin olduğu bileşen)
```

**Prompt metni:**

```
1) src/components/ui/HexWipe.tsx oluştur:
   SVG clip-path ile altıgen geçiş efekti.
   hexPath: "M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z"
   Animasyon: scale(0) → scale(3) merkez noktasından genişleme
   Süre: 0.8s, ease [0.76, 0, 0.24, 1]
   Kullanım: endüstri sayfaları arası geçişte tetiklenir.

2) Landing page'deki tüm büyük başlıklara (h1, h2) word-stagger uygula:
   <Reveal variant="word-stagger"> ile sar
   (Reveal.tsx Prompt 4'te oluşturuldu)

3) ParallaxSection.tsx — depth-3d variant'ını kontrol et,
   machine-loop video desteği Prompt 9'da eklendi,
   bu promptta sadece geçiş efektlerini HexWipe ile entegre et.

Admin ve müşteri panelinde hiçbir değişiklik yapma.
```

---

## PROMPT 14 — Final QA

**Değiştirilen dosyalar:**
```
Hata bulunan her dosya (QA'dan sonra belirlenir)
```

**Prompt metni:**

```
Tüm fazlar tamamlandı. Final QA gerçekleştir:

1) Regresyon kontrolü:
   - /admin/* içindeki tüm 15 modülü test et — işlevsellik bozulmuş mu?
   - /musteri-paneli/* içindeki 10 sekmeyi test et — herhangi bir kırılma var mı?
   - Supabase Realtime bağlantıları çalışıyor mu?
   - Excel export çalışıyor mu?

2) Landing page kontrol:
   - ParallaxSection 7 variant'ı hala çalışıyor mu?
   - HowWeWorkSection yatay scroll çalışıyor mu?
   - Footer sticky davranışı bozulmamış mı?
   - CNCScrollStory canvas doğru frame'leri gösteriyor mu?
   - Lenis scroll tüm section'larda düzgün çalışıyor mu?

3) Dark mode kontrolü:
   - Tüm yeni bileşenler dark mode'da doğru görünüyor mu?
   - IndustrialSkeleton dark mode'da okunabilir mi?
   - ScrollProgress dark mode'da görünüyor mu?

4) Mobil kontrol:
   - CursorFollower mobilde render edilmiyor mu? (render null)
   - CNCScrollStory mobilde 300vh + object-fit contain çalışıyor mu?
   - Video elementleri mobilde render edilmiyor mu?

5) Lenis geçiş kontrolü:
   - /admin path'ine geçişte Lenis destroy çalışıyor mu?
   - Geri dönüşte Lenis yeniden init çalışıyor mu?
   - Framer Motion scrollYProgress değerleri Lenis ile sync mi?

Bulunan sorunları düzelt. Her düzeltme sonrası ilgili testi tekrar çalıştır.
```

---

## YENİ DOSYALAR — TAM LİSTE

```
src/
├── components/
│   ├── providers/
│   │   └── SmoothScrollProvider.tsx     ← Prompt 1
│   ├── sections/
│   │   ├── CNCScrollStory.tsx           ← Prompt 5
│   │   └── MaterialMorphScroll.tsx      ← Prompt 10
│   └── ui/
│       ├── Reveal.tsx                   ← Prompt 4
│       ├── ScrollProgress.tsx           ← Prompt 7
│       ├── IndustrialSkeleton.tsx       ← Prompt 6
│       ├── ExportProgress.tsx           ← Prompt 6
│       └── HexWipe.tsx                  ← Prompt 13
└── hooks/
    └── useImagePreloader.ts             ← Prompt 5
```

---

## DEĞİŞTİRİLEN DOSYALAR — TAM LİSTE

```
src/App.tsx                                     ← Prompt 1, 3, 11
src/index.css                                   ← Prompt 1, 7, 8
src/index.html                                  ← Prompt 11, 12
src/components/CursorFollower.tsx               ← Prompt 2 (üzerine yaz)
src/components/SectionHeader.tsx                ← Prompt 4
src/components/MagneticButton.tsx               ← Prompt 7
src/components/StatsSection.tsx                 ← Prompt 7
src/components/ParallaxSection.tsx              ← Prompt 9, 13
src/components/JsonLdSchema.tsx                 ← Prompt 12
src/components/Header.tsx                       ← Prompt 12
src/components/sections/ServiceDetail.tsx       ← Prompt 9
src/components/admin/*.tsx                      ← Prompt 6
src/lib/excelExport.ts                          ← Prompt 6
src/pages/Index.tsx                             ← Prompt 5, 8
src/pages/Malzemeler.tsx                        ← Prompt 10
src/pages/*.tsx                                 ← Prompt 12
```

---

## PROMPT SIRASI ÖZETİ

```
Prompt 1:  Lenis + Framer Motion sync          — asset bağımsız
Prompt 2:  Industrial Cursor                   — asset bağımsız
Prompt 3:  Page Transitions                    — asset bağımsız
Prompt 4:  Reveal Component + SectionHeader    — asset bağımsız
Prompt 5:  useImagePreloader + CNCScrollStory  — sequence-cnc gerekli ⚠️
Prompt 6:  Skeleton + Export Progress          — asset bağımsız
Prompt 7:  Mikro-interaksiyonlar               — asset bağımsız
Prompt 8:  Tipografi & Spacing                 — asset bağımsız
Prompt 9:  Machine Loop Video BG               — machine-loop.mp4 gerekli ⚠️
Prompt 10: Material Morph Scroll               — sequence-material gerekli ⚠️
Prompt 11: Performans Optimizasyonu            — asset bağımsız
Prompt 12: SEO & Erişilebilirlik               — asset bağımsız
Prompt 13: HexWipe + Section Geçişleri         — asset bağımsız
Prompt 14: Final QA                            — tüm asset'ler gerekli ⚠️
```

Her prompt sonrası PIN at. Bir sonrakine geçme.
