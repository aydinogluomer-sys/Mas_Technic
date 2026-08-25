
-- Restrict financial_documents SELECT to admin only
DROP POLICY IF EXISTS "Staff can read financial_documents" ON public.financial_documents;
CREATE POLICY "Admins can read financial_documents" ON public.financial_documents
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Restrict financial_documents INSERT to admin only
DROP POLICY IF EXISTS "Staff can insert financial_documents" ON public.financial_documents;
CREATE POLICY "Admins can insert financial_documents" ON public.financial_documents
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Restrict financial_documents UPDATE to admin only
DROP POLICY IF EXISTS "Staff can update financial_documents" ON public.financial_documents;
CREATE POLICY "Admins can update financial_documents" ON public.financial_documents
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
