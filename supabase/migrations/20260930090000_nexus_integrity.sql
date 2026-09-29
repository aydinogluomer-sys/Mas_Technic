-- ════════════════════════════════════════════════════════════════════════
-- NEXUS INTEGRITY (polish run 2026-09-30) — NOT APPLIED TO PRODUCTION
--
-- Written as a file only: USER_INPUTS.md §M ALLOW_PRODUCTION_DATABASE_MUTATION
-- is NO. The owner applies it (`supabase db push`) after review. Every
-- statement is idempotent.
--
--  1. pipeline_leads / machine_schedule — queried by the admin Pipeline and
--     Scheduling views and typed in types.ts, but created by no migration.
--  2. approve_rfq(_rfq_id) — customers hold only SELECT on rfqs, so the
--     portal's direct UPDATE matched zero rows and reported success. The
--     function approves only the caller's own, quoted, not-yet-approved row.
--  3. Customers may read their OWN files: cad-uploads/<uid>/… objects, and
--     finance-docs objects listed on a financial_documents row they own.
--     Both buckets were staff-only, so every signed URL failed for customers.
--  4. Panel tables join the supabase_realtime publication (the portal and
--     admin subscribe to ~20 postgres_changes channels; nothing added them).
-- ════════════════════════════════════════════════════════════════════════

-- 1 ── Missing admin tables ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pipeline_leads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company       text,
  contact_name  text,
  contact_email text,
  stage         text DEFAULT 'lead',
  value         numeric,
  probability   integer,
  last_action   text,
  notes         text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.machine_schedule (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine     text NOT NULL,
  week_start  date NOT NULL,
  day         text NOT NULL,
  hours       numeric,
  job_name    text,
  order_id    text,
  notes       text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.pipeline_leads   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_schedule ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff manage pipeline_leads" ON public.pipeline_leads;
CREATE POLICY "Staff manage pipeline_leads" ON public.pipeline_leads
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff manage machine_schedule" ON public.machine_schedule;
CREATE POLICY "Staff manage machine_schedule" ON public.machine_schedule
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- 2 ── Customer quote approval ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.approve_rfq(_rfq_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  approved_id text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  UPDATE public.rfqs
     SET customer_approved    = true,
         customer_approved_at = now(),
         status               = 'Onaylandı'
   WHERE id = _rfq_id
     AND user_id = auth.uid()
     AND quoted_price IS NOT NULL
     AND coalesce(customer_approved, false) = false
     AND (price_valid_until IS NULL OR price_valid_until >= current_date)
  RETURNING id INTO approved_id;

  RETURN approved_id; -- NULL when nothing matched: the client treats that as failure
END;
$$;

REVOKE ALL ON FUNCTION public.approve_rfq(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_rfq(text) TO authenticated;

-- 3 ── Customers read their own files ─────────────────────────────────────
DROP POLICY IF EXISTS "Customers read own cad uploads" ON storage.objects;
CREATE POLICY "Customers read own cad uploads" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'cad-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Customers read own finance docs" ON storage.objects;
CREATE POLICY "Customers read own finance docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'finance-docs'
    AND EXISTS (
      SELECT 1 FROM public.financial_documents fd
       WHERE fd.user_id = auth.uid()
         AND storage.objects.name = ANY (fd.file_urls)
    )
  );

-- 4 ── Realtime publication ───────────────────────────────────────────────
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'rfqs', 'orders', 'wbs', 'issues', 'pipeline_leads', 'machine_schedule',
    'notifications', 'support_tickets', 'support_messages', 'financial_documents',
    'quality_reports', 'customer_files'
  ] LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t)
       AND NOT EXISTS (
         SELECT 1 FROM pg_publication_tables
          WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
       ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
