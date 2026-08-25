
-- Fix "WITH CHECK (true)" on public INSERT policies to remove linter warnings
-- These are intentionally public forms but we add basic non-null checks instead of bare "true"

-- 1. faq_analytics: Anyone can insert, but must have event_type
DROP POLICY IF EXISTS "Anyone can insert faq analytics" ON public.faq_analytics;
CREATE POLICY "Anyone can insert faq analytics" ON public.faq_analytics
  FOR INSERT TO public
  WITH CHECK (event_type IS NOT NULL AND length(event_type) > 0);

-- 2. meetings: Anyone can submit meeting request, but must have required fields
DROP POLICY IF EXISTS "Anyone can submit meeting request" ON public.meetings;
CREATE POLICY "Anyone can submit meeting request" ON public.meetings
  FOR INSERT TO public
  WITH CHECK (
    name IS NOT NULL AND length(name) > 0
    AND email IS NOT NULL AND length(email) > 0
    AND meeting_date IS NOT NULL
    AND meeting_time IS NOT NULL
    AND topic IS NOT NULL AND length(topic) > 0
  );

-- 3. rfqs: Anyone can submit RFQ, but must have an id
DROP POLICY IF EXISTS "Anyone can submit RFQ" ON public.rfqs;
CREATE POLICY "Anyone can submit RFQ" ON public.rfqs
  FOR INSERT TO anon, authenticated
  WITH CHECK (id IS NOT NULL AND length(id) > 0);
