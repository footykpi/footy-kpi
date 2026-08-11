# Secure the Highlights upload/delete paths

## Current state

A fresh security scan found two active issues:

1. `highlights_storage_open_write` — `storage.objects` policies on the `highlights` bucket allow INSERT, UPDATE, and DELETE for any `anon`/`authenticated` user, gated only by `bucket_id`. Anyone can overwrite or delete another athlete's media files.
2. `highlights_table_open_write` — `public.highlights` has `INSERT`/`DELETE` policies that allow any `anon`/`authenticated` user to add or remove rows for any `profile_id`.

Everything else is already protected: profiles, season stats, achievements, games, game media, private details, and unlock links are either public-read-only or server-role-only. Dependencies are clean.

## Goal

Close the two open write paths while keeping the Highlights upload/delete/proof-upload flows working for the athlete/family who manage the portfolio.

## Proposed approach

Move all highlight mutations behind server functions and remove the public write policies. Since this portfolio is currently viewer-auth-free (recruiters/coaches use unlock links), we will protect edits with a simple **edit key** shared by the athlete/family, rather than a full user account system.

## Implementation steps

### 1. Database / RLS hardening

- Drop the open write policies on `public.highlights`:
  - `Anyone can add highlights for now`
  - `Anyone can remove highlights for now`
- Replace with a minimal `SELECT` policy only: `public highlights are readable when is_public = true` (current policy already does this; keep it).
- Drop the open write policies on `storage.objects` for the `highlights` bucket:
  - `Anyone can upload highlight files for now`
  - `Anyone can update highlight files for now`
  - `Anyone can delete highlight files for now`
- Keep only the read policy on `storage.objects` for the `highlights` bucket.
- Revoke direct `INSERT`, `UPDATE`, `DELETE` grants on `public.highlights` from `anon` and `authenticated`; keep only `SELECT` and `service_role` grants.

### 2. Server-side mutations

Create a new server function module `src/lib/highlights.functions.ts` with:

- `uploadHighlight({ data: { profileId, slug, file, category, title } })`
  - Validate inputs with Zod.
  - Generate a unique storage path under `slug/`.
  - Upload the file to the `highlights` bucket using `supabaseAdmin`.
  - Insert the row into `public.highlights` using `supabaseAdmin`.
  - Return the new highlight id.
- `deleteHighlight({ data: { highlightId } })`
  - Fetch the row server-side to get the storage path.
  - Delete the storage object using `supabaseAdmin`.
  - Delete the row using `supabaseAdmin`.
- `uploadHighlightProof({ data: { highlightId, slug, file } })`
  - Upload proof file to `slug/proof/` using `supabaseAdmin`.
  - Update the highlight's `proof_url`, `proof_media_type`, `verification_status = 'pending'`, etc.

### 3. Edit-key gate

- Store a server-only env var `HIGHLIGHT_EDIT_KEY` (32+ character random string).
- Add an `editKey` field to the upload/delete/proof server functions.
- In each handler, compare the supplied key to `process.env['HIGHLIGHT_EDIT_KEY']` using a constant-time hash comparison (`createHash("sha256")` + `timingSafeEqual`).
- Return a generic failure message on mismatch so the key cannot be probed.

### 4. UI changes

- Update `src/components/HighlightsReel.tsx`:
  - Replace direct `supabase.storage.from("highlights").upload(...)` and `supabase.from("highlights").insert(...)` calls with the new `uploadHighlight` server function.
  - Replace direct `supabase.from("highlights").delete()` with the new `deleteHighlight` server function.
  - Add a small "Edit key" input field near the upload controls (or in a settings area) that the athlete/family enters before uploading or deleting.
  - Persist the entered key in component state during the session (not localStorage, so it stays ephemeral).
- Update `VerificationPanel` in the same file to use the new `uploadHighlightProof` server function instead of direct storage uploads.
- Update `src/lib/verification.functions.ts` if needed to keep `submitHighlightProof` and `reviewHighlightProof` aligned with the proof path returned by the new server function.

### 5. Verification

- Run `supabase--linter` again.
- Run `security--run_security_scan` to confirm:
  - `highlights_storage_open_write` is gone.
  - `highlights_table_open_write` is gone.
- Use `security--manage_security_finding` to mark both findings as fixed.
- Update `security--update_memory` to record that the Highlights feature is now write-gated via edit-key-protected server functions and that direct public writes are intentionally removed.

## Out of scope

- No full user account system or role-based ownership for editors. The edit key is a lightweight gate matching the current "pre-auth demo" spirit of the app.
- No changes to the public read behavior of highlights, games, stats, or profile data.

## Risks / trade-offs

- The edit key is shared among anyone the athlete gives it to. This is acceptable for the MVP, but if the product later adds per-user accounts, these server functions should be migrated to real ownership checks.
- Until the `HIGHLIGHT_EDIT_KEY` is set, uploads will fail. The first setup will need to generate and store that secret.
