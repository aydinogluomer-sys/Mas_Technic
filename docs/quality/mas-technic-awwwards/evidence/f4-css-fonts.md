# Faz 4: CSS kapsamı ve font kontrolü

## Yöntem

**1. Statik geçiş.** `src/**/*.css` içindeki her sınıf ve id seçicisi, `src/`, `scripts/` ve `index.html` içindeki kodda adıyla aranır.
- Adı hiçbir yerde geçmeyen ve dinamik bir önekle (`foo-${x}`) de üretilemeyen seçici ölüdür.
- Aynı işlem `[data-*]` öznitelik seçicileri ve `@keyframes` adları için de yapıldı.

**2. Çalışma zamanı geçişi.** Build edilmiş 190 rota 1440 ve 375 genişlikte açıldı.
- Her sayfa sonuna kadar kaydırıldı. 6 rotada menü açıldı, aileler gezildi ve sohbet açıldı.
- Her kaynak seçicinin durumdan bağımsız biçimi (`:hover`, `:focus` ve sözde öğeler çıkarılmış hâli) `querySelector` ile denendi.
- Bir azaltılmış hareket geçişi yalnız 1 seçici ekledi. Bu yüzden son koşu iki geçişle yapıldı.

Araçlar tek seferlik olduğu için repoya eklenmedi.

## Sonuç

| | Önce | Sonra |
|---|---|---|
| Kaynak CSS satırı (`src/**/*.css`) | 7.952 | 7.303 |
| `index-*.css` (ham / gz) | 122.339 / 30.482 B | 118.564 / 29.659 B |
| `PageShell-*.css` | 115.625 / 19.861 B | 112.713 / 19.403 B |
| `Index-*.css` | 51.758 / 9.422 B | 51.107 / 9.355 B |
| `Iletisim-*.css` | 8.555 / 2.187 B | 7.254 / 1.948 B |

**Silinenler:**
- **Adı kodda hiç geçmeyen 59 sınıf ve onların kuralları:**
  - Eski landing: `.section-tone-*`, `.btn-industrial-*`, `.typo-*`, marquee, nav underline, flip card.
  - Silinmiş `CustomCursor` öğeleri: `.cursor-dot`, `.cursor-ring`.
  - Eski 7 günlük randevu şeridi: `.booking-day(s)`.
  - Menü dizini: `.tl-menu-dir-*`, `.tl-menu-directory*`.
  - `.tl-status-badge`, `.shell-notfound-code`, `.shell-statement`, `.shell-gauge`.
  - Ek olarak `.card-icon`: `card-` öneki yalnız bir React `key`'iydi.
- **Bu kurallarla birlikte ölen öğeler:**
  - 6 `@keyframes`: `rotate-text`, `count-up`, `fade-in-up`, `fireText`, `marquee-scroll`, `marquee-scroll-reverse`.
  - Hiçbir öğenin taşımadığı öznitelik seçicileri: `[data-nav-sections]`, `[data-result]`, `[data-stat-value]`.
- **Testlerle ilişkisi:** `.booking-day(s)`, `.shell-gauge` ve `[data-nav-sections]` için testler zaten "yok" (`toHaveCount(0)`) diyor. Silme bu testleri değiştirmiyor.
- **Korunan:** `.tl-subgrid`. Kullanılmıyor ama `docs/lean/06` ve `13` tasarım sisteminin kuralı olarak ona atıf yapıyor.

**Çalışma zamanında eşleşmeyen ama silinmeyenler (273 seçici):** Hepsi şu durumlardan birine bağlı:
- ön render edilmeyen rotalar: giriş ve şifre sayfaları, 404;
- kapalı pencereler: randevu, sohbet;
- bayrakla kapalı RFQ ekleri;
- azaltılmış hareket ve ilk görünüm durumları (`html:not([data-first-view])`);
- panel.

Öznitelik değerlerinin hepsi kodda üretiliyor. Bu geçiş güvenle silinebilecek ek bir kural bulmadı.

## Fontlar

`/`, `/en`, `/hizmetler/cnc-frezeleme` ve `/en/malzemeler` sayfaları 375 ve 1440 genişlikte ölçüldü:
- **Ön yüklenen 4 face'in hepsi** kullanılıyor; "preloaded but not used" uyarısı 0. Bu face'ler: Space Grotesk latin ve latin-ext, IBM Plex Mono 400 ve 500 latin.
- TR ve EN ziyaretçi **Kiril ya da sembol alt kümesi indirmiyor**. `unicode-range` beklendiği gibi çalışıyor.
- `/en` sayfasında da latin-ext gerekli: ön render metninde İ, ş ve ğ var (adresler). Space Grotesk latin-ext (18,9 KB) ön yüklemesi doğru.

Değişiklik yapılmadı.

## Kritik CSS

Plan kuralı: 375 p75'te `cssEnd > imageEnd + 300 ms` ise `/` ve `/en` için kritik CSS inline edilir.
- Faz 0'ın yerel ölçümü bu koşulu sağlıyor (+573 ms). Ama yerel sunucu HTTP/1.1; `f0-baseline.md` kararı gerçek Vercel ölçümüne bırakıyor.
- Varsayılan **yapılmaz** kalır. Karar Faz 6'daki preview `perf=true` ölçümüyle verilir.
