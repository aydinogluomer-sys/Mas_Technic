# Decision Log — Mas Technic
> Tarihli kararlar. Gerekçe ve etki. Tersine çevrilmedikçe geçerliliğini korur.

---

## 2026-05-12

### Awwwards Hedefi Honorable Mention Olarak Revize Edildi
**Karar:** SOTD (Site of the Day) değil, Honorable Mention hedefleniyor.  
**Gerekçe:** B2B manufacturing kategorisi Awwwards'da niş; Türkçe içerik global jury için dezavantaj; özgün konsept yerine referans repo pattern'leri kullanılıyor. SOTD için 3-6 ay dedicated art direction şart.  
**Etki:** Gerçekçi beklenti yönetimi. Phase 4.5 Art Direction QA eklendi.

### Claude Code Primary Platform Seçildi (Lovable Terk)
**Karar:** Lovable.dev terk edildi. Claude Code primary development platform.  
**Gerekçe:** Lovable'da context bloat — 20+ prompt sonrası yanıt kalitesi dramatik düşüş; component awareness kayboldu; animasyon kodu bozuldu.  
**Etki:** Tüm geliştirme Claude Code ile yapılacak. Lovable.dev sadece deploy/preview için kullanılabilir. Prompt-library Lovable prompt'larından Claude Code prompt'larına dönüştürüldü.

### GitHub Repoları Snippet Workflow ile Kullanılacak
**Karar:** Reference repolar direkt AI context'ine verilmez; lokale clone → pattern çıkarma → /snippets → implement → sil.  
**Gerekçe:** GitHub repo içeriği Claude Code'a "skill" olarak verilemez; bütün repo context'i token bütçesini aşar.  
**Etki:** Snippet workflow tanımlandı. /snippets klasörü oluşturuldu.

### Doc Lifecycle Kuralı Benimsendi
**Karar:** Lean doc MASTER_CONTEXT'e tamamen damıtıldıysa silinir. Snippet implement edildiyse silinir.  
**Gerekçe:** Stale doc çelişki üretir; token bütçesini harcar; güncellenmediğinde yanıltıcı olur.  
**Etki:** Her phase sonunda cleanup adımı zorunlu.

### Phase 4.5 Art Direction QA Eklendi
**Karar:** Code phase'leri (1-4) sonrasında, performance (5) öncesinde görsel audit phase'i eklendi.  
**Gerekçe:** Teknik olarak iyi kod oluşturulabilir ama "GSAP'li template" görünümünden kurtulmak için manuel görsel karar gerekiyor.  
**Etki:** Phase 5'e geçiş koşulu: tüm Art Direction QA maddeleri ✅.

---

## Önceki Kararlar

### Heat/Precision/Material Temaları Kilitlendi
**Karar:** Forge & Steel renk paleti sabit. Obsidian-molten-teal üçlüsü core.  
**Tarih:** 2026-05-12 (varsayılan — Lovable geliştirme döneminden)  
**Etki:** design-tokens.json'a işlendi. Renk değişikliği için bu kararın tersine çevrilmesi şart.

### GSAP + Lenis Ticker Sync Seçildi
**Karar:** Lenis scroll → GSAP ticker.add() yöntemi. requestAnimationFrame direkt kullanılmadı.  
**Gerekçe:** GSAP ve Lenis'in ayrı rAF döngüleri yerine tek döngü daha performanslı.  
**Etki:** SmoothScrollProvider.tsx implementasyonu bu pattern üzerine kurulu.

### Border-Radius: 0 Kilitlendi
**Karar:** Tüm UI elementleri sharp edge — radius yok, istisnasız.  
**Gerekçe:** Premium industrial aesthetic — yuvarlak köşe bu tasarım diliyle uyumsuz.  
**Etki:** tailwind.config.ts'de `--radius: 0rem`. Yeni bileşenler rounded class kullanamaz.

### CSR-Only Mimari
**Karar:** Next.js/SSR kullanılmıyor. Vite + React + React Router — pure CSR.  
**Gerekçe:** GSAP SSR'da çalışmaz (window/document erişimi). SPA yeterli.  
**Etki:** SSR pattern'leri (getServerSideProps, useServerInsertedHTML) yasak.

---

*Bu log'a eklemek için:*  
```
## [YYYY-MM-DD]
### [Karar Başlığı]
**Karar:** [Ne kararlaştırıldı]
**Gerekçe:** [Neden]
**Etki:** [Ne değişiyor]
```
