# Teknik Performans ve Özellik Kurtarma Planı

## Amaç

Bu belge, arayüzde uygulanmış ve ürünü ileri taşıyan; ancak yükleme,
yaşam döngüsü veya erişilebilirlik problemleri nedeniyle tam değerini
üretemeyen özellikleri listeler. Ölçümler production build üzerinden,
`127.0.0.1:4181` adresinde soğuk tarayıcı bağlamlarıyla yapılmıştır.

## Doğrulanmış bulgular

### P0 — Malzeme morph sahnesi ilk yüklemeyi bloke ediyor

Malzeme kütüphanesindeki canvas sekansı güçlü bir ürün vitrini oluşturuyor.
Ancak sayfa açılır açılmaz 80 adet WebP frame indiriliyor:

- Frame transferi: yaklaşık 3,40 MB.
- Davranış 375, 768 ve 1280 px genişliklerde aynı.
- Sahne viewport dışında olsa bile preloader hemen başlıyor.
- `machine-loop.mp4`, CSS ile mobilde gizlense de `src` nedeniyle istek alıyor.

#### Malzeme morph çözümü

1. `MaterialMorphScroll` bileşenini section yaklaşana kadar mount etme.
2. İlk olarak tek poster veya 1, 20, 40, 60 ve 80 numaralı ana kareleri yükle.
3. Kalan kareleri `IntersectionObserver`, idle bütçesi ve bağlantı kalitesine
   göre küçük gruplar halinde getir.
4. `saveData`, `effectiveType`, reduced-motion ve coarse pointer koşullarında
   sekansı poster artı doğal dikey içeriğe indir.
5. Video `src` değerini yalnız uygun desktop media query eşleştiğinde ata.
6. Kareler yüklenemezse son başarılı kareyi koruyan hata toleransı ekle.

#### Malzeme morph başarı ölçütü

- Mobil ilk yüklemede sekans frame transferi en fazla 100 KB.
- Desktop section viewporta yaklaşmadan en fazla beş ana kare yüklenmiş olmalı.
- Tam sekans yalnız sahneyle etkileşim kuran uygun cihazlarda indirilir.

### P0 — Skip link birçok public route üzerinde boşa gidiyor

Global “Ana içeriğe geç” bağlantısı `#main-content` hedefini kullanıyor. Ana
sayfada hedef var; Malzemeler ve Teklif sayfalarında `main` veya bu ID yok.
Route smoke testinde her iki sayfa görünür biçimde açıldı ancak skip hedefi
bulunamadı.

#### Skip link çözümü

1. Public route layout seviyesinde tek bir `<main id="main-content">` sözleşmesi
   oluştur.
2. Sayfalardaki dağınık `<main>` ve kök `<div>` kullanımını bu layouta taşı.
3. Route başına duplicate `main` oluşmasını engelle.
4. Skip link focus transferini ve sabit header offsetini Playwright ile test et.

#### Skip link başarı ölçütü

- Tüm public route'larda tam bir `#main-content` hedefi bulunmalı.
- Skip link sonrası aktif odak ana içerik başlangıcına taşınmalı.

### P0 — Mobil kabiliyet rayı klavye erişimine kapalı

Mobilde `.lf-equipment` yatay kaydırılabilir bir raydır. Axe,
`scrollable-region-focusable` ihlalini ciddi seviyede raporladı.

#### Mobil kabiliyet rayı çözümü

1. Raya açıklayıcı `aria-label`, uygun region semantiği ve `tabIndex={0}` ekle.
2. Sol/sağ oklarla kart bazlı kaydırma sağla.
3. Kartların bilgi amaçlı mı, bağlantı mı olduğunu semantik olarak netleştir.
4. Focus ring ve scroll-padding değerlerini safe-area ile uyumlandır.

#### Mobil kabiliyet rayı başarı ölçütü

- Mobil tam sayfa Axe taramasında ciddi veya kritik ihlal kalmamalı.
- Klavye ile ilk ve son ekipman kartına ulaşılabilmeli.

### P1 — Motion geciktirme mimarisi gerçek ağ kazancı üretmiyor

Landing motion kurulumu ilk intent'e kadar bekletiliyor; ancak
`SmoothScrollProvider` mount sırasında Lenis ve GSAP'i yüklüyor. Fine pointer
cihazlarda özel cursor da GSAP kullanıyor.

Ölçülen masaüstü ilk etkileşim öncesi transferler:

- GSAP chunk: yaklaşık 45,6 KB.
- Lenis chunk: yaklaşık 5,5 KB.
- Landing motion henüz `motionReady` değilken iki runtime da yüklenmiş durumda.

#### Motion runtime çözümü

1. Motion runtime sahipliğini tek `MotionRuntimeProvider` altında birleştir.
2. Hero ilk boyaması sırasında native scroll ve CSS cursor kullan.
3. Lenis ile ScrollTrigger'ı ilk wheel/touch intent, idle bütçesi veya pinned
   sahne yakınlığı koşullarından en erken olanında yükle.
4. Custom cursor hareketini `requestAnimationFrame` ve CSS transform ile
   çalıştır; GSAP'i yalnız durum geçişlerinde isteğe bağlı kullan.
5. Tek GSAP ticker ve tek ScrollTrigger kayıt noktası oluştur.

#### Motion runtime başarı ölçütü

- İlk etkileşim öncesi resource listesinde Lenis bulunmamalı.
- GSAP yalnız motion gerçekten gerekliyse yüklenmeli.
- Cursor ilk hareket gecikmesi 50 ms altında kalmalı.

### P1 — Landing phase hydration sistemi artık işlevsiz

`LandingFlow` başlangıçta `renderPhase = 5` ile tüm içeriği render ediyor.
Buna rağmen phase artırmak için timer, scroll, wheel, touch, pointer, keydown ve
focus listener'ları kurulmaya devam ediyor. Koşullu JSX ve placeholder dalları
artık ürün davranışı üretmiyor.

#### Landing hydration çözümü

1. `renderPhase`, phase timer'ları ve placeholder dallarını kaldır.
2. Metinsel içeriği koşulsuz render et.
3. Ağır medyayı component mount yerine gerçek media observer ile ertele.
4. Motion intent ve media loading state'lerini birbirinden ayır.

#### Landing hydration başarı ölçütü

- İlk render ve ilk wheel arasında section DOM yapısı değişmemeli.
- Landing için tek intent listener grubu kalmalı.
- Anchor hedefleri JavaScript gecikmesinden bağımsız erişilebilir olmalı.

### P1 — Hero ve editorial görseller tek varyant kullanıyor

Ana sayfa hero'su mobile ve desktop için aynı yaklaşık 234 KB JPEG'i indiriyor.
`srcset`, `sizes`, AVIF veya WebP alternatifi bulunmuyor. Benzer durum hizmet ve
endüstri görsellerinin çoğunda devam ediyor.

#### Responsive görsel çözümü

1. Hero için 640, 960, 1280 ve 1920 px AVIF/WebP varyantları üret.
2. `<picture>`, doğru `srcset` ve `sizes` değerlerini ekle.
3. İlk hero dışındaki içerikte `fetchPriority="low"` ve gerçek lazy loading
   kullan.
4. Görsel kalite ve crop kararlarını section bazında görsel regresyonla koru.

#### Responsive görsel başarı ölçütü

- 375 px hero transferi 100 KB altında olmalı.
- LCP p75 hedefi 2,5 saniyenin altında kalmalı.
- Görsel kaynaklı CLS en fazla 0,05 olmalı.

### P1 — Teklif sayfası CAD runtime'ını kullanıcıdan önce yüklüyor

Teklif sayfası route seviyesinde Three.js, React Three Fiber, Drei ve loader
modüllerini statik olarak içeri alıyor. Kullanıcı CAD yüklemeden büyük 3D
runtime parse ediliyor. Soğuk ölçümde sayfanın JavaScript transferi yaklaşık
550 KB; en büyük route chunk'ı tek başına yaklaşık 233 KB transfer üretiyor.

#### CAD runtime çözümü

1. Upload formu ile CAD preview runtime'ını iki ayrı component sınırına ayır.
2. Canvas, Three.js ve STL/OBJ loader'larını dosya seçimi veya “3D önizle”
   aksiyonu sonrasında dynamic import et.
3. Yükleme sırasında düşük maliyetli statik teknik çizim placeholder'ı göster.
4. Worker destekli parse ve büyük dosya boyutu bütçesi ekle.

#### CAD runtime başarı ölçütü

- Dosya seçilmeden Three.js ve CAD loader chunk'ları indirilmemeli.
- Teklif formunun etkileşime hazır JavaScript transferi 250 KB altında olmalı.

### P2 — Chatbot public route maliyetini gereksiz yükseltiyor

Chatbot ana sayfa dışındaki her public route'ta hemen mount ediliyor. Ölçümde
ChatBot chunk'ı yaklaşık 43,6 KB, Supabase client yaklaşık 46 KB transfer
oluşturdu. Kullanıcı sohbeti hiç açmasa da maliyet ödeniyor.

#### Chatbot yükleme çözümü

1. İlk olarak yalnız hafif sohbet tetikleyicisini render et.
2. Chat UI, Supabase ve bilgi tabanını ilk açılışta dynamic import et.
3. İsteğe bağlı idle prefetch'i yalnız iyi bağlantıda etkinleştir.
4. İlk açılış loading ve hata durumunu erişilebilir biçimde göster.

#### Chatbot yükleme başarı ölçütü

- Sohbet açılmadan ChatBot ve Supabase chunk'ları yüklenmemeli.
- Tetikleyici 44 × 44 px dokunma hedefini korumalı.

### P2 — ScrollTrigger cleanup kapsamı global

`SmoothScrollProvider` cleanup sırasında `ScrollTrigger.getAll()` sonucundaki
tüm trigger'ları öldürüyor. Bu provider'a ait olmayan component trigger'ları da
etkileyebilir ve route/provider geçişlerinde beklenmeyen motion kaybı yaratır.

#### ScrollTrigger cleanup çözümü

1. Provider yalnız Lenis ticker ve kendi listener'larını temizlemeli.
2. Her motion component kendi `gsap.context()` yaşam döngüsüne sahip olmalı.
3. Global `kill all` yalnız test/debug yardımcılarına bırakılmalı.
4. Public → panel → public route dönüş testi eklenmeli.

### P2 — Route curtain düşük güçlü cihazlarda pahalı olabilir

Route geçişi beş panel, merkezi label ve tüm sayfaya uygulanan blur/filter
animasyonu kullanıyor. Görsel sonuç güçlü; ancak filter animasyonu paint
maliyetini artırabilir ve `mode="sync"` eski/yeni route'u aynı anda tutar.

#### Route curtain çözümü

1. Düşük cihaz profilinde blur'u kaldır; transform ve opacity kullan.
2. Panel sayısını ekran ve cihaz profiline göre üçe düşürebil.
3. Route chunk hazır olana kadar curtain zamanlamasını navigation state ile
   eşleştir.
4. DevTools trace ile paint, composite ve long task bütçelerini doğrula.

## Ölçüm özeti

| Kontrol | Sonuç |
| --- | ---: |
| Production build | Başarılı |
| Hedefli ESLint | 0 hata |
| Landing Playwright hedefli test | 2/2 geçti |
| Desktop Axe ciddi/kritik | 0 |
| Mobile Axe ciddi | 1 |
| Desktop CLS | 0 |
| Mobile CLS | 0 |
| Desktop pin | 2 |
| Mobile pin | 0 |
| Yatay overflow | 0 |
| Desktop lokal LCP | yaklaşık 2,02 sn |
| Mobile lokal LCP | yaklaşık 1,36 sn |
| Malzeme sekansı | 80 frame / yaklaşık 3,40 MB |

Lokal LCP değerleri throttling uygulanmamış loopback ölçümüdür; gerçek kullanıcı
performansının yerine yayın öncesi karşılaştırma tabanı olarak kullanılmalıdır.

## Uygulama sırası

### Faz 1 — Erişilebilirlik ve gereksiz yükleme

1. Global `main-content` sözleşmesini düzelt.
2. Mobil equipment rayını klavye erişilebilir yap.
3. Malzeme sekansını viewport ve cihaz profiline göre ertele.
4. Mobilde gizli videonun kaynak atamasını engelle.

### Faz 2 — Runtime ayrıştırma

1. Motion runtime sahipliğini birleştir.
2. Landing phase kalıntılarını kaldır.
3. Chatbot'u kullanıcı aksiyonuna göre yükle.
4. CAD preview runtime'ını teklif formundan ayır.

### Faz 3 — Medya ve motion bütçesi

1. Responsive AVIF/WebP pipeline'ı kur.
2. Route curtain için düşük cihaz profili ekle.
3. Frame ve görsel prefetch stratejisini bağlantı kalitesine bağla.

## Test ve yayın kapısı

1. 375 × 812, 768 × 1024, 1280 × 800 ve 1440 × 650 smoke test.
2. Reduced-motion, coarse pointer, save-data ve yavaş 4G profilleri.
3. Tam Axe taraması; ciddi/kritik ihlal sıfır.
4. Public route skip-link matrisi.
5. Landing'de desktop iki pin, mobil sıfır pin.
6. Malzemeler route'unda viewport öncesi frame istek sayısı testi.
7. Teklif route'unda upload öncesi Three.js yüklenmeme testi.
8. Chat açılmadan Supabase/ChatBot yüklenmeme testi.
9. Production build, hedefli lint ve tam Playwright regresyonu.
10. Değişiklik öncesi/sonrası transfer, LCP, CLS ve long-task karşılaştırması.
