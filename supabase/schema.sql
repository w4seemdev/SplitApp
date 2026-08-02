-- SplitApp backend schema
-- ============================================================================
-- Run once against a fresh Supabase project:
--   Dashboard -> SQL Editor -> New query -> paste this file -> Run
--
-- Then set the app's environment variables (see .env.example):
--   VITE_SUPABASE_URL       Project Settings -> API -> Project URL
--   VITE_SUPABASE_ANON_KEY  Project Settings -> API -> anon / public key
--
-- This script is idempotent: re-running it is safe.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- user_data: a per-user key/value store. The whole app persists through it.
--
-- Written by src/lib/cloudStore.js, keyed by the suffixes in src/lib/program.js:
--   'program'        { splitId, splitName, days: [...] }
--   'currentDay'     integer index of the next day to train
--   'history'        [{ id, date, day, volume, sets, unit, exercises: [...] }]
--   'settings'       { unit: 'kg' | 'lb' }
--   'activeWorkout'  the in-progress workout, or null
--
-- The composite primary key is REQUIRED, not cosmetic: cloudStore.js upserts
-- with onConflict 'user_id,key', which needs a unique constraint on exactly
-- those two columns. Without it every cloud save fails.
--
-- on delete cascade means deleting an auth user removes their data too, which
-- is what makes account deletion a real deletion (GDPR erasure).
-- ----------------------------------------------------------------------------
create table if not exists public.user_data (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  key        text        not null,
  value      jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);


-- ----------------------------------------------------------------------------
-- Row-Level Security.
--
-- This is the ONLY thing standing between one user's workout history and every
-- other user. The anon key is embedded in the client bundle and is public by
-- design, so anybody can issue queries against this table. RLS is what makes
-- that safe. If these policies are missing, the table is world-readable.
--
-- Verify after running:
--   select relrowsecurity from pg_class where relname = 'user_data';  -- must be true
--   select policyname, cmd from pg_policies where tablename = 'user_data';  -- 4 rows
-- ----------------------------------------------------------------------------
alter table public.user_data enable row level security;

drop policy if exists "users read own data" on public.user_data;
create policy "users read own data"
  on public.user_data for select
  using (auth.uid() = user_id);

drop policy if exists "users insert own data" on public.user_data;
create policy "users insert own data"
  on public.user_data for insert
  with check (auth.uid() = user_id);

-- Both clauses are needed: `using` decides which existing rows may be updated,
-- `with check` stops a user from reassigning a row to somebody else's user_id.
drop policy if exists "users update own data" on public.user_data;
create policy "users update own data"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "users delete own data" on public.user_data;
create policy "users delete own data"
  on public.user_data for delete
  using (auth.uid() = user_id);


-- ----------------------------------------------------------------------------
-- Auth configuration that is NOT captured by SQL and must be set in the
-- dashboard (Authentication -> ...):
--
--   Providers -> Email             enabled
--   Providers -> Confirm email     on (AuthContext.signup expects it: it
--                                  returns { needsEmailConfirmation: true }
--                                  when no session comes back)
--   URL Configuration -> Site URL  your deployed origin
--   URL Configuration -> Redirect  <origin>/reset-password
--                                  (AuthContext.resetPassword sends users to
--                                   window.location.origin + '/reset-password')
-- ----------------------------------------------------------------------------
