# Parity harness — "aynı davranış, daha az satır"

Davranışı koruyan her azaltma PR'ı, `origin/main` build'iyle **piksel piksel aynı** sayfalar üretmelidir (`maxDiffPixels: 0`). Snapshot'lar repoya girmez (`.parity/`, git-ignored); her karşılaştırmada main'den yeniden kaydedilir.

Kapsam (`e2e/parity/route-parity.spec.ts`):

- Build edilmiş `dist`'teki her ön render rota, tam sayfa, reduced motion; 375 ve 1440 (`parity-375`, `parity-1440`).
- Fullscreen menü, `/` ve `/hizmetler/cnc-frezeleme`'de, iki hareket modunda. Kaydedilen durumlar:
  - tetikleyicide klavye odağı
  - aile 1–4 seçili, ilk kategori açık

  Animasyonun ortasından kare alınmaz. Main'de menü framer-motion ile canlanıyor ve onun kareleri tamamen WAAPI üzerinden yürümüyor; bu yüzden duraklatılmış bir kapanış ortası karesi koşudan koşuya farklı çıkıyordu (gürültü koşusu). Kapanış animasyonu `fullscreen-menu.spec.ts` ve Faz 2'deki elle kontrolle doğrulanır.
- Menü yalnız klavyeyle sürülür; fare hareketi özel imleci ekrana getirir.
- Yakalama belirlenimli:
  - animasyonlar duraklatılmaz, sonuna oynatılır
  - görseller decode edilir ve `decoding="sync"` yapılır, çünkü tam sayfa yakalamada ekran dışındaki async görseller ara sıra boş çıkıyordu

`PARITY_SCOPE=sample` her bölümden bir rota alır (hızlı). Kapı her zaman `PARITY_SCOPE=full` ile koşulur. Parity projelerinde 1 yeniden deneme vardır: gerçek bir piksel farkı iki denemede de kalır, yük kaynaklı zaman aşımı kalmaz.

## 1. "Önce": main'den baseline

```sh
git fetch origin main
git worktree add ../mt-base origin/main
(cd ../mt-base && npm ci && VITE_SITE_ENGLISH=live \
  VITE_SUPABASE_URL=https://ci-placeholder.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=ci-placeholder-anon-key \
  npm run build)
node scripts/serve-dist.mjs --port 4180 --host 127.0.0.1 --dir ../mt-base/dist &

PLAYWRIGHT_PARITY=1 PARITY_SCOPE=full PARITY_DIST=../mt-base/dist PLAYWRIGHT_BASE_URL=http://127.0.0.1:4180 \
  npx playwright test --project=parity-375 --project=parity-1440 --update-snapshots

# gürültü kontrolü: aynı sunucuya, güncellemeden → 0 hata olmalı
PLAYWRIGHT_PARITY=1 PARITY_SCOPE=full PARITY_DIST=../mt-base/dist PLAYWRIGHT_BASE_URL=http://127.0.0.1:4180 \
  npx playwright test --project=parity-375 --project=parity-1440
```

## 2. "Sonra": dalı karşılaştır

```sh
VITE_SITE_ENGLISH=live VITE_SUPABASE_URL=… VITE_SUPABASE_PUBLISHABLE_KEY=… npm run build
node scripts/serve-dist.mjs --port 4181 --host 127.0.0.1 &
PLAYWRIGHT_PARITY=1 PARITY_SCOPE=full PARITY_DIST=dist PLAYWRIGHT_BASE_URL=http://127.0.0.1:4181 \
  npx playwright test --project=parity-375 --project=parity-1440
```

Her hata bir davranış farkıdır: `test-results/` içindeki `*-diff.png`'ye bakılır. Ya kod düzeltilir, ya da fark bilinçli bir değişiklikse PR'da açıkça yazılır. Azaltma PR'larında bilinçli fark yoktur.

Rota listesi `PARITY_DIST`'ten okunur. Bir rota eklenip silinmediği sürece önce ve sonra aynı listeyi kullanır; değişen liste ayrıca raporlanır.
