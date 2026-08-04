CREATE TABLE public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport text NOT NULL DEFAULT 'baseball',
  season text,
  game_date date NOT NULL,
  opponent text NOT NULL,
  location text,
  team_score integer,
  opponent_score integer,
  result text,
  stats jsonb NOT NULL DEFAULT '{}'::jsonb,
  coach_notes text,
  player_reflection text,
  mood text,
  performance_rating integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.games TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.games TO authenticated;
GRANT ALL ON public.games TO service_role;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Games are publicly readable" ON public.games FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER games_updated_at BEFORE UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.validate_game()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.performance_rating IS NOT NULL AND (NEW.performance_rating < 1 OR NEW.performance_rating > 5) THEN
    RAISE EXCEPTION 'performance_rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_game() FROM PUBLIC;
CREATE TRIGGER games_validate BEFORE INSERT OR UPDATE ON public.games FOR EACH ROW EXECUTE FUNCTION public.validate_game();

CREATE TABLE public.game_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  media_type text NOT NULL DEFAULT 'photo',
  url text NOT NULL,
  thumbnail_url text,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.game_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_media TO authenticated;
GRANT ALL ON public.game_media TO service_role;
ALTER TABLE public.game_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Game media is publicly readable" ON public.game_media FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER game_media_updated_at BEFORE UPDATE ON public.game_media FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX games_profile_date_idx ON public.games (profile_id, game_date DESC);
CREATE INDEX game_media_game_idx ON public.game_media (game_id, sort_order);