ALTER TABLE public.highlights
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS proof_url text,
  ADD COLUMN IF NOT EXISTS proof_media_type text,
  ADD COLUMN IF NOT EXISTS verification_note text,
  ADD COLUMN IF NOT EXISTS reviewer_name text,
  ADD COLUMN IF NOT EXISTS submitted_for_review_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

ALTER TABLE public.highlights
  ADD CONSTRAINT highlights_verification_status_check
  CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));