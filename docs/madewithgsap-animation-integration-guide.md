# Made With GSAP Animasyon Entegrasyon Rehberi

## Amaç

Bu rehber, Made With GSAP koleksiyonundaki efektleri MAS Technic ana
sayfasına doğrudan kopyalamak için değil, sitenin mevcut dokuz sahneli
editorial akışına uygun hareket prensiplerini seçmek ve projeye özgü biçimde
yeniden uygulamak için hazırlanmıştır.

Ana karar ölçütü “daha fazla animasyon” değildir. Bir efekt ancak aşağıdaki
üç koşulu birlikte sağlıyorsa önerilmiştir:

1. İçeriğin anlamını veya karşılaştırılabilirliğini güçlendiriyor.
2. Kullanıcının route, CTA veya teknik bilgiye erişimini yavaşlatmıyor.
3. Mobil, reduced-motion ve düşük güçlü cihazlarda doğal akışa geri
   dönebiliyor.

Made With GSAP, koleksiyonunu scroll, mouse move, drag ve infinite gibi
etkileşim türleri altında sınıflandırıyor; ayrıca efektlerin mobil/touch
uyumlu ve Canvas/WebGL gerektirmeden uygulanabildiğini belirtiyor.
Kaynak: [Made With GSAP koleksiyonu](https://madewithgsap.com/effects/) ve
[platform açıklaması](https://madewithgsap.com/).

## Mevcut Sitenin Hareket Envanteri

Ana landing şu anda dokuz gerçek sahne içeriyor:

1. Hero
2. Hizmetler
3. Endüstriler
4. Malzemeler
5. Neden Biz
6. Kabiliyetler
7. Güven / Referanslar
8. Karar Desteği / SSS
9. İletişim / CTA

`LandingFlow.tsx` hâlihazırda şu temel davranışları sağlıyor:

- Hero başlığı ve medyasında scroll-linked scale.
- Genel içeriklerde batch reveal.
- Hizmetlerde tek master timeline ile pinned hikâye geçişi.
- Endüstrilerde dikey scroll ile yatay pinned galeri.
- Mobil, kısa viewport, coarse pointer ve reduced-motion için doğal akış.
- Lenis ve ScrollTrigger senkronizasyonu.
- Route öğelerinde klavye odağı ve `aria-hidden` yönetimi.

Bu nedenle hero, hizmetler ve endüstriler için yeni bir “büyük efekt”
eklemek önerilmez. Bu sahneler zaten sayfanın ana motion bütçesini
kullanıyor. Yeni polish, mevcut ritimde daha durağan kalan orta ve alt
sahnelerde yoğunlaştırılmalıdır.

## Önerilen Efekt Haritası

| Öncelik | Made With GSAP referansı | MAS Technic hedefi | Karar |
| --- | --- | --- | --- |
| P0 | [#105 Scroll List Index](https://madewithgsap.com/effects/tutorial105) | Kabiliyetler | Uygula |
| P0 | [#108 Side Thumbnails Navigation](https://madewithgsap.com/effects/tutorial108) | Karar Desteği / teknik içerikler | Uyarlanmış biçimde uygula |
| P1 | [#110 3D Flip Cards](https://madewithgsap.com/effects/tutorial110) | Malzemeler | Sadeleştirerek uygula |
| P1 | #091 Mouse Move + Scroll | Neden Biz metriği | Yalnız prensibi uygula |
| P2 | #051 Infinite + Scroll | Güven / sertifika rayı | Çok düşük genlikte uygula |
| Reddedildi | [#094 Orbital Image Scroll](https://madewithgsap.com/effects/tutorial094) | Endüstriler | Uygulama |
| Reddedildi | [#100 Orbital Scroll Gallery](https://madewithgsap.com/effects/tutorial100) | Hero veya endüstriler | Uygulama |

## P0 — Kabiliyetlerde Scroll List Index

### Referans davranış

Effect #105, uzun bir liste viewport’tan geçerken satırları yatay yönde
hafifçe kaydırıyor ve merkeze en yakın satıra ait görseli sabit bir preview
alanında gösteriyor.

### Neden doğru eşleşme?

Kabiliyetler sahnesinde hâlihazırda beş ekipman satırı bulunuyor:

- 5 eksen işleme
- CNC tornalama
- Tel erozyon
- Silindirik taşlama
- CMM doğrulama

Bu içerik bir galeri değil, teknik bir karşılaştırma listesidir. Sabit preview
ve merkezde aktifleşen satır:

- Tezgâh adını görsel üretim bağlamıyla ilişkilendirir.
- “Tezgâh listesi değil, birbirine bağlı kabiliyetler” mesajını görünür bir
  üretim zincirine dönüştürür.
- Satırların mevcut okunabilirliğini korur.
- Kullanıcı scroll ederken aktif kabiliyeti doğal biçimde algılar; ayrı hover
  keşfi gerektirmez.

### Görsel davranış

Masaüstünde bölüm iki kolona ayrılır:

- Sol `7/12`: mevcut ekipman satırları.
- Sağ `5/12`: sticky medya ve teknik değer paneli.

Aktif satır viewport merkezine yaklaşırken:

- Satır `x: 0 → 20px → 0` yerine tek yönde en fazla `16px` drift yapar.
- Kod ve başlık opacity değeri `0.46 → 1` olur.
- Bakır ölçüm çizgisi `scaleX: 0 → 1` olur.
- Sağdaki görsel `clip-path` ve opacity ile değiştirilir.
- Teknik değer, örneğin `±0.005 mm`, monospaced sayaç alanına taşınır.

Görseller arası geçiş crossfade değil, CNC tasarım diline uygun dikey
“kalibrasyon kapısı” olmalıdır:

```text
eski görsel: clip-path inset(0 0 100% 0)
yeni görsel: clip-path inset(100% 0 0 0) → inset(0)
```

### Teknik uygulama

Yeni bileşen:

```text
src/components/landing/CapabilityIndexMotion.tsx
```

`CapabilityInfrastructure` veriyi bu bileşene prop olarak geçirir. Veri
bileşenin içine kopyalanmaz.

Tek bir ScrollTrigger kullanılmalıdır. Her satır için ayrı trigger açmak
yerine ana section progress değeri aktif indekse çevrilir:

```ts
const active = Math.min(
  items.length - 1,
  Math.round(self.progress * (items.length - 1)),
);
```

Aktif indeks değiştiğinde `gsap.timeline()` önceki preview’ı kapatır, yeni
preview’ı açar. Aynı indekste tekrar tween oluşturulmaz.

Scroll mesafesi sabit piksel yerine içerikten hesaplanmalıdır:

```ts
end: () => `+=${Math.max(window.innerHeight * 1.8, list.scrollHeight)}`,
invalidateOnRefresh: true,
```

### Mobil davranış

`max-width: 768px`, `max-height: 600px` veya `pointer: coarse` koşulunda:

- Pin ve sticky preview kaldırılır.
- Her satır kendi küçük görseliyle doğal akışta görünür.
- Satırların tümü link ve metin olarak erişilebilir kalır.
- Scroll progress üzerinden aktif state hesaplanmaz.

### Kabul kriterleri

- Aynı anda yalnız bir preview aktiftir.
- Preview değişimi 300 ms’yi geçmez.
- Aktif olmayan satır kontrastı WCAG AA sınırının altına düşmez.
- Klavye odağı alan satır, scroll konumundan bağımsız olarak preview’ı
  günceller.
- Bölüm CLS üretmez; preview alanı sabit aspect-ratio taşır.

## P0 — Karar Desteğinde Side Preview Navigation

### Referans Davranış

Effect #108, dikey bir başlık listesinde aktif satıra göre iki yana yayılan
thumbnail’lar gösteriyor; yatay pointer hareketi medya seçimini değiştiriyor.

### Neden birebir uygulanmamalı?

MAS Technic’in SSS alanında hareketli görseller kullanmak soruların
okunabilirliğini azaltır. Ancak aynı bölümdeki üç teknik içerik linki,
editorial preview davranışı için doğru hedeftir.

Bu nedenle efektin “başlığın iki yanına çok sayıda thumbnail açma” kısmı
alınmayacak. Yalnız şu prensip korunacak:

> Kullanıcının odaklandığı içerik satırı, kendisine ait görsel bağlamı
> gecikmesiz biçimde görünür kılar.

### Önerilen davranış

Teknik içerik listesinin yanında tek bir floating preview bulunur:

- Satır hover veya focus aldığında görsel `clip-path` ile açılır.
- Preview pointer’ı birebir takip etmez; section içinde yumuşatılmış bir
  dikey hedefe gider.
- `x` sabit kalır, yalnız `y` en fazla `±56px` değişir.
- Görselin üzerinde içerik türü ve `01–03` indeksi görünür.
- Pointer listeden ayrıldığında preview kaybolmaz; son aktif içerikte sakin
  halde kalır.

Bu çözüm “mouse kovalamaca” hissi yaratmadan Awwwards seviyesinde bir medya
geri bildirimi verir.

### Teknik Uygulama

Yeni hook:

```text
src/hooks/useEditorialPreview.ts
```

Pointer hareketinde sürekli `gsap.to()` üretmek yerine `gsap.quickTo()`
kullanılmalıdır. GSAP dokümantasyonu, aynı numeric property’nin pointer
eventlerinde sık güncellenmesi için `quickTo()` kullanımını performanslı
yol olarak öneriyor:
[gsap.quickTo dokümantasyonu](https://gsap.com/docs/v3/GSAP/gsap.quickTo%28%29/).

```ts
const yTo = gsap.quickTo(preview, "y", {
  duration: 0.35,
  ease: "power3.out",
});
```

Pointer koordinatı section sınırında clamp edilmelidir. Preview hiçbir zaman
footer veya CTA üzerine taşmamalıdır.

Focus davranışı pointer davranışıyla eşdeğer olmalıdır:

```ts
onFocus={() => setActive(index)}
onPointerEnter={() => setActive(index)}
```

### Mobil Davranış

- Floating preview render edilmez.
- Görsel, her teknik içerik satırının içinde mevcut yerinde kalır.
- Touch ile hover benzetimi yapılmaz.
- FAQ accordion davranışına hiçbir GSAP timeline bağlanmaz.

### Kabul Kriterleri

- Preview `pointer-events: none` kullanır.
- Link hit-area değerleri en az 44 px kalır.
- Hızlı hover geçişlerinde önceki tween’ler birikmez.
- Tab sırası DOM sırasıyla aynıdır.
- Preview olmadığı durumda tüm içerik hâlâ anlaşılırdır.

## P1 — Malzemelerde Sadeleştirilmiş 3D Flip Cards

### Referans Davranış

Effect #110, çift yüzlü kartları scroll ile ekran boyunca hareket ettiriyor;
kartlar derinlikte öne gelirken arka yüzlerini gösterecek şekilde dönüyor.

### Neden malzemeler için uygun?

Malzeme kararının doğal olarak iki yüzü vardır:

- Ön yüz: alaşım adı, kodu ve malzeme ailesi.
- Arka yüz: tolerans hedefi, proses penceresi ve teknik not.

Dolayısıyla flip burada dekoratif bir numara değil, bilgi modelinin fiziksel
metaforudur. Ancak referanstaki ekran boyunca seyahat ve büyük 3D derinlik
MAS Technic için fazla oyuncaktır. Sadece kontrollü kart dönüşü alınmalıdır.

### Önerilen Davranış

Masaüstünde malzeme kartları section girişinde sırayla görünür. Kullanıcı
kartın dikey merkezini geçerken:

- Kart `rotateY: 0 → 7deg → 0` ile yalnız derinlik ipucu verir.
- İç içerik gerçek anlamda ters çevrilmez; okunabilir metin DOM’da düz kalır.
- Teknik tolerans rayı soldan sağa dolar.
- Hover veya focus sırasında “ön/arka” bilgi katmanı
  `clip-path: inset()` ile yer değiştirir.

Tam `180deg` dönüş önerilmez. Ters yüz metni, klavye odağı ve motion
sickness açısından gereksiz risk oluşturur.

### Teknik Uygulama

Kart başına bağımsız ScrollTrigger açılabilir, ancak `ScrollTrigger.batch()`
tercih edilmelidir. Mevcut landing batch reveal genişletilerek malzeme
kartları için ayrı bir motion profile eklenebilir:

```ts
ScrollTrigger.batch(".lf-material-card", {
  start: "top 84%",
  once: true,
  onEnter: (cards) => timeline
    .from(cards, {
      y: 36,
      rotateY: -7,
      opacity: 0,
      stagger: 0.07,
    })
    .to(cards.map(getToleranceBar), {
      scaleX: 1,
      stagger: 0.07,
    }, "<+0.1"),
});
```

Kartlarda `transform-style: preserve-3d` yalnız desktop motion profilinde
etkinleştirilmelidir. `will-change` kalıcı verilmemeli; timeline başında
eklenip tamamlanınca temizlenmelidir.

### Kabul Kriterleri

- Kart linki tek odak hedefidir; iç katmanlar ayrı tab stop oluşturmaz.
- Text hiçbir karede aynalanmaz.
- Hover olmadan tüm temel teknik bilgi görünürdür.
- Reduced-motion altında kartlar doğrudan son durumda render edilir.

## P1 — Neden Biz Metriğinde Pointer-Tepkili Ölçüm Alanı

### Referans prensibi

Made With GSAP koleksiyonundaki mouse move + scroll efektleri, pointer
konumunu görsel katmanların derinlik veya yön değişimine çeviriyor. Burada
belirli bir premium efektin kodu alınmayacak; yalnız input-to-motion
prensibi kullanılacaktır.

### Neden bu bölüm?

`±0.005 mm` metriği sayfanın en güçlü teknik iddiasıdır. Şu an büyük tipografi
olarak güçlü, fakat ölçüm fikrini davranışla anlatmıyor. Çok küçük pointer
tepkisi, “hassas kontrol” mesajını destekleyebilir.

### Önerilen davranış

- Metriğin arkasında 11 ince datum çizgisi bulunur.
- Pointer yatay hareket ettikçe merkez çizgi en fazla `±8px` kayar.
- Ondalık bölüm ve `MM` etiketi en fazla `±3px` karşı yönde hareket eder.
- Pointer durduğunda tüm katmanlar kalibre edilmiş merkez konuma döner.
- Scroll girişinde çizgiler merkezden dışa `scaleX` ile açılır.

Bu alan cursor-following bir oyuncak değil, dijital kumpas hissi vermelidir.

### Performans sınırı

- Yalnız `(pointer: fine)` ve `prefers-reduced-motion: no-preference`.
- `pointermove` başına DOM ölçümü yapılmaz.
- Section ölçüsü girişte ve resize sonrasında cache edilir.
- Tüm hareket yalnız transform üzerinden çalışır.

## P2 — Güven Bölümünde Kontrollü Infinite Sertifika Rayı

### Neden düşük öncelik?

Infinite marquee hareketi güven alanını canlı tutabilir; fakat sürekli
hareket sertifikaların okunabilirliğini ve kurumsal sakinliği kolayca
bozabilir. Bu yüzden mevcut sertifika rayı otomatik kayan ana efekt hâline
getirilmemelidir.

### Önerilen kullanım

- Rail içeriği erişilebilir DOM’da yalnız bir kez bulunur.
- Görsel tekrarlar `aria-hidden="true"` ikinci bir track üzerinde yer alır.
- Hız `18–24 saniye / tur` aralığında olur.
- Kullanıcı section üzerine geldiğinde veya içinde focus olduğunda hareket
  durur.
- Scroll yönü değiştiğinde rail yönü değişmez; yalnız hız kısa süreli en
  fazla yüzde 12 artar.

Reduced-motion altında track tamamen sabitlenir.

## Neden Orbital Efektler Reddedildi?

Effect #094, görselleri sabit merkez başlığın çevresinde eğrisel yollardan
geçiriyor. Effect #100 ise görselleri viewport merkezi etrafında sürekli
dönen bir yörüngeye dağıtıyor.

Her ikisi de güçlü demo etkisi yaratıyor; ancak bu site için üç problem
oluşturuyor:

1. Endüstriler bölümü zaten yatay pinned galeri kullanıyor. İkinci bir
   orbital sistem içerik mimarisini ileri götürmek yerine mevcut davranışı
   değiştirir.
2. Havacılık, savunma, medikal gibi sektör adlarının hızlı görsel hareketle
   yarışması B2B karar vericinin tarama hızını düşürür.
3. Sürekli ticker ve scroll velocity tepkisi, hero video, Lenis ve iki pinned
   sahneyle birlikte motion bütçesini aşar.

Bu efektler ancak ayrı bir deneysel kampanya microsite’ında düşünülmelidir.

## Ortak Motion Mimarisi

### Dosya yapısı

```text
src/
  components/landing/
    CapabilityIndexMotion.tsx
    EditorialKnowledgePreview.tsx
    MaterialMotionCards.tsx
    PrecisionMetricField.tsx
  hooks/
    useEditorialPreview.ts
  config/
    landing-motion.ts
```

`LandingFlow.tsx` yeni efektlerin ayrıntılarını barındırmamalıdır. Ana dosya:

- Sahneleri sıraya koyar.
- Global hero, hizmet ve endüstri timeline’larını yönetir.
- Alt bölüm motion bileşenlerinin kendi scoped context’lerinde çalışmasına
  izin verir.

### Token genişletmesi

```ts
export const LANDING_MOTION = {
  // mevcut tokenlar
  scrub: 0.8,
  revealDistance: 40,
  revealDuration: 0.72,
  hoverDuration: 0.2,

  // yeni kontrollü profiller
  previewSwap: 0.28,
  previewFollow: 0.35,
  rowDrift: 16,
  cardTilt: 7,
  metricParallax: 8,
  certificationLoop: 22,
} as const;
```

### Responsive ve reduced-motion yönetimi

Koşullar farklı dosyalarda tekrar edilmemelidir. Tek bir `gsap.matchMedia()`
profili kullanılmalıdır:

```ts
const media = gsap.matchMedia();

media.add(
  {
    desktop: "(min-width: 769px) and (min-height: 601px)",
    fine: "(pointer: fine)",
    reduce: "(prefers-reduced-motion: reduce)",
  },
  ({ conditions }) => {
    const { desktop, fine, reduce } = conditions!;
    if (reduce || !desktop) return;
    setupScrollMotion();
    if (fine) setupPointerMotion();
  },
);
```

GSAP’in resmi dokümantasyonu `gsap.matchMedia()` içinde reduced-motion ve
breakpoint koşullarının birlikte yönetilebildiğini ve koşul değiştiğinde
context’in otomatik revert edildiğini açıklıyor:
[gsap.matchMedia dokümantasyonu](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/).

### Cleanup kuralı

Her bileşen kendi root ref’i içinde context oluşturmalıdır:

```ts
const ctx = gsap.context(() => {
  // timeline ve triggerlar
}, rootRef);

return () => ctx.revert();
```

Global provider içinde route değişiminde tüm ScrollTrigger’ları körlemesine
öldürmek yerine component context cleanup’ları esas olmalıdır. Aksi halde
aynı anda açılan route curtain veya başka sayfa animasyonları da
etkilenebilir.

### Refresh kuralı

Her görsel yüklenmesinde ayrı `ScrollTrigger.refresh()` çağrılmamalıdır.

1. Lazy görsel `decode()` tamamlanır.
2. Talepler tek bir requestAnimationFrame/debounce kuyruğunda birleştirilir.
3. Bir kez `ScrollTrigger.refresh()` çalıştırılır.

Dinamik ölçü kullanan triggerlarda `invalidateOnRefresh: true` olmalıdır.
ScrollTrigger başlangıç ve bitiş değerlerini önceden hesapladığı için,
ölçüler değiştiğinde refresh gerekir:
[ScrollTrigger dokümantasyonu](https://gsap.com/docs/v3/Plugins/ScrollTrigger/).

## Uygulama Sırası

### Faz 0 — Baseline

- Mevcut dokuz sahnenin ekran görüntülerini üret.
- Mevcut ScrollTrigger sayısını section bazında kaydet.
- 1280×800 masaüstünde scroll sırasında long-task ve FPS örneği al.
- Hero LCP, toplam CLS ve landing bundle boyutunu kaydet.

Bu ölçümler olmadan “wow effect arttı” değerlendirmesi öznel kalır.

### Faz 1 — Kabiliyetler

1. Ekipman verisini export edilebilir içerik modeline taşı.
2. Sticky preview için sabit aspect-ratio alanı ekle.
3. Tek master ScrollTrigger ile aktif indeks üret.
4. Focus ile aktif indeks senkronizasyonunu ekle.
5. Mobile doğal kart düzenini doğrula.

Bu faz en yüksek fayda/risk oranına sahiptir ve tek başına yayınlanabilir.

### Faz 2 — Editorial teknik içerik preview

1. Teknik içerik listesi için tek preview surface ekle.
2. `quickTo()` ile yalnız y eksenini yumuşat.
3. Hover ve focus state’lerini birleştir.
4. Section boundary clamp ve footer çakışma testini ekle.
5. Coarse pointer’da bileşeni DOM’dan çıkar.

### Faz 3 — Malzeme kartları

1. Kart bilgi hiyerarşisini ön/teknik katman olarak düzenle.
2. Batch giriş timeline’ını ekle.
3. Maksimum 7 derece tilt ve tolerance rail animasyonunu uygula.
4. Text zoom ve focus testlerini çalıştır.

### Faz 4 — Ölçüm alanı ve sertifika rayı

Bu iki polish aynı anda değil, ayrı ayrı A/B görsel değerlendirmeyle
eklenmelidir. Sayfanın hareket yoğunluğu artıyorsa sertifika rayı iptal
edilmelidir.

### Faz 5 — Motion bütçesi ve sadeleştirme

- Aynı viewport’ta iki sürekli animasyon bulunmamalıdır.
- Hero viewport’tan çıktıktan sonra hero tween GPU katmanı bırakmamalıdır.
- Infinite rail görünür değilken pause edilmelidir.
- Pointer effect yalnız ilgili section görünürken listener taşımalıdır.
- ScrollTrigger sayısı baseline’a göre en fazla `+4` artmalıdır.

## Test Planı

### Fonksiyonel testler

- Hero → hizmetler → endüstriler → malzemeler → neden biz →
  kabiliyetler → güven → SSS → CTA sırası korunur.
- Tüm eski anchor kimlikleri çalışır.
- Kabiliyet preview’ı ileri ve ters scroll’da doğru indeksi gösterir.
- Hızlı scroll sonrasında aktif satır ve preview ayrışmaz.
- Focus ile etkinleşen teknik içerik görseli doğru route’a bağlı kalır.
- Route değişiminden sonra orphan ScrollTrigger kalmaz.

### Viewport matrisi

- 320×568
- 375×812
- 390×844
- 768×1024
- 1280×800
- 1440×650
- 1440×900

1440×650 görünümünde yeni pin kurulmaz; kısa viewport doğal akış kullanır.

### Erişilebilirlik

- `prefers-reduced-motion: reduce` altında pin, parallax, card tilt ve
  infinite rail bulunmaz.
- 200% text zoom sırasında preview metnin üstünü kapatmaz.
- Hover ile açılan her bilgi focus veya statik metinle de erişilebilir olur.
- Dekoratif medya `alt=""`; anlam taşıyan üretim medyası açıklayıcı alt
  metin kullanır.
- Axe taramasında yeni ihlal oluşmaz.

### Performans yayın kapısı

- CLS `≤ 0.05`
- Hero LCP hedefi `≤ 2.5 s`
- Scroll sırasında yeni long task `≤ 50 ms`
- Masaüstü hedefi 60 fps; p95 frame süresi `≤ 20 ms`
- Landing başlangıç bundle artışı gzip olarak `≤ 12 KB`
- ScrollTrigger sayısı baseline’a göre `≤ +4`
- Pointer move handler içinde layout read/write karışımı bulunmaz

### Görsel değerlendirme

Her efekt şu sorularla puanlanmalıdır:

1. Kullanıcı, animasyon olmadan anlayamadığı bir ilişkiyi şimdi daha hızlı
   anlayabiliyor mu?
2. Hareket, CNC hassasiyet ve teknik güven karakterine uyuyor mu?
3. Etki durduğunda kompozisyon hâlâ güçlü mü?
4. Kullanıcı CTA veya route’a daha kolay mı ulaşıyor?
5. Efekt kaldırıldığında sayfa belirgin biçimde daha zayıf mı kalıyor?

Beş sorunun en az dördüne “evet” yanıtı vermeyen efekt yayınlanmamalıdır.

## Lisans ve Kaynak Kullanımı

Made With GSAP üyelikle açılan efektlerin kaynak kodu, asset’i veya
stil değerleri repository’ye izinsiz kopyalanmamalıdır. Bu rehberde:

- Kamuya açık tutorial açıklamalarından hareket prensibi çıkarılmıştır.
- MAS Technic’e özgü DOM, veri modeli ve timeline mimarisi önerilmiştir.
- Üçüncü taraf görsel, font veya ücretli snippet alınmamıştır.

Ücretli kaynağın gerçek kodu ileride lisanslı olarak kullanılacaksa satın alma
kanıtı, kullanım koşulları ve kaynak manifesti uygulamadan önce ayrıca
doğrulanmalıdır.

## Nihai Öneri

İlk yayın dalgasında yalnız iki efekt uygulanmalıdır:

1. Kabiliyetler için #105 esintili scroll list index.
2. Teknik içerikler için #108 esintili tek editorial preview.

Bu ikisi sitenin mevcut güçlü hero ve pinned galeri mimarisiyle yarışmadan
alt bölümlere anlamlı derinlik ekler. Malzeme tilt’i ikinci dalgaya
bırakılmalı; pointer metriği ve sertifika marquee’si ise performans ve görsel
yoğunluk ölçüldükten sonra opsiyonel polish olarak değerlendirilmelidir.
