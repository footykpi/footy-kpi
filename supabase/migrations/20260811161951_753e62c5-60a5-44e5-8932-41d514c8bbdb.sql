-- Remove public write policies on the highlights table
DROP POLICY IF EXISTS "Anyone can add highlights for now" ON public.highlights;
DROP POLICY IF EXISTS "Anyone can remove highlights for now" ON public.highlights;

-- Tighten grants: public read only, server role full access
REVOKE INSERT, UPDATE, DELETE ON public.highlights FROM anon, authenticated;
GRANT SELECT ON public.highlights TO anon, authenticated;
GRANT ALL ON public.highlights TO service_role;

-- Remove public write policies on the highlights storage bucket
DROP POLICY IF EXISTS "Anyone can upload highlight files for now" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update highlight files for now" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete highlight files for now" ON storage.objects;

-- Keep only the read policy on storage.objects for the highlights bucket
-- ("Highlight files are readable" remains)