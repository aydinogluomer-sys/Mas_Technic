---
description: RFQ/CAD upload, privacy, Supabase, form security, data-handling, validation, headers, and irreversible-action boundaries for MAS TECHNIC. Use when changing forms, uploads, backend calls, privacy/legal behavior, or security configuration.
---
# MAS TECHNIC RFQ / Security

- Treat CAD drawings and RFQ data as potentially confidential customer information.
- Do not change production Supabase schema/data without explicit authorization. Existing repository rules protecting `supabase/` remain in force unless the plan and user explicitly authorize otherwise.
- Validate files server-side where server handling exists; client validation is UX, not security. Check extension/MIME consistency and size/format limits.
- Prevent double submit, provide deterministic pending/success/error states, and expose what happens after submission.
- Use non-public/signed access patterns for confidential uploads when the backend supports them; avoid accidental public object URLs.
- Never claim encryption, retention, deletion, NDA, compliance or malware scanning unless verified.
- Privacy/consent copy must match the actual data flow.
- Review CSP, content-type, referrer, permissions, frame, HTTPS/HSTS posture as relevant to the deployment.
- Avoid leaking stack traces/secrets/environment values to the client.
- Spam/rate-limit protections should be proportional and not silently break legitimate RFQs.
- Production deploy, DB mutation, credential rotation and DNS changes are stop conditions unless pre-authorized.
