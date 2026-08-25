
-- 1. Add data validation constraints to customers table
ALTER TABLE public.customers
  ADD CONSTRAINT check_customer_name_length CHECK (name IS NULL OR length(name) <= 200),
  ADD CONSTRAINT check_customer_company_length CHECK (company IS NULL OR length(company) <= 200),
  ADD CONSTRAINT check_customer_city_length CHECK (city IS NULL OR length(city) <= 100),
  ADD CONSTRAINT check_customer_phone_length CHECK (phone IS NULL OR length(phone) <= 30),
  ADD CONSTRAINT check_customer_email_length CHECK (email IS NULL OR length(email) <= 255),
  ADD CONSTRAINT check_customer_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 2. Add admin SELECT policy for user_roles so admins can audit all roles
CREATE POLICY "Admins can read all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
