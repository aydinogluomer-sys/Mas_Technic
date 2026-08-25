
-- 1. Create role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'production', 'quality');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage roles, users can read their own
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2. Create security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: check if user has any staff-level role
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- 3. Fix RLS on ALL tables

-- == customers ==
DROP POLICY IF EXISTS "Allow public read-write on customers" ON public.customers;
CREATE POLICY "Staff can read customers" ON public.customers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update customers" ON public.customers FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete customers" ON public.customers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- == orders ==
DROP POLICY IF EXISTS "Allow public read-write on orders" ON public.orders;
CREATE POLICY "Staff can read orders" ON public.orders FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- == issues ==
DROP POLICY IF EXISTS "Allow public read-write on issues" ON public.issues;
CREATE POLICY "Staff can read issues" ON public.issues FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert issues" ON public.issues FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update issues" ON public.issues FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete issues" ON public.issues FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- == wbs ==
DROP POLICY IF EXISTS "Allow public read-write on wbs" ON public.wbs;
CREATE POLICY "Staff can read wbs" ON public.wbs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert wbs" ON public.wbs FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update wbs" ON public.wbs FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete wbs" ON public.wbs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- == rfqs (keep anonymous INSERT for public RFQ form) ==
DROP POLICY IF EXISTS "Allow public read-write on rfqs" ON public.rfqs;
CREATE POLICY "Anyone can submit RFQ" ON public.rfqs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff can read rfqs" ON public.rfqs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update rfqs" ON public.rfqs FOR UPDATE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete rfqs" ON public.rfqs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Fix storage: make cad-uploads private, keep anonymous upload
UPDATE storage.buckets SET public = false WHERE id = 'cad-uploads';

-- Drop existing permissive storage policies if any
DROP POLICY IF EXISTS "Allow public read from cad-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to cad-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert to cad-uploads" ON storage.objects;

-- Allow anonymous uploads (for public RFQ form)
CREATE POLICY "Anyone can upload CAD files"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'cad-uploads');

-- Only staff can read uploaded files
CREATE POLICY "Staff can read CAD files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'cad-uploads' AND public.is_staff(auth.uid()));

-- Only admins can delete files
CREATE POLICY "Admins can delete CAD files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'cad-uploads' AND public.has_role(auth.uid(), 'admin'));

-- 5. Admin role management policy
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
