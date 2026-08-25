# Landing Page — 9 Section İçerik Restorasyonu ve Editorial Akışı Koruma Planı

## 1. Yönetici özeti

Mevcut landing yeniden tasarımı görsel dil, tipografi, scroll koreografisi ve Awwwards karakteri açısından doğru yönde ilerliyor. Sorun görsel sistem değil; yeniden kurgu sırasında **içerik mimarisinin fazla sıkıştırılması**.

Önceki landing’de kullanıcı tarafından ayrı birer durak olarak algılanan dokuz bölüm vardı:

1. Hero / `#top`
2. Hizmetler / `#hizmetler`
3. Endüstriler / `#endustriler`
4. Malzemeler / `#malzemeler`
5. Neden Biz / `#neden-biz`
6. Kabiliyetler / `#kabiliyetler`
7. Referanslar / `#referanslar`
8. SSS + bilgi / `#sss`
9. İletişim CTA / `#iletisim`

Yeni yapı teknik olarak hero, manifesto, hizmetler, laboratuvar, endüstriler, proof ve CTA içeriyor. Ancak kullanıcı algısında bazı sahneler birleştiği, bazı eski anchor’lar yalnız görünmez alias olarak kaldığı ve proof içeriği sıkıştığı için deneyim yaklaşık dört ana içerik bloğu gibi hissediliyor.

Önerilen yön:

- Yeni editorial ana hat, büyük tipografi, pinned hizmetler, yatay endüstriler ve sakin geçiş dili korunacak.
- Kaybolan içerik eski görsel tasarımı birebir geri getirerek değil, yeni sistem içinde **dokuz ayrı, hissedilebilir section** olarak restore edilecek.
- Kompakt `LandingFooter` kaldırılacak; eski zengin `Footer` yeni landing’in renk, spacing ve motion tokenlarına adapte edilerek geri getirilecek.
- Her eski anchor yeniden gerçek section sahibi olacak; görünmez alias yaklaşımı kaldırılacak.
- Landing uzunluğu yapay olarak şişirilmeyecek. Her section kendi işlevi, kanıtı ve dönüşüm rolüyle var olacak.

---

## 2. Mevcut iyi gidişat — kesinlikle korunacak alanlar

### 2.1 Görsel kimlik

- Grafit, sıcak kırık beyaz ve bakır renk sistemi.
- Büyük, sıkıştırılmış editorial başlıklar.
- Mono teknik metadata ve numaralandırma dili.
- İnce datum çizgileri, çerçeveler ve ölçüm grafikleri.
- Endüstriyel görsellerde kontrollü desatürasyon.
- Hero’daki büyük `MAS TECHNIC` kompozisyonu.

### 2.2 Ana akış mekaniği

- Hero’dan manifesto alanına sakin geçiş.
- Desktop pinned hizmet vitrini.
- Desktop yatay endüstri vitrini.
- Mobilde pin yerine doğal dikey akış.
- GSAP’in scroll hareketlerinin, Framer Motion’ın route/menu geçişlerinin sahibi olması.
- Intent hydration, lazy görseller ve düşük başlangıç maliyeti.
- Reduced-motion altında doğal akış.

### 2.3 Teknik kalite

- `data-motion-ready` sonrasında deterministik ScrollTrigger kurulumu.
- Desktop iki pin, mobil sıfır pin mimarisi.
- Aktif olmayan pinned kartların `aria-hidden` ve `tabIndex=-1` ile izole edilmesi.
- Kısa ekranlarda 3+2 dengeli kart düzeni.
- Normal belge akışındaki footer prensibi.
- Mevcut route’ların ve fullscreen menünün korunması.

Bu başlıklar restorasyon sırasında yeniden tasarlanmayacak; yeni bölümler bunların üzerine kurulacak.

---

## 3. Gerileme analizi

## 3.1 Bilgi mimarisi gerilemesi

| Önceki bölüm | Yeni yapıdaki karşılığı | Kaybedilen değer | Şiddet |
| --- | --- | --- | ---: |
| Hero | Hero | CAD dropzone ve daha güçlü teklif etkileşimi basit linke indi | Orta |
| Hizmetler | Pinned hizmet vitrini | Kategori kapsamı büyük ölçüde korunuyor; bu bölüm gelişti | Pozitif |
| Endüstriler | Yatay endüstriler | Sektör sayısı ve ikincil endüstri kapsamı daraldı | Orta |
| Malzemeler | Laboratuvarda 3 kart | Bağımsız malzeme anlatısı, sertifika/izlenebilirlik kanıtları ve keşif akışı kayboldu | Kritik |
| Neden Biz | Manifestodaki 3 metrik | Dört avantaj, üretim yönetimi anlatısı ve karşılaştırmalı kanıtlar kayboldu | Yüksek |
| Kabiliyetler | Laboratuvarda 3 kart | Makine parkuru, ekipman listesi, tolerans sayacı ve kalite kapasitesi kayboldu | Kritik |
| Referanslar | Proof alanında tek alıntı | Çoklu testimonial, müşteri logoları ve güven istatistikleri kayboldu | Kritik |
| SSS + Blog | Proof alanında 3 içerik satırı | Gerçek FAQ accordion tamamen kayboldu; `#sss` görünmez alias oldu | Kritik |
| İletişim CTA | Büyük CTA | Temel dönüşüm korunuyor fakat alternatif temas yolu ve eski mikro etkileşimler azaldı | Orta |

### Temel problem

Yeni yapı içerikleri “özetlemek” yerine bazı alanlarda “temsil etmekle” yetiniyor. Kullanıcı:

- Malzeme yetkinliğini,
- Makine/ölçüm kapasitesini,
- Sosyal kanıtı,
- Sık sorulan soruların yanıtlarını,
- Firma tercih gerekçelerini

landing üzerinde yeterli derinlikte göremiyor. Bu durum tasarımı daha temiz gösterse de B2B üretim karar sürecinde güven ve teknik ikna gücünü azaltıyor.

## 3.2 Anchor ve navigasyon gerilemesi

Şu anchor’lar gerçek section yerine `.lf-anchor-alias` olarak render ediliyor:

- `#neden-biz`
- `#malzemeler`
- `#kabiliyetler`
- `#referanslar`
- `#sss`

Bu çözüm dış linkleri teknik olarak kırmıyor; fakat:

- Dot navigation gerçek içerik sınırına karşılık gelmiyor.
- Anchor’a gelen kullanıcı hangi içeriğin hedeflendiğini anlayamıyor.
- Analytics section görünürlüğünü doğru ölçemiyor.
- SEO/semantik bölüm yapısı zayıflıyor.
- İçerik “varmış gibi” görünürken gerçekte kaybolmuş oluyor.

Her anchor yeniden kendi `<section>` elemanına taşınmalı.

## 3.3 Footer gerilemesi

Mevcut `LandingFooter` işlevsel fakat önceki `Footer` ile karşılaştırıldığında belirgin biçimde daha zayıf.

### Kaybolan footer parçaları

- Üst marquee bandı.
- Editorial/teknik arka plan katmanı.
- Newsletter/blog çağrısı.
- Güçlü marka bloğu.
- Dört kapsamlı link ailesi:
  - Endüstriyel
  - Kabiliyetler
  - Hizmetler
  - Kurumsal & Destek
- Footer içi büyük dönüşüm CTA’sı.
- Mobil accordion navigasyonu.
- Daha kapsamlı alt legal bar.
- Footer’a yaklaşınca kaybolan scroll-to-top davranışı.
- Framer Motion stagger/reveal detayları.

### Neden kompakt footer burada yanlış karar oldu?

Kompakt footer portfolio sitesi için yeterli olabilir; fakat MAS Technic:

- Çok sayıda hizmet route’una,
- 48 detay bağlantısına,
- Teknik içeriklere,
- Malzeme ve kabiliyet sayfalarına,
- Teklif/iletişim dönüşümüne

sahip bir B2B üretim platformu. Footer yalnız kapanış değil, ikinci bir bilgi mimarisi ve güven katmanı.

### Restorasyon kararı

`LandingFooter` uzun vadede kaldırılmalı. `Footer` ana bileşeni:

- Fixed/reveal olmadan,
- Normal belge akışında,
- Landing renk tokenlarıyla,
- Daha sakin motion ile,
- Mobil safe-area ve accordion davranışı korunarak

ana sayfada yeniden kullanılmalı.

---

## 4. Hedef bilgi mimarisi — yeniden dokuz güçlü section

Yeni landing aşağıdaki sıraya getirilecek:

```text
01  Hero / Açılış
02  Hizmetler / Pinned Story
03  Endüstriler / Horizontal Showcase
04  Malzemeler / Material Intelligence
05  Neden Biz / Measurable Advantage
06  Kabiliyetler / Production Infrastructure
07  Referanslar / Trust & Proof
08  SSS + Teknik Bilgi / Decision Support
09  Birlikte Üretelim / Conversion
    Zengin Footer / Secondary Navigation
```

Manifesto bağımsız numaralı section olmaktan çıkarılmayacak; hero ile hizmetler arasındaki **editorial giriş katmanı** olarak Section 01’in devamında tutulacak. Böylece görsel akış korunurken kullanıcı dokuz ana iş durak görür.

Alternatif olarak manifesto `01B` etiketi alabilir; dot navigation’da ayrı nokta oluşturmaz.

---

## 5. Section bazında agresif restorasyon planı

## 5.1 Section 01 — Hero + manifesto

### Korunacaklar

- 110svh hero.
- Büyük MAS TECHNIC tipografisi.
- CNC görseli ve scroll scale.
- Hizmet marquee’si.
- “Hassas üretim, ölçülebilir kalite” manifesto dili.

### Geri getirilecekler

- Eski `HeroCadDropzone` mantığından hafif bir “CAD bırak / teklif başlat” etkileşimi.
- Dosya yükleme alanı doğrudan ağır CAD viewer açmayacak.
- Drag-over sırasında bakır datum çerçevesi ve dosya tipi bilgisi gösterilecek.
- Tıklama `/teklif-al` route’una aktaracak veya mevcut güvenli upload akışını açacak.
- Hero altında üç teknik proof point korunacak.

### UX amacı

İlk ekran yalnız marka gösterisi değil, kullanıcının üretim talebini başlatabildiği işlevsel giriş olmalı.

### Hizmet vitrini kabul kriterleri

- Hero LCP <2.5 saniye.
- Dropzone klavye ile erişilebilir.
- 320px genişlikte CTA kırpılmaz.
- Reduced-motion’da scale/parallax yok.

## 5.2 Section 02 — Hizmetler

### Endüstriler mevcut durumu

Yeni tasarımın en güçlü bölümlerinden biri. Pinned story sistemi korunmalı.

### İyileştirmeler

- Beş aile ve tüm detay bağlantıları korunacak.
- Aktif kategori başlığı yanında gerçek üretim çıktısı/termin/tolerans mikro metrikleri gösterilecek.
- Eski ServicesSection’daki rota/seyahat metaforundan yalnız faydalı bilgi kalıpları alınacak; görsel metafor geri getirilmeyecek.
- Her story’de:
  - Özet,
  - 3–5 detay route,
  - Kategori CTA,
  - Bir teknik güven göstergesi bulunacak.
- Mobil kartlarda gizlenen detay linkleri tamamen kaldırılmak yerine kompakt “alt hizmetler” disclosure içine alınacak.

### Kabul kriterleri

- Desktop aktif index ileri ve ters yönde deterministik.
- Tek master timeline.
- Mobilde tüm beş aile doğal akışta.
- Hiçbir bilgi yalnız hover ile erişilmez.

## 5.3 Section 03 — Endüstriler

### Mevcut durum

Beş güçlü endüstri kartı var; önceki yapı daha geniş sektör kapsamına sahipti.

### Endüstrilerde geri getirilecekler

- Ana vitrin beş stratejik endüstriyi göstermeye devam edecek.
- İkincil sektörler yatay vitrinin altında kompakt technical index olarak eklenecek.
- “Tüm endüstriler” CTA’sı kategori route’una bağlanacak.
- Eski çift-track hareket geri getirilmeyecek; current horizontal scrub korunacak.
- Her aktif kartta:
  - Sektör adı,
  - İlgili kalite/tolerans gereksinimi,
  - Örnek üretim kabiliyeti,
  - Route CTA bulunacak.

### Endüstri vitrini kabul kriterleri

- Desktop horizontal track tek pin kullanır.
- Mobilde dikey liste.
- 1440×500’de 3+2 dengeli fallback.
- Kart içeriği 200% zoom’da okunabilir.

## 5.4 Section 04 — Malzemeler

### Neden bağımsız olmalı?

Malzeme seçimi hassas üretim satın alma kararının merkezinde. Üç küçük laboratuvar kartı bu ihtiyacı karşılamıyor.

### Yeni tasarım

- Açık sıcak metal/paper yüzey.
- Sol tarafta büyük “Malzemeyi değil, davranışını seçiyoruz” başlığı.
- Sağda veya aşağıda küratörlü altı malzeme:
  - Alüminyum
  - Paslanmaz
  - Takım çeliği
  - Titanyum
  - Bakır alaşımları
  - Teknik plastikler
- Kartlar önem ve kullanım sıklığına göre asimetrik 12 kolon gridde.
- Her kartta:
  - Alaşım/standart,
  - Tolerans veya yüzey notu,
  - Örnek sektör,
  - Detay linki.
- Eski proof point’ler geri getirilecek:
  - EN 10204 3.1 izlenebilirlik
  - CMM raporu
  - FAIR / PPAP hazırlığı
- Tüm malzemeler CTA’sı `/malzemeler` route’una gider.

### Motion

- Ağır morph/WebGL yok.
- Kart girişleri düşük mesafeli reveal.
- Fine pointer’da görsel scale ve teknik etiket kayması.
- Reduced-motion’da statik.

### Malzeme bölümü kabul kriterleri

- `#malzemeler` gerçek section.
- En az altı malzeme görünür.
- Route verisi `toleranceMaterials`/mevcut material data’dan gelir.
- Yinelenen hardcoded landing datası oluşturulmaz.

## 5.5 Section 05 — Neden Biz

### Geri getirilecek içerik

Önceki dört avantaj yeniden yazılarak korunmalı:

- Akıllı üretim yönetimi.
- Tasarımdan üretime entegrasyon.
- Hızlı prototipleme.
- Sürdürülebilir üretim.

Önceki metrikler veri doğruluğu kontrolünden sonra kullanılmalı:

- CNC tezgâh sayısı.
- Çalışma/üretim erişilebilirliği.
- Tamamlanan proje.
- Yıllık tecrübe.

### Neden Biz için yeni tasarım

- Manifestonun tekrarı olmayacak.
- Sol tarafta ölçülebilir farkları anlatan editorial liste.
- Sağ tarafta tek güçlü üretim/kalite görseli.
- Scroll ilerledikçe avantaj satırları aktifleşirken görsel üzerindeki ölçüm çizgileri değişir.
- “Neden MAS?” anlatısı soyut slogan değil, ölçülebilir operasyon farklarıyla kurulmalı.

### Neden Biz kabul kriterleri

- `#neden-biz` gerçek section.
- Her iddia ölçülebilir veya doğrulanabilir.
- Aynı metrik başka section’da gereksiz tekrar edilmez.
- Mobilde aktif-state gerektirmeden tüm içerik okunur.

## 5.6 Section 06 — Kabiliyetler

### Kaybolan içerik

- Makine parkuru.
- Ekipman listesi.
- `±0.001 mm` tolerans sayacı/teknik kapasite sunumu.
- Kalite kontrol ve mühendislik altyapısı.
- Kapasite/teklif bağlantıları.

### Kabiliyetler için yeni tasarım

Bu section “üretim laboratuvarı” fikrinin gerçek karşılığı olacak:

- Büyük teknik başlık.
- Üç ana capability ailesi:
  - Üretim altyapısı
  - Kalite ve standartlar
  - Mühendislik desteği
- Makine parkuru için editorial equipment rack.
- Ölçüm/CMM/tolerans alanı.
- Prototipten seri üretime kapasite akışı.
- İki CTA:
  - Tüm kabiliyetler
  - Kapasite/teklif görüşmesi

### Grid

- Desktop 12 kolon.
- Ana makine parkuru 7 kolon.
- Tolerans/ölçüm paneli 5 kolon.
- Alt capability modülleri 4+4+4.
- Tablet 2 kolon.
- Mobil tek kolon.

### Kabiliyetler motion davranışı

- Sayı animasyonu bir kez çalışır.
- Makine rack reveal kısa ve transform/opacity tabanlı.
- Sürekli çalışan animasyon yok.

### Kabiliyetler kabul kriterleri

- `#kabiliyetler` gerçek section.
- Mevcut capability navigation datasından beslenir.
- Teknik değerler doğrulanmadan yayınlanmaz.
- 1440×500’de doğal grid; pin yok.

## 5.7 Section 07 — Referanslar ve güven

### Referanslarda geri getirilecekler

- Birden fazla müşteri yorumu.
- Müşteri/partner logo bandı.
- Güven istatistikleri.
- Sertifika/kalite kanıtları.

### Referanslar için yeni tasarım

- Tek alıntı yerine 3 testimonial.
- Desktop’ta kontrollü stacked-card ilerlemesi veya sticky olmayan editorial carousel.
- Mobilde doğal yatay snap yerine dikey liste tercih edilmeli; içerik tamamen erişilebilir kalmalı.
- Logolar monokrom ve düşük kontrastlı dekor değil, okunabilir marka kanıtı olarak sunulmalı.
- Sertifikalar ayrı bir mini rail:
  - ISO/kalite belgesi,
  - İzlenebilirlik,
  - Ölçüm raporları.

### İçerik doğruluğu

- Gerçek müşteri adı/onayı olmayan testimonial yayınlanmamalı.
- Placeholder logo veya uydurma kurum kullanılmamalı.
- Kanıtlanamayan `%100` gibi iddialar veriyle desteklenmeli veya yeniden yazılmalı.

### Referanslar kabul kriterleri

- `#referanslar` gerçek section.
- En az üç doğrulanmış proof item.
- Screen reader sırası görsel sırayla aynı.
- Logo görsellerinde anlamlı alt metin veya uygun `aria-label`.

## 5.8 Section 08 — SSS + teknik bilgi

### Kritik restorasyon

Mevcut yeni yapı yalnız üç blog satırı gösteriyor; gerçek FAQ içeriği kaybolmuş durumda. Bu bölüm yeniden iki katmanlı karar destek alanı olmalı.

### Sol kolon — SSS

- En sık sorulan 5–7 soru.
- Tek açık accordion.
- `aria-expanded`, `aria-controls`, benzersiz IDREF.
- Teklif, tolerans, minimum adet, termin, malzeme ve gizlilik konuları.
- “Tüm SSS” CTA’sı `/sss`.

### Sağ kolon — teknik içerikler

- Üç seçilmiş blog/teknik not.
- İçerik türü, başlık ve okuma süresi.
- Fine pointer’da görsel preview.
- Touch cihazda preview kaldırılır; bilgi kaybı olmaz.
- “Tüm teknik içerikler” CTA’sı `/blog`.

### SSS ve içerik kabul kriterleri

- `#sss` gerçek section.
- FAQ schema verisiyle içerik çelişmez.
- Klavye ve screen reader testleri geçer.
- Blog görselleri lazy-load edilir.

## 5.9 Section 09 — Birlikte üretelim

### Dönüşüm sahnesinde korunacaklar

- Büyük editorial soru.
- Koyu yüzey.
- Ana teklif aksiyonu.

### Dönüşüm sahnesinde geri getirilecekler

- Alternatif iletişim yolu.
- Dosya yükleme/teklif CTA’sı.
- İletişim CTA’sı.
- Kısa güven mesajı:
  - Gizlilik,
  - Teknik inceleme,
  - Geri dönüş beklentisi.
- Eski CTA’daki hover sweep’in daha sakin, token tabanlı versiyonu.

### Dönüşüm sahnesi kabul kriterleri

- Birincil CTA tek ve açık.
- İkincil CTA görsel rekabet yaratmaz.
- Mobil safe-area ile footer arasında çakışma olmaz.
- CTA sonrası footer normal akışta başlar.

---

## 6. Footer restorasyon planı

## 6.1 Bileşen kararı

Ana sayfada:

```tsx
<LandingFooter />
```

yerine yeniden:

```tsx
<Footer />
```

kullanılacak.

Ancak mevcut eski `Footer` doğrudan kopyalanıp bırakılmayacak. Aşağıdaki revizyonlardan geçecek.

## 6.2 Korunacak footer modülleri

- `FooterNewsletter`
- `FooterBrand`
- `FooterCTA`
- `FooterBottomBar`
- `footerLinks`
- Mobil `FooterAccordion`
- `FooterBackdrop`
- Marquee bandı

## 6.3 Yeniden düzenlenecek alanlar

- Landing’in `--lf-*` tokenlarıyla ortak semantic footer tokenları tanımlanacak.
- Framer Motion stagger süresi sakinleştirilecek.
- Footer CTA, Section 09 CTA’yı tekrar etmeyecek:
  - Section 09 = teklif başlatma.
  - Footer CTA = teknik içerik/newsletter veya kurumsal keşif.
- Newsletter gerçek backend’e bağlı değilse sahte form gibi davranmayacak.
- Marquee yüksekliği ve contrast’ı landing ritmine uyarlanacak.
- Footer backdrop GPU/ağır blur üretmeyecek.
- `overflow-x-hidden` korunacak; dikey overflow kesinlikle kısıtlanmayacak.
- Scroll-to-top:
  - Footer legal alanıyla çakışmayacak.
  - Mobilde safe-area kullanacak.
  - Footer viewport’a girince kaybolacak.

## 6.4 Footer bilgi mimarisi

Desktop:

- Marka alanı.
- Endüstriyel.
- Kabiliyetler.
- Hizmetler.
- Kurumsal & Destek.
- İletişim.
- Legal rail.

Mobil:

- Marka.
- İletişim.
- Dört accordion grubu.
- Legal bağlantılar.
- Copyright.

## 6.5 Footer kabul kriterleri

- `position: relative`.
- `data-footer-spacer` yok.
- `--footer-height` yok.
- 375×812, 768×1024, 1280×800, 1440×650’de üstten alta erişilebilir.
- Newsletter, marka, link kolonları, footer CTA ve copyright ayrı ayrı görünür hale getirilebilir.
- Ana sayfa, SSS, iletişim, malzemeler ve malzeme detay route’larında aynı kalite.
- Mobil CTA/chat/scroll-top ile overlap yok.

---

## 7. Motion ve scroll mimarisi

## 7.1 Sahiplik

- GSAP/ScrollTrigger:
  - Hero scroll hareketi.
  - Hizmet pin’i.
  - Endüstri yatay pin’i.
  - Section reveal.
- Framer Motion:
  - Fullscreen menü.
  - Route curtain.
  - Footer/component girişleri.
- CSS:
  - Hover/focus micro-interaction.
  - Reduced-motion fallback.

## 7.2 Pin bütçesi

Landing’de maksimum iki pinned section:

1. Hizmetler.
2. Endüstriler.

Malzemeler, neden-biz, kabiliyetler, referanslar ve SSS doğal akışta kalacak. Bu karar:

- Scroll yorgunluğunu azaltır.
- Uzun sayfayı daha hızlı hissettirir.
- Kısa viewport ve mobil davranışı sadeleştirir.
- ScrollTrigger karmaşıklığını sınırlar.

## 7.3 Reveal bütçesi

- Dikey mesafe: 24–40px.
- Süre: 420–650ms.
- Stagger: 35–70ms.
- Blur kullanılmayacak veya yalnız çok küçük başlangıç değerinde olacak.
- Aynı viewport’ta 12’den fazla öğe stagger edilmeyecek.
- Section başlıkları tekrar tekrar aynı animasyonu kullanmayacak; 2–3 varyasyon yeterli.

## 7.4 Reduced motion

- Pin yok.
- Scrub yok.
- Marquee yok.
- Parallax yok.
- Clip-path reveal yok.
- Tüm içerik ilk frame’de okunabilir.
- Sayı animasyonu nihai değerle görünür.

---

## 8. Veri ve içerik mimarisi

## 8.1 Tek kaynak ilkesi

Landing verisi aşağıdaki mevcut kaynaklardan türetilmeli:

- `navigationItems`
- `toleranceMaterials`
- Material data
- Blog data
- FAQ data
- Capability/equipment data

Yeni sectionlar için aynı route ve başlıkları tekrar eden bağımsız sabit diziler oluşturulmamalı.

## 8.2 Yeni modeller

```ts
type LandingSectionId =
  | "top"
  | "hizmetler"
  | "endustriler"
  | "malzemeler"
  | "neden-biz"
  | "kabiliyetler"
  | "referanslar"
  | "sss"
  | "iletisim";

type LandingProofItem = {
  id: string;
  kind: "testimonial" | "certification" | "metric";
  title: string;
  body: string;
  source?: string;
  verified: boolean;
};
```

## 8.3 İçerik doğrulama kapısı

Yayın öncesinde şu veriler işletme tarafından doğrulanmalı:

- Tezgâh sayısı.
- Tolerans değerleri.
- Proje sayısı.
- Zamanında teslim oranı.
- Sertifikalar.
- Müşteri adları/logoları.
- Testimonial metinleri.
- Ortalama termin/geri dönüş iddiaları.

Doğrulanmamış veri tasarım placeholder’ı olarak production’a taşınmamalı.

---

## 9. Bileşen mimarisi

`LandingFlow.tsx` daha fazla büyütülmemeli. Orchestrator yalnız sıra, hydration ve motion kurulumunu yönetmeli.

Önerilen yapı:

```text
src/components/landing/
  LandingFlow.tsx
  LandingHero.tsx
  LandingManifesto.tsx
  FeaturedServices.tsx
  IndustryShowcase.tsx
  MaterialIntelligence.tsx
  WhyMas.tsx
  CapabilityInfrastructure.tsx
  TrustProof.tsx
  DecisionSupport.tsx
  ConversionScene.tsx
  landing-data.ts
  landing-types.ts
  hooks/
    useLandingHydration.ts
    useLandingMotion.ts
    useFocusVisibility.ts
```

### Orchestrator hedefi

- Yaklaşık 150–220 satır.
- Section JSX detayları ayrı dosyalarda.
- Motion setup mümkünse sahne bazlı yardımcı fonksiyonlara ayrılır.
- ScrollTrigger creation merkezi kalır.
- Her child bağımsız reduced-motion ve semantic markup testine uygun olur.

---

## 10. Intent hydration stratejisi

Dokuz section geri gelirken başlangıç performansının gerilememesi için:

### İlk render

- Header.
- Hero.
- Manifesto.
- Diğer sectionlar için doğru yüksekliği ayıran lightweight shells.

### İlk kullanıcı intent’i

- Hizmetler.
- Endüstriler.
- Malzemeler.

### İkinci düşük öncelikli faz

- Neden Biz.
- Kabiliyetler.
- Referanslar.

### Son faz

- SSS/blog.
- CTA.
- Zengin footer.

### Kurallar

- Anchor elementleri shell aşamasında da mevcut olmalı.
- Shell yüksekliği final section ölçüsüne yakın olmalı.
- Hydration sonrası CLS <0.05.
- Görseller section yaklaşmadan yüklenmemeli.
- Footer içeriği aşırı geciktirilmemeli; derin link/klavye kullanıcıları için erişilebilir kalmalı.

---

## 11. Uygulama fazları

## Faz 0 — Baseline ve içerik dondurma

1. Mevcut production’ın tüm viewport screenshotlarını al.
2. Dokuz eski section’ın içerik envanterini JSON/Markdown olarak çıkar.
3. Gerçek/placeholder içerikleri işaretle.
4. Mevcut Awwwards skorlarını baseline olarak kilitle.
5. Route ve anchor manifestini oluştur.

Çıkış kriteri:

- Hangi içerik geri geliyor, hangisi emekli oluyor açıkça belli.

## Faz 1 — Mimari ayrıştırma

1. `LandingFlow.tsx` içindeki sahneleri ayrı bileşenlere böl.
2. Hydration ve motion hook’larını ayır.
3. Görsel davranışı değiştirmeden mevcut testleri geçir.
4. `LandingSectionId` dokuz section’a genişlet.
5. Dot navigation’ı dokuz gerçek hedefle güncelle.

Çıkış kriteri:

- Görsel regresyon yok.
- Mevcut landing testleri yeşil.
- Orchestrator 220 satır civarında.

## Faz 2 — Malzemeler restorasyonu

1. `MaterialIntelligence` oluştur.
2. Mevcut malzeme datasına bağla.
3. Altı küratörlü kart ve üç proof point ekle.
4. `#malzemeler` alias’ını kaldır, gerçek section’a taşı.
5. Responsive ve axe testlerini ekle.

Çıkış kriteri:

- Malzeme içeriği landing’de tekrar karar destek değeri taşır.

## Faz 3 — Neden Biz ve Kabiliyetler

1. Manifestodaki tekrar eden metrikleri temizle.
2. `WhyMas` section’ını dört doğrulanabilir avantajla kur.
3. `CapabilityInfrastructure` section’ını makine/ölçüm/engineering grid’iyle kur.
4. `#neden-biz` ve `#kabiliyetler` alias’larını kaldır.
5. Teknik verileri doğrula.

Çıkış kriteri:

- Firma farklılaşması ve üretim kapasitesi iki ayrı, güçlü hikâye olur.

## Faz 4 — Referanslar ve karar desteği

1. `TrustProof` section’ını testimonial/logo/sertifika katmanlarıyla kur.
2. `DecisionSupport` içinde gerçek FAQ accordion ve blog listesi oluştur.
3. `#referanslar` ve `#sss` alias’larını kaldır.
4. FAQ ARIA/keyboard testlerini ekle.
5. Proof içeriğinin doğruluğunu kontrol et.

Çıkış kriteri:

- Sosyal kanıt ve satın alma itirazları landing üzerinde tekrar karşılanır.

## Faz 5 — Hero ve CTA fonksiyonel polish

1. Lightweight CAD dropzone’u hero’ya ekle.
2. CTA’ya alternatif iletişim ve güven mesajı ekle.
3. Hover sweep’i sadeleştir.
4. Mobil safe-area ve focus sırasını test et.

Çıkış kriteri:

- Hem üst hem alt dönüşüm noktaları işlevsel ve birbirini tamamlar.

## Faz 6 — Zengin footer restorasyonu

1. `Index.tsx` içinde `LandingFooter` yerine `Footer` kullan.
2. Footer tokenlarını editorial landing sistemiyle birleştir.
3. Newsletter, brand, dört link kolonu, FooterCTA ve bottom bar’ı geri getir.
4. Mobil accordion ve scroll-to-top overlap testlerini çalıştır.
5. `LandingFooter.tsx` artık kullanılmıyorsa kaldır.

Çıkış kriteri:

- Eski footer’ın bilgi ve dönüşüm değeri geri gelir.
- Normal-flow/footer erişilebilirlik düzeltmeleri korunur.

## Faz 7 — Motion ve performans optimizasyonu

1. Yalnız iki pin kaldığını doğrula.
2. Yeni section reveal’larını merkezi timeline/observer sistemine bağla.
3. Görsel decode ve ScrollTrigger refresh çağrılarını tekilleştir.
4. Intent hydration fazlarını profile et.
5. Mobile’da gereksiz GSAP/Lenis yükünü engelle.

Çıkış kriteri:

- LCP <2.5s.
- CLS <0.05.
- TBT p75 <200ms.
- Motion-ready <1s hedefi.

## Faz 8 — Bağımsız jüri ve düzeltme loop’u

1. Altı ana viewport ve kısa landscape screenshotları.
2. Her section için ayrı görsel değerlendirme.
3. Design, Usability, Creativity, Content skorları.
4. Accessibility, Code Quality ve Performance skorları.
5. Her alt skor strict `>90` değilse blocker düzeltme loop’u.

Çıkış kriteri:

- Tüm bağımsız skorlar 90’ın üzerinde.
- Tam Playwright paketi sıfır hata.

---

## 12. Test matrisi

### Viewport’lar

- 320×568
- 375×812
- 390×844
- 768×1024
- 1280×800
- 1440×500
- 1440×650
- 1440×900

### Section bütünlüğü

- Dokuz gerçek section DOM’da tam bir kez bulunur.
- Dot navigation dokuz gerçek hedefe gider.
- Hiçbir ana anchor `.lf-anchor-alias` değildir.
- Section sırası doküman sırasıyla aynıdır.
- Her section başlığı semantic heading hiyerarşisine uyar.

### İçerik paritesi

- Beş hizmet ailesi.
- Ana ve ikincil endüstri listesi.
- En az altı malzeme.
- Dört neden-biz avantajı.
- Üç capability ailesi ve makine/ölçüm kanıtı.
- En az üç doğrulanmış proof item.
- En az beş FAQ.
- Üç teknik içerik.
- İki dönüşüm yolu.
- Zengin footer link grupları.

### Scroll ve motion

- Hızlı aşağı scroll.
- Hızlı ters scroll.
- Hizmet start/mid/end/reverse.
- Endüstri start/mid/end/reverse.
- Deep-link anchor açılışı.
- Browser back/forward.
- Route curtain handoff.
- Reduced-motion.
- Coarse pointer.
- Kısa viewport.

### Erişilebilirlik

- Full-body axe desktop/mobile.
- 200% text zoom.
- Tab/Shift+Tab.
- Focus görünürlüğü.
- Accordion ARIA.
- Hidden pinned panel tab izolasyonu.
- Renk kontrastı.
- Landmark ve heading sırası.
- Safe-area.

### Footer

- Newsletter/blog alanı.
- Marka.
- Dört link kolonu.
- Footer CTA.
- Legal bar.
- Copyright.
- Scroll-to-top.
- Ana sayfa ve iç route’lar.

### Performans

- 5 cold sample p75.
- Passive first load.
- First wheel sonrası hydration.
- Transfer boyutu.
- LCP.
- CLS.
- Long tasks/TBT.
- Görsel decode sonrası layout.
- Footer chunk yükleme zamanı.

---

## 13. Yayın kapıları

| Kategori | Minimum |
| --- | ---: |
| Design | >90 |
| Usability | >90 |
| Creativity | >90 |
| Content | >90 |
| Accessibility | >90 |
| Performance | >90 |
| Code Quality | >90 |
| Production build | Başarılı |
| Lint | 0 hata |
| Playwright | 0 başarısız |
| Axe | 0 serious/critical |
| CLS | <0.05 |
| LCP | <2.5s |
| TBT p75 | <200ms |

Bir kategori 90 veya altındaysa release verilmez.

---

## 14. Yapılmaması gerekenler

- Yeni editorial landing’i tamamen eski component sırasına geri döndürmek.
- Dokuz section’ın tamamını pinned yapmak.
- Kaybolan içeriği yalnız görünmez anchor ile “korunmuş” saymak.
- Aynı metrikleri manifesto, neden-biz, kabiliyetler ve referanslarda tekrar etmek.
- Doğrulanmamış müşteri, sertifika veya performans iddiası yayınlamak.
- Kompakt footer ile zengin footer’ı birlikte render etmek.
- Mobilde desktop koreografisini zorlamak.
- Her section için ayrı ScrollTrigger ordusu kurmak.
- Ağır WebGL, blur veya sürekli çalışan dekoratif animasyon eklemek.
- Başlangıç performansını korumak adına gerçek içeriği erişilemez hale getirmek.

---

## 15. Dosya bazlı beklenen değişiklikler

### Değişecek

- `src/pages/Index.tsx`
- `src/components/LandingFlow.tsx`
- `src/config/landing-motion.ts`
- `src/styles/landing-flow.css`
- `src/components/Footer.tsx`
- `src/components/footer/*`
- `src/components/SectionDotNav.tsx`
- Landing ve footer Playwright spec’leri

### Oluşturulacak

- `src/components/landing/MaterialIntelligence.tsx`
- `src/components/landing/WhyMas.tsx`
- `src/components/landing/CapabilityInfrastructure.tsx`
- `src/components/landing/TrustProof.tsx`
- `src/components/landing/DecisionSupport.tsx`
- `src/components/landing/landing-types.ts`
- `src/components/landing/landing-data.ts`
- Gerekli section-level test dosyaları

### Kaldırılması muhtemel

- `src/components/LandingFooter.tsx`
- Kullanılmayan `.lf-anchor-alias` markup’ı
- Yeni akışta karşılığı kalmayan eski standalone section componentleri

Silme işlemi yalnız yeni karşılıklar üretime bağlandıktan ve içerik paritesi testi geçtikten sonra yapılmalı.

---

## 16. Nihai ürün tanımı

Hedef, “eski dokuz section’ı geri koymak” değildir. Hedef:

- Yeni landing’in yüksek görsel kalitesini,
- Jingjing Han esintili kesintisiz editorial akışı,
- MAS Technic’in teknik/B2B bilgi yoğunluğunu,
- Eski footer’ın güçlü navigasyon ve dönüşüm değerini

tek sistemde birleştirmektir.

Başarılı sonuçta sayfa daha kalabalık değil, **daha ikna edici** hissedilecek. Kullanıcı her scroll durağında yeni ve gerekli bir karar bilgisi alacak; hiçbir section yalnız dekor veya tekrar olmayacak. Dokuz bölüm ayrı kimlik kazanacak, fakat sayfa yine tek bir yönetilmiş anlatı gibi akacak.
