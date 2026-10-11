# MAS TECHNIC — 7.0+ hedefi için yaratıcı dönüşüm ve uygulama sözleşmesi

**Tarih:** 11 Ekim 2026  
**Belge türü:** Referans incelemesi, sanat yönetimi, teknik tasarım ve sonraki uygulama için kabul sözleşmesi  
**Politika:** `engineering-core`  
**Bu teslim:** Rapor. Uygulama kaynakları, veri tabanı ve yayın değiştirilmedi.  
**Uygulama durumu:** Aşağıdaki fazlar `NOT_STARTED`; tanımlanan site testleri bu rapor hazırlanırken çalıştırılmış sayılmaz.

## SEC-00 — Hedef ve yürütme sınırı

Bu projenin hedefi, Mas Technic'in mevcut mühendislik dokümanı karakterini koruyarak görsel tasarım ve yaratıcı etkileşimde belirgin bir sıçrama yapmaktır. Mevcut 12 ana içerik bandı, NEXUS'un konumu, beş adımlı demo akışı, teklif işlevleri ve bütün genel erişime açık sayfa aileleri korunur. Yalnızca landing page yenilemek yeterli değildir.

Bu raporun ana önerisi: **aynı parçanın ham geometri, işleme, ölçüm ve teslim dosyası boyunca izlenen yolculuğu**. Ziyaretçi bir üretim şirketinin hareketli broşürünü değil, mühendislik kararlarının görünür olduğu bir deneyimi görmelidir. Ana sayfada üç belirgin zirve bulunmalıdır: geometri dönüşümü, metrologi sahnesi ve NEXUS'ta belgenin işe bağlanması. RFQ bu anlatının işlevsel karşılığıdır.

“7.0+” gerçek jüri oylamasına ilişkin garanti değildir. Bu belge, o seviyeye aday olabilecek bir tasarımın gözlemlenebilir özelliklerini ve kalite kapılarını tanımlar. Otomasyon; çalışmayı, hataları, hız bütçesini ve kapsamı ölçer. Özgünlüğü ve sanat yönetimini yalnızca test sayısıyla kanıtlayamaz. Görsel değerlendirme ayrı ve zorunlu bir kapıdır.

Kullanıcının son mesajındaki “önce yalnızca rapor” talebi bu teslimde geçerlidir. Aşağıdaki uygulama talimatları sonraki uygulama aşamasının sözleşmesidir; bu dosyanın yazılması, burada tarif edilen sahnelerin yapılmış olduğu anlamına gelmez.

### Karar kilitleri

| Kilit | Durum | Korunacak karar |
|---|---|---|
| DL-01 | LOCKED | Ana sayfada 02–13 numaralı 12 içerik bandı ve mevcut sıralama korunur. Header 01 ve footer 14 bu sayıya dahil değildir. |
| DL-02 | LOCKED | NEXUS 11. bantta kalır; Teklif, Onay, Üretim, Ölçüm, Sevkiyat adımları korunur. |
| DL-03 | LOCKED | Genel erişime açık NEXUS bir demodur. Gerçek müşteri/sipariş ekranı gibi sunulamaz. |
| DL-04 | LOCKED | Onaylı tolerans, sertifikalar, referanslar ve teklif taahhütleri kaynak veriden gelir. Estetik için yeni sonuç uydurulmaz. |
| DL-05 | LOCKED | Gönderilen MAS TECHNIC logosu esas alınır. Gogade talebi görünmez biçimde mevcut fontlarla ikame edilmez. |
| DL-06 | LOCKED | Ana görünüm daha açık olacak; endüstriyel teknik grid, ray, çizim dili ve keskin köşeler korunacak. |
| DL-07 | LOCKED | Mobilde doğal kaydırma, klavye erişimi, azaltılmış hareket ve animasyonsuz içerik erişimi korunur. |
| DL-08 | LOCKED | Özel admin/panel, kimlik doğrulama, Supabase şeması, RLS ve müşteri verileri bu görsel dönüşümün kapsamı dışındadır. |
| DL-09 | LOCKED | Var olan kullanıcı değişiklikleri korunur; eski çalışma ağacı otomatik resetlenmez. |
| DL-10 | LOCKED | Uygulama sonrası teslim hedefi yeni sürümü gerçekten açan `chatgpt.site` önizlemesidir; eski Vercel bağlantısı yeni teslim diye sunulmaz. |

Önceki “bronz tek vurgu rengidir” veya “3D doküman sitesiyle rekabet eder” gibi tasarım tercihleri kullanıcı tarafından verilmiş kalıcı kilitler değildir. Yeni açık renk ve marka isteği doğrultusunda yeniden değerlendirilmeleri gerekir.

## SEC-01 — Neden önceki revizyonlar küçük kaldı?

### Kaynaktan doğrulanabilen bulgular

| Bulgu | Somut kanıt | Tasarıma etkisi | Yeni karar |
|---|---|---|---|
| Yaratıcı araçlar sahne kurulmadan elenmiş. | `docs/quality/mas-technic-awwwards/reference-motion-fit.md`, “Deliberately not selected” bölümü; persistent canvas, spline kamera, FBO ve kinetik tipografi seçenekleri reddediliyor. | Hedef görsel sıçrama iken çalışma küçük reveal ve wipe düzeyinde kalmış. | Tekniği bütün siteye yaymak yerine belirli bir anlatı problemi üzerinde prototiple ve ölç. |
| Hero ana parça statik. | `TechnicalHero.tsx` içindeki responsive `<picture>`, SVG ölçü çizgileri ve dört ölçü düğmesi. | Ölçü etkileşimi var; ham geometri → işlenmiş parça dönüşümü yok. | Gerçek geometriye bağlı, büyük ölçekli dönüşüm ve kesit sahnesi. |
| Giriş animasyonları yaratıcı mimari yerine kullanılmış. | `useTechnicalLandingMotion.ts`: görünürlük sınıfları, observer, fail-safe ve reduced-motion yolu. | Bölümler açılıyor fakat neden bu hareketin Mas Technic'e özgü olduğu anlaşılmıyor. | Bölümlere ortak parça/ölçü kimliği, geri sarılabilen zaman çizelgesi ve anlamlı kontrol ekle. |
| Marka logosu ve istenen display font kaynakta yok. | Gönderilen `02-87562.jpg` turkuaz logo; `10-166586.jpg` Gogade referansı. Mevcut font varlıklarında Gogade bulunmuyor. | Kullanıcının tanımladığı marka yönü gerçekleşmemiş. | Logo ve gerçek font dosyası için açık kabul kapısı. |
| Mevcut renk sistemi bronz ve sıcak kâğıdı merkeze almış. | `src/styles/design-tokens.css`. | Markanın turkuazı geri planda kalmış; istenen aydınlık endüstriyel yön zayıf. | Beyaz/çelik/kâğıt tabanı ve markaya bağlı turkuaz. |
| Hero verileri örnek çizim olarak işaretli; yine de yanlış okunabilir. | `heroPartFacts` ve ölçü düğmelerinde `Ra 0.4 µm`, örnek çizim kimliği ve ±0.010 mm. | Örnek değer, şirketin genel doğrulanmış kabiliyeti sanılabilir. | Etiket ve açıklamayı bağlama yerleştir; örnek yüzey değerini bağımsız kabiliyet iddiasına dönüştürme. |
| 3D altyapısı tamamen eksik değil. | `src/components/rfq/cad/CadStage.tsx`; isteğe bağlı CAD görünümü ve demand render. | Sıfırdan teknoloji yığını kurmak gerekmez. | RFQ sınırını koru; tanıtım 3D'sini ayrı lazy chunk ile ekle. |
| Kahraman parçanın gerçek 3D varlığı eksik. | İncelenen `public`/`src/assets` içinde kullanılabilir hero GLB/GLTF veya üretim video sekansı yok. | Shader yazmak tek başına gerçek metal yüzey, kamera ve kesit üretmez. | Önce varlık sözleşmesi; geometri eksikliğini rastgele küple kapatma. |
| Aynı iç sayfa hero kalıbı çok tekrarlanıyor. | Paylaşılan shell ve mevcut servis/hakkımızda/kalite sayfalarının kaynakları ile önceki yerel ekran kayıtları. | Sayfa sayısı artıyor; özgün kompozisyon sayısı artmıyor. | İç sayfa aileleri konuya göre farklı editoryal şablonlar kullanır. |
| Geçmiş test başarısı yeni yaratıcı hedefi ölçmüyor. | Yapı, grid, motion, RFQ ve görsel shell testleri mevcut. | Bir sürü yeşil test, “yeni sahne gerçekten etkileyici mi?” sorusunu cevaplamıyor. | Eski regresyon testlerine ayrı sanat yönetimi ve canlı hareket kapısı ekle. |

**Kök neden:** Kapsamın korunması, kompozisyonun dondurulmasıyla karıştırılmış. Kullanılabilirlik şartları, yaratıcı kararların yerine geçmiş. “Küçük ve güvenli diff”, kullanıcının istediği “büyük ama kontrollü görsel değişim”in hedefi haline gelmiş.

Korunması gereken yapı ile değiştirilmesi gereken sunum farklıdır. 12 bölümün sırasını korumak, her bölümün görsel ölçeğini ve sahne düzenini korumak değildir. NEXUS'un beş düğmesini korumak, her adımda yalnızca iki metin satırı göstermeyi zorunlu kılmaz.

### Bu raporun kanıt sınırı

Altı referansın ana sayfaları ve aşağıda belirtilen ilgili iç sayfaları 11 Ekim 2026 tarihinde kamuya açık tarayıcı görünümü, kaydırma, seçili yerel kontroller ve rendered DOM üzerinden incelendi. Bu, gizli kaynak kodunun veya bütün sayfalarının eksiksiz reverse engineering'i değildir. Mobil gerçek cihaz benchmark'ı, her hover durumu ve özel backend davranışı doğrulanmadı.

Mas Technic için bu turdaki temel uygulama kanıtı mevcut kaynak ağacıdır. `https://mas-technic.vercel.app/` adresinin güncel sayfası web okuma aracıyla alınamadı; bu nedenle burada kaynağın o anki Vercel yayınıyla byte düzeyinde aynı olduğu ileri sürülmüyor. Uygulamanın P00 fazı eski Vercel yayını, mevcut kaynak ve yayınlanan ChatGPT sürümünü ayrı ayrı kaydetmek zorundadır.

## SEC-02 — Altı referans: görülen mekanik ve Mas Technic karşılığı

**Kanıt dili:** “Gözlendi” ekran/etkileşim; “DOM” kamuya açık rendered HTML; “çıkarım” adlandırma veya derleme işaretinden sınırlı yorum; “öneri” Mas Technic için yeni yaratıcı tasarım. Canvas sayıları yalnızca incelenen ana sayfanın o andaki DOM örneklemidir.

### R-FLEXIS — Flexis Mobility

**Gözlendi:** Tam alan araç videosu; ince çizgili navigation; büyük metinle ürün vaadi; ardından üç görsel sütun ve farklı ürün/hizmet bölümleri. Araç sayfasında parçalar ve mimari özellikler ayrı görsel konulara dönüşüyor. “Learn more” kontrolünün açılma durumu yerel olarak doğrulandı.

**DOM:** Ana sayfada 0 canvas, video var. WordPress/theme bundle izleri görüldü. Bu kanıt React Three Fiber, DRACO veya FBO kullanıldığını göstermiyor.

**Mas Technic'e aktarım — öneri:** Üretim bölümünü bir işlem listesi olmaktan çıkar. Aynı parçanın her operasyonunu görsel bir ürün bölümü gibi sun: bağlama, takım erişimi, işleme, kontrol. İç servis sayfasında ilgili yüzey ve takımın neden seçildiği görünür olsun. Flexis'in koyu paletini değil, büyük ürün odağını ve bölüm ritmini al.

**Yer:** 05 Süreç, servis/kabiliyet detayları. **Kaçınılacak:** Endüstriyel ürün yerine soyut “teknoloji evreni”; bütün sayfaya zorunlu uzun pin.

### R-CKI — CKI Group

**Gözlendi:** Mavi teknik grid üzerinde büyük marka tipografisi; küçük fabrika video penceresinin kaydırmayla tam sahneye açılması; üretim gücü ve teknolojinin ayrı bölümler halinde anlatılması. Teknoloji sayfasında belirgin bölüm başlığı, yerel bölüm menüsü ve uzun teknik içerik var.

**DOM:** 1 canvas; `gsap.min.js`, `ScrollTrigger.min.js`, `Splide.min.js` dosyaları ve fabrika videosu görüldü. Bu, canvas'ın tam shader/loader mimarisini kanıtlamaz.

**Mas Technic'e aktarım — öneri:** 05'te CNC görüntüsü dar teknik pencere olarak başlasın, mevcut bölümün içinde büyük üretim sahnesine açılsın. Dört üretim adımı altta sabit okunur kalsın. 09 Kalite'de küçük belge/detay penceresi kontrollü büyüsün. İç teknik sayfalara CKI benzeri yerel içerik indeksi ekle.

**Yer:** 05, 09, kabiliyet sayfaları. **Kaçınılacak:** CKI'nin görselini/markasını kopyalama; her bölümü video büyütme şablonuna çevirme.

### R-BOLDIUM — Boldium

**Gözlendi:** Büyük marka kelimesiyle giriş; daha sonra asimetrik proje alanları, kontrollü boşluk, geniş medya ve kısa açıklamalar. Autodesk Fusion 360 sayfası yazılım/üretim hikâyesini büyük teknik medya ve konuya bağlı içerik üzerinden kuruyor.

**DOM:** 0 canvas ve birden fazla video. `/_astro` ve `CurtainsDistort` adlı bir bundle görüldü. Astro derlemesi ve distorsiyon modülü olası çıkarımlardır; hover shader'ının hangi formülle çalıştığı doğrulanmadı.

**Mas Technic'e aktarım — öneri:** 06 kabiliyet profillerine eşit üç kart yerine güçlü bir ana parça ve iki farklı ölçekli eşlikçi koy. Tipografi teknik çizgiyi yutmasın; üç kısa vurgu sözcüğünde gerçek Gogade kullan. Detay sayfasında parçayı, kritik özellikleri ve kontrol yaklaşımını geniş görsel bölümle anlat.

**Yer:** 02, 06, 08, kabiliyet profili detayları. **Kaçınılacak:** Her başlığa harf efekti; açıklama yerine yalnızca dev slogan.

### R-TERMINAL — Terminal Industries

**Gözlendi:** Araç/lojistik çevresinin geniş sahnesi ve dijital ağ görselleştirmesi; ardından sakin, açık bilgi alanları. Operasyon anlatısı gerçek ürün yollarına bağlı. Yerel hesaplayıcıda günlük check-in girdisi 45'ten 90'a ve odak başka alana taşındığında tahmini sonuç 641.626'dan 713.788'e değişti; form gönderilmedi.

**DOM:** 1 canvas, birkaç video ve Nuxt bundle izleri. Bazı etkileyici sahnelerin video ile canvas'ı birleştirdiği görülüyor; bütün sahnenin canlı 3D olduğu söylenemez.

**Mas Technic'e aktarım — öneri:** NEXUS'u “iş ilerledikçe hangi belge oluşur?” sorusunu cevaplayan bir operasyon sahnesine dönüştür. Kullanıcı her adımı seçtiğinde parça/dosya/operasyon bağı değişsin. RFQ'da kendi parçanın kesiti ve boyut kutusu görünür olsun. Tahmini fiyat veya teslim sözü backend doğrulaması olmadan eklenmesin.

**Yer:** 11 NEXUS, 13 RFQ, `/teklif-al`. **Kaçınılacak:** Terminal'in tasarruf değerlerini veya görsel ağını Mas Technic verisi gibi aktarma.

### R-MWDT — Midwest Dynamic Technologies

**Gözlendi:** Büyük metal parçanın koyu panel sınırını aşarak açık zemine taşması; konuya bağlı imalat görselleri; kabiliyet, malzeme ve sektörün doğrudan birbirine bağlanması. CNC sayfasında büyük makine medyası ve iş zarfı/ekipman bilgisi öne çıkıyor.

**DOM:** 1 canvas; GSAP 3.12.5, ScrollTrigger, AOS, Headroom ve Bootstrap dosya adları görüldü. Hero parça rendered DOM'da bir görsel; canlı 3D olduğu doğrulanmadı.

**Mas Technic'e aktarım — öneri:** Hero manifoldunu küçük çerçevesinden çıkar; sayfanın ana nesnesi yap. Kâğıt/metal sınırından kontrollü taşır. Sektör başlığından ilgili üretim yöntemi ve RFQ bağlamına tek hareketle geçilsin. Gerçek makine zarfı verisi yoksa örnek kapasite yazma.

**Yer:** 02, 07, servis ve sektör detayları. **Kaçınılacak:** Rakibin sertifika, ekipman ve müşteri iddialarını alma; taşmayı mobilde yatay overflow'a çevirme.

### R-BBB — bb&b

**Gözlendi:** Açık zemin, güçlü siyah tipografi, gerçek endüstriyel görüntü ve kısa hareketli ifadeler. Ses için ayrı kullanıcı kontrolü var. Zonegreen sayfasında proje ihtiyacı, yaklaşım, uygulama, sonuç ve görsel uygulamalar birlikte sunuluyor; büyük görsel marka alanı korunuyor.

**DOM:** 0 canvas, video ve Next bundle izleri. Kamuya açık dosyalar tam animasyon kütüphanesini doğrulamadı.

**Mas Technic'e aktarım — öneri:** Hakkımızda ve kabiliyet profillerinde teknik karar → operasyon → kayıt hikâyesini gerçek görsellerle kur. Kalite ve blog sayfalarının atmosferini aç. Ses tasarımı sonradan seçilirse yalnızca açık kullanıcı tercihiyle çalışsın; temel deneyim sessiz olsun.

**Yer:** Hakkımızda, kalite, profil detayları, teknik günlük. **Kaçınılacak:** Kanıtı olmayan “sonuç” sayacı ve uydurma başarı hikâyesi.

### Referanslardan çıkan ortak tasarım ilkesi

Bu sitelerin gücü, kütüphane listesinin uzunluğundan gelmiyor. Büyük ve konuya özgü medya, net bölüm ritmi, güçlü ölçek farkı, birkaç belirgin sahne ve bu sahnelerin işletmeye bağlanması öne çıkıyor. Aynı GSAP'i kullanmak bu niteliği otomatik üretmez. Bütün teknikleri birleştirmek de daha özgün bir sonuç anlamına gelmez.

Kullanıcının DRACO, kamera, FBO ve shader anatomisi **Mas Technic için değerlendirilecek teknik seçeneklerdir**. Altı sitenin hepsinde bu mimarinin bulunduğuna ilişkin doğrulanmış kaynak sayılmaz. Özellikle “%70 sıkıştırma”, “4K dokular şart”, “60 FPS otomatik” ifadeleri sabit gerçek değil, varlık ve cihaz üzerinden ölçülecek hedeflerdir.

## SEC-03 — Tek yaratıcı yön: “Bir parçanın dijital pasaportu”

### İlk 20 saniyenin sahnesi

Ziyaretçi sayfayı açtığında beyaz mühendislik kâğıdı üzerinde turkuaz marka ve büyük metal manifold görür. Teknik ray ve grid hemen okunur. Başlık küçük bir kutuya sıkışmaz; parça, tipografi ve ölçü çizgileri aynı kompozisyonun elemanlarıdır. “HAM GEOMETRİDEN / DOĞRULANMIŞ HASSASİYETE” mevcut ana cümlesi korunabilir; teklifin CNC üretimi olduğu destek satırında açıkça anlaşılır.

İlk sahnede parçanın ham hacmi, işlenecek bölgeler ve bitmiş yüzey arasında kontrollü bir geçiş vardır. Kullanıcı bir ölçüyü seçince kamera o özelliği gösterecek kadar döner, bir kesit açılır, ölçü bağı belirginleşir. Fareyi rastgele hareket ettirmek parçayı sürekli döndürmez. Mühendis nesneyi inceleyebilir; başlık ve teklif düğmesi sabit kalır.

05'te aynı parçanın üretim bağlamını görür. 08'de artık nesneye değil, doğrulama hareketine odaklanır. 11'de aynı görsel kimlik bir iş/evrak bağlantısına dönüşür. 13'te “şimdi kendi parçanı yükle” daveti bu hikâyenin doğal devamıdır.

### Üç görsel zirve ve sakin alanlar

| Bölge | Yoğunluk | Duygusal/işlevsel hedef |
|---|---|---|
| 02 Hero | Zirve 1 | Metal, kesit ve ölçüden oluşan sahiplenilmiş ürün sahnesi. |
| 03–04 | Sakin | Kanıtlar ve kabiliyetler; ziyaretçinin nefes aldığı ritim. |
| 05–07 | Orta | Gerçek üretim, parça aileleri ve sektör bağlantısı. |
| 08 Manifesto | Zirve 2 | Ölçümün bir iddia değil kayıt üreten işlem olduğunu görselleştirme. |
| 09–10 | Sakin | Gerçek dosyalar ve onaylı referanslar. |
| 11 NEXUS | Zirve 3 | Kullanıcı seçimlerine bağlı operasyon/doküman sahnesi. |
| 12–13 | Sakin/işlevsel | Soruları giderme ve kendi dosyasına geçiş. |

### Palet ve tipografi kararı

| Rol | Önerilen başlangıç rengi | Kullanım |
|---|---|---|
| Ana kâğıt | `#F4F5F1` | Ana sayfanın ve iç sayfaların geniş açık alanları. |
| Temiz beyaz | `#FFFFFF` | Belge, RFQ ve okunurluk alanları. |
| Çelik yüzey | `#E0E6E7` | Teknik sahne altlığı ve ince alan ayrımı. |
| Ana mürekkep | `#17242A` | Başlık ve body. |
| Marka turkuazı | `#078AA7` | Gönderilen logodan türetilmiş başlangıç tonu; resmi marka dosyasıyla son değer netleşir. |
| Koyu turkuaz | `#006A80` | Açık zemindeki küçük metin ve aktif kontrol. |
| Grafit | `#1D272D` | 08 ve NEXUS'un belirli görüntü alanları; bütün sayfa tabanı değil. |
| Kobalt | `#0061F4` | Kullanıcının renk referansından; ancak tek kontrollü dijital vurgu alanında, turkuazla yarışmadan. |
| Çizgi | `#BEC8CA` | Grid ve teknik çerçeveler. |

Bunlar ölçülmüş mevcut kontrast sonuçları değil, başlangıç tasarım token'larıdır. Nihai kombinasyonlar normal metinde 4.5:1; büyük metin, önemli kontrol sınırı ve grafik işaretinde ilgili 3:1 hedeflerine karşı test edilir. Başarı/hata yalnız renk farkına bağlanmaz.

Ana sayfanın kompozisyon olarak yaklaşık üçte ikisi açık/çelik alanlardan oluşsun. Bu bir piksel kotası değildir: hero, süreç, profil, kalite ve RFQ ilk bakışta aydınlık olmalıdır. Grafit sahneler metal ve ölçüm için bilinçli duraklardır. Beyaz yazıyı her yere serpmek “premium endüstri” sayılmaz.

**Gogade:** Gönderilen referansın birincil satıcı sayfası fontu `qrdesignstd` ile ilişkilendiriyor. Elde lisanslı font dosyası yok. Display başlıklar için Gogade denenmeli; gerçek dosya, web gömme koşulu ve Türkçe glifler doğrulanmadan “kullanıldı” denemez. `ĞğİıŞşÇçÖöÜü`, sayılar ve `± µ Ø` kontrol edilir. Eksik teknik işaretler açık bir ikinci font rolüyle çözülür; harfler sessizce başka fonta düşemez. Çince/Rusça için destekleyen ayrı body/display fallback rolü açıkça tanımlanır.

**İkincil fontlar:** Uzun metin için mevcut IBM Plex Sans; ölçü, revizyon ve veri için IBM Plex Mono. Newsreader yalnızca bilinçli birkaç editoryal yerde kalabilir; bütün iç sayfa başlıklarının otomatik ikinci sesi olmasın. Body 16 px başlangıcı, açıklama 14 px, küçük teknik etiketler mümkünse 12 px altına düşmemeli. Gogade tüm paragraf ve tabloya yayılmamalı.

**Logo:** Kaynağı kullanıcı rasterıdır; yazıyla yeniden çizilmiş “MAS” bir ikame değildir. Açık header'da geniş ve okunur resmi logo; koyu yüzeyde yetkili ters varyant. İlk uygulamada özgün raster kullanılabilir, kalıcı sürümde resmi SVG tercih edilir. Logo şekli ve kelime aralığı font kullanılarak uydurulamaz.

### Gönderilen on görselin somut karşılığı

Bu görseller birer uygulama screenshot'ı değil, kullanıcının tasarım girdisidir. Kaynak dosyalar önce bulunur; varlığın bulunmadığı bir oturumda yeniden okunmuş gibi davranılmaz. Bu rapordaki değerlendirme, konuşmada görünen görseller ile bulunan logo/font kaynaklarına dayanır.

| Girdi | Öğrenilecek fikir | Mas Technic'teki karşılık / sınır |
|---|---|---|
| 01 — 12 bölümlü teknik wireframe | Ray, çizim hiyerarşisi, yoğun bilgi, NEXUS ve parça/ölçü ilişkisi. | DL-01/02; kompozisyon değişebilir ama bilgi omurgası silinmez. Eski resimdeki doğrulanmamış ±0.005 ve sahte sonuçlar geri alınmaz. |
| 02 — MAS TECHNIC logo | Turkuaz marka ve özgün wordmark geometrisi. | Gerçek header/footer logosu, aynı markaya bağlı renk sistemi. |
| 03 — oddworks büyük/dönük menü | Tek tipografinin çok güçlü mekânsal etkisi. | Desktop menüde büyük dikey/yan başlık vurgusu prototipi; link okunurluğu, mobile ve keyboard öncelikli. Bütün menüyü okunması zor döndürme yok. |
| 04 — Korea Travel Zine, nesne/type örtüşmesi | Büyük tipografi önündeki tek net fiziksel nesne; güçlü zemin rengi. | Hero manifoldunun büyük yazı ve teknik grid üzerinde planlı derinlik kurması. Kelimenin temel kısmı ve CTA kapanmaz. |
| 05 — Readymag katmanlı afiş | Ölçek, katman, asimetri ve kontrollü tipografik hareket. | 06 profil ve 09 dosya masasında farklı ölçekli düzlemler; mor/pembe palet veya eğik okunmaz belgeler aktarılmaz. |
| 06 — Superangel/Mastermind afiş | Çok güçlü tipografik ses ve alana taşan geometrik biçimler. | İmza başlıklarda cesur ölçek; soyut festival ikonları yerine gerçek parça/çizim geometrisi. Bu serif, Gogade'nin yerine sessiz ikame değildir. |
| 07 — Mental Health Film Festival | İnce kesinti/offset ile kişilikli başlık, açık mavi alan. | Manifestoda yalnız ana kelimede küçük datum hizası/offset denemesi; body ve teknik sayı glitch'e uğramaz. |
| 08 — Kobalt renk referansı | Doygun maviyle yüksek enerji ve belirgin vurgu. | Tek dijital vurgu alanında #0061F4; turkuaz logoyla rekabet eden dört ayrı mavi katman değil. |
| 09 — Renk/kontrast notu | Açık yüzeyler ve okunur mürekkep için token disiplini. | Ölçülmüş kontrast matrisi; fotoğraftaki hex değerleri tek tek kesin okunmuş marka standardı kabul edilmez. |
| 10 — Gogade font referansı | İddialı, nesne odaklı sans display karakteri. | Gerçek Gogade display rolü; lisans/dosya/glif kapısı. Screenshot'taki font adı kullanım kanıtı değildir. |

Kinetik menü, tipografi offset'i ve displacement ilk storyboard'da karşılaştırılacak seçeneklerdir. Üç ana sahneye hizmet etmeyen veya okuma kalitesini düşüren seçenek tutulmaz. Bu eleme, bütün yaratıcı riski baştan ortadan kaldıran bir politika değil, görünür prototip üzerinden verilen sanat yönetimi kararıdır.

### “AI slop” görünümünü kıran kararlar

1. Tek bir parçanın gerçek görsel karakteri; rastgele metal küre/küp ve mor ışık yok.
2. Düzenin her bandında aynı kart, aynı merkez başlık ve aynı reveal yok.
3. Eşit büyüklükte üçlü kartlar yerine Boldium'dan öğrenilen ölçek ve asimetri, teknik grid üzerinde kurulacak.
4. Başlıklar sektör jargonuyla dolu boş iddialar değil; parça, yöntem ve karar anlatacak.
5. Kinetik metin iki ya da üç alanda belirgin; diğer içerik rahat okunacak.
6. Teknik çizgiler dekoratif HUD değil: yüzey, datum, ölçü veya iş adımıyla bağlantılı olacak.
7. Motion bitince kompozisyon hâlâ güçlü olacak. Güzel son kare olmadan shader başarı sayılmaz.

## SEC-04 — Mevcut 12 bölümün ayrı ayrı dönüşümü

Buradaki zaman/progress değerleri önerilen koreografidir. Uygulama öncesinde storyboard ve gerçek medya üzerinde ayarlanır. `p`, ilgili sahnenin 0–1 normalize edilmiş ilerlemesidir; tüm sayfanın scroll yüzdesi değildir.

### BAND-02 — Hero / TechnicalHero

**Mevcut:** Fotoğraf + çizim anotasyonları + örnek parça pasaportu. **Yeni:** Metal manifold sayfa eninin yaklaşık yarısını veya daha fazlasını kaplayan ana nesne olur; ölçü paneli sağda teknik tanıklık alanı kalır. Nesne kendi kutusunun sınırını aşar, CTA ve metne fiziksel olarak girmez. Açık kâğıt, çelik, turkuaz ve nesnenin gölgesi ana atmosferi kurar.

**Koreografi:** `p=0` ham hacim ve ince outline; `0.20` işlenecek delik/yüzeylerin teknik katmanı; `0.45` bitmiş metalin kontrollü tarama ile ortaya çıkması; `0.70` 20–35° kamera yayı; `1.00` stabil inspection pozu. Bu, doğrulanmamış proses simülasyonuysa “geometri gösterimi” olarak ifade edilir. İlk poster anında görünür; giriş yüklemesi CTA'yı bekletmez.

**Etkileşim:** Mevcut dört ölçü düğmesi korunur. Seçim 3D feature kimliğine ve DOM açıklamasına aynı anda bağlanır. Delik için kesit; datum için yüzey vurgusu; finish için yakın detay. Ölçü/ray sonucu canvas tooltip'ine hapsedilmez. Native düğmeler klavye ile aynı sonucu verir. Otomatik tur bir kez ve kısa; kullanıcı seçince durur.

**Mobil/reduced:** Statik güçlü render ve büyük dokunulabilir ölçü listesi; isteğe bağlı “3B incele” açılımı. Reduced-motion son inspection pozunu gösterir. Parça tüm ekranı kapatıp teklif yolunu aşağı itmez.

**Varlık:** Aynı parça için ham/final geometri, feature adları, gölge/poster, kesit yüzeyleri ve metal referansı. **Kod yüzeyi:** `TechnicalHero.tsx`, `hero-image.ts`, yeni lazy sahne modülü ve sınırlı hero stilleri. **Kabul:** Beş progress karesi birbirinden anlamlı biçimde farklı; dört seçimin görünür sonucu var; hata/reduced yollarında CTA ve metin görünür; 320 px'de overflow yok. **Faz:** P05.

### BAND-03 — Kanıt şeridi / ProofStrip

**Yeni:** Altı hücre korunur. İlk bakışta daha açık zemin, daha büyük ana değer ve daha rahat etiket aralığı. Bir hücreye geldiğinde ölçüm halkası veya küçük çizim çizgisi tamamlanır; değerler sabit kalır. “±0.010” sayacı 0'dan hareket ederek anlamsız ara sonuçlar üretmez.

**Etkileşim:** Yalnızca gerçekten ilgili sayfa veya açıklamaya giden kanıt tıklanabilir. Kaynak veriye bağlanmayan dekoratif download butonu yok. Mobilde okunabilir 2 sütun/3 satır veya gerçek ölçüye uygun düzen.

**Kabul:** Altı onaylı içerik kaybolmaz; rakamlar uydurulmaz; giriş olmadan değerler okunur; kontrast ve klavye hedefleri yeterli. **Referans:** MWDT'nin konuya bağlı netliği. **Faz:** P06.

### BAND-04 — Kabiliyet hattı / MarqueeBand

**Yeni:** İki teknik bant yerine kontrollü bir büyük kabiliyet satırı ve ince koordinat altlığı. Tipografi gerçekten Gogade/display rolünü gösterecek ölçekte. Yalnız bu satırda scroll hızına bağlı, en fazla yaklaşık ±2° eğim denenebilir; durduğunda geri oturur. Sürekli koşan ticker okuyucuyu yormaz.

**Etkileşim:** İçerik link olacaksa her öğe ayrı native link ve odak sırasında hareket durur; dekoratif tekrarlar `aria-hidden` olur. Hızlı kaydırmada kelime okunamayacak kadar bükülmez. Mobil/reduced statik kabiliyet listesi.

**Kabul:** Hızlı ve ters scroll videosu; eğim sınırı; duplicate screen-reader okuması yok; sekmeye dönünce RAF birikmiyor. **Referans:** CKI büyük tipografi + Boldium ölçek. **Faz:** P07.

### BAND-05 — Süreç / TechnicalProcess

**Yeni:** Dört adım aynen korunur. CNC fotoğrafı/video alanı küçük bir çizim penceresiyle başlar ve bölümün içinde genişler; seçilen adım ilgili operasyon görüntüsü, geometri katmanı ve kontrol açıklamasını eşler. Mevcut kontrol yaklaşımı modülü kaldırılmaz.

**Koreografi:** Dış maske büyürken iç medya zıt yönde en fazla 24–48 px hareket eder ve `scale 1.10 → 1.00` yapar. Üretim adımında takım yolu kısa bir çizgiyle belirir. Kalite aşamasında bu çizgi ölçü kaydına bağlanır. Gerçek CNC video olmadığı durumda mevcut fotoğraf üzerinde sadece doğrulanabilir katmanlar çalışır; fotoğrafı “canlı üretim simülasyonu” diye sunma.

**Etkileşim:** Dört native step seçimi; scroll otomatik odağı çalmaz. Desktop pin kullanılacaksa kısa, kesintisiz çıkışı olan tek bir sahne; mobil step listesi doğal scroll. Kullanıcının seçimi scroll ile hemen geri değiştirilmez.

**Kabul:** 4/4 adım ve belge ilişkisi; hızlı wheel/geri scroll; alt bölüm/CTA'ya ulaşma; üretim medyası yüklenmezse fotoğraf + süreç metni. **Referans:** CKI pencere açılımı, Flexis ürün bölümleri. **Faz:** P08.

### BAND-06 — Kabiliyet profilleri / MeasuredProjects

**Yeni:** Mevcut bir büyük + iki küçük profil yapısı daha iddialı hale gelir. Ana parça kesilmiş, geniş metal render; yanında kritik özelliği ve kontrol planını gösteren teknik editoryal alan. Diğer ikisi farklı kadraj ve ölçekle tamamlar. Arka plan beyaz/çelik; tablo kâğıt gibi okunur.

**Koreografi:** Asimetrik maske ve iç counter-translate; ana render sakin parallax. Hover/focus yalnızca ilgili özelliğin çizimini veya ikinci gerçek render'ını açar. Hafif displacement tek medya alanında prototiplenebilir; teknik yazılar bozulmaz.

**İçerik:** Bugünkü profiller örnek kabiliyet anlatımıdır. Gerçek proje/ölçüm sonuçları sağlanmadıkça nominal–ölçülen–uygun tabloları geri getirilmez. Gerçek müşteri izni geldiğinde mevcut şema gerçek örnek olaylara evrilebilir.

**Kabul:** Üç profil ve bağlantıları korunur; klavye hover'a eşdeğer içerik; örnek statüsü görünür; sahte rapor numarası yok; medya genişlemesi tabloyu kapatmaz. **Referans:** Boldium proje ölçekleri, MWDT nesne ölçeği. **Faz:** P09.

### BAND-07 — Sektörler / TechnicalSectors

**Yeni:** Küçük thumbnail dizisi yerine, solda sektör adı ve gereksinimi; sağda seçilen parça/yüzeyden oluşan daha büyük sahne. Alt kısım mevcut sektörlerin okunur seçim hattı olur. Bütün sektörler veri kaynağından gelir; dört sektörle sınırlandırılmaz.

**Koreografi:** Kullanıcı seçiminde eski/yeni görselin teknik yüzey boyunca wipe geçişi; kısa katman parallax'ı. Aynı manifoldun sektörler arasında malzeme değiştiriyormuş gibi davranması gerçek anlam taşımıyorsa her sektörün uygun gerçek görseli kullanılır.

**Etkileşim:** Sector seçimi, ilgili detay sayfası ve teklif bağlamı. Dokunma, klavye ve geri/ileri butonları. Otomatik horizontal scroll takeover yok. Mobilde native scroll-snap veya liste.

**Kabul:** Bütün veri öğeleri erişilebilir; seçilen başlık ve görsel eşleşir; locale linki korunur; RFQ bağlamı onaylı alanlarla taşınır; seçim her frame'de yeni shader/canvas yaratmaz. **Faz:** P10.

### BAND-08 — Ölçüm manifestosu / MeasurementManifesto

**Yeni:** “Hassasiyet iddia edilmez. Ölçülür.” ana mesajının gerçek görsel karşılığı. Bir CMM probu veya ölçüm ucu parçadaki özelliğe yaklaşır. Temas noktasından ölçü çizgisi çıkar; kontrollü bir kayıt alanına bağlanır. Grafit bu bölümde anlamlıdır; güçlü siyah/beyaz metal ve tek turkuaz işaret yeterli.

**Koreografi:** `p=0` geniş ölçüm kadrajı; `0.25` probun yaklaşması; `0.50` özelliğin vurgulanması; `0.75` çizim çizgisi ve kayıt alanı; `1.00` sakin final. Metindeki iki veya üç kelime maske içinden çıkar; bütün paragraf bölünmez. Parça/metin kesişimi planlı bir occlusion olabilir fakat kelime görünürlüğü ve CTA korunur.

**İçerik:** Şirketin akredite üçüncü taraf CMM hizmeti koşulları doğru kalır; sahne “bizim fabrikamızdaki CMM” gibi yeni iddia üretmez. Gerçek ölçüm dosyası yoksa sayı sonuç alanı oluşturulmaz; “ölçü kaydı” ilişkisinin şematik gösterimi olur.

**Kabul:** Yaklaşma–özellik–kayıt üçlüsü gerçek hareket kaydında görülür; poster fallback aynı fikri anlatır; metin okunur; sahne gerçek ölçülmüş sonuç izlenimi yaratmaz. **Referans:** Terminal fiziksel/dijital bağ + CKI teknik anlatı. **Faz:** P11.

### BAND-09 — Kalite dosyası / QualityFile

**Yeni:** Belge kartları bir mühendislik dosyası masası gibi düzenlenir. Önizleme gerçek mevcut PDF sayfasından üretilir. Kullanıcı bir belgeyi seçtiğinde gerçek kapağı, ne için kullanıldığı ve dosya bilgisi görünür. İnce perspektif veya sayfa açılımı var; okunacak belgeyi eğik yüzeye hapseden 3D carousel yok.

**Koreografi:** Tek seçili dosya küçük pencere → açık kâğıt görünümüne büyür. Gerçek QR/doğrulama işlevi yoksa dekoratif doğrulama QR'ı eklenmez. Yeni sertifika veya kapsam yazılmaz.

**Kabul:** Dört gerçek PDF yolu ve ölçülmüş boyut; doğru sertifika kapsamı; native PDF açılımı; animasyon başarısız olsa download çalışır. **Referans:** CKI pencere, bb&b açık editoryal yaklaşım. **Faz:** P12.

### BAND-10 — Referanslar / ReferenceBand

**Yeni:** Onaylı markalar geniş, sakin ve güçlü bir şerit. Teknik grid görünür ama logo ağırlıklarını boğmaz. Sürekli kayan marka duvarı yerine yavaş reveal veya statik rail. Referans isimleri şirket dışı kaynakla yeniden icat edilmez.

**Etkileşim:** Gerçek onaylı örnek olay yoksa sahte müşteri projesi açılmaz. Varsa tek kısa müşteri/üretim bağlamı ve ilgili gerçek kayıt gösterilir. Logolar kullanılan hakkın kapsamına göre yüklenir.

**Kabul:** İzinli referans listesiyle birebir eşleşme; mobilde okunurluk; sahte case study yok. Bu bölüm güçlü sahneler arasında bilinçli bir dinlenme alanıdır. **Faz:** P13.

### BAND-11 — NEXUS / NexusEvidence

**Yeni:** Mevcut uygulama çerçevesi, ray ve beş adım korunur. Sol/üst seçim hattı; merkezde parça–operasyon ilişkisi; sağda o adımın belgesi. Adım değiştirilince belge satırları ve durum bağlantısı kontrollü olarak oluşur. Amaç sahte canlı dashboard değil, üretim takibinin anlaşılır demosudur.

**Beş görünür sonuç:** Teklif: geometri + teknik inceleme dosyası. Onay: revizyonun sabitlenmesi. Üretim: operasyon sırasına bağlantı. Ölçüm: kontrol planı + ölçü kaydı ilişkisi. Sevkiyat: teslim dosyasının parçaya bağlanması. Kimlikler demo içeriği olduğunda açıkça demo olarak kalır; gerçek sipariş numarası, performans oranı ve müşteri bilgisi görünmez.

**Koreografi:** Seçimde yalnız sahne için hafif kamera/kesit; DOM kayıt alanı 160–320 ms geçiş. Hızlı ardışık tıklamada önceki tween iptal edilir, son seçim kesin durum olur. Kullanıcı sekmeleri scroll ile zorla değişmez. Bütün temel bilgi DOM'da kalır.

**Mobil:** Adımlar üstte kaydırılabilir veya satırlı; belge ve parça üst üste. “Teklif isteyin” ve “NEXUS'a giriş” gerçek yollara gider. WebGL açılamazsa SVG/DOM belge şeması aynı iş akışını anlatır.

**Kabul:** 5/5 adım için ayrı görsel/semantik durum; klavye seçim; demo ibaresi her durumda; gerçek backend'e sahte okuma/yazma yok; mevcut giriş ve RFQ yolları korunur. **Referans:** Terminal operasyon sahnesi ve işlevsel araç yaklaşımı. **Faz:** P14.

### BAND-12 — SSS ve kaynaklar / FaqSection

**Yeni:** Açık kâğıtta iki okunur sütun; soru-cevap solda, gerçek kaynaklar sağda. Başlık ve satır düzeni daha güçlü; açılış hareketi yalnızca içerik yüksekliği ve artı işaretinde. Efekt yoğunluğu düşürülür; son CTA öncesi zihinsel yük azalır.

**Etkileşim:** İlgili cevap içindeki teklif, malzeme, kalite ve dosya formatı bağlantıları gerçek detaylara gider. Accordion keyboard ve screen-reader davranışı korunur. Kaynak dosya etiketi gerçek boyuttan türetilir.

**Kabul:** Bütün mevcut sorular/kaynaklar; açılan cevaba stabil scroll; gizli cevaptaki link odak hatası yok; metin tam erişilebilir. **Faz:** P15.

### BAND-13 — RFQ dönüşümü / RfqSection

**Yeni:** Hero'da görülen parçanın ince teknik outline'ı, dosya yuvasının içine oturur; yanında “Yükle → Analiz → Teklif → Üretim” dört adımı kalır. Beyaz alan, açık teklif CTA'sı, dosya formatları ve beklenen süreç aynı bakışta anlaşılır. Son alan dev bir soyut sloganla uzamaz.

**Etkileşim:** Ana sayfa drop alanı gerçekten dosya devredecekse aynı oturumda doğrulanmış dosya handoff yapılmalı; sadece `/teklif-al` bağlantısıysa upload yapıyormuş gibi davranmamalı. Boyut/format sınırları mevcut upload sözleşmesinden gelir. Ana sayfada dosyayı gizlice yükleme veya otomatik quote yok.

**Kabul:** 4/4 adım; açık CTA; dosya handoff uygulanırsa değişiklik/kayıp/iptal testleri; yapılmazsa dürüst bağlantı davranışı. **Referans:** MWDT net teklif yolu, Terminal işlevsel araçlar. **Faz:** P16.

## SEC-05 — Header, footer ve bütün iç sayfa aileleri

### SHELL — Header, menü, footer ve route geçişi

Header açık, ince teknik sınırlarla düzenlenir; gerçek turkuaz logo, anlaşılır navigation, dil ve “Teklif al” tek bakışta görünür. Mobil menü güçlü büyük tipografi ile çalışabilir; menü açılışında teknik kâğıt/panel hareketi 250–450 ms olur. Menü kapandığında önceki odak geri döner. Bütün viewport'u kapatan yükleme perdesi ve yazıyı 1–2 saniye gizleyen route wipe kullanılmaz.

Footer bir üretim çiziminin imza alanı olarak kalır. Şirket ve gerçek iletişim bilgileri okunur; “revizyon/build” gibi geliştirme metadata'sı müşteri yolculuğuna sokulmaz. Route transition kapısı, sonraki sayfanın ölçülebilir içeriğini geç gösteren bir efektten daha önemli değildir.

### İç sayfa tasarım ailesi matrisi

| Aile / kaynak | Yeni görsel yapı | Özgün hareket/işlev | Zorunlu kanıt |
|---|---|---|---|
| `/hizmetler/:slug` — `ServiceDetail.tsx` | Geniş gerçek operasyon görüntüsü; yanında işlem ve uygulama sorusu; altında yerel indeks. | Seçili operasyon yüzeyi/takım erişimi, kısa cross-section veya gerçek medya açılımı. | CNC frezeleme ve tornalama aynı hero'nun resim değiştirmiş hali olmamalı; her slug doğru içerik. |
| `/kabiliyetler/:slug` — aynı detay altyapısı | Teknik şema ve karşılaştırma; ölçü/finish/fixture farklı içerik modülleri. | Tolerans ilişkisi, yüzey detayı veya süreç şeması; örnek sonuçlar açık. | Her kabiliyetin gerçekte neyi açıkladığı görünür; yanlış ölçüm iddiası yok. |
| `/endustriyel/:slug` | Sektöre ait uygun parça + gereksinim + yöntem bağlantısı. | Gereksinimden üretim yöntemi ve RFQ bağlamına seçim. | Bütün sektör slugs; ilaç/havacılık vb. uyumluluk iddiası doğrulanmış kaynakla sınırlı. |
| `CategoryPage.tsx` | Teknik atlas: büyük kategori başlığı, eşit kartlardan kaçınan gruplu indeks. | Native filtre; seçili parçanın yerel önizlemesi. | Aynı ailesindeki tüm kayıtlar; link hedefleri ve locale. |
| `/malzemeler`, `MalzemeKategori.tsx` | Malzeme atlası; metal mikro doku, kullanım, proses ve yüzey ilişkisi. | Yalnız onaylı veriden karşılaştırma; materyal önizlemesi. | Uydurma fiziksel değer/işlenebilirlik skoru yok; küçük ekran tablosu okunur. |
| `/kabiliyet-profilleri` ve detay | Boldium ölçek farkı; detayda kritik geometri → kontrol planı → kayıt. | Özellik seçimi görsel ve açıklamayı eşler. | Örnek profil gerçek müşteri projesi gibi sunulmaz. |
| `/hakkimizda` | Gerçek ekip/tezgâh/fabrika görüntüsünden oluşan editoryal diptych. | Bir büyük medya açılımı ve kısa doküman çizgisi; marka ölçeği. | Ödül, kuruluş yılı, ekipman ve çalışan sayısı icat edilmez. |
| `/kalite-dosyasi` | Bir inceleme masası: gerçek PDF önizlemeleri, kapsam ve akış. | Belge seçimi ve kontrollü önizleme büyümesi. | PDF erişimi, gerçek dosya boyutu, sertifika kapsamı. |
| `/blog` ve `BlogDetail.tsx` | Teknik günlük; geniş konu medyası ve rahat uzun okuma. | Bölüm indeksi, ilgili içerik, küçük şema; hero her yazıda farklı konu. | Başlık/içerik/SEO doğru; her paragrafı reveal ederek saklama yok. |
| `/sss` | Konu grupları, aranabilir gerçek sorular. | Native arama/filtre ve doğru boş sonuç durumu. | Arama uygulanırsa sonucun metinle eşleşmesi; kaynak linkleri. |
| `/iletisim` | Açık bir teknik briefing alanı; iletişim ve RFQ yolları. | Formun focus/error/success durumları; küçük marka hareketi. | Gerçek iletişim bilgisi; mobil form; gönderim yanıltıcı değil. |
| Gizlilik/KVKK/çerez | Sade, sakin belge düzeni. | Yalnız okuma indeksi; ağır medya yok. | Metin ve linkler korunur; no-WebGL güzergâhı. |
| `/teklif-al` | İş odaklı dosya–parça–teklif workspace'i. | Mevcut CAD göstericiye kesit, wireframe ve bağlam; gerçek form akışı. | Aşağıdaki RFQ test sözleşmesi. |
| Giriş/şifre/panel/404 | Marka tutarlılığı, hatasız navigation. | Auth/panel işleyişi değiştirilmez; 404'te gerçek çıkışlar. | Korunan route ve izinler; gizli içeriğin genel erişime açılmaması. |

“100 sayfa yaptım” kalite kanıtı değildir. Route manifest'inden bütün sayfalar çıkarılır; **her sayfa işlev ve içerik açısından**, her şablon ailesi ayrıca görsel özgünlük açısından incelenir. Locale varyantları, redirect'ler ve auth yolları ayrı sınıflandırılır. 100 URL, 100 farklı özgün kompozisyon anlamına gelmez.

### RFQ workspace'inin özellikle geliştirilmesi

Mevcut CAD preview sistemi korunacak temel avantajdır. Başlangıçta form ve dosya listesi hızlı açılır; 3D modül yalnız kullanıcı istediğinde yüklenir. CAD işlemesi ana sayfanın başlangıç bundle'ına girmez. Desteklenen viewer biçimleri ile teklif için kabul edilen upload biçimleri aynı listeymiş gibi gösterilmez.

Parça görüntüsü; birim, bounding box, görünüm fit'i, kesit düzlemi, wireframe ve seçilen özelliğin açıklamasını net gösterir. Modelin üç boyutunu göstermek, GD&T/DFM doğrulaması yapmak değildir. Otomatik kalınlık, pah, risk analizi veya fiyat hesaplama ancak gerçek geometri algoritması ve doğrulanmış backend çıktısı varsa eklenir.

Form adımları görsel sahneyle senkronize olabilir fakat sahne adımları tamamlamanın ön koşulu olmaz. Kullanıcı yüklediği dosyayı değiştirdiğinde eski geometri ve eski analiz temizlenir. Ağ ve decoder hatasında retry/iptal ve metin tabanlı teklif yolu açık kalır. Teknik resim ile 3D dosyanın rolü ayrı anlatılır.

**Özgün işlev fikri:** Model özelliğinin seçimi, teklif alanındaki ilgili teknik notu işaretlesin. Örneğin kesit görünümünden sonra kullanıcı “kritik iç kanal” notunu ekleyebilsin. Bu elle seçilen bir mühendislik brief'idir; otomatik üretilebilirlik sonucu gibi pazarlanmaz. Backend şeması değişikliği gerekiyorsa ayrı High risk iş birimi açılır; bu görsel dönüşüm sırasında sessizce yapılmaz.

## SEC-06 — Kullanıcının animasyon anatomisi: seçilecek motorlar

| Teknik | Karar | Mas Technic'te gerekçe ve yer | Kabul / neden sınırlı |
|---|---|---|---|
| DRACO varlık hattı | Seçildi, geometriye bağlı | Hero GLB ve uygun model varlıkları. | Önce/sonra byte ve decode süresi; sabit %70 sözü yok. DRACO doku sıkıştırmaz. |
| Progressive loading | Seçildi | İlk kaliteli poster; sonra aynı geometri; son kalite katmanı. | Aynı kamera/ölçek, görünür geometri sıçraması/CLS yok. Yanlış wireframe yer tutucu yok. |
| Adaptive performance | Seçildi | 3D hero, manifesto, isteğe bağlı RFQ. | Ölçülen frame maliyetiyle DPR/efekt azaltımı; tab gizliyken yanlış FPS kararı yok. |
| Lenis/smooth scroll | Mevcut altyapıyla seçildi | Desktop anlatı alanları. | Tek ticker; native mobil; lag değerleri ölçülür. `scrub: 1.5` körlemesine uygulanmaz. |
| Persistent canvas | Ana sayfa sahneleri arasında koşullu | Ana sayfa tek canvas/scissor yaklaşımı prototiplenebilir. | Her route'ta canvas zorunlu değil; route değişiminde sakin içerik bekletilmez. Ölçüm maliyeti kazanımı varsa tutulur. |
| Spline kamera | Seçildi | Hero inspection ve manifesto yakın planı. | CatmullRom yayı, sınırlı açı, çarpışmasız kadraj; metne bindirme yok. |
| FBO/GPGPU parçacıkları | Araştırma seçeneği, çekirdek kapı değil | Yalnız gerçek talaş/işleme görüntüsüne anlamlı katkı sağlarsa. | Önce düşük maliyetli instancing ile hipotez test edilir. InstancedMesh tek başına GPU fizik değildir. |
| Raycasting | Seçildi | Hero'nun isimli yüzeyleri; CAD özelliği. | Feature ID doğruluğu; native DOM seçim eşdeğeri; hover'a bağımlı bilgi yok. |
| Asimetrik UV wipe | Seçildi, tek/az medya | Profil ve sektör seçimi; metal tarama. | Sınır etkisi küçük; başlık/ölçü alanı shader'da değil. Fallback mask/crossfade. |
| Bloom/chromatic/grain | Çok sınırlı, isteğe bağlı | Metal kenarda küçük ışık, tek metrologi sahnesi. | Güçlü bloom ile yüzey patlatmak yasak; low tier'da kapanır. Aydınlık tasarımda çoğu sahne için gerekmez. |
| Holografik tarama shader'ı | Seçildi, yeniden yorumlanmış | İşlenmiş geometri/özellik görünürleştirme. | Yeşil uzay hologramı yerine turkuaz teknik ölçüm çizgisi; gerçek üretim/ölçüm sonucu iddiası yok. |
| Displacement | Sınırlı prototip | Tek ana profil medyasında kontrollü distortion. | Metal/ölçü okunurluğunu düşürürse kaldırılır; bütün görsellere sıvı/glitch yok. |
| Counter-translate parallax | Seçildi | 05 süreç, 06 profil, iç sayfa medya. | 24–48 px gibi küçük kadraj hareketi; maskede siyah boş kenar yok. |
| Velocity typography | Seçildi, 04'te deneme | Kabiliyet hattı. | ±2° civarı clamp, reduced statik; hızlı scroll'da okunur. |
| SplitText maskeleri | Seçildi | Hero ve manifesto; en fazla birkaç büyük vurgu. | Font yükleme/resize doğru; aria davranışı; paragraflar ve buton içeriği körlemesine bölünmez. |
| HTML–WebGL eşlemesi | Seçildi | Hero anotasyonu ve manifesto çizgisi. | DOMRect → sahne koordinatı; resize/dil/font değişiminde güncellenir; metin seçilebilir. |
| Magnetic cursor | Yerel, desktop only | En fazla ana CTA ve parça inceleme kontrolünde. | Native pointer görünürlüğü korunur; gerçek hitbox hareket etmez; touch/reduced devre dışı. |
| Velocity-linked audio | İsteğe bağlı son deney | Kullanıcı ses açarsa kısa mekanik ton. | Sessiz varsayılan, açık kontrol, görünmeyen sekmede durma; temel kalite kapısının yerine geçmez. |

**Öncelik:** Kamera + doğru metal varlığı + geometri katmanı + ölçü ilişkisi, parçacık ve post-processing'den önce gelir. FBO yapılmaması çekirdek yaratıcı hedefi eksiltmez. Ana sahnelerin yapılmaması ise “performans için sadeleştirdik” diye başarı sayılmaz.

## SEC-07 — Gerçek varlık ihtiyacı ve üretim brief'i

### Gerekli dosyalar

| Varlık | İstenen içerik | Mevcut durum | Bloke ettiği faz |
|---|---|---|---|
| A-01 Logo | Resmi MAS TECHNIC SVG + tek renk/ters varyant; raster kaynak korunur. | Kullanıcı rasterı mevcut; resmi vektör yok. | P02 kalıcı marka teslimi; rasterla ilk uygulama mümkün. |
| A-02 Gogade | Lisanslı OTF/TTF/WOFF2, web kullanım koşulu, glyph kontrolü. | Referans görüntüsü var; gerçek font dosyası yok. | P02'nin Gogade kabulü. |
| A-03 Ana parça | Genel erişime uygun STEP/GLB; ham ve final katmanlar; feature isimleri. | Hero fotoğrafı var; ona eşleşen model yok. | P03, P05 canlı geometri/kesit. |
| A-04 Metal görünümü | Fiziksel yüzey fotoğrafı, materyal referansı, doğru normal/roughness. | Mevcut render/fotoğraflar var; sahneye bağlı PBR seti yok. | P03, P05 kalite. |
| A-05 CNC medya | Gerçek/izinli 5–8 sn operasyon videosu veya aynı konunun sekansı, poster. | Statik imalat fotoğrafı var; public video yok. | P08'nin video sürümü. |
| A-06 Metrologi sahnesi | Aynı parça + prob; 5 temel render/veya geometri; mekanik olarak tutarlı kamera. | Bu sahneye ait animasyon varlığı yok. | P11. |
| A-07 Profil görselleri | Üç parça ailesinin net, farklı kadrajlı özgün render/fotoğrafları. | İllüstratif mevcut görüntüler var. | P09/P19'in üst kalite sürümü. |
| A-08 Tesis/ekip | Yetkili gerçek fotoğraf/video; doğru mekân/ekipman. | Mevcut varlıkların gerçeklik/kullanım niteliği tek tek envanterlenecek. | P20 Hakkımızda. |
| A-09 Kalite belgeleri | Mevcut gerçek PDF kapakları; izinli anonim örnek kayıt varsa ek. | Dört public PDF var; gerçek ölçüm örneği sağlanmış değil. | P12/P20; sonuç içeriği. |
| A-10 Referans izinleri | Kullanım izni olan logolar, gerçek proje varsa yayın onayı. | Onaylı kaynak listesi var; yeni gerçek case study yok. | P13, gerçek proje genişletmesi. |

Bu eksikleri bir GitHub reposu veya yeni skill otomatik olarak doldurmaz. Özellikle **hero için aynı parçanın doğru geometri ve render'ı**, en yüksek görsel getiriyi sağlayan girdidir. Çalışan shader üzerine yanlış nesne koymak kalite ilerlemesi sayılmaz.

### CAD/3D sanatçısına verilecek brief

Ana manifold için sahne birimleri ve pivot sabit olacak. Mesh adları `body`, `bore-main`, `datum-A`, `finish-face` gibi semantik bir manifest'e bağlanacak; gerçek geometrinin olanak verdiği adlar kullanılacak. Ham ve bitmiş katmanların konumu aynı olmalı. Metalde ölçekli roughness ve kesici izleri; plastik gibi parlama veya krom aynası olmamalı. Delik içleri, kenar pahları, normals ve kesit kapakları kontrol edilecek.

Desktop için ilk hedef: görünür sahneye uygun yaklaşık 80–180 bin üçgen aralığını deneyerek ölçmek; en fazla gerekli materyaller; çoğunlukla 1K/2K doku. Mobil fallback ve proxy çok daha düşük maliyetli. Bu aralıklar evrensel doğru değildir; gerçek modelin kalitesi ve cihaz ölçümüyle revize edilir. 4K PBR bütün cihazlara zorunlu yüklenmez.

**İstenen render paketi:** Hero'nun 0/25/50/75/100% kompozisyonları; geniş ve mobil final poster; üç yakın özellik kadrajı; manifesto için prob yaklaşma/temas/kayıt sahneleri; doğru alpha gerekiyorsa alpha kanallı görüntü, gölge ayrı pass. Aynı ışık ve kamerada tutarlı kareler. Web için AVIF/WebP posterler, gerekiyorsa uygun sıkıştırılmış video; üretim master'ı ayrı tutulur.

Önceden render edilmiş alternatif, düşük kaliteli canlı 3D'den daha güçlü olabilir. Ancak onun sınırlı kamera/etkileşim alanı dürüstçe tasarlanır. Sadece beş ayrı JPEG'i opacity ile değiştirip “kamera spline ve 3D kesit” diye sunmak kabul edilmez. Örneğin gerçek kesit gereken hero için GLB, büyük CNC pencere açılımı için video daha uygundur.

### Özel yetkinlik gerektiğinde somut feedback

Kullanılacak feedback biçimi: “P05'in metal/kesit kabulü A-03/A-04 nedeniyle BLOCKED. Gerekli girdi: genel erişime uygun aynı manifoldun STEP/GLB'si, 5 kamera render'ı ve lisans/kullanım kaydı. Mevcut fotoğraf ile poster ve anotasyon prototipi yapılabilir; gerçek geometri dönüşümü tamamlandı sayılmaz.”

Bu feedback “daha fazla görsel gönder” gibi belirsiz olmamalı. Varlık adı, format, kadraj, özellik isimleri, cihaz varyantı, kullanım hakkı ve hangi fazı açtığı yazılmalı. Engellenmeyen diğer işler devam eder; engelli sahne sessizce kapsamdan çıkarılmaz.

### Skill veya açık kaynak repo ne zaman gerekir?

Mevcut stack temel GSAP, Lenis, Three, R3F, Drei ve CAD dönüşüm altyapısını içeriyor. İlk ihtiyaç yeni framework değildir. Özel GPU simülasyonu veya ileri shader prototipi gerçekten gerekirse resmi örnekler incelenir: [Three.js](https://github.com/mrdoob/three.js), [React Three Fiber](https://github.com/pmndrs/react-three-fiber), [Drei](https://github.com/pmndrs/drei), [Lenis](https://github.com/darkroomengineering/lenis). Alınan kodun sürümü/lisansı kaydedilir; referans site asset'leri veya özel kodu indirilecek malzeme değildir.

Bir repo sadece “wow” etiketi taşıdığı için indirilmez. Önce çözülemeyen ihtiyaç ve kabul testi yazılır; resmi örnek yeterli değilse hedef modül alınır. Yeni bir skill gerekiyorsa proje sahne üretimini ve render doğrulamasını standartlaştırır; çalışma kodunun yerine bir talimat dosyası bırakılmaz. Skill yaratılırsa ayrı küçük repo/sürüm kaydıyla kalıcılaştırılır. Bu rapor sırasında yeni skill veya paket kurulmadı.

## SEC-08 — Uygulama mimarisi ve bütçeleri

### Var olan sürüm sınırı

`package.json` React 18.3, R3F 8.18, Drei 9.122, Three 0.170, GSAP 3.14, Lenis 1.3 ve Playwright 1.59 ailelerini istiyor. Bunlar caret aralıklarıdır; uygulama başında gerçek lockfile sürümleri doğrulanır. Güncel bir dokümandaki örnek nedeniyle React 19/R3F major upgrade yapılmaz. Kaynakla uyumlu API kullanılır.

### Sorumluluk ayrımı

1. **İş durumu:** RFQ alanları, dosya kimliği, NEXUS seçimi ve locale React/veri katmanında kalır.
2. **Sahne durumu:** 0–1 progress, selected feature, kalite tier'ı ve kamera pozu küçük bir sahne köprüsünde taşınır. Her frame React state güncellemesi yapılmaz.
3. **DOM motion:** GSAP context ve scoped timeline; cleanup/revert zorunlu. Aynı transform'u GSAP ve Framer aynı anda yazmaz.
4. **3D motion:** R3F demand/invalidate veya görünürken aktif render; kullanıcı etkileşimi ve scene clock değiştiğinde render. Idle/offscreen/gizli tab'ta durur.
5. **Medya katmanı:** Poster daima ilk güvenilir yüzey. Canvas/video hata verirken aynı alanı kaplar, içerik kaybolmaz.
6. **Tek zaman kaynağı:** Desktop Lenis ve GSAP entegrasyonunda tek ticker. Milisaniye/saniye dönüşümü doğru; ikinci bağımsız scroll RAF eklenmez.
7. **Yükleme sınırı:** `three` ve decoder'lar başlangıç public chunk'ına girmemeli. Mevcut RFQ import sınırı mimari niyettir; landing için ayrı lazy sahne sınırı ve bundle testiyle bilinçli genişletilir.

Önerilen ek dosyalar, P00 kaynak araştırmasından sonra kesinleşir: `src/features/motion/scene-bridge.ts`, `src/features/landing-scene/InspectionScene.tsx`, `scene-assets.ts`, `scene-materials.ts`, `useMotionQuality.ts`. Bunlar mevcut dosyalar değildir ve sırf mimari diyagram güzel görünsün diye açılmaz. Mevcut uygun modül varsa onun içinde küçük ve tam kapsamlı uygulama tercih edilir.

### Önerilen sahne sözleşmesi

```ts
// Önerilen arayüz; şu an kaynakta uygulanmış değildir.
type MotionTier = 'poster' | 'lite' | 'full';
type SceneMode = 'raw' | 'machined' | 'inspection' | 'document';
interface InspectionSceneState {
  progress: number; // ilgili sahne için 0..1
  mode: SceneMode;
  selectedFeature: string | null;
  tier: MotionTier;
  visible: boolean;
  reducedMotion: boolean;
}
```

Feature kimliği gerçek model manifest'inden gelir. Bilinmeyen kimlik kontrollü olarak reddedilir. DOMRect ölçümü her frame bütün sayfada yapılmaz; resize/font/locale ve ilgili layout değişimlerinde yenilenir. Hero ve manifesto içindeki metin/nesne ilişkisi tek bir kamera ve viewport sözleşmesiyle hesaplanır.

### Başlangıç performans bütçeleri

| Alan | Uygulama hedefi | Ölçüm / yorum |
|---|---|---|
| Field Core Web Vitals | p75 LCP ≤2.5 sn, INP ≤200 ms, CLS ≤0.1; mobile/desktop ayrı | Gerçek trafik olmadığı durumda yalnız lab kanıtı raporlanır; field başarılı denemez. |
| İlk JS | Baseline'a göre artış en fazla 30 KB gzip; hero WebGL deferred chunk | Prerender/ilk yükleme paketi ölçülür; rapordaki hedef uygulama öncesi baseline ile netleşir. |
| Hero poster | Desktop yaklaşık ≤250 KB, mobile yaklaşık ≤120 KB | Nesnenin yüzey kalitesi bozulursa format/kadraj optimize edilir; ucuz thumbnail final sayılmaz. |
| Hero sahne payload | İlk geometri+doku yaklaşık ≤2 MB transfer hedefi; daha iyisi model ölçümüne bağlı | Decode/main-thread ve GPU bellek ayrıca ölçülür. Byte küçüklüğü tek kalite kanıtı değildir. |
| Font | İlk kullanılan display/body subset toplamını ölç; gereksiz tüm aileler preload edilmez | Türkçe glifler ve locale desteği korunur; `font-display` ve metrik fallback test edilir. |
| Motion desktop | Temsili 60 Hz cihazda hedef p95 frame interval ≤20 ms; ciddi uzun frame sayısı düşürülür | Başlangıç shader/texture yüklemesi ve steady-state ayrı raporlanır; cihaz/trace şarttır. |
| Mobile lite | Doğal scroll ve form etkileşimi öncelikli; aktif 3D varsa cihaz bazlı tier | Headless Chromium “her telefonda 60 FPS” kanıtı değildir. |
| Route dolaşımı | Tekrarlı giriş/çıkışta canvas, listener ve GPU kaynakları sınırsız büyümez | 20 turda plato, düşük kaynak ve context restore testleri. |
| Media/network | Offscreen ağır sahneler yüklenmez; save-data/reduced tier davranışı | Tüm sayfayı açınca 100 sayfanın medyasını indirmek yok. |

Kalite düşürme sırası: ağır post-processing → parçacık yoğunluğu → DPR → dokular/LOD → poster. Çizim/ölçü/CTA bilgisi bu sırada eksilmez. FPS düşüşünü tab gizliliği veya dış sistem yüküyle karıştıran bir heuristik düzeltilmelidir. Tier yükseltme/düşürme için hysteresis gerekir; cihaz her saniye iki kalite arasında zıplamaz.

Decoder aynı Three sürümüyle uyumlu ve mümkünse self-hosted olmalıdır. Bir decoder instance/worker havuzu tekrar kullanılabilir. DRACO yalnız geometriyi sıkıştırır; materyal ve dokular için ayrı optimizasyon yapılır. PNG/JPEG kaynakların AVIF/WebP'ye çevrilmesi, GPU doku belleği problemini tek başına çözmez.

## SEC-09 — Gereksinim ve kapsam kaybı kontrolü

Bu dosya uygulamaya alınırken önce Section Inventory, sonra gereksinim kayıtları ve dependency/coverage eşlemesi çıkarılır. Aşağıdaki tablo bunun başlangıcıdır; kaynak otoritesi bu rapor ile güncel kullanıcı talebidir. Tablodaki durumlar uygulama başarısı değildir. `NOT_STARTED` uygulanmamış iş; `BLOCKED` bilinen gerekli girdi eksikliği anlamına gelir.

| Gereksinim | Kaynak / kabul özeti | İş birimi | Kanıt | Başlangıç durumu |
|---|---|---|---|---|
| REQ-001 | SEC-00/04: 12 bandın sayısı/sırası, ray ve grid korunur. | P00, P24 | T01, eski/yeni bütün sayfa kayıtları | NOT_STARTED |
| REQ-002 | SEC-00/04: NEXUS konumu ve beş adımı korunur. | P14 | T05, 5 durum görüntüsü | NOT_STARTED |
| REQ-003 | SEC-01/04: onaylı iddialar korunur; örnek sonuçlar gerçek gibi sunulmaz. | P06, P09, P12, P13, P20 | T08, claims kaynağı eşlemesi | NOT_STARTED |
| REQ-004 | SEC-03: gönderilen logo kullanılır. | P02, P17 | Logo varlık/hash ve görünür ekran | NOT_STARTED |
| REQ-005 | SEC-03/07: Gogade gerçek dosya/lisans/glif ile display rolünde kullanılır. | P02 | T02, font dosyası ve lisans kaydı | BLOCKED |
| REQ-006 | SEC-03: açık mühendislik paleti ve turkuaz marka görünür. | P02 | T02, P24 karşılaştırması | NOT_STARTED |
| REQ-007 | SEC-07: aynı parçaya ait geometri, materyal, poster ve feature manifest'i. | P03 | T04, 5 render ve varlık envanteri | BLOCKED |
| REQ-008 | BAND-02: büyük, anlamlı geometri/kamera hero sahnesi. | P05 | T03/T04, 5 progress karesi + video | NOT_STARTED |
| REQ-009 | BAND-02: 4 ölçü seçimi gerçek feature ve DOM açıklamasıyla eşleşir. | P05 | T04, native kontrol testleri | NOT_STARTED |
| REQ-010 | BAND-03: 6 kanıt okunur, içerik ve kaynaklar doğru. | P06 | T02/T08, 320 px kontrolü | NOT_STARTED |
| REQ-011 | BAND-04: sınırlı kinetik tipografi, statik erişim eşdeğeri. | P07 | T03/T09, hızlı/ters scroll kaydı | NOT_STARTED |
| REQ-012 | BAND-05: 4 adım ve kontrol modülü; genişleyen operasyon sahnesi. | P08 | T03/T05, 4 durum ve medya hatası | NOT_STARTED |
| REQ-013 | BAND-06: asimetrik 3 profil, kontrol planı ve doğru örnek statüsü. | P09 | T03/T08/T10 | NOT_STARTED |
| REQ-014 | BAND-07: bütün sektörler, doğru içerik ve ilgili RFQ/detail yolu. | P10, P18 | T01/T05/T10 | NOT_STARTED |
| REQ-015 | BAND-08: prob–özellik–kayıt imza sahnesi. | P11 | T03/T04/T08, 5 progress karesi | NOT_STARTED |
| REQ-016 | BAND-09: gerçek PDF önizleme ve çalışan dosya erişimi. | P12 | T07/T08, dosya hash/boyut | NOT_STARTED |
| REQ-017 | BAND-10: yalnız onaylı referanslar ve gerçek bağlam. | P13 | T08, kaynak listesi | NOT_STARTED |
| REQ-018 | BAND-11: seçime bağlı 5 ayrı operasyon/doküman durumu. | P14 | T05/T08/T09, 5 state videosu | NOT_STARTED |
| REQ-019 | BAND-12 ve SSS: tam kaynaklar, düzgün accordion/arama varsa gerçek sonuç. | P15, P21 | T05/T07/T09 | NOT_STARTED |
| REQ-020 | BAND-13: 4 RFQ adımı ve dürüst dosya/CTA davranışı. | P16 | T06/T08/T10 | NOT_STARTED |
| REQ-021 | SEC-05: header/footer/menü/route geçişi marka ve odağı korur. | P17 | T01/T09/T10 | NOT_STARTED |
| REQ-022 | SEC-05: servisler konuya bağlı medya ve işlem anlatımı kullanır. | P18 | T01/T03/T10; aile içi görsel kontrol | NOT_STARTED |
| REQ-023 | SEC-05: kabiliyet, sektör, kategori aileleri birbirinden ayrışır. | P18 | T01/T08/T10/T13 | NOT_STARTED |
| REQ-024 | SEC-05: malzeme atlası ve karşılaştırma yalnız mevcut doğrulanmış veriye bağlıdır. | P19 | T05/T08/T10 | NOT_STARTED |
| REQ-025 | SEC-05: profil detayında geometri–kontrol–kayıt bağı. | P19 | T04/T08/T10 | NOT_STARTED |
| REQ-026 | SEC-05: Hakkımızda gerçek tesis/ekip anlatısı. | P20 | T08/T10/T13 | NOT_STARTED |
| REQ-027 | SEC-05: kalite detayında gerçek belge ve doğru kapsam. | P20 | T07/T08/T10 | NOT_STARTED |
| REQ-028 | SEC-05: blog, iletişim, SSS ve legal tam ve kullanılabilir. | P21 | T01/T05/T09/T10 | NOT_STARTED |
| REQ-029 | SEC-05: RFQ viewer ve teklif adımları doğru dosya/birim/hata durumlarıyla çalışır. | P22 | T06/T04/T11 | NOT_STARTED |
| REQ-030 | SEC-08: tek motion clock, scoped cleanup, lazy Three sınırı. | P04 | T03/T11/T12 | NOT_STARTED |
| REQ-031 | SEC-06/08: HTML–WebGL hizası ve feature kimliği doğrudur. | P04, P05, P11 | T04; resize/font/locale kayıtları | NOT_STARTED |
| REQ-032 | SEC-08: ölçülen adaptive tier ve offscreen/hidden pause. | P04, P23 | T03/T04/T11/T12 | NOT_STARTED |
| REQ-033 | SEC-00/08: mobil, keyboard, reduced, no-WebGL eşdeğeri. | P02, P04, P23 | T09/T10/T11 | NOT_STARTED |
| REQ-034 | SEC-05: tüm canonical/locale/redirect/404 route sözleşmesi. | P00, P23 | T01/T10 | NOT_STARTED |
| REQ-035 | SEC-08: baseline'a karşı perf/bundle/CWV ve cihaz frame bütçesi. | P00, P23 | T12, trace ve benchmark | NOT_STARTED |
| REQ-036 | SEC-11/12: eski–yeni görsel ve işlev regresyonu düzeltilir. | P00, P24 | T10/T13, finding ledger | NOT_STARTED |
| REQ-037 | SEC-03/13: özgün art direction ve üç imza sahnesi bağımsız değerlendirilmeyi geçer. | P01, P24 | T13, rubric ve açık bulgular | NOT_STARTED |
| REQ-038 | SEC-00: mevcut kaynak ve özel backend sınırı korunur. | P00–P25 | T14, scope/diff incelemesi | NOT_STARTED |
| REQ-039 | SEC-14: test–Git–build–deployment sürümü eşleşir. | P25 | T14/T15, release manifest | NOT_STARTED |
| REQ-040 | SEC-14: teslim edilen ChatGPT linki yeni sürümün üç sahnesini gösterir. | P25 | T15, canlı UI kayıtları | NOT_STARTED |
| REQ-041 | SEC-01/02: altı referans incelenir; gözlem/çıkarım/öneri ayrı kalır. | P00, P01 | R-FLEXIS…R-BBB + kaynak kayıtları | NOT_STARTED |
| REQ-042 | SEC-07: varlık/font/kod kullanım hakları ve sürümleri kaydedilir. | P02, P03, P25 | Varlık/bağımlılık envanteri | NOT_STARTED |
| REQ-043 | SEC-07: eksik varlık belirli brief'le bildirilir; placeholder tamamlanmış sayılmaz. | P03, P05, P11 | BLOCKED kaydı ve varlık kabulü | NOT_STARTED |
| REQ-044 | SEC-05: bütün genel erişime açık sayfa aileleri kapsamda kalır. | P00, P18–P23 | Route/aile coverage matrisi | NOT_STARTED |
| REQ-045 | SEC-12: başarısız faz durdurulur, kök neden sınıflanır, kapı zayıflatılmaz. | Bütün fazlar | Finding ledger ve tekrar test | NOT_STARTED |
| REQ-046 | SEC-03/07: sahne storyboard'ları ve render kompozisyonları koddan önce görünürdür. | P01, P03 | Desktop/mobile storyboard ve render paketi | NOT_STARTED |

İlk uygulama başlangıcında REQ-005 ve REQ-007 için girdi yolu kontrol edilir. Yetkili dosya bulunursa `READY`; bulunmazsa `BLOCKED` kalır. Engeli kaldırmak için sahte font adı, generic GLB veya bilinmeyen lisanslı asset kullanmak yasaktır.

### Section Inventory başlangıcı

| Kaynak bölüm | Sınıf | Yürütülebilir karşılık |
|---|---|---|
| SEC-00 | Hedef, sınır, Decision Lock | REQ-001/002/003/033/038/040 |
| SEC-01 | Tanı, kanıt sınırı | P00, REQ-036/041 |
| SEC-02 | Referans gözlemi ve yaratıcı öneri | P01, REQ-041; bölüm önerilerinin kaynak bağı |
| SEC-03 | Sanat yönetimi ve marka kabulü | P01/P02, REQ-004/005/006/037/046 |
| SEC-04 | 12 bölüm gereksinimi | P05–P16, REQ-008–020 |
| SEC-05 | İç sayfa ve RFQ gereksinimi | P17–P22, REQ-021–029/034/044 |
| SEC-06 | Teknik seçim ve açık araştırma seçenekleri | P04/P05/P07/P11; optional teknikler deferral olarak ayrı kalır |
| SEC-07 | Varlık, yetkinlik, lisans ve blocker | P03, REQ-007/042/043/046 |
| SEC-08 | Mimari ve performans kısıtı | P04/P23, REQ-030–035 |
| SEC-09 | Türetilmiş coverage kaydı | Başlamadan orphans kontrolü; kullanıcı talebinin yerine geçmez |
| SEC-10 | İş birimleri ve bağımlılıklar | P00–P25 |
| SEC-11 | Test ve kanıt kabulü | T01–T15, faz eşlemeleri |
| SEC-12 | Finding/loop/bağımsız kapı | REQ-045, PHASE_VERIFIED kuralları |
| SEC-13 | Görsel değerlendirme ve skor hedefi | P24, REQ-037; ödül garantisi değil |
| SEC-14 | Release ve yeni link kapısı | P25, REQ-039/040 |
| SEC-15 | Sonraki uygulama için çalıştırma promptu | Orijinal gereksinimlere bağlı yürütme talimatı |
| SEC-16 | Kaynak dizini | Teknik kararları doğrulama; sayfa talimatlarını yetki saymama |

## SEC-10 — Ayrı fazlar ve kabul kapıları

Her fazın tek aktif yazarı olur. Sıkı bağlı shader/DOM/sahne işleri ardışık yürütülür. Bağımsız işlerde bile dosya çakışması yaratılmaz. Moderate/High uygulama fazlarında builder kanıtı ve bağımsız QA kabulü gerekir. Rapor hazırlamak için ekip kurulması zorunlu değildir; uygulama büyüklüğü nedeniyle sonraki çalışma Formal Spec Team Mode'a uygundur.

### P00 — Baseline, gerçek kapsam ve ölçüm

**İş:** Eski Vercel, mevcut kaynak ve ChatGPT yayını ayrı kimlikle kaydet. Route manifest'ini gerçek veriden üret; public/auth/protected/redirect/404/locale sınıflarını ayır. 12 bant ve beş NEXUS adımı için başlangıç ekranı/video, RFQ görev tamamlanması, bundle ve temel performans ölçümü al. Mevcut dirty çalışma ağacının fingerprint'ini koru.

**Kapı:** T01/T06/T10/T12/T14; testlerin bu ortamda gerçekten çalıştığı ve ilgili golden dosyalarının bulunduğu doğrulanır. Mevcut hata baseline olarak raporlanır; yeni değişiklik sonucu gibi gösterilmez. Bir URL'ye erişilemiyorsa hangi baseline'ın kullanılabildiği açık kalır.

**Bağımlılık:** Yok. **Risk:** Moderate. **Çıktı:** baseline manifest, route coverage, paired capture koşulları, performans cihaz/ayar kaydı. Bu fazdan önce uygulama yapılmaz.

### P01 — Art direction ve storyboard

**İş:** SEC-03 yönünü gerçek mevcut wireframe üzerine yerleştir. 12 bantlık bir uzun sayfa kompozisyonu, 3 imza sahnesinin beşer ana karesi, 320/390/768/1440 düzeni ve 6 iç sayfa ailesi örneği üret. Layout bilgisi doğru olacak; bitmap konseptleri uygulama screenshot'ı sayılmayacak.

**Kapı:** T13; her sahnenin Mas Technic'e özgü anlamı, referans bağı, statik final kompozisyonu ve mobil eşdeğeri var. “Biraz daha glow” veya “daha fazla parallax” kabul edilen yaratıcı brief değildir. Hero fotoğrafının küçüklüğü, iç sayfa tekdüzeliği ve marka eksikliği burada görünür biçimde çözülür.

**Bağımlılık:** P00. **Risk:** Moderate. **Çıktı:** storyboard/render brief, sahne karar kaydı. Üç imza sahnesi olmadan micro-polish fazına kaçılmaz.

### P02 — Marka, font ve açık tasarım sistemi

**İş:** Logo, Gogade display rolü, body/mono rolleri ve SEC-03 paleti. Yeni token'lar mevcut grid ve merkezi z-index sistemine bağlanır. Lisans ve glif incelemesi ayrı kaydedilir. Çok dilli fallback açıkça tasarlanır.

**Kapı:** T02/T09/T10/T14; fontun gerçekten indirildiği değil gerçekten render edildiği kanıtlanır. Metin fontu fallback'e düşüyorsa geçmez. Türkçe glif, ilk yükleme shift, button ölçüsü ve açık/koyu kontrast kontrol edilir.

**Bağımlılık:** P01 + A-02. **Risk:** Moderate. **Çıktı:** token/font/brand uygulaması ve 4 viewport marka kayıtları. Lisanslı Gogade yoksa bu gereksinim BLOCKED; mevcut font “Gogade benzeri” diye kapatılmaz.

### P03 — Model, render ve medya hattı

**İş:** A-03/A-04/A-06 varlıklarını kabul et veya üretim brief'ini tamamla. Named feature manifest, model scale/pivot/normals, compressed GLB, yerel decoder, posterler ve düşük kalite proxy. Gerçek PDF önizlemeleri ve diğer medya envanteri hazırlanır.

**Kapı:** T04/T07/T12; decoded model doğru, katmanlar aynı konumda, kesit gerçek, poster ile 3D kadraj eşleşiyor. Compression oranı ve decode zamanı gerçek rakamlarla. DRM/lisans veya model hakkı belirsizse ilgili varlık yayın kapısını geçmez.

**Bağımlılık:** P01 + gerekli varlıklar. **Risk:** Moderate. **Çıktı:** versioned asset manifest + 5 kamera render'ı. Bu faz scene kodundan önce gelir.

### P04 — Ortak motion runtime ve kalite tier'ları

**İş:** Tek clock, scoped GSAP, lazy scene import, demand/invalidate, offscreen pause, reduced/no-WebGL fallback, responsive DOM–3D köprüsü. Gerekirse mevcut motion hook'u evrilt; paralel bir ikinci sistem ekleme.

**Kapı:** T03/T04/T09/T11/T12/T14; route giriş/çıkışı 20 tur, sekme görünürlüğü, context loss, font/resize, StrictMode cleanup. Canvas idle render etmiyor ve sahne değişiminde gereken render geliyor. Native mobile scroll kontrolü.

**Bağımlılık:** P02/P03. **Risk:** Moderate. **Çıktı:** çalışır runtime ve hata yollarının kanıtı; henüz hero tamamlanmış sayılmaz.

### Bölüm fazları — her bant ayrı iş birimi

Her satırdaki kapı SEC-04'teki bölüm kabulünün tamamını ve listelenen T test ailelerini kapsar. Ortak token/runtime değişirse bağımlı fazların etkilenen kanıtı STALE olur.

| Faz | Tek hedef / ilgili yüzey | Bağımlılık | Fazı geçirecek kanıt | Risk |
|---|---|---|---|---|
| P05 | BAND-02: geometri, kamera, gerçek dört feature; `TechnicalHero` + lazy sahne | P04 | T02/T03/T04/T09/T10/T12; 5 progress frame, 4 seçim, video ve error poster | Moderate |
| P06 | BAND-03: kanıt hücreleri; `ProofStrip` | P02 | T02/T08/T09/T10; 6 hücre + claims diff | Moderate |
| P07 | BAND-04: kontrollü kinetik kabiliyet hattı; `MarqueeBand` | P04 | T03/T09/T10; hızlı/geri scroll ve statik/reduced kayıt | Moderate |
| P08 | BAND-05: dört adım, geniş üretim medyası, kontrol modülü | P04/P03 | T03/T05/T08/T09/T10/T12; 4 seçim, medya timeout, scroll çıkışı | Moderate |
| P09 | BAND-06: 3 farklı ölçekli profil ve doğru kontrol planı | P02/P03/P04 | T03/T08/T09/T10; 3 profil, hover/focus, örnek statüsü | Moderate |
| P10 | BAND-07: bütün sektörler ve seçime bağlı görsel | P04 | T01/T05/T08/T09/T10/T11; tüm sektörlerin link/state kapsamı | Moderate |
| P11 | BAND-08: prob–özellik–kayıt sahnesi | P03/P04 | T03/T04/T08/T09/T10/T12; 5 frame + video + poster | Moderate |
| P12 | BAND-09: gerçek kalite dosya masası | P02/P03 | T05/T07/T08/T09/T10; bütün gerçek PDF linkleri | Moderate |
| P13 | BAND-10: izinli referans şeridi | P02 | T08/T09/T10; kaynak listesi ve mobil logo okunurluğu | Moderate |
| P14 | BAND-11: 5 farklı NEXUS belge/operasyon durumu | P04 | T05/T08/T09/T10/T11/T12; 5 durum, hızlı seçim, demo/giriş/teklif | Moderate |
| P15 | BAND-12: SSS/kaynaklar ve açık okuma | P02 | T05/T07/T09/T10; bütün cevap/indirme durumları | Moderate |
| P16 | BAND-13: gerçek RFQ yönlendirmesi ve 4 adım | P02 | T06/T08/T09/T10; CTA ve varsa handoff | Moderate; upload davranışı değişirse High |

### P17 — Header, menü, footer ve route geçişi

**İş:** SEC-05 SHELL. Mevcut navigation/locale sözleşmesini koruyarak gerçek marka, okunur menü, ölçülü route animasyonu. Chat launcher form ve CTA'yı kapatmaz. Kaydırma/odak geri dönüşü doğru.

**Kapı:** T01/T03/T09/T10/T11/T14; keyboard menü, Escape, focus return, scroll restore, mobile sticky header, chat aç/kapat, route rapid switch. Yeni belge içerikleri geçiş perdesinin arkasında kalmaz.

**Bağımlılık:** P02/P04. **Risk:** Moderate. **Çıktı:** bütün route'larda aynı sağlam marka kabuğu; sayfa aileleri henüz ayrı değerlendirilir.

### P18 — Servis, kabiliyet, sektör ve kategori sayfaları

**İş:** SEC-05'teki dört aile. Ailelere özgü içerik modülleri ve yerel indeks; gerçek üretim/teknik medya. Veri şemasının uygun alanlarını kullan, her slug için bağımsız statik sayfa kopyası üretme.

**Kapı:** T01/T03/T08/T09/T10/T12/T13; bütün slugs işlevsel olarak taranır. Her ailenin en uzun içerik, tablo, farklı medya oranı ve son öğesi görsel kontrolden geçer. Servis ve sektör örneği aynı hero'nun sadece başlığı değiştirilmiş haliyse yaratıcı kapı başarısızdır.

**Bağımlılık:** P17 + uygun medya. **Risk:** Moderate. **Çıktı:** konuya bağlı page family modülleri ve route coverage; yanlış aile URL'leri canonical hedefe gider.

### P19 — Malzeme atlası ve kabiliyet profili detayları

**İş:** Gerçek malzeme gruplarının okunur atlası; varsa mevcut veriye dayalı karşılaştırma. Profil detayında seçilen geometri/özellik ve kontrol planı. Üç profilin küçük fotoğraf tekrarı olan genel şablonla yetinme.

**Kapı:** T01/T04/T05/T08/T09/T10/T12/T13; bütün material/profile kayıtları, uzun tablo, kaydırma, boş/uyumsuz seçim. Karşılaştırma ya da feature davranışı yoksa eklenmiş gibi pazarlanmaz.

**Bağımlılık:** P17/P03. **Risk:** Moderate. **Çıktı:** iki farklı görsel aile; doğru örnek statüsü ve ilgili RFQ yolu.

### P20 — Hakkımızda ve kalite derinliği

**İş:** Gerçek tesis/ekip görüntüsüyle kuruluş anlatısı; gerçek belge ve kontrol kapsamıyla kalite masası. Ana sayfadan farklı, editoryal ve daha açık düzenler.

**Kapı:** T07/T08/T09/T10/T13; gerçek görsel kökeni, belge önizleme ve bütün iddialar. Gerçek tesis fotoğrafı yoksa o ihtiyacın BLOCKED kaydı; AI fabrikanın şirket tesisi gibi sunulması yasak.

**Bağımlılık:** P17 + A-08/A-09. **Risk:** Moderate. **Çıktı:** iki tamamlanmış, konuya bağlı sayfa ve mobil kayıtlar.

### P21 — Blog, SSS, iletişim ve sakin belge sayfaları

**İş:** Teknik günlük ve rahat uzun okuma; arama/indeks uygun ise uygulanır; iletişim formunun ergonomisi; legal metinleri koruyan sade marka uyumu. “Wow” bu yüzeylerde büyük sahne değil, doğru içerik ve ayrıntıdır.

**Kapı:** T01/T05/T08/T09/T10/T12; bütün blog kayıtları, form error/success, bütün SSS, legal linkler, 404 çıkışları. Gerçek gönderim test-only güvenli uçta veya uygun mock ile; canlı kullanıcı mesajı gönderilmez.

**Bağımlılık:** P17. **Risk:** Moderate. **Çıktı:** bütün sakin sayfa aileleri; route manifest'inde eksik public yüzey kalmaz.

### P22 — RFQ/CAD workspace

**İş:** SEC-05 RFQ; mevcut yükleme ve form adımlarını koruyarak CAD/DOM senkronizasyonu, ölçü/birim, kesit ve hata durumları. Bu fazda upload/parse işleyen dosyalar değişirse High risk sınıflandırılır. Auth, storage policy veya schema değişikliği ayrı gerekçe olmadan yapılmaz.

**Kapı:** T04/T06/T09/T10/T11/T12/T14; desteklenen gerçek STL/OBJ/STEP fixture'ları, viewer'ın desteklemediği ama upload'ın kabul ettiği dosya, bozuk/çok büyük/iptal/değiştirilmiş dosya, birim/fit, eski preview invalidation, form doğrulama. CAD önizleme açmadan da teklif yolu çalışır. Untrusted input/worker sınırları için ilgili bağımsız security incelemesi gerekir.

**Bağımlılık:** P17/P04. **Risk:** High, değişen yüzeye göre. **Çıktı:** çalışan teknik brief workspace; yalnızca render edilmiş form görseli değil.

### P23 — Bütün route'lar, localization ve performans birleşimi

**İş:** Tüm public route/locale kapsamı; sayfa başlıkları/SEO, font fallback, 3D tier, bundle ve gerçek cihaz ölçümleri. Doğru app build'i üzerinden çalış. Yeni script/schema/hosting sistemi kurma ihtiyacı çıkarsa ayrıca sınıflandır.

**Kapı:** T01/T09/T10/T11/T12/T14; build/typecheck/lint, critical, interop/smoke ve ilgili a11y. URL ailesi, uzun çeviri, Çince/Rusça font ve mobile tier. Performance bütçesi/ölçüm koşulu açık, yalnız Lighthouse puanına dayanmaz.

**Bağımlılık:** P05–P22'nin gerekli kapıları. **Risk:** Moderate. **Çıktı:** entegrasyon kanıtı. Bu faz “site etkileyici” kararını tek başına vermez.

### P24 — Eski/yeni karşılaştırma ve yaratıcı kabul

**İş:** Aynı viewport, aynı route/state, aynı ölçüm koşulu ve aynı görevlerle baseline'a karşı A/B. 12 bandın tamamı, 3 imza sahnesi, 5 NEXUS adımı, RFQ ve bütün page family'leri. Hareket için film; statik kompozisyon için final frame.

**Kapı:** T10/T12/T13/T14. Gerilemeler finding ledger'a girer; ilgili faza dönülür. Bir bölüm daha güzel ama önemli bilgi/CTA kaybolduysa kabul edilmez. Yeni görüntüler bağımsız değerlendirmeden geçmeden golden'lar güncellenmez.

**Bağımlılık:** P23. **Risk:** Moderate. **Çıktı:** paired comparison, görsel rubric, regression fix kanıtı, güncel coverage. Gerekli varlık/sahne eksikliği burada “opsiyonel”e çevrilmez.

### P25 — Yeni sürümü yayınlama ve gerçek link

**İş:** SEC-14; test edilen Git/worktree/build ile aynı artifact yeni ChatGPT Site sürümüne taşınır. Önceki yayın ve rollback bilgisi korunur. Kaynak repo yazımı/deploy için mevcut kesin kullanıcı yetkisi ve platform kısıtları kontrol edilir; yeni izin gerektiğinde somut hedef ve hazır artifact üzerinden istenir.

**Kapı:** T14/T15; yeni version/deployment ID, artifact hash, deep-link açılımı, console/network, 12 bant/3 sahne/RFQ canlı kontrol. Publication success bildirimi tek başına yeterli değildir. Farklı tabda cache'siz açılan link yeni görsel işaretleri göstermeli.

**Bağımlılık:** P24 ve fresh release audit. **Risk:** Moderate; erişim/yetki değişikliği yapılırsa yeniden sınıflandırılır. **Çıktı:** `RELEASE_VERIFIED` sürüm kimliği, gerçekten yeni `chatgpt.site` linki ve kısa test/limit raporu.

## SEC-11 — Agresif fakat anlamlı test sözleşmesi

Bu testler gelecekte uygulanacak doğrulama planıdır. Bu raporda isimleri geçmesi çalıştırıldıkları anlamına gelmez. Amaç test sayısını büyütmek değil, bir özelliğin uygulanmış olduğunu yanlış olumlu sonuç olmadan kanıtlamaktır.

### Test aileleri

| ID | Kontrol | Kanıt / örnek olumsuz yol |
|---|---|---|
| T01 | Yapı ve route kapsamı | 12 bant sırası; gerçek route manifest; tüm public slug/locale bağlantıları; yanlış aile/unknown slug; protected yolların public olmaması. |
| T02 | Marka, font ve kontrast | Gerçek logo kaynağı; yüklü font dosyası ve glif; rendered font kontrolü; font network failure; layout shift; açık/koyu anlamlı metin kontrastı. |
| T03 | Gerçek motion | Progress frame + timestamp'li ekran kaydı; ileri/geri scroll; scrub/timeline sınırlı; DOM/3D hareketi gözlenir; gizli/offscreen pause ve cleanup. |
| T04 | 3D, shader ve geometri | Named feature raycast; kamera/clip plane; gerçek units/normals; decoder failure/context loss; DOM ankrajı resize/font/locale; yanlış feature ID; poster eşdeğeri. |
| T05 | Yerel kontrol/iş akışı | 4 süreç, tüm sektörler, 5 NEXUS, accordion; hızlı ardışık seçim, keyboard, focus; last intent wins; yanlış semantik durum yok. |
| T06 | RFQ görevi | Dosya/form adımları; geçersiz/bozuk/büyük/unsupported preview; dosya değişimi, iptal, geri/ileri, tekrar açma; preview olmadan submit yolu. |
| T07 | Gerçek medya/belge | PDF hash/MIME/boyut/önizleme; görsel aspect ratio/srcset; video yüklenmez veya autoplay engellenir; fallback; broken download. |
| T08 | İçerik ve iddia | `claims.ts`, `technicalLandingData`, case study şeması; örnek statüsü; Ra bağlamı; onaysız sertifika/müşteri/sonuç; tüm dillerde aynı anlam. |
| T09 | Erişilebilirlik ve hareket tercihi | Keyboard, zoom, reduced-motion, touch, screen-reader labels; duplicate split text; inactive panel focus; pause; hata duyurusu. |
| T10 | Responsive ve görsel regresyon | 320/375/390/768/1280/1440; kısa/uzun viewport; tüm family'ler, tablo, logo, header/chat örtüşmesi; final/progress paired images. |
| T11 | Kaynak yaşam döngüsü | 20 route veya viewer aç/kapat turu; canvas/worker/listener/material dispose; hidden tab; GPU loss/restore; request cancellation; state invalidation. |
| T12 | Ölçülmüş performans | Bundle/transfer/decode; cold/warm load; LCP/CLS lab, INP için gerçek etkileşim/field ayrımı; cihaz frame trace; bellek plato; baseline kıyası. |
| T13 | Sanat yönetimi ve yaratıcı kalite | Blind A/B, üç imza sahnesi, 12 bandın ritmi, konuya özgü 6+ page family; çoklu bağımsız rubric ve açık eleştiri. |
| T14 | Kaynak, scope ve kanıt kimliği | Dirty çalışma korunur; final diff; REQ–dosya–test eşlemesi; backend/schema/auth hariç; her raporda source/asset/build kimliği. |
| T15 | Canlı yeni sürüm | Git/build/deploy hash eşleşmesi; ChatGPT Site linki ve deep routes; cache temiz ikinci tabda yeni sahneler; canlı error/fallback ve rollback bilgisi. |

### Mevcut testlerle doğru bağ

Başlangıçta uygun mevcut testler çalıştırılır ve yeni sahnelerin kabulüne göre genişletilir: `e2e/landing/landing-structure.spec.ts`, `landing-grid-axes.spec.ts`, `landing-process-flow.spec.ts`, `motion-grammar.spec.ts`, `landing-reduced-motion.spec.ts`, `claims-gate.spec.ts`, `gpt61-motion.spec.ts`; `e2e/polish/prose-reveal.spec.ts`, `rfq-cad-preview.spec.ts`; RFQ attachment ve CAD DOM testleri; `e2e/visual` altındaki landing/inner/shell/font guard testleri. Yeni test dosyası ancak mevcut testin kapsamına doğru yerleştirilemiyorsa açılır.

Şu komutlar mevcut package scripts'idir; bu raporda çalıştırılmadılar:

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e:critical
npm run test:e2e:smoke
npm run test:e2e:interop
npm run test:e2e:visual
```

Faz başına ilgili focused test + build/typecheck gereken yerde; entegrasyonda tam gerekli matrise geçilir. Her küçük CSS patch'inden sonra aynı binlerce testi çalıştırmak yerine değişen kabul ve bağımlı riskler ölçülür. Yeni hata/ortak değişiklik varsa kapsam genişletilir. Chromium temel işlev/hareket testi için; Firefox/WebKit etkileşim/asset/render uyumluluğu için; gerçek iOS/Android ve GPU cihazları performans kanıtı için kullanılır.

### Görsel snapshot ile motion kanıtını karıştırma

Playwright `toHaveScreenshot` stabil kare bekler. `animations: 'disabled'` CSS transitions/animations ve Web Animations üzerinde davranış sağlar; **GSAP RAF, WebGL shader zamanını veya video progress'ini otomatik kontrol etmez**. Böyle bir screenshot'ın geçmesi animasyonun çalıştığı kanıt değildir.

Uygulama sırasında deterministik bir test köprüsü yalnız test ortamında sahne `progress`, kamera, seçili feature ve clock değerini seek eder. Üretim UI'ında debug paneli olmaz. Shader/video frame kontrolü, testin kurulumunda kayıtlı zaman/kare sözleşmesiyle yapılır. Gerçek scroll ve gerçek kullanıcı seçiminden gelen motion videosu ayrıca alınır; seek eden test entegrasyon testinin yerine geçmez.

Her imza sahnesi için `p=0/.25/.50/.75/1` görüntüleri, en az bir ileri ve bir geri hareket videosu gerekir. Test şunları da kontrol eder: feature/scene state gerçekten değişiyor mu; kamera/sahne varlığı görünür mü; framebuffer alanında anlamlı değişiklik var mı; metin/CTA okunur mu; son kare doğru mu. Yalnız `data-progress` attribute'u yazılmış veya canvas DOM'a eklenmiş diye geçmez.

Font testinde `getComputedStyle(...).fontFamily` yalnızca istenen aileyi gösterir; kullanılan glifin gerçekten o fonttan geldiğini tek başına kanıtlamaz. Font dosyasının cmap/glif kapsamı incelenir, font load/network kaydı alınır ve Türkçe örnek başlık render'ı doğrulanır. Uygun Chromium test ortamında rendered font bilgisi veya güvenilir glif karşılaştırmasıyla fallback yakalanır. Teknik ölçü sembollerinin açık ikinci font rolü bu testte hata sayılmaz; tanımsız sessiz harf fallback'i sayılır.

**Test hilesi örnekleri:** `canvas.count() > 0` ile “3D tamam” demek; testte gerçek materyali basit cube ile değiştirmek; font family CSS değerine bakıp fallback fontla rendering'i kaçırmak; golden'ı yeni hatalı görünümle güncellemek; her olumsuz senaryoda `skip`; başarılı build ile upload akışını tamamlanmış saymak. Bunların hiçbiri kabul değildir.

### Test ortamı ve golden kapısı

Mevcut dosyalarda Windows golden örnekleri bulunuyor. Uygulama ortamında Linux/başka platform için gereken golden dosyası yoksa visual test başarıyla doğrulanmış sayılamaz. Seçilen OS, Chromium sürümü, font yükleme ve GPU ayarı baseline ve adayda aynı tutulur. Yeni platform baseline'ı bağımsız görsel review sonrası yaratılır; otomatik `--update-snapshots` kabul mekanizması değildir.

GPU olmayan CI'da fallback görseli ve işlev test edilir. Bu ortam canlı metal shader'ın gerçek cihaz kalitesini/FPS'ini kanıtlamaz. WebGL donanım ve tarayıcı farkları ayrı kayıt olur. Hiç ölçülmemiş “60 FPS, 100 sayfada sorunsuz” iddiası final rapora giremez.

### Olumsuz testlerin zorunlu asgari seti

Font fail/slow; model decoder 404/timeout; bozuk GLB; context loss/restore; slow media; reduced-motion ilk yükleme ve runtime değişimi; no-WebGL; touch pointer; viewport resize/orientation; uzun çeviri; 200% zoom; hızlı NEXUS seçimi; route değişirken aktif tween; dosya değişirken eski parser sonucu; tekrar eden viewer açılımı; unsupported preview fakat geçerli RFQ attachment; PDF unavailable; tamamen bilinmeyen route.

Untrusted dosya testleri canlı müşteri dosyalarıyla yapılmaz. Kontrollü, lisanslı fixture'lar kullanılır. Mevcut `sample-cube.stp` parser/fit testi için uygundur; hero gerçeklik ve sanat yönetimi testinin materyali değildir.

## SEC-12 — Başarısızlık loop'u ve bağımsız kapanış

Her faz başlamadan önce ilgili REQ'ler, izinli dosyalar, forbidden yüzeyler, test planı, kanıt dosyaları ve ilk patch bütçesi kaydedilir. Başlangıç bütçesi en fazla üç eşdeğer düzeltme döngüsüdür. Bu kaliteyi üç denemede bırakmak değildir; aynı başarısız yaklaşımı körlemesine sürdürmemek içindir.

```text
Gereksinimi ve gerçek baseline'ı oku
→ uygulanacak somut sahne/iş akışını seç
→ kapsamlı fakat sınırlı diff yap
→ güncel focused test + gerçek ekran/motion kanıtı al
→ bağımsız kabul eşlemesi ve regresyon incelemesi yap
→ başarısızsa finding aç, kök nedeni sınıfla, düzelt
→ başarılıysa ilgili fazı kapat; bağımlı faza ilerle
```

**Hata sınıfları:** Uygulama kusuru, belirsiz gereksinim, mimari uyumsuzluk, yanlış test oracle'ı, ortam problemi, eksik gerçek varlık, stale kanıt, bağımsız değerlendirme uyuşmazlığı.

Aynı bulgu iki kez geri gelirse sınıflandırma zorunlu. Üçüncü eşdeğer döngüden önce mimari değişim, oracle düzeltmesi, yeni varlık üretimi veya somut blocker kararı gerekir. “Bir kez daha delay ekledim” diye tekrar çalıştırılmaz. Test yanlışsa kanıtla düzeltilir; hedefi küçülterek yeşile çevrilmez. GPU cihazı veya gerekli model yoksa engel raporlanır; hayali ölçüm üretilmez.

### Fazın iki anahtarı

- **Uygulama anahtarı:** İstenen diff/varlık gerçekten var; ilgili güncel testler geçiyor; forbidden scope yok; ekran/video kanıtı gereksinime bağlı.
- **Bağımsız anahtar:** QA, builder'ın “bitti” özetini kabul etmek yerine gereksinim, gerçek diff ve olumsuz yolları inceliyor. Sahne etkisi görsel olarak değerlendiriliyor. Gerekli performans/frontend/security kanıtı çözümlenmiş.

Moderate/High faz, iki anahtar olmadan `PHASE_VERIFIED` olamaz. Bağımsız reviewer adayı değiştirirse artık o hash'in yazarıdır; yeni hash için yeni bağımsız inceleme gerekir. Saf rapor/düşük risk artifact doğrulaması için gereksiz ajan tiyatrosu yapılmaz.

`IMPLEMENTED` ≠ `VERIFIED` ≠ `PHASE_VERIFIED` ≠ `RELEASE_VERIFIED` ≠ merged ≠ canlı yeni link. Yeni ortak değişiklikten etkilenen kanıt STALE olur. Her şeyi baştan test etmek de eski yeşili yeni sürüme taşımak da varsayılan değildir; etki analizi yapılır.

### Finding Ledger zorunlu alanları

`FIND-ID`, ilgili REQ/phase, önem, gözlenen sonuç, beklenen sonuç, kaynak/asset/build kimliği, ekran/trace, kök neden, çözüm, tekrar test, bağımsız kapanış. Görsel bulgu da finding'dir: “Model oyuncak plastik gibi”, “Gogade render edilmemiş”, “NEXUS seçimi sahneyi değiştirmiyor”, “Kalite belgesi artık okunmuyor” kayıt dışı bırakılamaz.

## SEC-13 — 7.0+ adaylığını değerlendirme: ölçülebilir ilerleme, dürüst puan

Kullanıcının 5.5–6.5 öz değerlendirmesi başlangıç görüşüdür; bu rapor ölçülmüş resmi bir site puanı üretmez. Kullanıcının verdiği ağırlık modeliyle planlama yapılır: Design %40, Usability %30, Creativity %20, Content %10. Ödül koşulları başvuru öncesinde Awwwards'ın o günkü resmi sayfasından yeniden doğrulanır; iki oylama ayağına ilişkin bütün ayrıntılar burada güncel teyit edilmiş kabul edilmez.

Bu ağırlıklarla yalnız kullanılabilirliği 6.5'ten 8'e çıkarmak toplamı 0.45 artırır. Tasarımda +1 ve yaratıcılıkta +1 ise toplamda 0.60 artırır. Bu matematik, istenen sıçrama için sanat yönetimi ve özgün sahnelerin neden öncelik olduğunu gösterir; yapılacak işlerin kesin puan getirisini tahmin etmez.

### Resmi olmayan iç hedef

| Kriter | İç hedef | Bu hedefi destekleyen görünür sonuç |
|---|---|---|
| Design | 7.5 | Gerçek marka/font, aydınlık metal kompozisyonu, ölçek farkı, 12 bandın ritmi, konuya göre iç sayfa aileleri. |
| Usability | 8.0 | Hızlı ilk içerik, kolay teklif, doğru navigation, mobile/reduced eşdeğeri, hata yolları ve ölçülmüş performans. |
| Creativity | 7.3 | Geometri dönüşümü, prob–kayıt sahnesi, seçime bağlı NEXUS ve işlevsel CAD brief ilişkisi. |
| Content | 7.5 | Doğru teknik metin, net örnek statüsü, gerçek PDF/medya, uydurulmamış sonuçlar, güçlü konu anlatısı. |

Bu örnek iç hedeflerin ağırlıklı toplamı **7.61**'dir. Bir ölçüm veya ödül tahmini değil, 7.0 çevresinde kıl payı başarı aramak yerine tasarıma pay bırakmak için seçilen çalışma hedefidir. Dış jüri bu hedeflerden daha düşük veya farklı puan verebilir.

### Bağımsız görsel değerlendirme

Mümkünse en az üç, tercihen altı bağımsız değerlendirici: sanat yönetimi/motion uzmanı, ürün/UX uzmanı ve endüstriyel satın alma veya mühendislik kullanıcısı perspektifleri. Eski/yeni sürümler A/B sırası değiştirilerek sunulur. Her değerlendiriciye aynı route/state ve kısa görev verilir; “ödüllük yaptık” diye çerçevelenmez.

1. İlk 10 saniyede ne satıldığı, marka ve ana teknik nesne anlaşılabiliyor mu?
2. Hero hareketi teknik anlam taşıyor mu; sıradan floating-object demo'sundan ayrılıyor mu?
3. Sayfanın ortasında ve sonunda yeni bir fikir var mı; yalnız baştaki efekt mi güçlü?
4. NEXUS beş adımı gerçekten farklılaştırıyor mu; bir dashboard resmi mi?
5. İç sayfalar özgün konu düzeni taşıyor mu; generic detay şablonu mu?
6. Açık renk yönü metal kalitesini güçlendiriyor mu; kontrast ve okunurluk doğru mu?
7. Dosya/teklif görevi karışık mı; 3D işi kolaylaştırıyor mu?
8. Şirketin teknik iddiaları ve örnek içerikleri ayırt ediliyor mu?
9. Motion kapalıyken düzen hâlâ güçlü mü?
10. Ziyaretçinin hatırladığı bir Mas Technic fikri var mı?

P24 için önerilen iç kapı: kriter medyanlarından hesaplanan ağırlıklı skor en az 7.3; Design ve Creativity medyanları en az 7.0; kritik kullanılabilirlik/gerçeklik kusuru yok. Değerlendirici grubu gerçek jüri değildir ve temsilî sayılmaz. Grup yoksa “bağımsız sanat yönetimi kapısı çalışmadı” yazılır; model kendi verdiği 7.6'yı dış kanıt saymaz.

### Eski/yeni gerileme matrisi

| Yüzey | İlerleme kanıtı | Kabul edilmeyen gerileme | Düzeltme yönü |
|---|---|---|---|
| Hero | Nesne büyük, metal gerçek, feature ilişkisi canlı | CTA kaybolmuş, küçük ekran dolmuş, metin uzun süre gizli | Kadraj/pin süresini azalt; DOM bilgi katmanını sabitle. |
| 12 bant | Ritim ve kompozisyon farklılaşmış | Bant eksilmiş, NEXUS taşınmış, bilgi sayacı uydurulmuş | Yapı/data kilidini geri uygula; görsel alan içinde çöz. |
| NEXUS | 5 ayrı belge/operasyon durumu | Sadece ilk adım yapılmış; demo belirsiz; keyboard bozuk | State/event sözleşmesini düzelt; tüm durumları ayrı kanıtla. |
| İç sayfalar | Konuya bağlı medya ve yerel indeks | Aynı dev boş hero tüm sayfalara yayılmış | Aile/konu modülü değiştir; medyayı içerik yoğunluğuna bağla. |
| RFQ | İnceleme ve teknik brief kolaylaşmış | Dosya/submit daha yavaş; viewer zorunlu | Lazy opt-in, worker/iptal, formdan bağımsız render. |
| Performans | Güçlü sahne bütçe içinde | Ağ yükü/CLS/frame maliyeti kötüleşmiş | Tekniği optimize et; anlamsız ağır pass'i çıkar; çekirdek sahneye iyi render fallback üret. |
| Marka | Logo ve Gogade gerçekten görünür | Font fallback, yanlış logo veya aşırı küçük marka | Varlık/font/metric düzelt; dosya eksikse blocker. |
| İçerik | Gerçek teknik bağlar ve dosyalar | Onaysız sonuç/sertifika/tesis görseli | Kaynak kaydı, örnek etiketi, yetkili gerçek varlık. |

**Minimum görünür değişim eşiği:** İlk viewport'ta ve 08/11'de belirgin yeni sahne; font/logo/paletin gerçek uygulanması; en az altı public page family'nin konuya bağlı düzeni; bütün public URL'lerin korunması; RFQ'da işlevsel fayda. Bu eşik sağlanmadan “7.0+ hazır” ifadesi kullanılmaz. Daha çok hover ve 10 px reveal bunu karşılamaz.

## SEC-14 — Yayın, kaynak güncellemesi ve yeni linkin doğrulanması

1. P24'ten geçen adayın source/asset kimlikleri sabitlenir. Mevcut kullanıcı değişiklikleri ve repo kuralları korunarak source commit/PR hazırlanır. Merge edilmiş olmak yayınlanmış olmak değildir.
2. Build aynı kaynak ve varlıklarla alınır. Gerçek output envanteri/hash kaydedilir. `index.html`, deep route HTML'leri, asset referansları, robots ve hosting metadata aynı sürümü taşımalı.
3. Native Site/Git sync kullanılıyorsa o aracın mevcut yönergeleri okunur. Dizini atomik yeniden adlandırıp önceki tracked kök dosyalarını istemeden bırakma olasılığı kontrol edilir. Kök giriş ve route dosyaları, bütün payload ile gerçekten güncellendi mi karşılaştırılır.
4. Önceki sürüm/deployment ID ve rollback yolu tutulur. Gizli değerler release manifest'e yazılmaz.
5. Yeni site version/deployment oluşturulur. `succeeded` durumu alınır; sonrasında canlı UI doğrulaması yapılır.
6. Yeni link ikinci tabda ve uygun cache koşuluyla açılır. Hero'da yeni geometri/font/marka; 08'de prob sahnesi; 11'de 5 seçime bağlı durum; `/teklif-al` ve bir iç sayfa ailesi canlı kontrol edilir. 12 bandın tümü hâlâ vardır.
7. Build kimliği ile Site version/deployment hash eşleşir. Ürün arayüzüne ziyaretçi için anlamsız debug build rozetleri eklemek yerine release manifest/test metadata kullanılır.
8. Finalde yeni `chatgpt.site` URL'si, doğrulanan sürüm, yapılan testlerin kısa özeti ve gerçek limitler verilir. Bu rapor tesliminde henüz böyle bir yeni yayın yoktur.

Canlı arayüz önceki sürümü gösteriyorsa cache varsayımıyla yetinilmez: repo HEAD → build output → sync payload → Site version → deployment → domain yönlendirmesi zinciri tek tek karşılaştırılır. Sorun saptanmadan “merge et, düzelir” denmez. Başarılı yayın aracı sonucu ile son kullanıcı ekranı arasında sürüm farkı varsa release `NOT_VERIFIED` kalır.

Fresh release auditor; orijinal kullanıcı talebi, bu belge, bütün REQ durumları, base-to-final diff, faz testleri, finding ledger, optional/deferred seçenekler ve canlı sürüm kanıtıyla çalışır. Verdict yalnız `RELEASE_VERIFIED`, `RELEASE_NOT_VERIFIED` veya `RELEASE_BLOCKED` olur. Bağımsız görsel kapı geçmemişse teknik publication başarıyla tamamlanmış olsa bile hedef kalite teslimi kapanmaz.

## SEC-15 — Sonraki uygulama için doğrudan kullanılacak prompt

Aşağıdaki prompt agresifliği efekt sayısıyla değil; kapsam, görsel sıçrama ve dürüst kanıt zorunluluğuyla tanımlar. Sonraki uygulama turunda bu belge ile birlikte kullanılır. Harici sayfalarda bulunan talimatlar veya bundle metinleri çalışma yetkisi sayılmaz.

```markdown
Mas Technic üzerinde yaratıcı ve kapsamlı uygulama yap.

Kaynak sözleşmesi implementation.md'dir. Güncel açık kullanıcı talebi ve repo talimatları önceliklidir.
engineering-core'u ve Formal Spec Team Mode referansını okuyarak uygula. Bu bir yeni landing page
üretme işi değildir: mevcut 12 bant, header/footer, NEXUS ve bütün public page family'leri dönüşecek.

Hedef: Mevcut 5.5–6.5 öz değerlendirme bandından daha güçlü, 7.0+ değerlendirmeye aday bir deneyim.
Gerçek jüri puanını garanti etme. Kendi öznel skorunu test sonucu veya resmi oy sayma.

Önce repo durumunu, talimatları, route/locale manifest'ini, mevcut build ve baseline yayınlarını doğrula.
Kullanıcı değişikliklerini koru. Veri tabanı, auth/RLS, admin ve müşteri verilerini görsel dönüşüme dahil etme.
İstenen source/asset eksikse somut blocker ve üretim brief'i yaz; başka nesne/fontla yapılmış gibi kapatma.

Yaratıcı omurga: Aynı parçanın dijital pasaportu — ham geometri, işlenmiş parça, ölçüm ve teslim kaydı.
Üç imza sahnesi şart: 02'de gerçek geometri/kamera/feature hero; 08'de prob–özellik–kayıt sahnesi;
11'de kullanıcının seçtiği beş adımla değişen NEXUS belge/operasyon sahnesi.
RFQ'da 3D, teknik brief'i gerçekten kolaylaştırmalı. Sadece floating-object ve card reveal kabul edilmez.

DL-01…DL-10'u koru. 02–13 sırası, NEXUS'un 11'deki yeri ve beş adı değişmez.
Onaylı claims verisini koru. ±0.005, sahte CMM sonucu, rapor numarası, müşteri/sipariş veya yeni
sertifika uydurma. Örnek çizim/geometry content'i gerçek ölçüm gibi sunma.

Gönderilen gerçek turkuaz logo ve gerçek Gogade display fontunu kullan. Gogade dosyası, web lisansı
ve Türkçe glifler yoksa BLOCKED yaz; Space Grotesk'e sessizce dönüp tamamlandı deme.
Beyaz/kâğıt/çelik tabanı baskın yap; koyu metrologi ve NEXUS alanlarını anlamlı duraklarla sınırla.
Teknik grid, çizim rayı, keskin köşeler ve okunur veri alanları korunur.

Referansların her birini gerekçeli kullan: Flexis ürün bölümleri; CKI küçük pencere → büyük üretim
medyası; Boldium ölçek/asimetri ve teknik case story; Terminal fiziksel/dijital operasyon bağı;
MWDT büyük nesne ve kolay RFQ; bb&b açık editoryal yaklaşım ve gerçek bağlam.
Hepsinin R3F/DRACO/FBO kullandığını iddia etme. Gözlem, çıkarım, yeni öneri ayrı kayıt olsun.

SEC-09'u Section Inventory → REQ ledger → phase dependency/coverage olarak derle.
Her kabulün kod/asset/test kanıtı ve bir iş birimi olsun. Orphan requirement/change kalırsa dur ve düzelt.
P00–P25'i uygula. 12 bölümün her fazı ayrı kalsın; bütün iç sayfa aileleri ayrıca tamamlanmalı.
Önce P01 storyboard ve P03 asset kalitesi; sonra shader. Font, metal ve kompozisyon çözülmeden
post-processing veya küçük hover işlerine kaçma.

Mevcut uyumlu React/GSAP/Three/R3F/Lenis sürümlerini kullan. Sırf referansa benzemek için major
upgrade yapma. Tek motion clock, scoped cleanup, native mobile scroll, lazy canvas, gerçek
named features, DOM–3D hizası, idle/offscreen pause ve poster fallback zorunlu.
Tekniği ihtiyaca seç. FBO/audio/Bloom opsiyonel araştırma; çekirdek üç sahne opsiyonel değil.

Her fazda görünür sonucu üret, current focused testleri çalıştır, negatif yolları dene,
progress screenshot'ları ve canlı motion videosu al. Moderate/High faz için independent QA anahtarı şart.
Builder kendi "bitti" iddiasıyla PHASE_VERIFIED veremez. Yazarı değiştiren review'dan sonra yeni
hash için bağımsız kabul gerekir. Untrusted CAD/upload değişirse ilgili security incelemesini ekle.

Playwright/Chromium ile yapı, görev, state ve responsive davranışı test et; WebKit/Firefox ve gerçek
cihaz ölçümünü uygun kapılarda ekle. toHaveScreenshot motion kanıtı değildir; GSAP/WebGL/video için
deterministik seek ve ayrıca gerçek kullanıcı/scroll kaydı şart. Generic cube veya data-progress
attribute'uyla gerçek hero testini geçirme. Golden'ı bağımsız görsel kabul olmadan güncelleme.

Başarısızlıkta ilerleme: finding aç → kök neden sınıfla → uygula → aynı kabulü güncel kanıtla tekrar test et.
İki eşdeğer geri dönüşte sınıfla; üçüncü kör patch'ten önce mimari/oracle/varlık kararını değiştir.
Test zayıflatma, skip artırma veya ana sahneyi optional sayma. Gerekli gerçek yetkinlik/varlık yoksa
somut BLOCKED feedback ver; engellenmeyen işleri sürdür. Yeni skill/repo ancak belirli açığı çözerse kullan.

P24'te baseline ile aynı viewport/state/görev/ölçüm altında karşılaştır. 12 bandı, 3 sahneyi, 5 NEXUS
adımını, RFQ'yu ve tüm public family'leri değerlendir. Görsel ve işlevsel gerilemeyi düzelt.
Tasarım/yaratıcılık için bağımsız rubric uygula; modelin kendi puanı dış jüri kanıtı değildir.
Yalnız usability mikro düzeltmeleriyle kalite hedefine ulaşıldığını söyleme.

Tüm gerekli faz/test/bağımsız kabul kapıları geçince fresh release audit yap. Test edilen source,
asset, build output, Git/PR ve Site deployment'ın aynı sürüm olduğunu kanıtla. Yeni chatgpt.site
linkini ikinci tabda açarak üç sahne ve deep routes'ı canlı kontrol et. Eski Vercel'i yeni teslim diye verme.

Finalde somut değişiklik, testler, remaining limits, yeni doğrulanmış link ve engineering-core
Execution Summary ver. Gerçek ödül/7.0 puanı garanti etme; tamamlanmamış fazı tamamlandı sayma.
```

### Promptun dayandığı güncel uygulama ilkeleri

OpenAI'nin frontend rehberi, mevcut markaya ve kullanım bağlamına dikkat etmeyi ve konuya özgü görsel varlıkları vurguluyor. Uzun görev rehberi hedef, kısıt, teslimat, milestone kabulü ve sürekli doğrulamayı kalıcı dokümanlarla bağlamayı örnekliyor. Bu rapor bu ilkeleri mevcut Mas Technic'in kullanıcı kilitlerine uyarlıyor; model adına dayalı bir performans sözü vermiyor. Harici genel tasarım önerisi, kullanıcının 12 bölüm ve mevcut wireframe talebini geçersiz kılmıyor.

## SEC-16 — Kaynak ve doküman dizini

**Erişim tarihi:** 11 Ekim 2026. Referans site versiyonları zamanla değişebilir; incelenen canlı görünüm, kullanıcının önceki ödül/versiyon örneğiyle aynı olmak zorunda değildir. Altı sitenin hepsinin SOTD aldığı bu raporda iddia edilmiyor.

### Kamuya açık referans sayfalar

| Kaynak | Ana sayfa | İncelenen ilgili iç sayfa |
|---|---|---|
| R-FLEXIS | https://flexis-mobility.com/ | https://flexis-mobility.com/our-vehicles/ |
| R-CKI | https://www.cki-group.jp/ | https://www.cki-group.jp/technology/ |
| R-BOLDIUM | https://boldium.com/ | https://boldium.com/work/autodesk-fusion-360/ |
| R-TERMINAL | https://terminal-industries.com/ | https://terminal-industries.com/yard-efficiency-calculator |
| R-MWDT | https://mwdtinc.com/ | https://mwdtinc.com/capabilities/cnc-machining/ |
| R-BBB | https://www.bb-b.net/ | https://www.bb-b.net/references/zonegreen |

### Birincil teknik dokümanlar

| Kaynak | URL | Bu rapordaki kullanım |
|---|---|---|
| engineering-core | https://github.com/aydinogluomer-sys/engineering-core | Kaynak temelli çalışma, risk, loop, phase/release ayrımı, iki anahtar. Yerel SKILL ve Formal Spec Team Mode okundu. |
| GSAP ScrollTrigger | https://gsap.com/docs/v3/Plugins/ScrollTrigger/ | Scrub semantiği, velocity, scope/cleanup, responsive/pin kararları. |
| GSAP SplitText | https://gsap.com/docs/v3/Plugins/SplitText/ | Font/resize, mask/autoSplit, aria davranışı ve seçili kinetik metin. |
| Lenis resmi repo | https://github.com/darkroomengineering/lenis | GSAP integration ve tek clock yaklaşımı. |
| R3F performance | https://r3f.docs.pmnd.rs/advanced/scaling-performance | Demand/invalidate, reuse/instancing ve performans uyarlaması. Mevcut React/R3F sürümüyle uyumluluk ayrıca kontrol edilecek. |
| Drei useGLTF | https://drei.docs.pmnd.rs/loaders/gltf-use-gltf | Model loading/DRACO decoder davranışı ve varlık sınırı. |
| Three DRACOLoader | https://threejs.org/docs/pages/DRACOLoader.html | Geometri sıkıştırma kapsamı, decode tradeoff ve decoder reuse. |
| Three CatmullRomCurve3 | https://threejs.org/docs/pages/CatmullRomCurve3.html | Önerilen sınırlı kamera yayı. |
| Playwright visual comparisons | https://playwright.dev/docs/test-snapshots | Stabil screenshot, platform/ortam ve golden yaklaşımı. |
| Playwright toHaveScreenshot API | https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-1 | CSS/Web Animations kontrolünün GSAP/WebGL/video'dan ayrılması. |
| Core Web Vitals | https://web.dev/articles/vitals | LCP/INP/CLS hedefleri, p75 ve field/lab ayrımı. |
| Gogade birincil satıcı | https://www.creativefabrica.com/product/gogade/ref/777922 | Gerçek fontun kimliği; edinilecek dosya/web lisansı/glif doğrulaması için başlangıç. Satın alma/lisans sözleşmesi bu turda kabul edilmedi. |
| OpenAI frontend guidance | https://developers.openai.com/api/docs/guides/frontend-prompt | Marka/bağlam ve konuya özgü UI ilkeleri; modelden bağımsız uyarlama. |
| OpenAI uzun görev rehberi | https://developers.openai.com/blog/run-long-horizon-tasks-with-codex | Kalıcı hedef ve faz doğrulaması; rapor/runbook düzeni. |
| Awwwards evaluation | https://www.awwwards.com/about-evaluation/ | Önceki konuşmada kullanılan ağırlık bağlamı; bu rapor turunda yeniden açma zaman aşımına uğradı. Başvuru öncesi güncel kurallar tekrar doğrulanmalı. |

### İncelenen yerel kaynaklar

Repo kökü: `/workspace/scratch/c49d41d5da0d/Mas_Technic`. Kaynak referansları bu köke göre relatiftir. Yerel HEAD `ef0575e99da98aae767772da5b661579b9dd69ea`; önceden mevcut dirty çalışma bu HEAD'den farklıdır. Bu rapor onu korur ve o farkları kendi yaptığı değişiklikler gibi sunmaz.

- `docs/quality/mas-technic-awwwards/reference-motion-fit.md`
- `src/components/technical-landing/TechnicalLanding.tsx`, `TechnicalHero.tsx`, `ProcessNexusProjects.tsx`, `FinalSections.tsx`, `ProofStrip.tsx`, `MarqueeBand.tsx`
- `src/data/technicalLandingData.ts`, `src/content/claims.ts`, `src/content/caseStudies.ts`
- `src/hooks/useTechnicalLandingMotion.ts`, `src/hooks/useInspectionMotion.ts`
- `src/components/rfq/cad/CadStage.tsx`, `src/pages/TeklifAl.tsx`
- `src/styles/design-tokens.css`, `fonts.css`, `technical-landing.css`, `shell.css`
- `scripts/quality/route-table.ts`, `routes-manifest.ts`, `src/lib/detail-route.ts`
- `package.json`, mevcut e2e test dizinleri ve asset envanteri
- Kullanıcının logo ve font referansı: `upload/02-87562.jpg`, `upload/10-166586.jpg`; diğer gönderilen referans görsellerinin görsel yönü konuşma bağlamında korunur.

## Rapor tesliminin doğrulaması

Bu dokümanın teslim kontrolü, 12 BAND tanımının, altı referansın, P00–P25 fazlarının, REQ-001–046 coverage kaydının, T01–T15 test ailelerinin ve kaynak dizininin varlığını/bağlarını kontrol eder. Markdown yapısı ve repo içerik fingerprint'i ayrıca doğrulanır. Bu, burada önerilen sitenin testlerinin geçtiği veya yeni site yayınlandığı anlamına gelmez.

### Execution Summary

Policy: engineering-core  
Risk: Low  
Status: VERIFIED  
Changed: Bu implementation.md raporu oluşturuldu; uygulama, backend ve canlı yayın değiştirilmedi.  
Verified: Rapor kapsamı/Markdown yapısı ve kaynakların değişmeden kaldığı doğrulandı. Referans gözlemleri ile öneriler ayrıldı.  
Limitations: Gerçek jüri puanı garanti edilemez. Uygulama fazları/testleri çalıştırılmadı; hero geometri/metal varlıkları ve lisanslı Gogade girdisi eksik. Bu turda yeni site linki üretilmedi.

