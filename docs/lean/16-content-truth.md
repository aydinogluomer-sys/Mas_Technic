# 16 — Content Truth

> Two gates, not one. A fact must be **verified** *and* **cleared for
> publication**. Passing the first says nothing about the second.
> Source of policy: `USER_INPUTS.md` §0. Owner of enforcement: Phase 06.

## The two questions

| Question | Answered by | Failure mode if skipped |
|---|---|---|
| Is it true? | `USER_INPUTS.md` §A–§L | Fabrication — a certificate, a KPI, a measurement |
| May we publish it? | `USER_INPUTS.md` §0 visibility flags | Disclosure — team size, facility size, machine count, order volume |

`DEFAULT_FACT_VISIBILITY: INTERNAL_ONLY_UNLESS_PUBLIC_OK` and
`NEVER_PUBLISH_JUST_BECAUSE_KNOWN: YES`. A true fact is **not** automatically
publishable. Team size and facility size are exactly that case: real, known,
and forbidden.

## Where a public claim comes from

`src/content/claims.ts` — the ledger. Nothing else may originate a factual
claim about the company.

```ts
// Permitted: publish() only accepts a PublishableClaim.
export const MINIMUM_TOLERANCE = publish({
  value: "±0.01 mm",
  visibility: "PUBLIC_CORE",
  source: "USER_INPUTS.md §D — MINIMUM_TOLERANCE_INTERNAL: ±0.01 mm",
});

// Forbidden by the TYPE SYSTEM, not by review:
export const TEAM_SIZE = withhold({ visibility: "PRIVATE_DO_NOT_DISCLOSE", ... });
publish(TEAM_SIZE);   // ts(2345) — `value` missing, `visibility` not assignable
```

Every entry names the `USER_INPUTS.md` field that authorises it. **If a claim
is not in the ledger, it has no authorisation.**

## The machine gate

`node scripts/claims-gate.mjs` — 22 rules, each carrying the `USER_INPUTS.md`
field that decides it and the remedy. `node scripts/claims-gate.mjs --list`
prints the rule table.

Scope: `src/pages`, `src/components`, `src/data`, `src/content`, `index.html`,
excluding `admin/` and `musteri/`. JS/TS comments are skipped so a removal
stays explainable; **HTML comments are not**, because Vite ships `index.html`
verbatim and a comment there is public.

Wired into `e2e/landing/claims-gate.spec.ts`, which is `CRITICAL_MATCH`, so
`npm run test:e2e:critical` fails on a reintroduced claim. A second test writes
a probe file containing a forbidden string and requires a non-zero exit — a
gate nobody has watched fail is a gate nobody can trust.

## The rules, grouped

| Group | Catches |
|---|---|
| `unverified-certification`, `certifying-body`, `sector-standard-compliance` | AS9100, IATF 16949, ISO 13485, NADCAP, NIST 800-171, MIL-SPEC, AQAP, ITAR, AS9102, 21 CFR 820, ISO 13485/10993/14644 — and any named registrar |
| `tolerance-beyond-verified` | any ± figure tighter than the verified ±0.01 mm |
| `quote-sla-overpromise`, `delivery-or-quality-rate`, `process-capability-metric` | 48-hour quotes, on-time/quality percentages, OEE, Cpk, PPAP |
| `company-scale-disclosure`, `machine-inventory`, `named-supplier`, `named-enterprise-system` | headcount, floor area, machine and supplier names, 24/7 running, ERP/MES/CAM systems |
| `fabricated-analytics` | view counts and anything derived from them (`ANALYTICS_PROVIDER: NONE`) |
| `demo-placeholder-badge`, `fake-verification`, `fabricated-report-number` | DEMO/ÖRNEK/HAZIRLANIYOR badges, verification QR, forged signature or seal, invented report numbers |
| `unapproved-confidentiality`, `unconditional-guarantee` | NDA/retention/clearance promises, `%100 kontrol`, delivery guarantees |
| `unverified-reference`, `unverified-social`, `english-availability`, `wrong-city` | non-`PUBLIC_OK` client names, absent social accounts, a language the site does not serve, the wrong city |
| `marketing-filler` | superlatives with no proof behind them |

## Case studies

`src/content/caseStudies.ts`. The union is discriminated on `kind`:

- `capability` — how MAS approaches a part family. `client`, `reportNo` and
  `measuredResults` are typed `never`, so it cannot grow project evidence.
- `anonymised-project` — real work, no client name; requires
  `permission: "ANONYMISED"` and carries a `sector` instead of a customer.

There is deliberately **no `named-project` variant**. Naming a client needs two
separate permissions — §F `PUBLIC_OK` for the name *and* written consent for
the project — and that is a human decision, not a refactor.

`USER_INPUTS.md` §G currently reads `CASE_STUDIES: NONE_PROVIDED_YET`, so the
site ships capability profiles.

## Published documents

`QUALITY_RESOURCES` in the ledger. The four §H PDFs live in `public/belgeler/`.
The gate re-measures every printed file size from disk: before Phase 06 all
four sizes were invented, for files that were never copied into the build.

## When you cannot verify something

**Remove it. Softening is not removing.** "Yaklaşık", "up to" and "'e varan"
applied to an unverified number is still an unverified claim. Where a figure
goes, replace it with the mechanism behind it — what is controlled, how, and
what record it leaves. That reads stronger anyway.

## Positioning guardrail

`DO_NOT_USE_SMALL_WORKSHOP_LANGUAGE: YES` **and**
`DO_NOT_INVENT_LARGE_COMPANY_LANGUAGE: YES`. Removing a scale claim must not
produce apologetic copy. Authority comes from
`PUBLIC_POSITIONING_PRIORITY: PRECISION_ENGINEERING, MEASUREMENT, TRACEABILITY,
PROCESS_DISCIPLINE, TECHNICAL_RESPONSIVENESS`.
