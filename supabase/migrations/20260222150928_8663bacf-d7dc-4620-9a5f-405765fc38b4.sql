
-- Insert seed data for orders
INSERT INTO public.orders (id, rfq_ref, customer, part_name, quantity, order_date, deadline, status, progress) VALUES
('ORD-2025-101', 'RFQ-2026-8519', 'Yılmaz Makina', 'Motor Gövdesi', 50, '2025-02-10', '2025-02-28', 'Üretimde', 75),
('ORD-2025-102', 'RFQ-2026-6144', 'Demir Otomotiv', 'Bağlantı Plakası', 1000, '2025-02-12', '2025-03-05', 'Hazırlık', 10),
('ORD-2025-103', NULL, 'Kaya Medikal', 'Dişli Mili', 25, '2025-02-15', '2025-02-25', 'Kalite Kontrol', 90),
('ORD-2025-104', NULL, 'AeroDynamics Inc.', 'Türbin Flanşı', 14, '2025-02-18', '2025-03-10', 'Üretimde', 40),
('ORD-2025-105', 'RFQ-2026-6268', 'Teknik Plastik A.Ş.', 'Enjeksiyon Kalıbı', 1, '2025-02-20', '2025-03-15', 'Hazırlık', 5);

-- Insert seed data for customers
INSERT INTO public.customers (name, company, city, phone, email, balance, last_order) VALUES
('Ahmet Yılmaz', 'Yılmaz Makina', 'İstanbul', '+90 532 111 22 33', 'ahmet@yilmazmakina.com', 15000, '2025-02-10'),
('Mehmet Demir', 'Demir Otomotiv', 'Bursa', '+90 533 222 33 44', 'mehmet@demirotomotiv.com', 45000, '2025-02-12'),
('Dr. Zeynep Kaya', 'Kaya Medikal', 'Ankara', '+90 534 333 44 55', 'zeynep@kayamedikal.com', 8500, '2025-02-15'),
('Emre Çelik', 'AeroDynamics Inc.', 'Eskişehir', '+90 535 444 55 66', 'emre@aerodynamics.com', 120000, '2025-02-18'),
('Fatma Arslan', 'Teknik Plastik A.Ş.', 'Kocaeli', '+90 536 555 66 77', 'fatma@teknikplastik.com', 22000, '2025-02-20'),
('Hasan Öztürk', 'Öztürk Savunma', 'Ankara', '+90 537 666 77 88', 'hasan@ozturksavunma.com', 250000, '2025-01-28');

-- Insert seed data for wbs
INSERT INTO public.wbs (id, customer, part_name, machine, current_step, status, deadline, total_qty) VALUES
('WBS-001', 'Yılmaz Makina', 'Motor Gövdesi', 'CNC-01', 3, 'active', '2025-02-28', 50),
('WBS-002', 'Demir Otomotiv', 'Bağlantı Plakası', 'CNC-02', 1, 'active', '2025-03-05', 1000),
('WBS-003', 'Kaya Medikal', 'Dişli Mili', 'Lazer-01', 4, 'active', '2025-02-25', 25),
('WBS-004', 'AeroDynamics Inc.', 'Türbin Flanşı', 'CNC-01', 2, 'paused', '2025-03-10', 14),
('WBS-005', 'Teknik Plastik A.Ş.', 'Enjeksiyon Kalıbı', NULL, 0, 'waiting', '2025-03-15', 1);

-- Insert seed data for issues
INSERT INTO public.issues (id, job, category, date, status, severity, machine, detail, resolution, cost) VALUES
('ISS-001', 'PO-9928', 'Kritik Donanım', '2025-02-18', 'pending', 'high', 'CNC-03', 'Spindle arızası — Hata kodu E-0442. Yüksek titreşim tespit edildi, rulman değişimi gerekebilir.', NULL, 4500),
('ISS-002', 'PO-9930', 'Takım Arızası', '2025-02-17', 'resolved', 'normal', 'CNC-01', 'Ø12 parmak freze kırılması. Talaş sıkışması nedeniyle takım kırıldı.', 'Takım değiştirildi, ilerleme hızı %15 düşürüldü. Soğutma sıvısı basıncı artırıldı.', 850),
('ISS-003', 'PO-9931', 'CAM/NC Hatası', '2025-02-19', 'pending', 'normal', 'CNC-02', 'Yanlış takım çağırma komutu — T12 yerine T15 çağrıldı. Bağlantı plakasında ölçü kaçıklığı.', NULL, 1200),
('ISS-004', 'PO-9932', 'İnsan Hatası', '2025-02-20', 'pending', 'low', 'Abkant-01', 'Yanlış bükme açısı — 90° yerine 87° bükülmüş. Kalıp ayarı kontrol edilmeli.', NULL, 300),
('ISS-005', 'PO-9928', 'Kaynak Kusuru', '2025-02-16', 'resolved', 'high', 'Kaynak-01', 'Gözenekli kaynak dikişi tespit edildi. MIG gazı karışım oranı yanlış ayarlanmış.', 'Gaz karışımı düzeltildi (%82 Ar + %18 CO2). Dikişler yeniden çekildi ve NDT ile kontrol edildi.', 2100);
