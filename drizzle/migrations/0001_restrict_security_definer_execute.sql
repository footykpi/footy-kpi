CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

-- Move the role-check helper out of the exposed API schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
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
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- Trigger functions must not be callable through the API
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_game() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.validate_season_stats() FROM PUBLIC, anon;

-- RLS helpers stay callable by signed-in users only (required by policies)
REVOKE ALL ON FUNCTION public.owns_profile(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_accepted_coach(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owns_profile(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_accepted_coach(uuid) TO authenticated, service_role;