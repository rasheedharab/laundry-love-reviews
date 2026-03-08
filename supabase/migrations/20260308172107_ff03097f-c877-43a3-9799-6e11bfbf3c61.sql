
-- Loyalty points ledger
CREATE TABLE public.loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points integer NOT NULL,
  type text NOT NULL DEFAULT 'earn',
  description text,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON public.loyalty_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own points" ON public.loyalty_points
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, order_id, service_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  is_read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Referrals
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referral_code text NOT NULL UNIQUE,
  referred_user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  reward_points integer DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert own referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to award points on order completion
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO public.loyalty_points (user_id, points, type, description, order_id)
    VALUES (NEW.user_id, GREATEST(1, FLOOR(NEW.total / 10)), 'earn', 'Order completion reward', NEW.id);

    INSERT INTO public.notifications (user_id, title, body, type, link)
    VALUES (NEW.user_id, 'Points Earned! 🎉', 'You earned ' || GREATEST(1, FLOOR(NEW.total / 10)) || ' points from your order', 'reward', '/profile');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_completed
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.award_loyalty_points();
