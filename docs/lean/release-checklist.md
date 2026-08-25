# Release Checklist — Mas Technic
> Her deploy öncesi bu listeyi gez. "Geçti" demeden geçme.

---

## Pre-Release

### Build
- [ ] `npm run build` — hata yok, warning minimal
- [ ] `npm run lint` — ESLint clean
- [ ] TypeScript strict check — `tsc --noEmit` hata yok
- [ ] Bundle size kontrolü: three chunk <500KB, gsap chunk <200KB

### Animasyon
- [ ] GSAP ScrollTrigger instance sayısı <20 (console log ile kontrol)
- [ ] Route change sonrası ScrollTrigger cleanup çalışıyor (console'da kill log)
- [ ] Memory leak yok: 3 kez route geçişi yap, instance sayısı artmıyor
- [ ] Lenis mobile'da kapalı (<768px'de window.__lenis undefined)
- [ ] will-change sadece animate edilen elementlerde

### Reduced Motion
- [ ] Mac: System Preferences → Accessibility → Reduce Motion → Açık
- [ ] Hero animasyon skip → layout sağlam
- [ ] Tüm section reveal → instant state
- [ ] Cursor animasyon → normal cursor

### Mobile
- [ ] iPhone (375px): Hero kırılmıyor, touch targets ≥44px
- [ ] iPad (820px): Lenis aktif, cursor yok
- [ ] Android Chrome: Native scroll düzgün
- [ ] iOS Safari: -webkit-fill-available hero fix çalışıyor

### Visual QA
- [ ] Dark mode — forge renkleri doğru override
- [ ] Light mode — concrete/workshop background sağlam
- [ ] Film grain overlay görünüyor (opacity 0.035)
- [ ] Custom cursor desktop'ta aktif (>901px, pointer:fine)
- [ ] border-radius: 0 — hiçbir element yuvarlak değil

---

## Performance

### Lighthouse (Mobile, Throttled)
- [ ] Performance ≥90
- [ ] LCP <2.5s
- [ ] CLS <0.1
- [ ] INP <200ms
- [ ] Accessibility ≥85

### Network
- [ ] Space Grotesk font — font-display: swap
- [ ] Supabase CDN preconnect link rel tag var
- [ ] Hero video lazy load (intersection observer)
- [ ] Three.js canvas lazy mount (intersection observer)

---

## İçerik

### Türkçe
- [ ] Typo taraması: başlıklar, CTA'lar, form label'ları
- [ ] Alt text: tüm `<img>` elementlerde Türkçe alt var
- [ ] KVKK uyumu: çerez banner, gizlilik linki footer'da

### SEO
- [ ] JSON-LD schema: Organization + LocalBusiness
- [ ] OG tags: title, description, image — tüm sayfalarda
- [ ] Canonical URL: index.html'de doğru
- [ ] robots.txt: /admin ve /musteri-paneli disallow

---

## Fonksiyonel Test

### RFQ Akışı
- [ ] CAD dosyası yükleme çalışıyor (STEP, STL, OBJ)
- [ ] 3D viewer: pan, zoom, wireframe toolbar
- [ ] Form submit → Supabase'e yazıldı
- [ ] Rate limit: 5+ hızlı submit → bloklanıyor

### Chatbot
- [ ] Chat balonu açılıyor
- [ ] FAQ soruları yanıt veriyor
- [ ] Streaming response çalışıyor
- [ ] Rate limit mesajı görünüyor

### Auth
- [ ] Login akışı çalışıyor
- [ ] Protected route redirect: /admin → /admin/login
- [ ] Müşteri portalı: session olmadan redirect

### Admin Panel
- [ ] Excel export çalışıyor (pivot + KPI sheets)
- [ ] Supabase Realtime: sipariş güncelleme anlık

---

## Phase 4.5 — Art Direction QA Checklist

Her madde için: ✅ Geçti / ⚠️ Revize / ❌ Baştan. Tüm maddeler ✅ olmadan Phase 5'e geçilmez.

### Section Düzeyi
- [ ] Her section tek visual idea taşıyor mu?
- [ ] Generic/template section var mı?
- [ ] Section kaldırılsaydı kayıp hissedilir mi?

### Hero
- [ ] İlk 3 saniyede "Premium Industrial" net mi?
- [ ] Entrance 1.2s altında bitiyor mu?
- [ ] Scroll başlayınca entrance kalıntısı yok mu?

### Typography
- [ ] Başlıklar editorial mi, sadece büyük mü?
- [ ] IBM Plex Mono teknik tag'larda tutarlı mı?
- [ ] Type hierarchy okunabilir mi?

### Görsel Tutarlılık
- [ ] Görseller aynı ışık dünyasında mı?
- [ ] Renk rolleri tutarlı mı?
- [ ] border-radius:0 istisnasız mı?

### Motion Ritmi
- [ ] HIGH → CALM → CONTRAST → CALM düzeni var mı?
- [ ] Aynı animasyon 3+ kez tekrarlanıyor mu?
- [ ] En az bir "silence zone" var mı?

### CTA & Conversion
- [ ] CTA'lar kayboluyor mu?
- [ ] Molten rengi dikkat çekiyor mu?
- [ ] RFQ formu hero'dan ulaşılabilir mi?

### Mobile
- [ ] Mobile'da premium industrial hissi var mı?
- [ ] Lenis-off durumunda kırılma yok mu?
- [ ] Touch hedefleri ≥44px mi?

---

## Post-Release

- [ ] Supabase Edge Function logları — error var mı?
- [ ] Browser console — uncaught error var mı?
- [ ] Lovable.dev preview URL çalışıyor
- [ ] Google Search Console: indexing sorun yok
- [ ] decision-log.md'e release notunu ekle
- [ ] ROADMAP.md'i güncelle

---

*Önerilen release sıklığı: feature complete olunca, acele değil*  
*Her release için bu checklist'in tüm maddeleri ✅ olmalı*
