# 07 · Motion System — Mas Technic

## Temel İlke
Her animasyon işlevsel: yönlendirme, hiyerarşi, geri bildirim. Dekoratif yok.

---

## Scroll: Lenis → GSAP Sync

```typescript
// SmoothScrollProvider.tsx — tek doğru yer
const lenis = new Lenis({ lerp: 0.065, duration: 1.4, wheelMultiplier: 0.75 })
window.__lenis = lenis
lenis.on('scroll', () => ScrollTrigger.update())
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
// Mobile (<768px): Lenis yok, native scroll
// Admin/müşteri panel: Lenis devre dışı
```

## ScrollTrigger Pattern
```typescript
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 80%', scrub: 1 },
      y: 60, opacity: 0, duration: 0.8, ease: 'power3.out'
    })
  }, containerRef)
  return () => ctx.revert()
}, [])
```

---

## Hero 4-Phase Choreography

- **Phase 1 (0–45%):** MAS mask grows, content fades up, header hides
- **Phase 2 (45–60%):** PAUSE — section pinned, no change
- **Phase 3 (60–88%):** Horizontal slide — Hero ←, QuickQuote → (100vw each)
- **Phase 4 (88–100%):** Lava pour (`--lava-fill` 0→100%) + heat distortion

---

## Reveal Primitives

| Pattern | Hook | Detay |
|---------|------|-------|
| Clip-Path | `useClipReveal` | `inset(0 100% 0 0)` → `inset(0)`, 0.9s, industrial ease |
| Split Text | `useSplitTextReveal` | Char-bazlı, stagger 0.035s, rotateY 90→0 |
| Batch Stagger | `useStaggeredReveal` | `ScrollTrigger.batch()`, 3 per batch, 0.08s stagger |

---

## Page Transition

```
Mevcut:  exit 0.6s / enter 0.6s, single overlay
Phase 4: exit 0.4s / enter 0.6s, forge-teal (std) / forge-molten (CTA)
```

---

## Mikro-Etkileşimler

- **MagneticButton:** Mouse follow %30, spring stiffness:120 damping:18
- **Card hover:** `translateY(-4px)` + molten border glow, 0.25s industrial ease
- **brutal-link:** `scaleX(0→1)` underline, 0.4s industrial ease

---

## Süre Ölçeği — üç seviye, dördüncüsü yok

| Seviye | Süre | TS | CSS | Ne zaman |
|--------|------|----|-----|----------|
| micro | 0.22s | `MOTION_LEVEL.micro` | `--tl-dur-micro` | Tek bir kontrolün yanıtı: hover, focus, toggle |
| standard | 0.35s | `MOTION_LEVEL.standard` | `--tl-dur-short` | Varsayılan: bir öğe girer, çıkar, çözülür |
| cinematic | 0.62s | `MOTION_LEVEL.cinematic` | `--tl-in` | Sadece anlatı anları: menü açılışı, bant girişi |
| (stagger) | 65ms | `MOTION_STEP` | `--tl-step` | Kardeşler arası gecikme — süre değil |
| reduced | 0 | `MOTION_REDUCED` | — | Kapalı, "hızlı" değil |

`NAV_MOTION` (menü) aynı üç değerdir: `micro` / `close` / `open`.
Ölçeğe oturmayan bir süre yeni bir seviye değil, yanlış sınıflanmış bir
seviyedir; istisna ancak ölçülmüş bir gerekçe yorumuyla kalır
(`ROUTE_TRANSITION.holdDuration`).

Eğrisi iki tane: `MOTION_EASE.enter` (`--tl-ease-out`, GSAP'te `power3.out`)
ve `MOTION_EASE.precision` (kesme/klip). Üçüncüsü yok.

---

## Reduced Motion (Zorunlu)

**Framer Motion kullanan her şey `@/components/shell/motion`'dan `motion`
import eder — `framer-motion`'dan DEĞİL.** Bu primitive, kullanıcı reduced
motion istediğinde reveal'i animasyonun biteceği duruma anında çözer
(`initial=false`, `whileInView` → `animate`, `viewport` düşer, süre 0).

Neden: `whileInView` IntersectionObserver'a bağlıdır ve Framer bu kapıyı
reduced-motion için kaldırmaz. Sonuç, bozulmuş animasyon değil, **kaybolmuş
içerik** olur (defect B28: `/hizmetler/cnc-frezeleme` 186 metin öğesi).

```typescript
// GSAP tarafı — değişmedi
const prefersReduced = usePrefersReducedMotion()
if (prefersReduced) { gsap.set(el, finalState); return }
```
CSS: `@media (prefers-reduced-motion: reduce) { ... }`

Doğrulama: `node scripts/motion-audit.mjs --mode=rest` (içerik gizli mi),
`--mode=enabled` (karşı kanıt: reveal'ler hâlâ çalışıyor mu),
`--mode=guard` (kimse primitive'i atlamış mı).

---

## Motion Ritmi (Section Düzeni)

```
Hero/CNCStory/Industries/FinalCTA → HIGH
HowWeWork/Capabilities          → CALM
Services/Materials              → MEDIUM
Testimonials/FAQ                → LOW (silence zone)
```
En az bir silence zone zorunlu.

---

## Hareket Dilbilgisi — İÇERİK TÜRÜNE göre, banda göre değil

Süre ölçeği bir hareketin NE KADAR sürdüğünü söyler; dilbilgisi NE OLDUĞUNU
söyler. Bir bandın nasıl geldiği, ne taşıdığını anlatmak zorundadır. Aksi
hâlde hareket anlam değil gecikme ekler — nitekim eski katmanda 03, 05, 06,
07, 10, 12, 13 ve 14 aynı `opacity` + `translateY` çiftini kullanıyordu.

Eşleme **türe** bağlıdır: aynı türden içerik taşıyan yeni bir bant yeni bir
dil icat etmez, aşağıdakini konuşur.

| # | Dilbilgisi | İçerik türü | Jest | Nerede (`styles/technical-landing.css`) |
|---|-----------|-------------|------|------------------------------------------|
| G1 | **DRAW → LOCK** | teknik çizgi işi | çizgi çizilir, değeri ucuna basılır | 02 hero kılavuz çizgileri + ölçü kutuları; 10 ıslak imza |
| G2 | **PRINT** | kâğıt kanıt | sayfa yukarıdan aşağı ortaya çıkar, dikey yol YOK | 07 ölçüm raporları, 10 sertifikalar |
| G3 | **EXPOSE → CALIBRATE** | koyu cihaz paneli | panel raydan sağa açılır, sonra sayılar netleşir | 06 NEXUS |
| G4 | **RESOLVE → VERIFY** | veri tablosu | satırlar çözülür, SONUÇ hücresi en son yazılır | 06 iş emirleri, 07 ölçüm tabloları |
| G5 | **REVEAL** | görsel | perde + ≤1.07 ölçek oturması | 05 süreç, 08 sektörler, 09 manifesto |
| G6 | **SETTLE** | düz metin — sessiz varsayılan | opaklık + ≤10px yol, `--tl-dur-short` | 03, 05 adımlar, 11, 12, 13 tabanı, 14 |

Beşinin hiçbirini hak etmeyen her şey G6'dır. G6 bir başarısızlık değil,
varsayılandır.

### Üç zirve — ve bedeli

Sayfada tam olarak üç büyük an vardır. Dördüncüsünü eklemek üçünü birden
küçültür.

1. **02 HERO** — parça kahramandır: karanlıktan çıkar (`tl-part-expose`),
   ölçülür (`tl-draw-measure`), değerleri kilitlenir (`tl-label-lock-*`).
   Sayfanın tek anlamlı etkileşimi de buradadır: bir ölçünün üzerine gelmek o
   ölçünün kılavuz çizgisini ve pasaporttaki karşılığını birlikte aydınlatır,
   kalanı geri çeker. Yeni sekme durağı açmaz — zaten görünen iki bilgiyi
   ilişkilendirir, hiçbirini gizlemez.
2. **09 MANİFESTO** — "Hassasiyet iddia edilmez. **Ölçülür.**" İddia
   canlandırılmaz, ölçülür: sözcüğün altında iki uzatma çizgisi dışarıdan
   içeriye kapanır, sonra sözcük harf aralığını toplayarak yerine oturur.
3. **13 RFQ** — devir teslim: bırakma alanı ortadan dışa doğru açılır.

Zirveleri korumak için **bilinçli olarak susturulanlar**: 03 (dikey yol
kaldırıldı, .62s → .35s), 04 (görüş alanı dışında durdurulur), 11 (altı ayrı
gecikme tek blok geçişine indi), 12 (yol kaldırıldı).

### Mobil = daha az şey, daha yavaş değil

G2–G5 ve iki zirvenin destek katmanları `@media (min-width: 768px)` içindedir.
Mobilde animasyonlu **birim değişir**: tek tek kart/hücre/satır değil, onları
taşıyan kap tek bir sessiz geçişle gelir. Manifesto zirvesi mobilde de durur
ama tek jeste iner (başlığın satır açılışı).

Ölçüldü — `node scripts/motion-audit.mjs --mode=density`:

| | 1280 | 375 |
|---|---|---|
| `transitioned` | 132 | 58 |
| `animated` | 9 | 5 |
| `transformed` | 23 | 15 |

`e2e/landing/motion-grammar.spec.ts` bu farkı bir eşikle değil bir
KARŞILAŞTIRMAYLA sabitler; eşik, ikisi birbirine yaklaşırken bile geçmeye
devam ederdi.

---

## Performans Kuralları

- Sadece `transform` ve `opacity` animate et
- `width/height/top/left` animate etme (CLS + reflow)
- `will-change: transform` sadece animate edilen elementlerde
- `ScrollTrigger.batch()` — per-element yerine
- Three.js canvas → IntersectionObserver ile lazy

### Phase 05b'de ölçülerek eklenenler

- **Büyük bir ögeyi `clip-path` ile açma — ÜZERİNE perde koy.** `clip-path`
  ögenin kendisini her karede yeniden boyatır; tablo, kaydırma kapsayıcısı
  veya filtreli görsel taşıyan bir panelde bu pahalıdır. Tek renk bir
  `::after` perdesini `scaleX`/`scaleY` ile toplamak aynı görüntüyü verir ve
  kompozitörde kalır. `clip-path` küçük ögelerde kalır (durum rozeti, sonuç
  hücresi) — orada metafor da tam oturuyor: hücre soldan sağa YAZILIR.
- **Kaydırmaya bağlı bir dönüşümün içindeki ögeye ikinci dönüşüm bindirme.**
  `ReverseScrollSection` + `filter` + CSS `transform` dört katmanlı bir yığın
  demektir.
- **Görüş alanı dışında iş yapma.** Sonsuz animasyonlar (`tl-marquee`) iki
  yönlü `.tl-onscreen` sınıfıyla durdurulur. Giriş koreografisinin sınıfı
  (`.tl-inview`) TEK yönlüdür ve öyle kalmalıdır: geri kaydırınca yeniden
  tetiklenen bir giriş, okunmuş içeriği yeniden gizler.
- **Odaklanabilir öge saran her `clip-path` `inset(-8px)` ile biter.**
  `inset(0)` kutuyu tam sınırından keser ve `:focus-visible` halkasını
  (`outline-offset: 4px`) yok eder.
- **Yerleşim animasyonu bir tanedir ve ölçülmüştür:** 09'daki
  `letter-spacing` kapanışı. Metafor onun kendisidir ve `transform` ile
  taklidi sözcüğü bulanıklaştırır. `--mode=cls`: manifesto hiçbir
  `layout-shift` girdisi üretmiyor, çünkü `strong` kendi satırındaki tek
  kutudur. İkinci bir örnek çıkarsa yeniden ölçülmelidir.

### CLS ölçümü nasıl okunur

`--mode=cls` **tek bir toplam basmaz**, çünkü tek bir toplam iddiayı
taşıyamaz. İddia nedensel — "hareket katmanı yerleşim kaydırmasına yol
açmıyor" — ama sayfanın toplam CLS'i hareketle ilgisi olmayan şeyleri de
içerir: giriş kabuğunun devir teslimi, geç gelen bir yazı tipi, yerine oturan
bir görsel. Bu yüzden her genişlik **iki kez** koşulur (hareket açık ve
`prefers-reduced-motion: reduce`) ve koşu iki yarıya bölünür: kaydırma
BAŞLAMADAN önce olan her şey YÜKLEME, sonrasında olan her şey bant
koreografisidir.

Ölçüldü, bu yapı üzerinde üç ardışık koşu:

| ölçüm | 1280 | 375 |
| --- | --- | --- |
| `scrollCost` (nedensel sayı) | 0.00000 / 0.00000 / 0.00000 | 0.00000 / 0.00106 / 0.00000 |
| `clsWhileScrolling`, hareket açık | 0 / 0 / 0 | 0 / 0.00106 / 0 |
| `manifestoEntries` | 0 / 0 / 0 | 0 / 0 / 0 |
| ham `cls`, hareket açık | 0.01915 / 0.02087 / 0.02087 | 0.01102 / 0.01291 / 0.01139 |
| ham `cls`, reduced-motion | 0.08544 / 0.06444 / 0.08207 | 0.01069 / 0.01070 / 0.01069 |

Okunuşu: **bütün landing baştan sona kaydırılırken ve her bandın girişi
oynarken tarayıcı hiçbir kaydırma girdisi bildirmiyor** — hareket açıkken de,
reduced-motion'da da. Raporlanacak sayı budur.

Ham toplam ise tek bir şeyi göstermek dışında işe yaramaz: **hareket açık koşu
reduced-motion koşusundan DAHA AZ kayıyor** (1280'de ~0.02'ye karşı
0.064–0.085). Fark hareket katmanından değil, giriş kabuğunun devir
tesliminden geliyor — reduced-motion yolunda en büyük iki girdi
`div.shell-state` (t≈185ms) ve `div.relative` (t≈541ms), yani landing kendi
koreografisine başlamadan önce. Ham toplamı "hareketin bedeli" diye
raporlamak bu yüzden yanlış olur; üstelik kendisi de tekrarlanabilir değil.

### Kare ölçümü nasıl okunur

`--mode=frames` üç geçiş koşar ve üçünü de basar, çünkü **aynı şeyi
ölçmezler**: 1. geçiş giriş koreografisinin bedelidir (ilk okuyucunun
gördüğü), 2.–3. geçişler `.tl-inview` tek yönlü olduğu için yerleşik
kaydırmadır. Bu yapıda ölçülen — 1280: 489 karede 12 yavaş kare, sonra 1 ve 0.

Ayrıca bu makinenin gürültüsü geniştir: değişmeyen bir yapı üzerinde ardışık
dört geçiş `over32ms` = 16 / 19 / 34 / 34 verdi. Bir farkı ancak bu aralığı
aşıyorsa **ve 1. geçiş 1. geçişle** karşılaştırılıyorsa ciddiye al. Her
sürümün her geçişinde sabit kalan tek sayı `median` = 16.7ms'dir.
