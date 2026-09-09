CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'property-images');

CREATE POLICY "Owners can upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can update own property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owners can delete own property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can manage property images storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'property-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'property-images' AND public.has_role(auth.uid(), 'admin'));