
-- TPM Bakım Kayıtları tablosu
CREATE TABLE public.maintenance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  machine TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Periyodik',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration TEXT,
  cost NUMERIC DEFAULT 0,
  detail TEXT,
  technician TEXT,
  status TEXT DEFAULT 'Tamamlandı',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read maintenance_logs" ON public.maintenance_logs FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Staff can insert maintenance_logs" ON public.maintenance_logs FOR INSERT WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff can update maintenance_logs" ON public.maintenance_logs FOR UPDATE USING (is_staff(auth.uid()));
CREATE POLICY "Admins can delete maintenance_logs" ON public.maintenance_logs FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Tezgah Sağlık Durumu tablosu
CREATE TABLE public.machine_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  spindle_hours INTEGER DEFAULT 0,
  next_maintenance INTEGER DEFAULT 5000,
  filter_life INTEGER DEFAULT 100,
  oil_level INTEGER DEFAULT 100,
  status TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.machine_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read machine_health" ON public.machine_health FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Staff can insert machine_health" ON public.machine_health FOR INSERT WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff can update machine_health" ON public.machine_health FOR UPDATE USING (is_staff(auth.uid()));
CREATE POLICY "Admins can delete machine_health" ON public.machine_health FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Kesici Takım Envanteri tablosu
CREATE TABLE public.tool_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  unit_cost NUMERIC DEFAULT 0,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tool_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read tool_inventory" ON public.tool_inventory FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Staff can insert tool_inventory" ON public.tool_inventory FOR INSERT WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff can update tool_inventory" ON public.tool_inventory FOR UPDATE USING (is_staff(auth.uid()));
CREATE POLICY "Admins can delete tool_inventory" ON public.tool_inventory FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Hammadde Envanteri tablosu
CREATE TABLE public.raw_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  spec TEXT,
  stock INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'adet',
  unit_cost NUMERIC DEFAULT 0,
  waste_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read raw_materials" ON public.raw_materials FOR SELECT USING (is_staff(auth.uid()));
CREATE POLICY "Staff can insert raw_materials" ON public.raw_materials FOR INSERT WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff can update raw_materials" ON public.raw_materials FOR UPDATE USING (is_staff(auth.uid()));
CREATE POLICY "Admins can delete raw_materials" ON public.raw_materials FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed: machine_health
INSERT INTO public.machine_health (name, spindle_hours, next_maintenance, filter_life, oil_level, status) VALUES
  ('CNC-01', 4280, 5000, 82, 95, 'normal'),
  ('CNC-02', 7800, 8000, 34, 78, 'warning'),
  ('CNC-03', 3100, 5000, 91, 100, 'down'),
  ('Lazer-01', 2400, 3000, 67, 88, 'normal'),
  ('Abkant-01', 6200, 7000, 45, 62, 'maintenance'),
  ('CMM-01', 1800, 5000, 96, 100, 'normal');

-- Seed: maintenance_logs
INSERT INTO public.maintenance_logs (machine, type, date, duration, cost, detail, technician, status) VALUES
  ('CNC-01', 'Periyodik', '2025-02-15', '2 saat', 1200, 'Spindle rulman kontrolü, yağ değişimi', 'Ahmet K.', 'Tamamlandı'),
  ('CNC-03', 'Arıza', '2025-02-18', '8 saat', 4500, 'Spindle arızası — rulman değişimi', 'Mehmet Y.', 'Tamamlandı'),
  ('Abkant-01', 'Periyodik', '2025-02-10', '3 saat', 800, 'Hidrolik sistem kontrolü ve filtre değişimi', 'Ali D.', 'Tamamlandı'),
  ('Lazer-01', 'Kalibrasyon', '2025-02-12', '1 saat', 600, 'Lazer güç kalibrasyonu', 'Veli S.', 'Tamamlandı'),
  ('CNC-02', 'Periyodik', '2025-01-28', '4 saat', 2100, 'Genel bakım, soğutma sistemi temizliği', 'Ahmet K.', 'Tamamlandı'),
  ('CMM-01', 'Kalibrasyon', '2025-02-05', '2 saat', 950, 'Prob kalibrasyonu ve doğrulama', 'Veli S.', 'Tamamlandı');

-- Seed: tool_inventory
INSERT INTO public.tool_inventory (code, name, category, stock, min_stock, unit_cost, supplier) VALUES
  ('TK-001', 'Ø12 Parmak Freze (HSS)', 'Freze', 8, 5, 180, 'Dormer Pramet'),
  ('TK-002', 'Ø6 Karbür Parmak Freze', 'Freze', 3, 5, 420, 'Sandvik'),
  ('TK-003', 'CNMG 120408 Insert', 'Kesici Uç', 24, 10, 85, 'Iscar'),
  ('TK-004', 'WNMG 080408 Insert', 'Kesici Uç', 2, 8, 72, 'Kennametal'),
  ('TK-005', 'Ø8.5 HSS Matkap', 'Matkap', 12, 6, 45, 'Gühring'),
  ('TK-006', 'M10x1.5 Kılavuz', 'Kılavuz', 4, 4, 95, 'Emuge'),
  ('TK-007', 'Ø16 Karbür Matkap', 'Matkap', 1, 3, 650, 'Sandvik');

-- Seed: raw_materials
INSERT INTO public.raw_materials (code, name, spec, stock, unit, unit_cost, waste_rate) VALUES
  ('HM-001', 'Alüminyum 6061-T6', 'Ø80 × 300mm', 45, 'adet', 320, 22),
  ('HM-002', 'Çelik 1040 (C45)', 'Ø60 × 200mm', 120, 'adet', 180, 28),
  ('HM-003', 'AISI 316L', '150×150×50mm', 8, 'adet', 890, 35),
  ('HM-004', 'POM-C (Delrin)', 'Ø100 × 500mm', 15, 'adet', 210, 15),
  ('HM-005', '7075-T6 Alüminyum', '200×100×30mm', 22, 'adet', 540, 40);
