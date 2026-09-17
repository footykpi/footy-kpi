CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.owns_profile(_profile_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = _profile_id AND p.user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION private.is_accepted_coach(_profile_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coach_links cl
    WHERE cl.athlete_profile_id = _profile_id
      AND cl.status = 'accepted'
      AND cl.coach_user_id = auth.uid()
  )
$$;

REVOKE ALL ON FUNCTION private.owns_profile(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_accepted_coach(uuid) FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.owns_profile(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_accepted_coach(uuid) TO authenticated, service_role;

-- profiles
DROP POLICY IF EXISTS "Accepted coaches can read linked profiles" ON public.profiles;
CREATE POLICY "Accepted coaches can read linked profiles" ON public.profiles
  FOR SELECT TO authenticated USING (private.is_accepted_coach(id));

-- season_stats
DROP POLICY IF EXISTS "Athletes manage their own season stats" ON public.season_stats;
CREATE POLICY "Athletes manage their own season stats" ON public.season_stats
  FOR ALL TO authenticated USING (private.owns_profile(profile_id)) WITH CHECK (private.owns_profile(profile_id));
DROP POLICY IF EXISTS "Accepted coaches can read linked season stats" ON public.season_stats;
CREATE POLICY "Accepted coaches can read linked season stats" ON public.season_stats
  FOR SELECT TO authenticated USING (private.is_accepted_coach(profile_id));

-- achievements
DROP POLICY IF EXISTS "Athletes manage their own achievements" ON public.achievements;
CREATE POLICY "Athletes manage their own achievements" ON public.achievements
  FOR ALL TO authenticated USING (private.owns_profile(profile_id)) WITH CHECK (private.owns_profile(profile_id));
DROP POLICY IF EXISTS "Accepted coaches can read linked achievements" ON public.achievements;
CREATE POLICY "Accepted coaches can read linked achievements" ON public.achievements
  FOR SELECT TO authenticated USING (private.is_accepted_coach(profile_id));

-- games
DROP POLICY IF EXISTS "Athletes manage their own games" ON public.games;
CREATE POLICY "Athletes manage their own games" ON public.games
  FOR ALL TO authenticated USING (private.owns_profile(profile_id)) WITH CHECK (private.owns_profile(profile_id));
DROP POLICY IF EXISTS "Accepted coaches can read linked games" ON public.games;
CREATE POLICY "Accepted coaches can read linked games" ON public.games
  FOR SELECT TO authenticated USING (private.is_accepted_coach(profile_id));

-- coach_links
DROP POLICY IF EXISTS "Athletes manage their own coach invites" ON public.coach_links;
CREATE POLICY "Athletes manage their own coach invites" ON public.coach_links
  FOR ALL TO authenticated USING (private.owns_profile(athlete_profile_id)) WITH CHECK (private.owns_profile(athlete_profile_id));

-- game_media
DROP POLICY IF EXISTS "Athletes manage their own game media" ON public.game_media;
CREATE POLICY "Athletes manage their own game media" ON public.game_media
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.games g WHERE g.id = game_media.game_id AND private.owns_profile(g.profile_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.games g WHERE g.id = game_media.game_id AND private.owns_profile(g.profile_id)));
DROP POLICY IF EXISTS "Accepted coaches can read linked game media" ON public.game_media;
CREATE POLICY "Accepted coaches can read linked game media" ON public.game_media
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.games g WHERE g.id = game_media.game_id AND private.is_accepted_coach(g.profile_id)));

-- highlights
DROP POLICY IF EXISTS "Athletes manage their own highlights" ON public.highlights;
CREATE POLICY "Athletes manage their own highlights" ON public.highlights
  FOR ALL TO authenticated USING (private.owns_profile(profile_id)) WITH CHECK (private.owns_profile(profile_id));
DROP POLICY IF EXISTS "Accepted coaches can read linked highlights" ON public.highlights;
CREATE POLICY "Accepted coaches can read linked highlights" ON public.highlights
  FOR SELECT TO authenticated USING (private.is_accepted_coach(profile_id));
DROP POLICY IF EXISTS "Accepted coaches can review linked highlights" ON public.highlights;
CREATE POLICY "Accepted coaches can review linked highlights" ON public.highlights
  FOR UPDATE TO authenticated USING (private.is_accepted_coach(profile_id)) WITH CHECK (private.is_accepted_coach(profile_id));

-- profile_private_details
DROP POLICY IF EXISTS "Athletes manage their own private details" ON public.profile_private_details;
CREATE POLICY "Athletes manage their own private details" ON public.profile_private_details
  FOR ALL TO authenticated USING (private.owns_profile(profile_id)) WITH CHECK (private.owns_profile(profile_id));

-- profile_unlock_links
DROP POLICY IF EXISTS "Athletes manage their own unlock links" ON public.profile_unlock_links;
CREATE POLICY "Athletes manage their own unlock links" ON public.profile_unlock_links
  FOR ALL TO authenticated USING (private.owns_profile(profile_id)) WITH CHECK (private.owns_profile(profile_id));

DROP FUNCTION IF EXISTS public.owns_profile(uuid);
DROP FUNCTION IF EXISTS public.is_accepted_coach(uuid);