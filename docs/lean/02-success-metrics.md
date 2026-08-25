# 02 · Success Metrics — Mas Technic

## Awwwards Hedefi

**Gerçekçi hedef:** Honorable Mention  
**SOTD için gerekli ek:** Özgün konsept + dedicated art direction (3-6 ay polish)

### 5 Kriter Hedefleri

| Kriter | Hedef | Notlar |
|--------|-------|--------|
| Design | ≥7.5 / 10 | Brutalist industrial, typography, depth sistemi |
| Usability | ≥7.5 / 10 | Navigation net, CTA erişilebilir, form akışı temiz |
| Creativity | ≥7.5 / 10 | CNC scroll story, lava typography, 3D showcase |
| Content | ≥8.0 / 10 | 500+ materyal, 50+ hizmet, 6 blog — içerik zengin |
| Developer | ≥8.0 / 10 | GSAP + Lenis + R3F stack, clean architecture |

## Lighthouse Hedefleri

| Metrik | Hedef | Mevcut Risk |
|--------|-------|------------|
| Performance | ≥90 | Three.js canvas, 120-frame sekans yüklemesi |
| LCP | <2.5s | Hero video + canvas konkuransı |
| CLS | <0.1 | HeadlineStagger layout shift riski |
| INP (FID) | <200ms | GSAP ticker overhead |
| Accessibility | ≥85 | Türkçe alt text, focus states |

**Test koşulları:** Lighthouse Mobile, CPU 4x throttle, Slow 4G network

## Performans KPI'ları

| Metrik | Hedef |
|--------|-------|
| İlk yükleme (bundle) | <300KB gzipped JS |
| Hero LCP görsel | <2s |
| Scroll FPS | Sabit 60fps (desktop), 30fps (mobile) |
| GSAP instance sayısı | <20 aktif ScrollTrigger |
| Three.js canvas | IntersectionObserver ile lazy |
| Sequence preload | İlk 20 frame önceden yükle |

## Conversion KPI'ları

| Eylem | Hedef |
|-------|-------|
| CTA tıklama (RFQ) | >3% landing visitor |
| Chatbot başlatma | >15% visitor |
| İletişim formu | >1% visitor |
| Ortalama sayfa süresi | >2 dakika |
| Hizmet sayfası görüntüleme | >2 sayfa/session |

## Art Direction Kriterler (Phase 4.5 QA)

- Her section tek net visual idea taşımalı
- Typography editorial mi, sadece büyük mü? → Editorial olmalı
- Ritim: HIGH → CALM → CONTRAST → CALM
- En az bir "silence zone" (statik, sessiz bölüm)
- border-radius: 0 istisnasız uygulanmış
- Renk rolleri tutarlı: teal=interactive, molten=CTA
- Mobile'da hero hâlâ premium hissettiriyor
