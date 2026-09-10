-- Data API grants (PostgREST) for all public tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.highlights TO authenticated;
GRANT SELECT ON public.highlights TO anon;
GRANT ALL ON public.highlights TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.season_stats TO authenticated;
GRANT SELECT ON public.season_stats TO anon;
GRANT ALL ON public.season_stats TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT SELECT ON public.achievements TO anon;
GRANT ALL ON public.achievements TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT ALL ON public.games TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_media TO authenticated;
GRANT ALL ON public.game_media TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_links TO authenticated;
GRANT ALL ON public.coach_links TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_private_details TO authenticated;
GRANT ALL ON public.profile_private_details TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_unlock_links TO authenticated;
GRANT ALL ON public.profile_unlock_links TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
