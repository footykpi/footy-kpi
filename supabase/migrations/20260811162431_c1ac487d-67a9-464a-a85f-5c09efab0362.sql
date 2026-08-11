DROP POLICY IF EXISTS "Highlight files are readable" ON storage.objects;

CREATE POLICY "Public highlight files are readable"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id = 'highlights'
    AND EXISTS (
      SELECT 1
      FROM public.highlights h
      WHERE (
        h.url = storage.objects.name
        OR h.proof_url = storage.objects.name
      )
      AND h.is_public = true
    )
  );
