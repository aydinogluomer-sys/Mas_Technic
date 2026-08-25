# MAS Technic — Changelog Index

Tüm sürüm notları `docs/changelog/` altında ayrı dosyalarda tutulur. Bu dosya yalnızca üst düzey **index** rolündedir.

## Sürümler

| Sürüm | Tarih | Özet | Detay |
|---|---|---|---|
| **v3.5** | 2026-04-18 | Footer Visibility Fix + Modular Refactor (488 → 157 satır) | [`changelog/v3.5.md`](./changelog/v3.5.md) |
| **v3.4** | 2026-04-18 | Phase 11 Hardening (11A→11E): residual color sweep, R3F theme reactivity, forwardRef fix, bundle leak audit, xlsx static fallback | [`changelog/v3.4.md`](./changelog/v3.4.md) |
| **v3.0 + Phase 11A/B/C/D** | 2026-04-17/18 | Architecture cleanup, MoldCast removal, token migration v2.0, type-safe accessor, ESLint guardrail | [`changelog/v3.0-and-phase11.md`](./changelog/v3.0-and-phase11.md) |

## Kurallar

- Yeni sürüm → `docs/changelog/v<X.Y>.md` dosyası oluştur, bu index'e satır ekle.
- Tek dosya 200 satırı geçtiğinde alt-faz dosyalarına böl (örn. `v3.6-phase-12a.md`).
- `keep-a-changelog` formatına uy: `Added / Changed / Fixed / Removed / Deprecated / Validation`.
