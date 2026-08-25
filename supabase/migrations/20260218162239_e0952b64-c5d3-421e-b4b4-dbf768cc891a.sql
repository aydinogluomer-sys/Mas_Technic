
-- Create meetings table for online meeting requests
CREATE TABLE public.meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,
  meeting_date date NOT NULL,
  meeting_time text NOT NULL,
  topic text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a meeting request (public form)
CREATE POLICY "Anyone can submit meeting request"
  ON public.meetings
  FOR INSERT
  WITH CHECK (true);

-- Staff can read meetings
CREATE POLICY "Staff can read meetings"
  ON public.meetings
  FOR SELECT
  USING (is_staff(auth.uid()));

-- Staff can update meetings (change status etc)
CREATE POLICY "Staff can update meetings"
  ON public.meetings
  FOR UPDATE
  USING (is_staff(auth.uid()));

-- Admins can delete meetings
CREATE POLICY "Admins can delete meetings"
  ON public.meetings
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
