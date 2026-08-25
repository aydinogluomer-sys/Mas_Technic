# Phase 11 Residual Literal Audit
Date: 2026-04-18
Status: **AUDIT ONLY** — migration deferred to phase-11A (next session)

> Bu sayım pre-flight P4 sırasında alınmış toplu sayımdır. Locked zone'lar (`src/components/admin/**`, `src/components/musteri/**`, `src/components/ui/**`, `src/integrations/supabase/**`, `src/pages/admin/**`, `src/pages/musteri-paneli/**`, `src/lib/tokens.ts`, `src/index.css`, `src/styles/**`) **DAHİL** sayılmıştır; 11A migration sadece non-locked dosyaları kapsayacaktır.

## Aggregate Counts (root scan)

| Pass | Pattern | Hits |
|---|---|---|
| A | `#hex` / `rgb(a)?(...)` / `hsl(a)?(...)` literal (excl. `// OK:`, `var(--`, index.css, styles/) | **584** |
| B | Tailwind preset `text-white\|black`, `bg-white\|black`, `border-...`, `ring-...`, `fill-...`, `stroke-...`, `divide-...`, `placeholder-...`, `caret-...`, `accent-...` | **380** |
| C | invalid `rgba(var(--...))` syntax | **1** (in `src/lib/tokens.ts:9` — JSDoc comment, exempt token-def file, not a real violation) |

**Pass C net violation count: 0** (the single hit is a doc comment inside the exempt tokens file).

## Locked-Zone vs Non-Locked Breakdown (informational)

11A non-locked targets (computed from existing audit on 2026-04-17):
- Pass A non-locked: 56 literals across 11 files
- Pass B non-locked: 31 occurrences across 9 files
- Pass C non-locked: 0
- ~14 unique non-locked files → 11A batch strategy: **3 batches × max 6 files**

Detailed per-file mapping (with deterministic token mapping table) is preserved in the prior audit — see `docs/phase-11-residual-audit-detailed.md` if needed; AMBIGUITY decisions for 5 categories (R3F, brand SVG, Gizmo XYZ, material picker, NotFound dynamic hue) are now **LOCKED** in `docs/phase-11-ambiguity-decisions.md`.

## Pass A — hex/rgb/hsl literals (top sample)
| File | Line | Value | Proposed Token | AMBIGUITY? |
|---|---|---|---|---|
| src/components/CNCModel.tsx | 16-18, 107-109 | `#0688AD`, `#1e293b`, `#94a3b8`, `#ffffff` | precision-ice / surface-base / material-chrome / text-primary | **YES — R3F runtime (Karar 1)** |
| src/components/IndustryModels.tsx | 10-13, 348-351 | THREE.Color hex map | precision/material tokens | **YES — R3F runtime (Karar 1)** |
| src/components/ModelViewer.tsx | 23-28, 247, 506-520 | material picker + gizmo + state init | static palette / chrome | **YES — Karar 3+4** |
| src/components/ProjectShowcase.tsx | 181-183 | RGB chroma split | KEEP | already `// OK:` |
| src/components/QuickQuoteSection.tsx | 191 | `rgb(34 197 94 / 0.4)` | success token | NO |
| src/components/ServicesSection.tsx | 292 | `#ffffff` | text-primary | NO |
| src/components/auth/SocialIcons.tsx | 3-11 | brand fills | KEEP | **YES — Karar 2** |
| src/hooks/useTilt.ts | 18 | `rgba(255,255,255,0.07)` | text-primary-rgb / 0.07 | NO |
| src/pages/NotFound.tsx | 69-73, 121-129 | hsla glitch + rgba overlay | dynamic + surface-base-rgb | **YES — Karar 5 (hsla only)** |
| src/pages/ServiceDetail.tsx | 189 | `hsl(220,15%,8%)` gradient | surface-base | NO |
| src/pages/TeklifAl.tsx | 63-91, 285, 736-750 | material picker + R3F + gizmo | various | **YES — Karar 1+3+4** |

## Pass B — Tailwind presets (top sample)
| File | Line | Class | Proposed Replacement | AMBIGUITY? |
|---|---|---|---|---|
| src/components/CertificationsSection.tsx | 43 | `group-hover:bg-white/10` | `bg-[rgb(var(--text-primary-rgb)/0.1)]` | NO |
| src/components/ChatBot.tsx | 240 | `hover:bg-white/20` | token equiv | NO |
| src/components/ProjectShowcase.tsx | 221 | `bg-white/10` | token equiv | NO |
| src/components/auth/LoginLeftPanel.tsx | 27-54 | text-white / border-white/N | token equivs | NO |
| src/pages/ForgotPassword.tsx | 90 | `text-white` | `text-[var(--text-primary)]` | NO |
| src/pages/Login.tsx | 224 | `text-white` | token equiv | NO |
| src/pages/Malzemeler.tsx | 117-340 | text-white/N + bg-white/10 + border-white/20 | token equivs | NO |
| src/pages/ResetPassword.tsx | 134 | `text-white` | token equiv | NO |
| src/pages/ServiceDetail.tsx | 195-224 | text-white/N + bg-white/N + border-white/N | token equivs | NO |
| src/pages/TeklifAl.tsx | 1212-1219 | text-white + border-white/20 + hover:bg-white/10 | token equivs | NO |

## Pass C — invalid `rgba(var(--))`
**0 net violations** in non-tokens-def files. The single grep hit (`src/lib/tokens.ts:9`) is JSDoc that documents the forbidden pattern.

## Verdict
- 11A migration scope is well-defined: ~14 non-locked files, 3 batches.
- 5 AMBIGUITY categories are LOCKED (no FIX-07 trigger expected in 11A).
- Pre-flight P4 status: **AUDIT COMPLETE — no migration this session.**
