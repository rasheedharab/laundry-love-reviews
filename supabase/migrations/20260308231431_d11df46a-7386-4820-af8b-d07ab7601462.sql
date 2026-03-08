-- Add tagline columns to service_categories
ALTER TABLE public.service_categories 
  ADD COLUMN tagline_badge text,
  ADD COLUMN tagline_title text,
  ADD COLUMN tagline_subtitle text;

-- Create ritual_steps table
CREATE TABLE public.ritual_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number integer NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT 'sparkles',
  color_class text DEFAULT 'bg-primary/10 text-primary',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.ritual_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active ritual steps" ON public.ritual_steps FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage ritual steps" ON public.ritual_steps FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create care_tips table
CREATE TABLE public.care_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'scissors',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.care_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active care tips" ON public.care_tips FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage care tips" ON public.care_tips FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create site_settings table (key-value)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));