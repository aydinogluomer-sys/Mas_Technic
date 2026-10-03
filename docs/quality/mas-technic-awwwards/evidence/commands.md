# Komut kanıtı — paket 1 (S00, S01, M01, R01)

Ortam: bulut container, Node 22.22.2, npm ci (lockfile), headless Chromium 1194 (`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium`).
Bu container'da IPv6 yok: Playwright'ın kendi `vite preview`'u (`localhost` → `::1`) açılamıyor (`EAFNOSUPPORT`). Bu yüzden build ayrı alındı, `vite preview --host 127.0.0.1` ile sunuldu ve testler `PLAYWRIGHT_BASE_URL` ile koşuldu.
Tarayıcı build'leri CI ile aynı placeholder env ile alındı (`VITE_SUPABASE_URL=https://ci-placeholder.supabase.co`, `VITE_SUPABASE_PUBLISHABLE_KEY=ci-placeholder-anon-key`) → `LOCAL_FIXTURE`.

## Taban (HEAD 4618e71, ayrı worktree)

```
npm run typecheck   → exit 0 (18.3 s)
npm run lint        → exit 0 — 0 errors, 2 warnings (src/components/BlurImage.tsx:125, :148 react-refresh/only-export-components)
npm run build       → exit 0 (21.7 s); chunk-size warning: xlsx.min 627 kB, AdminDashboard 803 kB, cssVar 851 kB (raw)
```

Taban istek ölçümü:
```
node scripts/quality/capture-requests.mjs --base http://127.0.0.1:4180 --dist <base>/dist \
  --out evidence/s01-baseline-requests.json --routes /,/malzemeler --screens evidence/screens/s01-baseline
```
Envsiz build ile aynı ölçüm: `evidence/s01-baseline-requests-noenv.json` (her rota `ErrorBoundary`: `VITE_SUPABASE_URL is not set`).

## Dal (paket 1 sonrası)

```
npm run typecheck   → exit 0
npm run lint        → exit 0 — 0 errors, 2 warnings (tabandakiyle aynı)
npm run build       → exit 0 (envsiz ve placeholder env)
node scripts/claims-gate.mjs → PASS — 0 unverified claims across 32 rules, 305 controls green
```

Sonrası istek ölçümü: `evidence/s01-after-m01-r01-requests.json`. `/malzemeler` ekran görüntüleri (375/768/1440 × normal/reduced): `evidence/screens/after/m01-plate-*.png`.

## Playwright

```
# Yeni specler — 47 passed, 0 failed, 21 skipped
npx playwright test e2e/detail-route-family.spec.ts e2e/malzemeler-static-plate.spec.ts e2e/s01-webgl-failure.spec.ts \
  --project=desktop-1280 --project=mobile-375 --project=tablet-768 --project=desktop-1440

# İlgili mevcut regresyon — 59 passed, 0 failed, 19 skipped
npx playwright test e2e/malzemeler-sticky.spec.ts e2e/shared-shell-accessibility.spec.ts \
  e2e/landing/navigation-reachability.spec.ts e2e/material-category-footer.spec.ts \
  e2e/qa-p08-scroll-region-reach.spec.ts e2e/qa-p09a2-claims-sweep.spec.ts e2e/qa-p09a2-contrast.spec.ts \
  --project=desktop-1280 --project=mobile-375

# Kritik kapı — 158 passed, 5 failed, 3 skipped (claims-gate düzeltmesi öncesi)
npx playwright test --project=critical-1280 --project=critical-375
#   claims-gate.spec.ts:28 ×2  → M01 caption'ı; claims-gate sabitlemesinden sonra 4/4 passed
#   landing-structure.spec.ts:95 ×2, technical-landing.spec.ts:178 ×1 → değişmemiş taban build'de de aynı (FAIL_INFRA):
#     konsolda fonts.googleapis.com ERR_CERT_AUTHORITY_INVALID; font fallback ile başlık oranı 0.7727 (sınır < 0.75)
```

WebGL probe ekleri: `evidence/s01-webgl-failure.json`, `evidence/screens/s01-webgl-unavailable.png`, `evidence/screens/s01-webgl-context-lost.png`.

## Paket 3 — L01 / SEO01

```bash
# build (placeholder env, varsayılan preview: noindex, canonical yok)
VITE_SUPABASE_URL=https://ci-placeholder.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=ci-placeholder-anon-key npm run build
# indekslenebilir build (origin zorunlu; yoksa build kırılır)
VITE_SITE_INDEXING=public VITE_SITE_ORIGIN=https://<origin> VITE_SUPABASE_URL=… VITE_SUPABASE_PUBLISHABLE_KEY=… npm run build

# EN overlay tamlığı ve sayı kimliği
npx esbuild scripts/quality/locale-check.ts --bundle --platform=node --format=esm --alias:@=./src \
  --outfile=/tmp/locale-check.mjs --loader:.webp=empty --loader:.png=empty --loader:.jpg=empty --loader:.svg=empty
node /tmp/locale-check.mjs

# sayısal iddia envanteri (genişletilmiş desen)
npx esbuild scripts/quality/claims-scan.ts --bundle --platform=node --format=esm --alias:@=./src \
  --outfile=/tmp/claims-scan.mjs --loader:.webp=empty --loader:.png=empty --loader:.jpg=empty --loader:.svg=empty
node /tmp/claims-scan.mjs

# e2e (IPv6 olmayan container: preview'u loopback'te ayrı başlat)
npx vite preview --host 127.0.0.1 --port 4181 --strictPort &
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4181 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium \
  npx playwright test e2e/l01-locale.spec.ts --project=desktop-1280 --project=mobile-375
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4181 PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium PLAYWRIGHT_WORKERS=4 \
  npx playwright test --project=desktop-1280 --project=critical-1280 --project=critical-375
```
