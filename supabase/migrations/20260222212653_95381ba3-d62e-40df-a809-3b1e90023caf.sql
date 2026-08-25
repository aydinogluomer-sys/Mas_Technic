
-- 1. Trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Financial documents table
CREATE TABLE IF NOT EXISTS public.financial_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_type text NOT NULL DEFAULT 'fatura',
  doc_number text,
  title text,
  vendor text,
  amount numeric DEFAULT 0,
  currency text DEFAULT 'TRY',
  vat_rate numeric DEFAULT 18,
  vat_amount numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  category text,
  doc_date date DEFAULT CURRENT_DATE,
  due_date date,
  status text DEFAULT 'beklemede',
  payment_status text DEFAULT 'ödenmedi',
  source text DEFAULT 'manuel',
  notes text,
  file_urls text[],
  ai_summary text,
  ai_category_suggestion text,
  tags text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read financial_documents" ON public.financial_documents FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Staff can insert financial_documents" ON public.financial_documents FOR INSERT WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff can update financial_documents" ON public.financial_documents FOR UPDATE USING (is_staff(auth.uid()));
CREATE POLICY "Admins can delete financial_documents" ON public.financial_documents FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Trigger
CREATE TRIGGER update_financial_documents_updated_at
  BEFORE UPDATE ON public.financial_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('finance-docs', 'finance-docs', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Staff can upload finance docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'finance-docs' AND is_staff(auth.uid()));
CREATE POLICY "Staff can read finance docs" ON storage.objects FOR SELECT USING (bucket_id = 'finance-docs' AND is_staff(auth.uid()));
CREATE POLICY "Staff can update finance docs" ON storage.objects FOR UPDATE USING (bucket_id = 'finance-docs' AND is_staff(auth.uid()));
CREATE POLICY "Admins can delete finance docs" ON storage.objects FOR DELETE USING (bucket_id = 'finance-docs' AND has_role(auth.uid(), 'admin'::app_role));

-- 5. Seed data
INSERT INTO public.financial_documents (doc_type, doc_number, title, vendor, amount, vat_rate, vat_amount, total_amount, category, doc_date, status, payment_status, source) VALUES
('fatura', 'FTR-2026-001', 'CNC Kesici Takım Alımı', 'Sandvik Coromant', 12500, 18, 2250, 14750, 'Takım Giderleri', '2026-02-15', 'onaylandı', 'ödendi', 'manuel'),
('fatura', 'FTR-2026-002', 'Alüminyum 6061 Hammadde', 'Assan Alüminyum', 34200, 18, 6156, 40356, 'Hammadde', '2026-02-18', 'onaylandı', 'ödenmedi', 'manuel'),
('fiş', 'FIS-2026-001', 'Atölye Sarf Malzeme', 'Tekzen', 890, 18, 160.2, 1050.2, 'Sarf Malzeme', '2026-02-20', 'onaylandı', 'ödendi', 'manuel'),
('çek', 'CEK-2026-001', 'Makine Bakım Hizmeti', 'CNC Servis A.Ş.', 8500, 18, 1530, 10030, 'Bakım', '2026-02-10', 'beklemede', 'vadeli', 'manuel'),
('dekont', 'DKT-2026-001', 'Elektrik Faturası Ödeme', 'BEDAŞ', 4200, 18, 756, 4956, 'Sabit Giderler', '2026-02-01', 'onaylandı', 'ödendi', 'manuel'),
('e-fatura', 'EFT-2026-001', 'Yazılım Lisans Yenileme', 'Mastercam Türkiye', 22000, 18, 3960, 25960, 'Yazılım', '2026-02-12', 'onaylandı', 'ödendi', 'e-fatura');
