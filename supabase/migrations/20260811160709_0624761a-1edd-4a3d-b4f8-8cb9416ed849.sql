CREATE OR REPLACE FUNCTION public.validate_season_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gp integer := COALESCE(NEW.games_played, 0);
BEGIN
  IF NEW.season IS NULL OR NEW.season !~ '^[0-9]{4}(/[0-9]{2,4})?$' THEN
    RAISE EXCEPTION 'season must look like 2026 or 2025/26';
  END IF;

  IF NEW.games_played IS NOT NULL AND (NEW.games_played < 0 OR NEW.games_played > 200) THEN
    RAISE EXCEPTION 'games_played must be between 0 and 200';
  END IF;

  IF NEW.minutes_played IS NOT NULL AND (NEW.minutes_played < 0 OR NEW.minutes_played > 24000) THEN
    RAISE EXCEPTION 'minutes_played must be between 0 and 24000';
  END IF;

  IF NEW.pass_completion IS NOT NULL AND (NEW.pass_completion < 0 OR NEW.pass_completion > 100) THEN
    RAISE EXCEPTION 'pass_completion must be between 0 and 100';
  END IF;

  IF LEAST(
       COALESCE(NEW.goals, 0), COALESCE(NEW.assists, 0), COALESCE(NEW.shots, 0),
       COALESCE(NEW.shots_on_goal, 0), COALESCE(NEW.yellow_cards, 0), COALESCE(NEW.red_cards, 0),
       COALESCE(NEW.penalty_kicks, 0), COALESCE(NEW.pk_saves, 0), COALESCE(NEW.saves, 0),
       COALESCE(NEW.clean_sheets, 0), COALESCE(NEW.fouls, 0), COALESCE(NEW.tackles, 0),
       COALESCE(NEW.interceptions, 0), COALESCE(NEW.headers_won, 0), COALESCE(NEW.mvp_awards, 0)
     ) < 0 THEN
    RAISE EXCEPTION 'season stat counts cannot be negative';
  END IF;

  IF GREATEST(
       COALESCE(NEW.goals, 0), COALESCE(NEW.assists, 0), COALESCE(NEW.shots, 0),
       COALESCE(NEW.shots_on_goal, 0), COALESCE(NEW.penalty_kicks, 0), COALESCE(NEW.pk_saves, 0),
       COALESCE(NEW.saves, 0), COALESCE(NEW.fouls, 0), COALESCE(NEW.tackles, 0),
       COALESCE(NEW.interceptions, 0), COALESCE(NEW.headers_won, 0)
     ) > 5000 THEN
    RAISE EXCEPTION 'season stat counts are unrealistically high';
  END IF;

  IF NEW.shots IS NOT NULL AND NEW.shots_on_goal IS NOT NULL AND NEW.shots_on_goal > NEW.shots THEN
    RAISE EXCEPTION 'shots_on_goal cannot exceed shots';
  END IF;

  IF NEW.shots_on_goal IS NOT NULL AND NEW.goals IS NOT NULL AND NEW.goals > NEW.shots_on_goal THEN
    RAISE EXCEPTION 'goals cannot exceed shots_on_goal';
  END IF;

  IF NEW.games_played IS NOT NULL THEN
    IF NEW.minutes_played IS NOT NULL AND NEW.minutes_played > gp * 120 THEN
      RAISE EXCEPTION 'minutes_played cannot exceed 120 per game played';
    END IF;
    IF NEW.red_cards IS NOT NULL AND NEW.red_cards > gp THEN
      RAISE EXCEPTION 'red_cards cannot exceed games_played';
    END IF;
    IF NEW.yellow_cards IS NOT NULL AND NEW.yellow_cards > gp * 2 THEN
      RAISE EXCEPTION 'yellow_cards cannot exceed 2 per game played';
    END IF;
    IF NEW.clean_sheets IS NOT NULL AND NEW.clean_sheets > gp THEN
      RAISE EXCEPTION 'clean_sheets cannot exceed games_played';
    END IF;
    IF NEW.mvp_awards IS NOT NULL AND NEW.mvp_awards > gp THEN
      RAISE EXCEPTION 'mvp_awards cannot exceed games_played';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS season_stats_validate ON public.season_stats;
CREATE TRIGGER season_stats_validate
BEFORE INSERT OR UPDATE ON public.season_stats
FOR EACH ROW EXECUTE FUNCTION public.validate_season_stats();