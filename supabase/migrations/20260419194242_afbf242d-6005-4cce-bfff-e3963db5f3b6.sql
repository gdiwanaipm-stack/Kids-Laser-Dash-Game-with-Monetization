-- Track one-time unlocks (e.g. levels 3-5)
CREATE TABLE public.game_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  stripe_session_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, product, environment)
);

ALTER TABLE public.game_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own unlocks"
  ON public.game_unlocks FOR SELECT
  USING (auth.uid() = user_id);

-- Orders / payment records
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  product_id TEXT,
  price_id TEXT,
  amount INTEGER,
  currency TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  environment TEXT NOT NULL DEFAULT 'sandbox',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_game_unlocks_user ON public.game_unlocks(user_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);