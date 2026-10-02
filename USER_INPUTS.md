# MAS TECHNIC — USER INPUTS / PRIVATE TRUTH + PUBLICATION POLICY

> This file is an **internal execution brief**, not website copy.
> Providing a fact here NEVER means the fact should be published.
> The autonomous agents use these inputs to prevent fabrication, choose safe positioning, and decide what may or may not appear publicly.
>
> **Default rule:** `INTERNAL_ONLY_UNLESS_PUBLIC_OK`.
> If a fact is true but would weaken brand positioning, create unnecessary scale comparison, expose sensitive business information, or is simply not useful to a buyer, keep it private.
>
> For a factual field you cannot provide, use `UNKNOWN_REMOVE_IF_UNVERIFIED`.
> For a true fact you do not want public, use `PRIVATE_DO_NOT_DISCLOSE`.
> For a fact that may be shown publicly, use `PUBLIC_OK` in the relevant visibility field.

---

## 0. GLOBAL PUBLICATION / BRAND POLICY

- PUBLICATION_MODE: `SELECTIVE_PREMIUM`
- DEFAULT_FACT_VISIBILITY: `INTERNAL_ONLY_UNLESS_PUBLIC_OK`
- NEVER_PUBLISH_JUST_BECAUSE_KNOWN: `YES`
- DO_NOT_EMPHASIZE_COMPANY_SCALE: `YES`
- DO_NOT_PUBLISH_TEAM_SIZE_BY_DEFAULT: `YES`
- DO_NOT_PUBLISH_FACILITY_SIZE_BY_DEFAULT: `YES`
- DO_NOT_PUBLISH_REVENUE_OR_ORDER_VOLUME: `YES`
- DO_NOT_PUBLISH_MACHINE_COUNT_BY_DEFAULT: `YES`
- DO_NOT_USE_SMALL_WORKSHOP_LANGUAGE: `YES`
- DO_NOT_INVENT_LARGE_COMPANY_LANGUAGE: `YES`
- PUBLIC_POSITIONING_PRIORITY: `PRECISION_ENGINEERING, MEASUREMENT, TRACEABILITY, PROCESS_DISCIPLINE, TECHNICAL_RESPONSIVENESS`
- EXTRA_BRAND_NOTES: `NONE`

### Publication decision rule

For every factual item, the agent must classify it as one of:

- `PUBLIC_CORE` — strategically useful and verified; may be prominent.
- `PUBLIC_SUPPORTING` — verified but secondary; may appear contextually.
- `PRIVATE_DO_NOT_DISCLOSE` — true/internal but must never appear publicly.
- `REMOVE_IF_UNVERIFIED` — do not show unless independently verified.
- `ANONYMIZE` — may be used only without identifying the client/project.

**Truth and disclosure are separate decisions.**

---

## A. Production identity

- PRODUCTION_DOMAIN: `https://www.masmare.com`
- COMPANY_LEGAL_NAME_INTERNAL: `Mas Technic Makine Sanayi Ltd. Şti.`
- COMPANY_LEGAL_NAME_VISIBILITY: `PUBLIC_CORE`
- PUBLIC_BRAND_NAME: `MAS TECHNIC`
- PUBLIC_CITY: `İzmir`
- PUBLIC_DISTRICT: `Çiğli`
- PUBLIC_ADDRESS: `Ataşehir, 8287. Sk. No:4, 35620 Çiğli/İzmir`
- ADDRESS_VISIBILITY: `PUBLIC_SUPPORTING`
- PUBLIC_PHONE: `+90 536 564 51 94`
- SALES_EMAIL: `sales@mastechnic.com`
- GENERAL_EMAIL: `NONE`

## B. Languages

- TURKISH_LIVE: `YES`
- ENGLISH_LIVE_NOW: `NO`
- OTHER_LANGUAGES: `NONE`
- TARGET_ADDITIONAL_LANGUAGES: `EN, DE, AR, FA, RU`

## C. Verified certifications

> Give the truth for verification. Publication is separate.
> For each real certification provide: standard, certificate number if known, issuer, validity, source file/path if available.

- ISO_9001_VALUE: `VERIFIED`
- ISO_9001_VISIBILITY: `PUBLIC_OK`
- AS9100D_VALUE: `NONE`
- AS9100D_VISIBILITY: `REMOVE_IF_UNVERIFIED`
- ISO_14001_VALUE: `VERIFIED`
- ISO_14001_VISIBILITY: `PUBLIC_OK`
- IATF_16949_VALUE: `NONE`
- IATF_16949_VISIBILITY: `REMOVE_IF_UNVERIFIED`
- OTHER_CERTIFICATIONS: `OHSAS 18001 (PUBLIC_OK)`

## D. Capability / KPI truth

> These fields exist to stop the site from inventing numbers. They do **not** need to be published.
> Scale-revealing metrics should default to private.

- MINIMUM_TOLERANCE_INTERNAL: `±0.01 mm`
- MINIMUM_TOLERANCE_VISIBILITY: `PUBLIC_IF_VERIFIED_AND_STRATEGIC`
- QUOTE_RESPONSE_TIME_INTERNAL: `1-3 Days`
- QUOTE_RESPONSE_TIME_VISIBILITY: `PUBLIC_IF_VERIFIED_AND_STRATEGIC`
- MATERIAL_COUNT_INTERNAL: `UNKNOWN_REMOVE_IF_UNVERIFIED`
- MATERIAL_COUNT_VISIBILITY: `PRIVATE_DO_NOT_DISCLOSE`
- CMM_COVERAGE_INTERNAL: `THIRD_PARTY_ACCREDITED_ON_DEMAND`
- CMM_COVERAGE_VISIBILITY: `PUBLIC_IF_VERIFIED_AND_STRATEGIC`
- ON_TIME_DELIVERY_INTERNAL: `95%`
- ON_TIME_DELIVERY_VISIBILITY: `PUBLIC_IF_VERIFIED_AND_STRATEGIC`
- TEAM_SIZE_INTERNAL: `PRIVATE_DO_NOT_DISCLOSE`
- TEAM_SIZE_VISIBILITY: `PRIVATE_DO_NOT_DISCLOSE`
- MACHINE_COUNT_INTERNAL: `PRIVATE_DO_NOT_DISCLOSE`
- MACHINE_COUNT_VISIBILITY: `PRIVATE_DO_NOT_DISCLOSE`
- FACILITY_SIZE_INTERNAL: `PRIVATE_DO_NOT_DISCLOSE`
- FACILITY_SIZE_VISIBILITY: `PRIVATE_DO_NOT_DISCLOSE`
- REVENUE_OR_ORDER_VOLUME: `PRIVATE_DO_NOT_DISCLOSE`
- OTHER_PUBLIC_KPIS: `NONE`

## E. Services and sectors

- MUST_KEEP_SERVICES: `DERIVE_FROM_REPO`
- MUST_KEEP_SECTORS: `DERIVE_FROM_REPO`
- SERVICES_TO_REMOVE: `NONE`
- SECTORS_TO_REMOVE: `NONE`
- SERVICES_NOT_ACTUALLY_OFFERED: `NONE`
- SECTORS_NOT_ACTUALLY_SERVED: `NONE`

## F. Customers / references

> Internal truth can be supplied without publication permission.
> A client name/logo appears publicly only when explicitly marked `PUBLIC_OK`.

- HPT: `PUBLIC_OK`
- TAAC: `PUBLIC_OK`
- METSAN: `PUBLIC_OK`
- ZTM: `REMOVE_IF_UNVERIFIED`
- TEKNIK_BALANS: `PUBLIC_OK`
- AKON_HIDROLIK: `PUBLIC_OK`
- OTHER_REFERENCES: `TEKNOPAR (PUBLIC_OK)`

## G. Real project / case-study evidence

> Public case studies should communicate technical competence, not company scale.
> Confidential projects may be anonymized by default.

- CASE_STUDIES: `NONE_PROVIDED_YET`
- DEFAULT_CASE_STUDY_VISIBILITY: `ANONYMIZE`
- IF_NONE: `REMOVE_FAKE_PROJECT_EVIDENCE_AND_USE_NON_FACTUAL_CAPABILITY_CONTENT`

## H. Quality resources/documents

- QUALITY_POLICY_PDF: `Politikalar/Kalite Politikası.pdf`
- QUALITY_POLICY_VISIBILITY: `PUBLIC_OK`
- MEASUREMENT_EQUIPMENT_PDF: `Politikalar/Ölçüm Ekipmanları.pdf`
- MEASUREMENT_EQUIPMENT_VISIBILITY: `PUBLIC_OK`
- PACKAGING_GUIDE_PDF: `Politikalar/Paketleme Kılavuzu.pdf`
- PACKAGING_GUIDE_VISIBILITY: `PUBLIC_OK`
- SUPPLIER_CONDUCT_PDF: `Politikalar/Tedarikçi Davranış Kuralları.pdf`
- SUPPLIER_CONDUCT_VISIBILITY: `PUBLIC_OK`
- OTHER_PUBLIC_DOCS: `NONE`

## I. Brand / photography assets

- OFFICIAL_LOGO_ASSETS: `USE_REPO`
- FACILITY_PHOTOS: `NONE`
- FACILITY_PHOTOS_VISIBILITY: `PRIVATE_DO_NOT_DISCLOSE`
- MACHINE_PHOTOS: `NONE`
- TEAM_PHOTOS: `NONE`
- PROJECT_PHOTOS: `USE_REPO`
- DO_NOT_USE_ASSETS: `NONE`
- OPTIONAL_AWWWARDS_REFERENCES: `NONE`

### Asset publication rule

Do not use a truthful photo merely because it exists. Reject or crop assets that make the brand feel visually smaller, cluttered, low-end, unsafe, improvised, or inconsistent with the Technical Editorial art direction. Never falsify the facility; simply choose stronger truthful angles/details or omit weak imagery.

## J. RFQ / CAD business policy

- RFQ_RECIPIENT_EMAIL: `sales@mastechnic.com`
- ACCEPTED_CAD_FORMATS: `DERIVE_FROM_CURRENT_WORKING_IMPLEMENTATION`
- MAX_UPLOAD_SIZE: `DERIVE_FROM_BACKEND_OR_SHOW_NO_UNVERIFIED_LIMIT`
- QUOTE_SLA: `1-3 Days`
- CAD_RETENTION_PERIOD: `UNKNOWN_REMOVE_IF_UNVERIFIED`
- CAD_DELETE_REQUEST_PROCESS: `UNKNOWN_REMOVE_IF_UNVERIFIED`
- NDA_AVAILABLE: `NO`
- CONFIDENTIALITY_TEXT_APPROVED: `NO`

## K. Privacy / analytics / monitoring

- ANALYTICS_PROVIDER: `NONE`
- ANALYTICS_PUBLIC_CONFIG: `NONE`
- ERROR_MONITORING_PROVIDER: `NONE`
- ERROR_MONITORING_PUBLIC_CONFIG: `NONE`
- COOKIE_CONSENT_REQUIRED_BY_CURRENT_SETUP: `DERIVE_FROM_ACTUAL_SCRIPTS_AND_LEGAL_REQUIREMENTS`

Never place secret API keys in this file.

## L. Social links

- LINKEDIN: `PUBLIC_OK`
- INSTAGRAM: `PUBLIC_OK` — https://www.instagram.com/mastechnic (owner, 2026-10-01)
- FACEBOOK: `PUBLIC_OK` — https://www.facebook.com/mastechnic (owner, 2026-10-01)
- YOUTUBE: `NONE`
- X_TWITTER: `NONE`
- OTHER: `NONE`

## M. Git / release permissions

- ALLOW_PUSH_TO_AUTONOMOUS_BRANCH: `YES`
- ALLOW_MAIN_MERGE: `NO`
- ALLOW_PRODUCTION_DEPLOY: `NO`
- ALLOW_PRODUCTION_DATABASE_MUTATION: `NO`

## N. Preserve areas

- NEVER_REDESIGN_ADMIN: `YES`
- NEVER_REDESIGN_CUSTOMER_PANEL: `YES`
- OTHER_MUST_NOT_TOUCH_PATHS: `NONE`

## O. Optional final preferences

- KEEP_CURRENT_TECHNICAL_LANDING_ART_DIRECTION: `YES`
- PRIMARY_CREATIVE_THESIS: `MEASUREMENT_IS_THE_INTERACTION_MODEL`
- BRAND_SCALE_STRATEGY: `DO_NOT_DISCUSS_SCALE_UNLESS_IT_ADDS_CREDIBILITY`
- COPY_STRATEGY: `CAPABILITY_AND_EVIDENCE_OVER_COMPANY_SIZE`
- EXTRA_NOTES: `NONE`
