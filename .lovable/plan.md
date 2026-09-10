# Accounts and role dashboards for Footy KPI

Add sign up / log in with email and password, and give each kind of user their own dashboard: athletes manage their own portfolio, coaches review and verify the athletes who invited them, recruiters search and view athlete profiles.

## What people will see

**Signing up**
- A sign-up form asks for email, password, full name, and which of the three roles they are: athlete, coach, or recruiter. The role is chosen at sign-up.
- After confirming their email they land on the dashboard for their role.
- A log-in page, plus a "forgot password" flow with a page to set a new password.
- The header shows their name and a log-out button once signed in.

**Athlete dashboard**
- Their own portfolio in edit mode: photo, team, jersey number, position, graduation year, height/weight, GPA, bio.
- Season stats editor, game log, journal, highlights upload, progress charts, AI insights, trading card, and the existing share/unlock links — all scoped to their own profile only.
- Public/private toggle and their shareable profile link.
- A "My coaches" panel: invite a coach by email, see pending and accepted invites, and remove a coach.

**Coach dashboard**
- List of athletes who invited them, with pending invites to accept or decline.
- Open an athlete to see stats, games, and highlights, and approve or reject items submitted for verification, with a review note. Coaches cannot edit an athlete's stats.

**Recruiter dashboard**
- Search public athletes by name, team, position, and graduation year, with a results grid.
- Open any public profile; private profiles stay hidden unless the athlete shared an unlock link.

**Public pages**
- A landing page at the home address explaining Footy KPI with sign-up and log-in buttons.
- Shareable athlete profiles move to their own address, e.g. `/p/marcus-chen`, still viewable without an account and still working with unlock links and QR codes.
- The Marcus Chen demo profile and its data are removed, as agreed.

## Technical outline

**Database**
- `app_role` enum (`athlete`, `coach`, `recruiter`) and `user_roles` table (`user_id`, `role`, unique) with a `security definer` `has_role(_user_id, _role)` function. Roles never live on profiles.
- `profiles` gains `user_id uuid not null` (unique) referencing the auth user; RLS policies let owners read/write their own row while keeping the existing public-visibility read policy.
- Owner-scoped RLS policies added for `season_stats`, `achievements`, `games`, `game_media`, `highlights`, `profile_private_details`, `profile_unlock_links` via `profile_id -> profiles.user_id = auth.uid()`.
- New `coach_links` table: `athlete_profile_id`, `coach_user_id` (nullable until accepted), `coach_email`, `status` (`pending`/`accepted`/`declined`), timestamps. Policies: athlete owner manages own rows; coach reads/updates rows matching their email or user id.
- Verification policies allow update of `highlights` verification fields only by an accepted coach for that athlete.
- Every new public table gets GRANTs (`authenticated`, `service_role`) before enabling RLS and policies.
- Delete the demo profile rows.

**Server functions** (`createServerFn` + `requireSupabaseAuth`, replacing the current `supabaseAdmin`-everywhere reads for signed-in paths)
- `src/lib/account.functions.ts` — role lookup for the signed-in user, athlete profile create/update, ensure-profile-on-first-login.
- `src/lib/coach.functions.ts` — invite coach, list invites, accept/decline, list athletes for a coach, coach-scoped athlete detail.
- `src/lib/recruiter.functions.ts` — public athlete search (publishable-key client, safe columns only).
- Existing `season-stats`, `journal`, `highlights`, `verification`, `access` functions get `requireSupabaseAuth` and derive `profile_id` from the caller instead of trusting a slug; the `HIGHLIGHT_EDIT_KEY` shim is dropped in favour of real auth.
- `getPublicProfile` stays public and unauthenticated for the shareable page.

**Routes**
- `src/routes/index.tsx` — public landing page.
- `src/routes/auth.tsx` (sign up / log in), `src/routes/reset-password.tsx`.
- `src/routes/p.$slug.tsx` — public profile, current dashboard UI in read-only/share mode, keeps `head()` with title, description, OG/Twitter tags.
- `src/routes/_authenticated/route.tsx` — integration-managed gate (`ssr: false`, redirect to `/auth`).
- `src/routes/_authenticated/dashboard.tsx` — routes to the right role view; `athlete.tsx`, `coach.tsx`, `coach.$slug.tsx`, `recruiter.tsx` under the same gate.
- `__root.tsx` gains one `onAuthStateChange` subscriber that invalidates the router, plus a session-aware header.

**Notes**
- Email confirmation stays on by default; sign-up shows a "check your email" state rather than treating the user as logged in.
- Sign-out cancels and clears cached queries, then navigates to `/auth` with history replace.
