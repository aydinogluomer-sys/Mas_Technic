---
name: mas-seo-metadata
description: Technical SEO, route metadata, canonical, sitemap, robots, structured data, social cards, crawlability, and 404 rules for MAS TECHNIC. Use for any public route or metadata phase.
---
# MAS TECHNIC SEO & Metadata

- Use the real production domain from `USER_INPUTS.md`; never ship Lovable preview canonical/OG URLs.
- Resolve location/company-language inconsistencies across HTML, JSON-LD and public copy.
- Every indexable route needs deliberate title, description, canonical, OG title/description/url/image and appropriate Twitter metadata.
- Only claim `availableLanguage` variants that actually exist.
- Generate production sitemap with indexable routes only; exclude test/preview/legacy/admin/private routes.
- `robots.txt` must match deployment intent; preview/staging should not be indexed.
- 404 should be a real missing-route experience and production hosting should return appropriate status where architecture permits; avoid soft-404 content patterns.
- Remove redirect chains, broken internal links, orphan pages and canonical loops.
- Structured data must reflect verifiable facts only.
- Create stable branded OG assets rather than temporary preview-host images.
