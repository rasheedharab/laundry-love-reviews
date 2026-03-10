-- Add preferred_outlet_id to profiles for persisting outlet selection
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_outlet_id UUID REFERENCES public.outlets(id) ON DELETE SET NULL;
