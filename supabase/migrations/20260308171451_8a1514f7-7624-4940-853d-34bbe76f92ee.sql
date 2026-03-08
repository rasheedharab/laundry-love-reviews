ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS service_level text DEFAULT 'regular';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text;