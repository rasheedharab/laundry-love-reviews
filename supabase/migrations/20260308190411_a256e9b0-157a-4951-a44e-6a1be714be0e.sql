-- Create service-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true);

-- Allow anyone to read
CREATE POLICY "Public read service images" ON storage.objects FOR SELECT USING (bucket_id = 'service-images');

-- Allow admins to upload
CREATE POLICY "Admins can upload service images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to update
CREATE POLICY "Admins can update service images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete
CREATE POLICY "Admins can delete service images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'));

-- Add admin CRUD policies for service_categories
CREATE POLICY "Admins can insert categories" ON public.service_categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update categories" ON public.service_categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete categories" ON public.service_categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));