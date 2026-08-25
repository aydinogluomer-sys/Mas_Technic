
-- 1. customer_files: Teknik Arşiv
CREATE TABLE public.customer_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id text,
  rfq_id text,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT 'other',
  version integer DEFAULT 1,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customer_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers read own files" ON public.customer_files FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Customers insert own files" ON public.customer_files FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read all files" ON public.customer_files FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff manage files" ON public.customer_files FOR ALL TO authenticated USING (is_staff(auth.uid()));

-- 2. quality_reports: Kalite ve Raporlar
CREATE TABLE public.quality_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id text,
  report_type text DEFAULT 'cmm',
  title text NOT NULL,
  file_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quality_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers read own reports" ON public.quality_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Staff read all reports" ON public.quality_reports FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff manage reports" ON public.quality_reports FOR ALL TO authenticated USING (is_staff(auth.uid()));

-- 3. support_tickets: Destek
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open',
  priority text DEFAULT 'normal',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers read own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Customers create tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read all tickets" ON public.support_tickets FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff manage tickets" ON public.support_tickets FOR ALL TO authenticated USING (is_staff(auth.uid()));

-- 4. support_messages: Destek Mesajları
CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text NOT NULL,
  is_staff boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ticket owner read messages" ON public.support_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.support_tickets st WHERE st.id = ticket_id AND st.user_id = auth.uid())
);
CREATE POLICY "Users send messages" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff read all messages" ON public.support_messages FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff manage messages" ON public.support_messages FOR ALL TO authenticated USING (is_staff(auth.uid()));

-- 5. Extend rfqs with pricing columns
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS quoted_price numeric;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS price_valid_until date;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS customer_approved boolean DEFAULT false;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS customer_approved_at timestamptz;

-- 6. Add user_id to financial_documents for customer access
ALTER TABLE public.financial_documents ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE POLICY "Customers read own financial docs" ON public.financial_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 7. Create storage bucket for customer files
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-files', 'customer-files', false) ON CONFLICT (id) DO NOTHING;

-- Storage RLS for customer-files bucket
CREATE POLICY "Customers upload own files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'customer-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Customers read own files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'customer-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Staff access all customer files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'customer-files' AND is_staff(auth.uid()));
