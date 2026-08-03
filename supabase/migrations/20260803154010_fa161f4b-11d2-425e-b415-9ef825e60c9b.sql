CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  photo_url text,
  team text,
  jersey_number text,
  position text,
  graduation_year text,
  height text,
  weight text,
  dominant_hand text,
  gpa text,
  bio text,
  sport text NOT NULL DEFAULT 'baseball',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE public.season_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  season text NOT NULL,
  sport text NOT NULL DEFAULT 'baseball',
  games_played integer,
  batting_average numeric,
  hits integer,
  home_runs integer,
  rbi integer,
  strikeouts integer,
  stolen_bases integer,
  wins integer,
  saves integer,
  era numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.season_stats TO authenticated;
GRANT SELECT ON public.season_stats TO anon;
GRANT ALL ON public.season_stats TO service_role;

ALTER TABLE public.season_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Season stats are publicly readable"
  ON public.season_stats
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT SELECT ON public.achievements TO anon;
GRANT ALL ON public.achievements TO service_role;

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are publicly readable"
  ON public.achievements
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER season_stats_updated_at
  BEFORE UPDATE ON public.season_stats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.profiles (
  slug, first_name, last_name, photo_url, team, jersey_number, position,
  graduation_year, height, weight, dominant_hand, gpa, bio, sport
)
VALUES (
  'demo-athlete',
  'Marcus',
  'Chen',
  NULL,
  'Westside Varsity Baseball',
  '14',
  'Shortstop / Pitcher',
  '2027',
  '6''1"',
  '175 lbs',
  'R / R',
  '3.85',
  'Marcus is a competitive two-way player focused on fundamentals, team wins, and consistent improvement. He brings leadership in the infield and a calm presence on the mound in high-pressure situations.',
  'baseball'
);

INSERT INTO public.season_stats (
  profile_id, season, sport, games_played, batting_average, hits, home_runs,
  rbi, strikeouts, stolen_bases, wins, saves, era
)
SELECT
  id,
  'Spring 2025',
  'baseball',
  28,
  0.342,
  38,
  4,
  22,
  18,
  12,
  5,
  2,
  2.14
FROM public.profiles
WHERE slug = 'demo-athlete';

INSERT INTO public.achievements (profile_id, title, description, date)
SELECT
  id,
  'All-Conference Shortstop',
  'Named to the All-Conference First Team for the 2025 spring season.',
  '2025-05-15'
FROM public.profiles
WHERE slug = 'demo-athlete';

INSERT INTO public.achievements (profile_id, title, description, date)
SELECT
  id,
  'Team MVP',
  'Voted Most Valuable Player by teammates and coaches.',
  '2025-06-02'
FROM public.profiles
WHERE slug = 'demo-athlete';