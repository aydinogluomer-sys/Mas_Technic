# Phase 00 — Dependency & Vulnerability Baseline

**Base commit:** `6ffde20`
**Raw:** `reports/baseline/raw/audit.txt` (human), `reports/baseline/raw/audit.json` (machine),
`reports/baseline/raw/install.txt` (`npm ci --dry-run` + `npm ls --depth=0`)
**Commands:** `npm audit` → **exit 1**, `npm audit --json` → captured.

> `npm audit` was run against the **shared** `node_modules` junction. No mutation was performed:
> `npm audit fix` was **not** run. Fixing is Phase 12's job (IDs 344–352).

---

## 1. Totals

```text
info: 0   low: 0   moderate: 3   high: 15   critical: 0   TOTAL: 18
dependencies: prod 438 · dev 190 · optional 77 · peer 0 · total 630
direct dependencies: 80 (61 prod + 19 dev)
```

**18 total (0 critical / 15 high / 3 moderate / 0 low).**

npm reports a non-breaking `npm audit fix` for **every one of the 18**
(`fixAvailable: true` for all entries — no `isSemVerMajor` fix was proposed).
That claim is npm's, not verified here; Phase 12 must actually run it and re-test.

## 2. High-severity table

| Package | Installed | Vulnerable range | Direct? | Advisory (lead) | Non-breaking fix? |
|---|---|---|---|---|---|
| `react-router-dom` | 6.30.1 | `6.0.0-alpha.0 – 6.30.2` | **direct** | depends on vulnerable `react-router` / `@remix-run/router` | yes |
| `react-router` | — | `6.0.0 – 7.17.0` | transitive | depends on vulnerable `@remix-run/router` | yes |
| `@remix-run/router` | **1.23.0** | `<=1.23.2` | transitive | [GHSA-2w69-qvjg-hvjx] React Router XSS via open redirects; [GHSA-2j2x-hqr9-3h42] same-origin redirect with `//` path → open redirect via protocol-relative URL | yes |
| `vite` | 5.4.19 | `<=6.4.2` | **direct** | depends on vulnerable `esbuild` | yes |
| `postcss` | **8.5.6** | `<=8.5.22` | **direct** | [GHSA-qx2v-qp2m-jg93] XSS via unescaped `</style>` in stringify output; [GHSA-6g55-p6wh-862q] + [GHSA-fxqj-rqcc-2cmp] + [GHSA-r28c-9q8g-f849] arbitrary `.map` file read via attacker-controlled `sourceMappingURL` | yes |
| `rollup` | **4.24.0** | `4.0.0 – 4.58.0` | transitive (via vite) | [GHSA-mw96-cpmx-2vgc] arbitrary file write via path traversal | yes |
| `nanoid` | **3.3.11** | `<=3.3.17` | transitive | [GHSA-28wg-ghj8-5hjv] / [GHSA-2v37-7h3g-55p8] infinite loop on negative/zero size | yes |
| `ws` | **8.19.0** | `8.0.0 – 8.20.1` | transitive | [GHSA-58qx-3vcg-4xpx] uninitialised memory disclosure; [GHSA-96hv-2xvq-fx4p] memory-exhaustion DoS | yes |
| `lodash` | **4.17.21** | `<=4.17.23` | transitive | [GHSA-r5fr-rjxr-66jc] code injection via `_.template`; two prototype-pollution advisories in `_.unset`/`_.omit` | yes |
| `js-yaml` | **4.1.0** | `4.0.0 – 4.3.0` | transitive | [GHSA-mh29-5h37-fv8m] prototype pollution in merge (`<<`); three quadratic-CPU DoS advisories | yes |
| `flatted` | **3.3.1** | `<=3.4.1` | transitive | [GHSA-25h7-pfq9-p65f] unbounded-recursion DoS in `parse()`; [GHSA-rf6f-7fwh-wjgh] prototype pollution | yes |
| `glob` | **10.4.5** | `10.2.0 – 10.4.5` | transitive | [GHSA-5j98-mcp5-4vw2] glob CLI command injection via `-c/--cmd` | yes |
| `minimatch` | — | `<=3.1.3 \|\| 9.0.0 – 9.0.6` | transitive (3 copies) | three ReDoS advisories | yes |
| `brace-expansion` | — | `<=1.1.17 \|\| 2.0.0 – 2.1.3` | transitive (3 copies) | four DoS advisories (zero-step sequence, exponential `{}` expansion, OOM) | yes |
| `picomatch` | **2.3.1** | `<=2.3.1` | transitive | [GHSA-3v7f-55p6-f55p] method injection in POSIX classes; [GHSA-c2c7-rcm5-vvqj] ReDoS via extglob quantifiers | yes |

## 3. Moderate-severity table

| Package | Installed | Range | Advisory | Non-breaking fix? |
|---|---|---|---|---|
| `esbuild` | **0.21.5** (+ 0.25.0 nested) | `<=0.24.2` | [GHSA-67mh-4wv8-2f99] any website can send requests to the dev server and read the response | yes |
| `ajv` | — | `<6.14.0` | [GHSA-2g4f-4pwh-qvx6] ReDoS with the `$data` option | yes |
| `yaml` | — | `2.0.0 – 2.8.2` | [GHSA-48c2-rrv3-qjmp] stack overflow via deeply nested collections | yes |

## 4. Runtime-exposure assessment (which of these actually reach a browser)

| Package | Ships to the browser? | Note |
|---|---|---|
| `react-router-dom` / `react-router` / `@remix-run/router` | **YES** | The open-redirect advisories are the only **production-runtime** issues in the list. The app uses `<Navigate to="/teklif-al" replace />` (`App.tsx:144`) and `window.location.href = "/"` (`NotFound.tsx:22`), neither of which takes user input — but `react-router-dom` is bundled into `vendor-react` on every route. **Highest real risk of the 18.** |
| `nanoid` | possibly | pulled in transitively; not verified as reaching the client bundle. |
| `postcss`, `rollup`, `vite`, `esbuild`, `glob`, `minimatch`, `brace-expansion`, `picomatch`, `js-yaml`, `flatted`, `lodash`, `ws`, `ajv`, `yaml` | **NO** | Build/tooling only. Real but lower-priority: they matter for supply-chain and CI integrity, not for site visitors. |

## 5. `three-mesh-bvh` — explicitly deprecated

```text
node_modules/three-mesh-bvh :: Deprecated due to three.js version incompatibility.
                               Please use v0.8.0, instead.
```

- **Installed:** `three-mesh-bvh@0.7.8` (`package-lock.json:8403-8405`).
- **Marked `deprecated` in the lockfile** with the message above.
- **Not a direct dependency.** It arrives only through `@react-three/drei@9.122.0`, which pins
  `"three-mesh-bvh": "^0.7.8"` (`package-lock.json:2552`). It cannot be bumped by editing
  `package.json` dependencies; it needs either a `drei` major upgrade or an `overrides` entry.
- Its own `peerDependencies` say `three: ">= 0.151.0"`, which `three@0.170.0` nominally satisfies —
  so the deprecation is a maintainer-declared incompatibility, not an npm resolution error.
  `npm audit` does **not** flag it (deprecation ≠ vulnerability), which is exactly why it is
  recorded here explicitly.

## 6. `@react-three/*` ↔ `three@0.170` pairing

| Package | Version | Resolves `three` to |
|---|---|---|
| `three` | **0.170.0** (direct) | — |
| `@types/three` | 0.170.0 (dev) | matched to runtime — good |
| `@react-three/fiber` | 8.18.0 | `three@0.170.0` deduped |
| `@react-three/drei` | 9.122.0 | `three@0.170.0` deduped |
| `@react-spring/three` | 9.7.5 | deduped |
| `three-stdlib` | 2.36.1 | deduped |
| `three-mesh-bvh` | 0.7.8 (deprecated) | deduped |
| `camera-controls` | 2.10.1 | deduped |
| `maath` | 0.10.8 | deduped |
| `meshline` | 3.3.1 | deduped |
| `stats-gl` | 2.4.2 | deduped |
| `troika-three-text` | 0.52.4 | deduped |
| `@monogrid/gainmap-js` | 3.4.0 | deduped |

**Assessment:** the pairing is internally consistent — every consumer dedupes onto the single
`three@0.170.0` and there is **no duplicate three.js instance**, which is the failure mode that
usually breaks R3F. `@react-three/fiber@8.x` + `@react-three/drei@9.x` is the correct generation
for `three@0.170`; the v9 (fiber) / v10 (drei) line targets React 19 and would be a breaking
change against React 18.3.1. **Recommendation for Phase 12: do not upgrade the R3F stack; add an
`overrides` entry for `three-mesh-bvh@^0.8.0` instead, and verify the CAD/3D viewer still works.**

## 7. Other dependency hygiene observations (recorded, not fixed)

| Observation | Evidence | Owner |
|---|---|---|
| `@playwright/test` is in **`dependencies`**, not `devDependencies` | `package.json` dependency block | Phase 12 — a test runner in prod deps inflates `npm ci --omit=dev` installs. |
| Two esbuild majors coexist | `node_modules/esbuild@0.21.5` (vite 5) and `node_modules/lovable-tagger/node_modules/esbuild@0.25.0` | Phase 12 |
| `lovable-tagger@1.1.13` is a build-time devDependency of a platform the project has left | `CLAUDE.md`: "Lovable terk edildi (2026-05-12)"; `vite.config.ts` only loads it in `mode === "development"` | Phase 12 / Phase 01 |
| `caniuse-lite` browser data is **14 months old** | build warning | Phase 12 |
| `vitest.config.ts` exists but `vitest` is not installed and `src/test/setup.ts` does not exist | `vitest.config.ts:8` | Phase 01 |
| Both `framer-motion@12.34.0` **and** `gsap@3.14.2` load on the landing route (130.58 kB + 111.69 kB raw) | `reports/baseline/raw/landing-payload.txt` | Phase 12 |
| `xlsx-js-style@1.2.0` is pinned exactly and is 627 kB raw / 323 kB gzip | build output | Phase 12 |
| `occt-import-js@0.0.14` — pre-1.0, and externalises Node `path`/`crypto` in the browser build | build warnings | Phase 09 / Phase 12 |
| No `overrides` / `resolutions` block exists in `package.json` | read | Phase 12 |
