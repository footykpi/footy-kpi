-- 1. Roles ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('athlete', 'coach', 'recruiter');

CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2. Remove demo data ----------------------------------------------------
DELETE FROM public.game_media WHERE game_id IS NOT NULL;
DELETE FROM public.games WHERE profile_id IS NOT NULL;
DELETE FROM public.season_stats WHERE profile_id IS NOT NULL;
DELETE FROM public.achievements WHERE profile_id IS NOT NULL;
DELETE FROM public.highlights WHERE profile_id IS NOT NULL;
DELETE FROM public.profile_private_details WHERE profile_id IS NOT NULL;
DELETE FROM public.profile_unlock_links WHERE profile_id IS NOT NULL;
DELETE FROM public.profiles WHERE id IS NOT NULL;

-- 3. Profile ownership ---------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN user_id uuid NOT NULL;
CREATE UNIQUE INDEX profiles_user_id_key ON public.profiles(user_id);

CREATE OR REPLACE FUNCTION public.owns_profile(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = _profile_id AND p.user_id = auth.uid()
  )
$$;

-- 4. Coach links ---------------------------------------------------------
CREATE TABLE public.coach_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_user_id uuid,
  coach_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (athlete_profile_id, coach_email)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_links TO authenticated;
GRANT ALL ON public.coach_links TO service_role;
ALTER TABLE public.coach_links ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER coach_links_updated_at
  BEFORE UPDATE ON public.coach_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Athletes manage their own coach invites"
  ON public.coach_links FOR ALL TO authenticated
  USING (public.owns_profile(athlete_profile_id))
  WITH CHECK (public.owns_profile(athlete_profile_id));

CREATE POLICY "Coaches read invites addressed to them"
  ON public.coach_links FOR SELECT TO authenticated
  USING (coach_user_id = auth.uid() OR lower(coach_email) = lower(COALESCE(auth.jwt() ->> 'email', '')));

CREATE POLICY "Coaches respond to invites addressed to them"
  ON public.coach_links FOR UPDATE TO authenticated
  USING (coach_user_id = auth.uid() OR lower(coach_email) = lower(COALESCE(auth.jwt() ->> 'email', '')))
  WITH CHECK (coach_user_id = auth.uid() OR lower(coach_email) = lower(COALESCE(auth.jwt() ->> 'email', '')));

CREATE OR REPLACE FUNCTION public.is_accepted_coach(_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.coach_links cl
    WHERE cl.athlete_profile_id = _profile_id
      AND cl.status = 'accepted'
      AND cl.coach_user_id = auth.uid()
  )
$$;

-- 5. Owner + coach access on athlete data --------------------------------
CREATE POLICY "Athletes manage their own profile"
  ON public.profiles FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Accepted coaches can read linked profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_accepted_coach(id));

CREATE POLICY "Athletes manage their own season stats"
  ON public.season_stats FOR ALL TO authenticated
  USING (public.owns_profile(profile_id))
  WITH CHECK (public.owns_profile(profile_id));

CREATE POLICY "Accepted coaches can read linked season stats"
  ON public.season_stats FOR SELECT TO authenticated
  USING (public.is_accepted_coach(profile_id));

CREATE POLICY "Athletes manage their own achievements"
  ON public.achievements FOR ALL TO authenticated
  USING (public.owns_profile(profile_id))
  WITH CHECK (public.owns_profile(profile_id));

CREATE POLICY "Accepted coaches can read linked achievements"
  ON public.achievements FOR SELECT TO authenticated
  USING (public.is_accepted_coach(profile_id));

CREATE POLICY "Athletes manage their own games"
  ON public.games FOR ALL TO authenticated
  USING (public.owns_profile(profile_id))
  WITH CHECK (public.owns_profile(profile_id));

CREATE POLICY "Accepted coaches can read linked games"
  ON public.games FOR SELECT TO authenticated
  USING (public.is_accepted_coach(profile_id));

CREATE POLICY "Athletes manage their own game media"
  ON public.game_media FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.games g WHERE g.id = game_id AND public.owns_profile(g.profile_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM public.games g WHERE g.id = game_id AND public.owns_profile(g.profile_id)));

CREATE POLICY "Accepted coaches can read linked game media"
  ON public.game_media FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.games g WHERE g.id = game_id AND public.is_accepted_coach(g.profile_id)));

CREATE POLICY "Athletes manage their own highlights"
  ON public.highlights FOR ALL TO authenticated
  USING (public.owns_profile(profile_id))
  WITH CHECK (public.owns_profile(profile_id));

CREATE POLICY "Accepted coaches can read linked highlights"
  ON public.highlights FOR SELECT TO authenticated
  USING (public.is_accepted_coach(profile_id));

CREATE POLICY "Accepted coaches can review linked highlights"
  ON public.highlights FOR UPDATE TO authenticated
  USING (public.is_accepted_coach(profile_id))
  WITH CHECK (public.is_accepted_coach(profile_id));

CREATE POLICY "Athletes manage their own private details"
  ON public.profile_private_details FOR ALL TO authenticated
  USING (public.owns_profile(profile_id))
  WITH CHECK (public.owns_profile(profile_id));

CREATE POLICY "Athletes manage their own unlock links"
  ON public.profile_unlock_links FOR ALL TO authenticated
  USING (public.owns_profile(profile_id))
  WITH CHECK (public.owns_profile(profile_id));