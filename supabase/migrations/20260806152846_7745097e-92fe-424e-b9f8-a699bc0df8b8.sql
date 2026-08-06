CREATE TABLE public.highlights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_type text NOT NULL DEFAULT 'photo',
  category text NOT NULL DEFAULT 'moment',
  title text,
  caption text,
  url text NOT NULL,
  thumbnail_url text,
  highlight_date date,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT highlights_media_type_check CHECK (media_type IN ('photo','video')),
  CONSTRAINT highlights_category_check CHECK (category IN ('moment','award','certificate','medal'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.highlights TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.highlights TO anon;
GRANT ALL ON public.highlights TO service_role;

ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Highlights are publicly readable"
  ON public.highlights FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can add highlights for now"
  ON public.highlights FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can remove highlights for now"
  ON public.highlights FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE TRIGGER highlights_updated_at
  BEFORE UPDATE ON public.highlights
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX highlights_profile_idx ON public.highlights (profile_id, sort_order);