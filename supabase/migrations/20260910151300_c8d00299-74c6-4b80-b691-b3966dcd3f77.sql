REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.owns_profile(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_accepted_coach(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_profile(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_accepted_coach(uuid) TO authenticated, service_role;