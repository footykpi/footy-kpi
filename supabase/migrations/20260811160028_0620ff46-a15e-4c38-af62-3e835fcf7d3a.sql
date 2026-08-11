ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS journal_went_well text,
  ADD COLUMN IF NOT EXISTS journal_improve text,
  ADD COLUMN IF NOT EXISTS journal_next_goal text,
  ADD COLUMN IF NOT EXISTS journal_updated_at timestamp with time zone;

UPDATE public.games
SET journal_went_well = COALESCE(journal_went_well, player_reflection),
    journal_updated_at = COALESCE(journal_updated_at, updated_at)
WHERE player_reflection IS NOT NULL;