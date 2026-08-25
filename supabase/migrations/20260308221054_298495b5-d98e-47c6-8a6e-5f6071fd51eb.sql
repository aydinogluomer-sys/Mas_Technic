
-- Notifications table for persistent notification history
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Staff insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (is_staff(auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "Staff read all notifications" ON public.notifications
  FOR SELECT TO authenticated USING (is_staff(auth.uid()));

-- Notification preferences table
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email_rfq boolean NOT NULL DEFAULT true,
  email_order boolean NOT NULL DEFAULT true,
  email_quality boolean NOT NULL DEFAULT true,
  email_finance boolean NOT NULL DEFAULT true,
  push_rfq boolean NOT NULL DEFAULT true,
  push_order boolean NOT NULL DEFAULT true,
  push_quality boolean NOT NULL DEFAULT true,
  push_finance boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own preferences" ON public.notification_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own preferences" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own preferences" ON public.notification_preferences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);
