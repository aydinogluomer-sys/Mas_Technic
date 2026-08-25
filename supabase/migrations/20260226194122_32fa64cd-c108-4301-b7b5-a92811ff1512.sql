
-- Fix documents table missing RLS policies
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read documents" ON public.documents FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff can insert documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Admins can delete documents" ON public.documents FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
