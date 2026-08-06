CREATE POLICY "Highlight files are readable"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'highlights');

CREATE POLICY "Anyone can upload highlight files for now"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'highlights');

CREATE POLICY "Anyone can update highlight files for now"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'highlights');

CREATE POLICY "Anyone can delete highlight files for now"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'highlights');