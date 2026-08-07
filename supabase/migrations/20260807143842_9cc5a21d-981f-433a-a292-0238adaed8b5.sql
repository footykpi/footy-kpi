-- 1. Private details (never exposed to anon)
CREATE TABLE public.profile_private_details (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_email text,
  contact_phone text,
  guardian_name text,
  academic_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.profile_private_details TO service_role;
ALTER TABLE public.profile_private_details ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policies: reachable only via the trusted server role.

CREATE TRIGGER profile_private_details_updated_at
BEFORE UPDATE ON public.profile_private_details
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Role-based unlock links
CREATE TABLE public.profile_unlock_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('recruiter', 'coach')),
  token text NOT NULL UNIQUE,
  label text,
  unlock_contact boolean NOT NULL DEFAULT true,
  unlock_game_log boolean NOT NULL DEFAULT true,
  unlock_highlights boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  revoked_at timestamptz,
  view_count integer NOT NULL DEFAULT 0,
  last_viewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profile_unlock_links_profile_id_idx ON public.profile_unlock_links(profile_id);

GRANT ALL ON public.profile_unlock_links TO service_role;
ALTER TABLE public.profile_unlock_links ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policies: tokens are validated server-side only.

CREATE TRIGGER profile_unlock_links_updated_at
BEFORE UPDATE ON public.profile_unlock_links
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Highlights: reserve some for unlock-link holders
ALTER TABLE public.highlights ADD COLUMN is_public boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "Highlights are publicly readable" ON public.highlights;
CREATE POLICY "Public highlights are readable"
ON public.highlights FOR SELECT
TO anon, authenticated
USING (is_public);

GRANT ALL ON public.highlights TO service_role;

-- 4. Games hold coach notes / reflections: release them through the app only
DROP POLICY IF EXISTS "Games are publicly readable" ON public.games;
DROP POLICY IF EXISTS "Game media is publicly readable" ON public.game_media;
REVOKE SELECT ON public.games FROM anon, authenticated;
REVOKE SELECT ON public.game_media FROM anon, authenticated;
GRANT ALL ON public.games TO service_role;
GRANT ALL ON public.game_media TO service_role;

-- 5. Seed demo data
INSERT INTO public.profile_private_details (profile_id, contact_email, contact_phone, guardian_name, academic_notes)
SELECT id, 'marcus.chen.soccer@example.com', '(602) 555-0184', 'Linda Chen',
  'Honors track, 3.9 GPA. NCAA Eligibility Center registered. Transcript available on request.'
FROM public.profiles WHERE slug = 'demo-athlete'
ON CONFLICT (profile_id) DO NOTHING;

INSERT INTO public.profile_unlock_links (profile_id, role, token, label)
SELECT id, 'recruiter', 'rec-demo-2026-a1b2c3', 'Club showcase recruiters'
FROM public.profiles WHERE slug = 'demo-athlete'
ON CONFLICT (token) DO NOTHING;

INSERT INTO public.profile_unlock_links (profile_id, role, token, label)
SELECT id, 'coach', 'coach-demo-2026-d4e5f6', 'College coaches — fall ID camp'
FROM public.profiles WHERE slug = 'demo-athlete'
ON CONFLICT (token) DO NOTHING;

UPDATE public.highlights SET is_public = false
WHERE id IN (SELECT id FROM public.highlights ORDER BY created_at DESC LIMIT 1);