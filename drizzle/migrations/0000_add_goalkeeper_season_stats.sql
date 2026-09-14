ALTER TABLE public.season_stats
  ADD COLUMN IF NOT EXISTS goals_conceded integer,
  ADD COLUMN IF NOT EXISTS shots_faced integer,
  ADD COLUMN IF NOT EXISTS pk_faced integer,
  ADD COLUMN IF NOT EXISTS high_claims integer,
  ADD COLUMN IF NOT EXISTS punches integer,
  ADD COLUMN IF NOT EXISTS catches integer;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.season_stats TO authenticated;
GRANT SELECT ON public.season_stats TO anon;
GRANT ALL ON public.season_stats TO service_role;