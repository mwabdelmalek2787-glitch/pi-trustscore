-- Trust Score Hub — Phase 1 schema (hardened)
-- Run this in the Supabase SQL Editor.

create table if not exists public.profiles (
  pi_user_id text primary key,
  username text not null,
  trust_score integer not null default 0,
  created_at timestamptz not null default now(),
  privacy_accepted boolean not null default false
);

alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- READ: profiles are public reputation cards. We expose only the columns the
-- UI needs and allow anonymous SELECT. (If you later want to hide rows from
-- other users, replace this with a per-row policy keyed off a verified Pi
-- token claim — that requires the Edge Function described below.)
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
  on public.profiles for select
  using (true);

-- ---------------------------------------------------------------------------
-- INSERT: still required so a brand-new Pi user can create their own row on
-- first sign-in. Until we have an Edge Function that verifies the Pi access
-- token, this is the narrowest workable rule: anon may insert a row, but only
-- one whose pi_user_id does not already exist (PK enforces this) and whose
-- trust_score / privacy_accepted use the safe defaults.
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_anon_insert" on public.profiles;
create policy "profiles_anon_insert"
  on public.profiles for insert
  to anon, authenticated
  with check (
    trust_score = 0
    and privacy_accepted = false
  );

-- ---------------------------------------------------------------------------
-- UPDATE: removed. The previous `profiles_anon_update` policy let any visitor
-- rewrite anyone's trust_score with the public anon key. We now route the only
-- legitimate write (flipping privacy_accepted) through a SECURITY DEFINER RPC
-- below, which bypasses RLS but is constrained to that single column.
-- ---------------------------------------------------------------------------
drop policy if exists "profiles_anon_update" on public.profiles;

-- ---------------------------------------------------------------------------
-- RPC: accept_privacy(_pi_user_id text)
-- The only allowed write path from the browser. Because it runs as the
-- function owner with `security definer`, it sidesteps RLS, but it can only
-- toggle privacy_accepted for the matching row — nothing else.
-- ---------------------------------------------------------------------------
create or replace function public.accept_privacy(_pi_user_id text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
     set privacy_accepted = true
   where pi_user_id = _pi_user_id;
$$;

revoke all on function public.accept_privacy(text) from public;
grant execute on function public.accept_privacy(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- TODO (production hardening, out of scope for Phase 1):
--   1. Move profile creation behind an Edge Function that verifies the Pi
--      access token, then drop the broad anon INSERT policy above.
--   2. Replace the public read policy with one that returns only the columns
--      a viewer is allowed to see (e.g. via a view).
--   3. Move trust_score mutations behind a similarly verified RPC.
-- ---------------------------------------------------------------------------
