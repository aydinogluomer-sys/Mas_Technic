
-- Fix old RFQ file paths: clear files that don't exist in storage
-- Only RFQ-1772885441615 and RFQ-1772794900427 have real files
UPDATE rfqs SET files = ARRAY[]::text[] WHERE id IN ('RFQ-2026-8080', 'RFQ-2026-9164', 'RFQ-2026-5597', 'RFQ-2026-5424', 'RFQ-2026-5884', 'RFQ-2026-6268', 'RFQ-2026-6144', 'RFQ-2026-8519');
