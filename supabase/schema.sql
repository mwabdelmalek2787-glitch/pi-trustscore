-- Trust Score Hub — Phase 1 schema
-- Run this in the Supabase SQL Editor.

create table if not exists public.profiles (
  pi_user_id text primary key,
  username text not null,
  trust_score integer not null default 500,
  created_at timestamptz not null default now(),
  privacy_accepted boolean not null default false
);

alter table public.profiles enable row level security;

-- Public read (profiles are public reputation cards).
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
on public.profiles for select
using (true);

-- Anonymous insert for first-time Pi sign-in (Phase 1 only).
-- WARNING: This is intentionally permissive for the MVP. Move writes behind
-- an Edge Function that verifies the Pi access token before production.
drop policy if exists "profiles_anon_insert" on public.profiles;
create policy "profiles_anon_insert"
on public.profiles for insert
to anon, authenticated
with check (true);

-- Anonymous update for the same reason as above.
drop policy if exists "profiles_anon_update" on public.profiles;
create policy "profiles_anon_update"
on public.profiles for update
to anon, authenticated
using (true)
with check (true);
