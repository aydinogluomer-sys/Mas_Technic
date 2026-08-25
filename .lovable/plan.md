MAS Technic için öncelik: daha fazla efekt eklemek değil, mevcut “portfolio demo” hissini “ölçülebilir CNC üretim sistemi”ne çevirmek. Yüklediğin Claude audit / Applied HTML / Lovable patches dosyalarıyla uyumlu şekilde aşağıdaki sırayla ilerleyeceğim.

## Kapsam

Yalnızca public landing ve public sayfa UX katmanı:
- `/` landing page
- Header, Footer, Hero, Services, Materials, Capabilities/Final CTA, debug panel
- Global token/motion yardımcıları

Dokunulmayacak alanlar:
- `/admin/*`
- `/musteri-paneli/*`
- `supabase/*`
- RFQ wizard iç mantığı (`/teklif-al`) bu turda sadece CTA hedefi olarak kalacak

## 1. P0 stabilizasyon: görünürlük ve footer regresyonunu kesin kapatma

- `Footer` default davranışını zaten `static` görünüyor; bunu doğrulayıp homepage dışında reveal kullanımının kalmadığından emin olacağım.
- Homepage’de `<Footer variant="reveal" />` opt-in olarak kalacak; statik sayfalarda fixed overlay olmayacak.
- Stacking scene / footer z-index ilişkisini tekrar sadeleştireceğim: footer içerik üstüne çıkmayacak, section’lar başlangıçta görünür kalacak.
- `ScrollDebugPanel` production görünümünde sürekli açık bir buton gibi durmayacak; sadece debug param/local flag ile görünür olacak.

## 2. Sistem temeli: semantic token ve motion grammar

Mevcut dosyada hâlâ iki renk sistemi var: `--forge-*` legacy ve v2 Heat/Precision/Material tokenları. Bunu tek seferde tüm projeden sökmek riskli, bu yüzden landing’de kullanılacak semantic katmanı ekleyip yeni bileşenleri buna bağlayacağım.

Eklenecek semantic tokenlar:
- `--action-primary`, `--action-primary-hover`, `--action-primary-ink`
- `--data-accent`, `--data-accent-soft`
- `--status-nominal`, `--status-warn`, `--status-fail`
- `--rule`, `--rule-strong`, `--surface-interactive`, `--focus-ring`
- `--ease-enter`, `--ease-exit`, `--ease-emphasis`, `--dur-fast/mid/slow`

Böylece yeni UI “orange token = her şey” yerine anlam bazlı renk kullanacak.

## 3. Hero redesign: rotasyonlu slogan yerine Engineering Ledger

Mevcut hero şu an ekranda çalışıyor ama “Stabil Kalite & Güvenilir Teslimat” gibi jenerik slogan ve R3F/mask/450vh gösterisi hâlâ fazla baskın. Bunu Claude Applied HTML’deki konseptle değiştireceğim:

- Rotating headline kaldırılacak.
- Yeni hero ana fikri:

```text
Her iddia
bir ölçümdür.
± 0.005 mm
```

- Sağ kolona `LiveLedgerCard` eklenecek:
  - Parça: AL-7075 valf gövdesi
  - Operasyon: Op 30 · 5x finish
  - Tolerans: ±0.008 mm
  - Spindle bar: %74
  - CMM: Zeiss Contura
  - Sevkiyat: DHL planlı
- Hero üstünde operasyon ticker row olacak: hat durumu, FAIR zamanı, açık teklif, SLA, ISO revizyonu.
- Hero’da tek primary CTA olacak: `48 saatte teklif al`; ikincil CTA `Traveler örneği gör`.
- Reduced-motion fallback: tüm içerik statik ve temiz render olacak; animation completion beklenmeyecek.

## 4. Landing akışını kısaltma: 16 sahneden 9 odaklı sahneye

Audit’in ana bulgusu doğru: landing çok fazla dekoratif sahne taşıyor. İlk implementation’da en riskli ve en fazla dikkat dağıtan sahneleri kaldırıp akışı şu yapıya çekeceğim:

```text
Hero / Engineering Ledger
Services / Traveler Sheet
Materials / Tolerance Strip
Industries
Capabilities / Machine Park table
Why Us / proof points
Testimonials / measured outcomes
FAQ / Blog
Final CTA
Footer
```

Kaldırılacak veya homepage’den çıkarılacak dekoratif sahneler:
- `NexusPromoSection` landing odağını dağıtıyor
- `CNCScrollStory` hero ile çakışan ikinci scrollytelling katmanı
- `MaterialMorphScroll` fotoğrafik efekt, ölçüm fikrine hizmet etmiyor
- Gereksiz bridge yoğunluğu azaltılacak

Bu değişiklik LCP ve scroll karmaşasını da düşürür.

## 5. Services redesign: kart değil Traveler Sheet

`ServicesSection` mevcutta çok uzun, eski image/hover pattern’leri ve ledger denemesi birlikte duruyor. Bunu net bir Traveler Sheet’e çevireceğim.

- Yeni `src/data/travelers.ts` oluşturulacak.
- 5 servis olacak:
  - 5 Eksen CNC Frezeleme
  - CNC Torna · Mill-Turn
  - Tel Erozyon · Dalma
  - Isıl İşlem · Yüzey
  - CMM Doğrulama
- Tab arayüzüyle servis seçilecek.
- Her tab’da üretim rotası tablo halinde gösterilecek:

```text
Op | Açıklama | Ekipman | Setup | Cycle | QC
```

- Alt kısımda mühendis onayı / kalite kontrol / durum stamp alanı olacak.
- Mobilde tablo yatay kayacak, içerik gizlenmeyecek.
- Fotoğraf kartları, blur image overlay ve gereksiz hover spektakülü kaldırılacak.

## 6. Materials redesign: fotoğraf kartı yerine Tolerance Strip

`MaterialsSection` şu an flip-card/fotoğraf/badge hissinde. Bunu gerçek ölçüm şeridine dönüştüreceğim.

Her malzeme kartında:
- Tip kodu: `AL·2024·T3`
- Başlık ve endüstriyel bağlam
- Tolerans rail’i: `-0.05 → +0.05 mm`
- Band göstergesi
- Ölçülen değer, dönem, örneklem sayısı
- 4 satır teknik spec listesi

Örnekler:
- Alüminyum 2024-T3
- Paslanmaz 316L
- Titanyum Grade 5
- Çelik 4140 QT
- Pirinç CW614N
- PEEK + CF30

Bu bölümde decorative image importları kaldırılacak; daha hızlı ve daha B2B güven veren bir görünüm olacak.

## 7. Header/navigation okunabilirlik ve mobil CTA

- `mix-blend-mode: difference` sadece güvenli durumda kullanılacak: hero top ve dropdown kapalıyken.
- Dropdown açıkken veya scroll sonrası header normal solid/glass yüzeye dönecek.
- Mobile’da sticky CTA bar eklenecek:
  - `48 saatte teklif al →`
  - safe-area destekli
  - Header menüsünün üstüne binmeyecek
- Theme/sound gibi dikkat dağıtan kontrollerin header’daki görünürlüğü audit yönüne göre azaltılacak; gerekiyorsa daha ikincil alana taşınacak.

## 8. Debug ve doğrulama

- Debug panel yalnızca `?debug=gsap` veya localStorage flag ile görünür olacak.
- Panel şunları gösterecek:
  - ScrollTrigger count
  - Text reveal eventleri
  - Inset reveal eventleri
  - Section id / progress
- GSAP eventleri sadece development/debug modunda dispatch edilecek, normal kullanıcıya görünmeyecek.

## 9. Teknik doğrulama

Uygulama sonrası şu kontrolleri yapacağım:
- TypeScript build kontrolü
- Vite build kontrolü
- `/` görsel smoke test: 763px mevcut viewport, 1280px desktop, 375px mobile
- `/iletisim`, `/hakkimizda`, `/sss`, `/blog`, `/malzemeler` footer overlay smoke test
- Console error kontrolü
- Reduced-motion davranışı kontrolü: animasyonlar content’i gizlemeyecek

## Beklenen sonuç

- Landing “efekt kataloğu” yerine ölçüm odaklı Industrial-Luxe üretim deneyimi olacak.
- Hero daha net, daha hızlı ve daha B2B güven verici olacak.
- Services ve Materials bölümleri Awwwards seviyesinde ama CNC sektörüne özgü bir içerik fikri taşıyacak.
- Footer ve scroll regresyonları tekrar etmeyecek.
- Debug aracı kullanıcıya görünmeden doğrulama için kullanılabilecek.