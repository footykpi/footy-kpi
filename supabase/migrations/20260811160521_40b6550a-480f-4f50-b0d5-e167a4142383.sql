DROP POLICY IF EXISTS "Profiles are publicly readable" ON public.profiles;
CREATE POLICY "Public profiles are readable"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (visibility = 'public');

DROP POLICY IF EXISTS "Achievements are publicly readable" ON public.achievements;
CREATE POLICY "Achievements of public profiles are readable"
ON public.achievements
FOR SELECT
TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = achievements.profile_id AND p.visibility = 'public'
));

DROP POLICY IF EXISTS "Season stats are publicly readable" ON public.season_stats;
CREATE POLICY "Season stats of public profiles are readable"
ON public.season_stats
FOR SELECT
TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = season_stats.profile_id AND p.visibility = 'public'
));