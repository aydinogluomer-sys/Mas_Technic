# ACTIVE_TASK.md
> Her session başında oku. Bitince güncelle.

---

## Aktif Phase
**Phase 4.5 — Art Direction QA (Manuel)**

## Tamamlanan
- ✅ Phase 1 — Documentation (22 dosya)
- ✅ Phase 2 — Animation Architecture Centralization
- ✅ Phase 3 — Visual Elevation (entrance, kinetic typo, depth CSS)
- ✅ Phase 4 — Interaction Polish (velocity cursors, hover baseline, page transition)
- ✅ Phase 5 — Performance (will-change, BlurImage priority, Supabase preconnect)

## Şu An
Tüm kod fazları tamamlandı.

### Phase 6 — Teknik Pafta Landing (referans görsele hizalama)
Landing, referans görseldeki 14 bantlı teknik pafta düzenine getirildi.
Yeni bantlar: 04 MARQUEE, 11 REFERANSLAR; 12 SSS ve 13 RFQ ayrı bantlara bölündü.
10 KALİTE DOSYASI sertifika + CMM raporu + doğrulama şeridi olarak yeniden yazıldı.

**Yayın öncesi doğrulanmalı (içerik sahibi onayı gerekir):**
- 03 bandındaki altı rakam (±0.005 mm, 48 saat, 50+, %100 CMM, izlenebilir, %98 teslimat)
- 11 bandındaki referans firma adları — kullanım izni
- 10 bandındaki ISO 9001 / AS9100D / ISO 14001 sertifika iddiaları
- QR doğrulama servisi ve KAYNAKLAR PDF'leri henüz bağlanmadı (placeholder)

## Bekleyen Manuel Görevler (Headless Kısıtı)

### Phase 4.5 — Art Direction QA
`docs/lean/release-checklist.md` → Phase 4.5 bölümündeki her madde canlı tarayıcıda kontrol edilmeli:
- Hero: "Premium Industrial" ilk 3 saniyede net mi?
- Entrance 1.2s altında bitiyor mu?
- Motion ritmi: HIGH → CALM → CONTRAST → CALM var mı?
- CTA'lar (molten) dikkat çekiyor mu?
- Mobile'da premium hissi var mı, Lenis-off kırılıyor mu?

### Browser Verification
- sessionStorage sıfırla → entrance 1.7s'de tamamlanmalı
- Headline t=0.6s'de belirmeli
- hızlı scroll'da skewX ±3deg lean görünmeli
- ScrollTrigger: `ScrollTrigger.getAll().length` route geçişinden sonra artmamalı
- Cursor velocity scale: hızlı scroll'da ring büyümeli
- PageTransition: /teklif-al → molten, diğer → teal

## Aktif Constraint'ler
- `npm run build` her commit öncesi geçmeli
- Supabase schema / `/admin/*` / `/musteri-paneli/*` — dokunma yok
- Lenis mobile'da (<768px) kapalı
- gsap.context() cleanup zorunlu
- Reduced-motion check zorunlu
- Hardcoded renk / Z dışı z-index yok

## Blocker
Yok. Kalan görevler yalnızca canlı tarayıcıda manuel test.

---
*Detay için:* `docs/lean/task-backlog.md`
