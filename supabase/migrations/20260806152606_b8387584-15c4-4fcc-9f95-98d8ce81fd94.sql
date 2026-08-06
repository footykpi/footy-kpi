ALTER TABLE public.profiles
  ADD COLUMN visibility text NOT NULL DEFAULT 'public';

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_visibility_check CHECK (visibility IN ('public','private'));