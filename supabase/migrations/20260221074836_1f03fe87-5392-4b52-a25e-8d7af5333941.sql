
-- FAQ analytics table: tracks search queries and question clicks
CREATE TABLE public.faq_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('search', 'click')),
  query TEXT,
  question TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faq_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert analytics events (anonymous tracking)
CREATE POLICY "Anyone can insert faq analytics"
ON public.faq_analytics
FOR INSERT
WITH CHECK (true);

-- Only staff can read analytics
CREATE POLICY "Staff can read faq analytics"
ON public.faq_analytics
FOR SELECT
USING (is_staff(auth.uid()));

-- Only admins can delete analytics
CREATE POLICY "Admins can delete faq analytics"
ON public.faq_analytics
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for common queries
CREATE INDEX idx_faq_analytics_event_type ON public.faq_analytics (event_type);
CREATE INDEX idx_faq_analytics_created_at ON public.faq_analytics (created_at DESC);
CREATE INDEX idx_faq_analytics_query ON public.faq_analytics (query) WHERE event_type = 'search';
CREATE INDEX idx_faq_analytics_question ON public.faq_analytics (question) WHERE event_type = 'click';
