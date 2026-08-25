
-- Add user_id to orders and rfqs
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Customer can read own orders
CREATE POLICY "Customers can read own orders"
ON public.orders FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Customer can read own rfqs
CREATE POLICY "Customers can read own rfqs"
ON public.rfqs FOR SELECT TO authenticated
USING (auth.uid() = user_id);
