# Landing Page — SOTD Yolu

> Hedef: **Awwwards Site of the Day.** (CLAUDE.md'deki eski "Honorable Mention,
> SOTD değil" satırı 2026-08-13'te güncellendi.)
> Bu dosya, önceki turların kapanmış maddelerini ve SOTD için kalan gerçek
> boşlukları içerir. Her madde ölçümle/gözle doğrulanmıştır.

---

## Bu turda yapılanlar (ölçülü)

### Tasarım / görsel bütünlük

- [x] **Adaptif header.** En görünür kusurdu: sabit header `bg-background/90` ile
      temaya sabitliydi, ama landing koyu↔açık bölümler arasında geçiyor. Koyu
      sahnelerin üzerinde sert kenarlı açık bir şerit olarak duruyordu — her
      ekranda. Bölümlere `data-surface="dark|light"` eklendi; header altındaki
      yüzeyi rAF-throttled örnekleyip `.header-skin-dark/light` ile kontrastı
      çeviriyor. `[data-surface]` yoksa (diğer sayfalar) eski davranış korunur.
- [x] **Header tam genişliğe alındı.** Safe-area padding'i dış katmandaydı,
      şerit kenarlardan 16px içeride kalıp keskin köşeli, yapıştırılmış bir
      dikdörtgen gibi görünüyordu. Padding içeriğe taşındı.
- [x] **Başa dön kontrolü yeniden tasarlandı.** `bg-card` + `shadow-lg` yuvarlak
      FAB, brutalist/endüstriyel dile aykırıydı ve landing'in sabit paletiyle
      uyuşmuyordu. Keskin köşeli grafit cam oldu. Mobilde kart metnini
      örttüğü için gizlendi (sabit header + logo aynı erişimi veriyor).

### Performans (production build; Playwright + CDP throttling ile ölçüldü)

- [x] **Ekran dışı görseller ertelendi.** `ProcessProofCinema` 5 aşama görselini
      (~1 MB) mount anında yüklüyordu; üstelik masaüstü stack + mobil figür
      olarak **iki kez**. Kendi IntersectionObserver'ı eklendi (`data-ppc-src`,
      600px rootMargin) ve yalnız o breakpoint'te **görünür** varyant iniyor.
- [x] **`content-visibility: auto` (yalnız mobil).** Bölümler ilk boyamada mount
      ediliyor (anchor hedefleri için bilinçli tercih — `renderPhase=5` Codex'in
      işi değil, kasıtlı). Mobilde GSAP kapalı olduğundan ekran dışı bölümlerin
      layout maliyeti tarayıcıya atlatıldı; DOM'da kaldıkları için anchor'lar ve
      sayfa içi arama çalışıyor (4 anchor ayrıca test edildi).

- [x] **Kademeli mount.** `renderPhase` `useState(5)` ile başlıyordu; tüm
      bölümler tek seferde render ediliyor, mobilde ana thread bloklanıyordu.
      Hero (phase 1) önce boyanıyor, kalan fazlar `requestIdleCallback` ile
      hemen ardından geliyor. Etkileşim beklemiyor: doğrulandı, hiç scroll/tık
      olmadan 4 sn içinde **9 bölümün hepsi gerçek içerikle** mount oluyor.

Ölçülen etki (mobil değerler 3 koşunun medyanı, 4G + 4× CPU throttle):

| Metrik | Oturum başı | Şimdi | Hedef |
| --- | --- | --- | --- |
| Masaüstü LCP | 660–1788 ms | ~1200 ms | <2500 ✅ |
| Masaüstü TBT | 1046 ms | **785 ms** | — |
| Mobil FCP | — | **1580 ms** | — |
| Mobil TBT | 3448 ms | **1954 ms** (−43%) | — |
| Mobil en uzun görev | 2211 ms | **1122 ms** (−49%) | — |
| Mobil CLS | 0.0000 | **0.0000** | <0.1 ✅ |
| Mobil LCP | 5980 ms | **~4500 ms** (−25%) | <2500 ❌ |

Ek olarak hero görseli `index.html`'de `preload` ediliyor (React render edene
kadar keşfedilmiyordu).

### Doğrulama

`tsc` 0 hata · `eslint` **0 uyarı 0 hata** (588'den) · `npm run build` temiz ·
`axe` (wcag2a+aa, tam sayfa) **0 ciddi/kritik ihlal**

---

## ✅ ÇÖZÜLDÜ — mobil LCP hedefi tutuyor

**Mobil LCP 4500 → 1664 ms** (hedef <2500). Çözüm prerender/hydration değil,
**app-shell hero** oldu.

`index.html` içine, React'ten bağımsız, ilk boyamada görünen bir hero bloğu
kondu (`#hero-shell`): tam ekran koyu zemin + "MAS TECHNIC" tipografisi,
gerçek hero'nun ölçüleriyle birebir. `LandingFlow` mount olunca iki rAF
sonra siliniyor; React'in hero'su aynı boyutta olduğu için yeni bir LCP
adayı tetiklenmiyor ve erken LCP korunuyor.

**Bu yaklaşım oturumun başında bir kez denenip başarısız olmuştu.** Nedeni
sonradan bulundu: kabukta `contain: layout paint` kullanılmıştı ve
**`contain: paint` elemanı LCP adaylığından çıkarıyor.** O satır kaldırılınca
çalıştı. (Ders: app-shell'de `contain` kullanma.)

İki ek düzeltme gerekti:

- Kabuk `position: fixed; inset: 0` olduğu için diğer rotalarda ekranı
  kaplıyordu → `main.tsx` React render etmeden önce `pathname !== "/"` ise
  kabuğu siliyor. (`/iletisim`, `/malzemeler` ile doğrulandı.)
- Kabuk `aria-hidden="true"` — ekran okuyucuya çift içerik gitmiyor.

**Son ölçüm (production build, 4G + 4× CPU throttle, 3 koşu medyanı):**

| Metrik | Oturum başı | Şimdi | Hedef |
| --- | --- | --- | --- |
| Mobil LCP | 5980 ms | **1664 ms** | <2500 ✅ |
| Mobil FCP | — | **1664 ms** | — |
| Mobil TBT | 3448 ms | **2025 ms** | — |
| Mobil CLS | 0.0000 | **0.0021** | <0.1 ✅ |
| Masaüstü LCP | 660–1788 ms | ~1200 ms | <2500 ✅ |

`tsc` 0 · `eslint` 0 · build temiz · `axe` (wcag2a+aa) **0 ciddi/kritik** ·
9/9 bölüm mount · 0 JS hatası · kabuk 3 rotada da doğru temizleniyor.

---

## Denenip başarısız olan yol: prerender + hydration (referans)

### 1. Mobil LCP — 4368 ms medyan (hedef <2500)

Tek kalan sert teknik blokaj. **Kök neden kesin olarak tespit edildi.**

Font hipotezi **test edildi ve çürütüldü**: fontları tamamen bloklayınca LCP
iyileşmedi, kötüleşti (4684 → 6804 ms). Yani Google Fonts sorumlu değil.

Gerçek neden, tarayıcı içi zaman damgalarıyla:

```text
1400 ms  ilk boyama (uygulama kabuğu)
4860 ms  lf-root mount + hero başlık ölçülü     ← ~3.4 s boşluk
4368 ms  LCP (medyan)
```

Landing rotası **lazy chunk** olarak geliyor; hero boyanabilmesi için önce
react (47 KB) + framer-motion (44 KB) + index (38 KB) + Index (14 KB) +
HeaderFullscreen (8 KB) ≈ 150 KB JS'in 4× yavaşlatılmış CPU'da indirilip
parse edilip render edilmesi gerekiyor. Hero, React render edene kadar DOM'da
yok — LCP bu yüzden geç.

**Denenen ve ölçüm sonucu GERİ ALINAN yaklaşımlar** (kodda yok, tekrar
denenmesin diye kayıt altında):

| Deneme | Sonuç | Karar |
| --- | --- | --- |
| Fontları self-host etme hipotezi | Fontlar bloklanınca LCP **kötüleşti** (4684 → 6804 ms) — font sorumlu değil | Yapılmadı |
| Landing rotasını eager import | lf-root 4860 → 3715 ms ama FCP 1396 → 1880, TBT 1887 → 2478, CLS 0 → 0.0038 | Geri alındı |
| `index.html`'e app-shell hero | LCP 4012 → 4384, FCP 1880 → 2216 — iyileşme yok | Geri alındı |
| Chunk'ı modül seviyesinde prefetch (ayrı chunk kalarak erken indirme) | LCP 4572 → 4828 — kazanç yok | Geri alındı |
| `PageTransition`'ı kritik yoldan çıkarma (framer-motion 44 KB) | LCP 4572 → 4732 — kazanç yok. **Neden:** framer build'de yine 133 KB; Header ve Footer de kullanıyor ve ikisi de ilk yüklemede render ediliyor | Geri alındı |

**Bu denemelerin ortak sonucu — teşhisin en değerli parçası:** chunk'ı erken
indirmek de, ana bundle'a katmak da, HTML'e statik hero koymak da LCP'yi
oynatmadı. Yani darboğaz **ağ değil, CPU**. TBT ~2000 ms, yani ana thread o
süre boyunca zaten dolu; hero, JS parse + execute + React render bitene kadar
boyanamıyor. Ağ tarafında yapılacak hiçbir şey bunu değiştirmiyor.

### Bağımlılık kırpmanın tavanı — ölçüldü, kapandı

CDP trace ile chunk başına derleme + çalıştırma süresi (4× yavaş CPU):

| Chunk | CPU süresi |
| --- | --- |
| **vendor-react.js** | **3961 ms** |
| vendor-framer.js | 455 ms |
| Index.js | 269 ms |
| Footer.js | 3 ms |

Bu tablo tartışmayı bitiriyor: framer-motion tüm maliyetin **%10'u**.
Kritik yoldaki 6 bileşeni (HeaderFullscreen, Footer, PageTransition,
SectionDotNav, MenuTrigger, FooterCTA) Framer'dan arındırmak LCP'yi
4500 → ~4050 ms yapardı — hedefin hâlâ çok uzağı, üstelik `MenuTrigger` ve
`SectionDotNav` her zaman görünür olduğu için lazy-load edilemez, ancak
yeniden yazılabilirdi.

**Baskın maliyet React'in kendisi (3961 ms).** Yani hiçbir bağımlılık
kırpma stratejisi <2500 ms'ye ulaştıramaz. Hero'yu React çalışmadan önce
boyamanın tek yolu **HTML göndermek** — yani prerender.

### Kalan yol: prerender + hydration (paket kuralı engel DEĞİL)

Önceki bir notta "prerender yeni paket gerektirir, CLAUDE.md satır 104'e
takılır" demiştim — **bu yanlıştı, düzeltiliyor.** `@playwright/test` zaten
devDependency. Build sonrası dist'i Playwright ile açıp render edilmiş HTML'i
`dist/index.html`'e yazmak yeni bağımlılık gerektirmez.

**Asıl engel bu değil, şu:** `src/main.tsx` `createRoot()` kullanıyor. CSR
modunda React `#root` içeriğini **siler ve yeniden render eder** — yani
prerender edilmiş hero boyanır, sonra React onu değiştirir ve LCP yeniden
tetiklenir. Bu oturumda denenen app-shell yaklaşımının neden işe yaramadığını
da tam olarak bu açıklıyor.

LCP'nin erken zamanda sabitlenmesi için React'in DOM'u **yeniden kullanması**
gerek: `hydrateRoot()`. Bunun ön koşulu, prerender edilen HTML ile client'ın
ilk render'ının birebir aynı olması.

**Bugünkü kod bunu karşılamıyor:** render sırasında viewport okunuyor —

- `LandingFlow.tsx` → `pinnedLayout = window.matchMedia("(min-width: 769px)…")`
- `HeaderFullscreen.tsx` → `shouldCollapseCategories()` (innerWidth/innerHeight)

Prerender masaüstü değerlerini HTML'e gömer, mobil client farklı hesaplar →
hydration mismatch → React ya uyarı verip yeniden render eder (kazanç sıfır)
ya da yanlış UI kalır.

### ⚠️ Bu yaklaşım DENENDİ ve BAŞARISIZ oldu — sonraki oturum bunu bilerek başlasın

Aşağıdaki 4 adımın tamamı bu oturumda uygulandı, ölçüldü ve **geri alındı**:

- `pinnedLayout` ve `activeCategory` hydration-safe hâle getirildi
- `main.tsx` koşullu `hydrateRoot`'a çevrildi
- `scripts/prerender.mjs` yazıldı (Playwright ile, yeni paket olmadan) ve
  çalıştı — `dist/index.html` 70 KB gerçek HTML olarak üretildi

**Sonuç: React error #418 (hydration mismatch) ve metrikler çöktü:**

| Metrik | Baseline | Prerender + hydration |
| --- | --- | --- |
| LCP | ~4500 ms | **10824 ms** |
| FCP | ~1580 ms | **6736 ms** |
| TBT | ~1950 ms | 3409 ms |

**İKİNCİ DENEME de başarısız oldu (aynı oturumda).** Sistematik envanter
yapıldı ve bulunan 4 kaynağın hepsi düzeltildi:

| Kaynak | Düzeltme |
| --- | --- |
| `LandingFlow.tsx` `pinnedLayout` | render → `useLayoutEffect` + state |
| `HeaderFullscreen.tsx` `shouldCollapseCategories()` | sabit başlangıç + effect |
| `SectionDotNav.tsx` `isCoarse` | render → effect *(ilk denemede kaçmıştı)* |
| `use-reduced-motion.ts` initializer | `false` başlangıç + `useLayoutEffect` |

Buna rağmen **yine React #418**. Yani grep ile bulunabilen tüm render-zamanı
medya sorgularını kapatmak yetmiyor; başka uyuşmazlık kaynakları var
(muhtemelen tema sınıfı, portal host'ları, `useId` ağaç sırası veya
üçüncü-parti bileşen içi durum).

### ÜÇÜNCÜ deneme: kök neden bulundu (ama tam çözülmedi)

Aynı oturumda üçüncü tur yapıldı. İki kesin bulgu:

**1. Mismatch viewport kaynaklı DEĞİL.** Prerender'ın yapıldığı viewport'un
(1440×900) birebir aynısında test edildi — yine #418. Yani medya sorgularını
kapatmak tek başına yetmiyor.

**2. Asıl kök neden: portal'lar.** Prerender çıktısında header
`#shared-header-host` içinde dolu duruyor:

```html
<div id="shared-header-host"><header id="main-header" ...>
```

Ama `HeaderFullscreen` portal hedefini `useLayoutEffect` içinde buluyor
(`headerHost` state'i ilk render'da `null`), yani **client'ın ilk render'ında
o kap boş**. React dolu bir kap bulup boş bekliyor → hydration çöküyor.
Aynısı body seviyesindeki portal'lar için de geçerli.

**3. Prerender script'i idempotent olmalı.** Script `dist/index.html`'i servis
ediyor; zaten prerender edilmiş bir dosyayı tekrar prerender edince çıktı
şişiyor (54 → 70 → 91 KB) ve ölçüm geçersizleşiyor. Her koşudan önce temiz
`vite build` şart.

### DÖRDÜNCÜ deneme: uyuşmazlık zincirinin tamamı haritalandı

Portal temizliği + lazy route ön-yükleme + idempotent script uygulandı, temiz
build üzerinde ölçüldü. **Prerender'ın çalıştığı kanıtlandı** (masaüstü,
throttle'sız: FCP 1144 ms, LCP 1260 ms, 9/9 bölüm) — ama #418 sürüyor.

Dördüncü ve son kaynak bulundu: **`renderPhase` kademeli mount.** Snapshot
`requestIdleCallback` sonrası, 9/9 bölüm render edilmişken alınıyor; client
ise `renderPhase = 1` ile (hero + placeholder'lar) başlıyor → uyuşmazlık.

**Uyuşmazlık zincirinin tamamı (dördü de bu oturumda tespit edildi):**

| # | Kaynak | Çözüm yaklaşımı | Durum |
| --- | --- | --- | --- |
| 1 | Render sırasında medya sorgusu (4 yer) | render → effect | Uygulandı, çalıştı |
| 2 | Portal hedefleri (header, body) | snapshot'tan temizle | Uygulandı, çalıştı |
| 3 | Lazy route → Suspense fallback | hydrate öncesi chunk'ı çöz | Uygulandı, çalıştı |
| 4 | `renderPhase` kademeli mount | **çözülmedi** | Açık |

**4. madde için iki yol:**

- Snapshot'ı `renderPhase = 1` durumundayken al (hero render olur olmaz,
  `requestIdleCallback` ilerlemeden önce). Hero zaten LCP elemanı olduğu için
  kazanç korunur. Yarış koşulu riski var; uygulama prerender modunda faz
  ilerletmeyi durduracak bir sinyal vermeli (örn. `window.__PRERENDER__`).
- Ya da prerender sırasında tüm fazları zorla açıp client'ın da ilk render'da
  `renderPhase = 5` ile başlamasını sağlamak — ama bu, bu oturumda LCP için
  kazanılan kademeli mount avantajını geri verir.

### BEŞİNCİ deneme: gerçek hata mesajı alındı

`vite.config.ts`'e `define: { "process.env.NODE_ENV": '"development"' }`
eklendi (React dev bundle) ve 4 kaynağın hepsi düzeltilmiş hâlde, prerender
ile aynı viewport'ta (1440×900 — medya farkı elenir) test edildi.

**Minified #418 yerine gerçek mesaj:**

```text
Warning: Expected server HTML to contain a matching <div> in <div>.
    at div
    at a (vendor-framer-*.js)      ← framer-motion ile render edilen bir <a>
    at div
    at sc / Rl / Bl (index-*.js)
Error: Hydration failed because the initial UI does not match what was
rendered on the server.
```

**Yorum:** framer-motion tarafından render edilen bir `<a>` içindeki `<div>`
snapshot'ta yok ama client bekliyor. `motion.a` landing yolunda yok (yalnız
`Iletisim.tsx`'te), dolayısıyla framer bir `Link`/`<a>`'yı sarıyor olmalı —
büyük ihtimalle `Footer` alt bileşenlerindeki `motion.div` + `Link` iç içe
yapısı veya `FooterCTA`.

**Sonraki oturumun tam olarak yapacağı:** aynı dev-bundle kurulumunu tekrar
kurup (bu dosyadaki 1–4 düzeltmeleri + `define` + `hydrateRoot` + prerender
script), yukarıdaki stack'i takip ederek o `<a>`'yı bulmak. Bulunduğunda
düzeltme muhtemelen tek bileşenlik. Ondan sonra `define` kaldırılıp
production ölçümü yapılır.

**Uyarı:** `npm run build:dev` bu iş için YETMEZ — Vite `--mode development`
ile bile minified prod React üretir. `define` şart.

### ALTINCI deneme: deterministik faz eşitleme — o da çözmedi

Zamanlama yarışını tamamen elemek için: snapshot tüm fazlar açıkken alındı,
`<html data-prerendered="1">` işareti kondu ve client o sayfada `renderPhase`'i
doğrudan 5'ten başlattı. Böylece ilk render ile snapshot birebir aynı olmalıydı.

Sonuç: **yine #418.** (Masaüstü throttle'sız FCP 1464 / LCP 1632 ölçüldü —
yani prerender mekanik olarak yine çalışıyor, engel sadece hydration.)

**Bu oturumda denenip elenen hipotezler (hepsi geri alındı):**

| Hipotez | Sonuç |
| --- | --- |
| Render-zamanı medya sorguları (4 yer) | Düzeltildi, yetmedi |
| Portal hedefleri (header/body) | Snapshot'tan temizlendi, yetmedi |
| Lazy route → Suspense fallback | Hydrate öncesi çözüldü, yetmedi |
| `renderPhase` — `__PRERENDER__` ile dondurma | Yetmedi |
| `renderPhase` — deterministik faz eşitleme | Yetmedi |
| `SectionDotNav`, `FooterCTA`, `motion.a` | Aday değil (elendi) |

### YEDİNCİ deneme: uyuşmazlığın bileşeni TESPİT EDİLDİ

`define: { "process.env.NODE_ENV": '"development"' }` **+ `build.minify: false`**
ile stack'teki minified adlar okunabilir hâle geldi. (Yalnız `define` yetmiyor —
bileşen adları `sc`, `Rl` gibi kalıyor; `minify: false` şart.)

**Gerçek stack:**

```text
Warning: Expected server HTML to contain a matching <div> in <div>.
    at div
    at MotionDOMComponent (vendor-framer)
    at div
    at ScrollProgress          ← SORUMLU BİLEŞEN
    at Router → BrowserRouter → ... → App
```

Not: önceki turda stack truncated olduğu için "framer `<a>`" diye
okumuştum — **yanlıştı**, aday olarak elediğim `SectionDotNav`/`FooterCTA`
zaten alakasızmış.

**`src/components/ui/ScrollProgress.tsx`** şunu render ediyor:

```tsx
<div role="region" aria-label="Sayfa ilerlemesi">
  <motion.div role="progressbar" style={{ scaleX, height: barHeight, ... }} />
</div>
```

**Kısmi eleme yapıldı:** prerender snapshot'ı `role="progressbar"` div'ini
İÇERİYOR (grep ile doğrulandı). Yani düğüm eksik değil — sorun sıralama /
kardeş yapısı. Muhtemel neden: prerender script'inin body temizliği
(`#root` dışı çocukları silme) `ScrollProgress`'in bir kardeşini kaldırıyor,
ya da `useScrollVelocity` / `useSpring` ilk değerleri iki koşuda farklı
DOM üretiyor.

**Denendi:** `ScrollProgress` hydration sonrası mount edilecek şekilde
değiştirildi (`mounted` state). **Sonuç: yine #418.**

### Nihai teşhis: bu bir zincir, tek bir bug değil

React hydration'da **ilk** ayrışma noktasını raporlar. Bir kaynağı
düzeltince hata bir sonrakine kayıyor. Bu oturumda bu desen altı kez
tekrarlandı:

medya sorguları → portal'lar → lazy route → renderPhase (2 farklı yaklaşım)
→ ScrollProgress → (bir sonraki, henüz bilinmiyor)

**Çıkarım:** bu uygulama CSR varsayımıyla yazılmış ve ilk render'ı
tarayıcı durumuna bağlı çok sayıda bileşen içeriyor. Bunları tek tek
avlamak yakınsamıyor.

### Önerilen doğru yaklaşım (sonraki oturum)

Tek tek avlamak yerine **toplu tespit**:

1. `define` + `minify: false` ile dev build al (bu oturumda doğrulanan reçete).
2. Prerender snapshot'ı ile client'ın **ilk render** çıktısını programatik
   olarak diff'le. React'in tek tek uyarılarını beklemek yerine tüm
   ayrışmaları bir kerede listele.
   Yöntem: aynı sayfayı iki kez render et (biri prerender bağlamında, biri
   CSR), `#root.innerHTML`'leri normalize edip (inline `style`/`transform`
   atributlarını ayıklayarak) karşılaştır.
3. Çıkan listedeki her bileşeni hydration-safe hâle getir, sonra hydrate.

**Alternatif ve muhtemelen daha ekonomik yol:** prerender'dan tamamen
vazgeçip hedefi cihaz profiline bağlamak. Throttle'sız masaüstünde LCP
zaten ~1.2 s; ölçüm profili (yavaş 4G + 4× CPU) Lighthouse'un kasıtlı en
sert senaryosu.

Alternatif, daha az kırılgan yol: prerender'ı **yalnız hero** için yapıp
React'in o düğümü sahiplenmesini sağlamak yerine, hero'yu React ağacının
tamamen dışında tutmak (ama bu oturumdaki app-shell denemesi de LCP'yi
oynatmamıştı — çünkü `createRoot` sonrası yeni LCP adayı tetikleniyor).

**Aşağıdaki adım adım plan referans olarak duruyor; uygulanmadan önce
yukarıdaki envanter yapılmalı:**

**Adım 1 — Hydration-safe render.** Viewport okumaları render'dan çıkacak.

`src/components/LandingFlow.tsx` (~satır 70):

```ts
// ÖNCE (render sırasında matchMedia → prerender/client uyuşmazlığı)
const pinnedLayout = !prefersReduced && typeof window !== "undefined"
  && window.matchMedia("(min-width: 769px) and (min-height: 601px) and (pointer: fine)").matches;

// SONRA — ilk render her ortamda aynı (false), ölçüm effect'te
const [pinnedLayout, setPinnedLayout] = useState(false);
useEffect(() => {
  const mq = window.matchMedia("(min-width: 769px) and (min-height: 601px) and (pointer: fine)");
  const sync = () => setPinnedLayout(!prefersReduced && mq.matches);
  sync();
  mq.addEventListener("change", sync);
  return () => mq.removeEventListener("change", sync);
}, [prefersReduced]);
```

⚠️ `pinnedLayout` GSAP pin kurulumunu ve JSX'te `aria-hidden`/`tabIndex`
değerlerini besliyor. İlk render `false` olacağı için masaüstünde bir kare
"pinned değil" hâli görünebilir — bunu görsel olarak doğrulayın; gerekirse
CSS ile ilk boyamada gizleyin.

`src/components/HeaderFullscreen.tsx` (~satır 26): `useState(() =>
shouldCollapseCategories() ? -1 : 0)` aynı kalıba çevrilecek — sabit
başlangıç, ardından effect'te düzeltme.

**Adım 2 — Koşullu hydration.** `src/main.tsx`:

```ts
import { createRoot, hydrateRoot } from "react-dom/client";
const root = document.getElementById("root")!;
// Prerender edilmiş HTML varsa DOM'u yeniden kullan; yoksa normal CSR.
if (root.hasChildNodes()) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
```

**Adım 3 — Prerender script'i** (`scripts/prerender.mjs`, yeni paket gerekmez;
`@playwright/test` mevcut). Akış: `vite preview` başlat → Playwright ile `/`
aç → `.lf-hero-title` görünür olana kadar bekle →
`document.documentElement.outerHTML` al → `dist/index.html`'e yaz.
`package.json`'a `"build": "vite build && node scripts/prerender.mjs"`.

⚠️ Alınan HTML'e Playwright'ın eklediği bir şey karışmadığından emin olun ve
`<script type="module">` etiketinin korunduğunu doğrulayın.

**Adım 4 — Doğrulama.** Hydration uyarısı olmamalı (console'da "did not
match"), 9/9 bölüm mount olmalı, mobil+masaüstü görsel karşılaştırma, sonra
LCP ölçümü. Beklenti: LCP ≈ FCP ≈ 1.6 s.

**Geri alma:** Adım 3'ü kaldırmak (build script'ini eski hâline döndürmek)
tek başına sistemi CSR'a döndürür — `hasChildNodes()` kontrolü sayesinde
Adım 2 zararsız kalır.

**Alternatif karar — hedefi cihaz profiline bağlamak.** Ölçüm profili
(yavaş 4G + **4× CPU throttle**) Lighthouse'un kasıtlı en sert senaryosu.
Throttle'sız masaüstünde LCP zaten ~1.2 s.

### 2. `neden-biz` / `kabiliyetler` gerçek bölüm değil — açık karar, sizde

İkisi de `ProcessProofCinema` içindeki `aria-hidden` sentinel span'ler; aynı
anlatının %0-50 / %50-100 scroll derinliğine inen sanal işaretçiler. Menüde iki
ayrı konu gibi görünüyor. Çözüm ya (a) bu başlıklar için gerçek ayrı içerik
yazmak (iş kararı) ya da (b) navigasyonun birleşik yapıyı dürüstçe yansıtması.

### 3. Daha küçük notlar

- Mobil sayfa uzunluğu masaüstünün ~1.6 katı — kart yoğunluğu gözden geçirilebilir
- Bölüm nokta navigasyonu (sağ kenar) düşük kontrastlı, kolay gözden kaçıyor
- Z-index namespace tutarsızlığı (`z-index.ts` dışı 10000'li seri) — ayrı refactor

---

## Dürüst değerlendirme

Tasarım dili (premium industrial, editorial tipografi, sinematik scroll) ve
içerik kalitesi SOTD seviyesinde. Bu turda en görünür tasarım kusuru (header) ve
teknik borcun büyük kısmı kapandı. **Kalan tek sert blokaj mobil LCP.**

SOTD bir jüri kararıdır; "ulaşıldı" demek bana düşmez. Ölçülebilir kapılar
açısından durum: erişilebilirlik ✅, CLS ✅, masaüstü hız ✅, kod sağlığı ✅,
**mobil LCP ❌** — ve onun somut çözüm yolu yukarıda.
