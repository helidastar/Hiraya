-- Base schema for Hiraya
-- Reconstructed from how the app reads and writes data, for setting up a new
-- Supabase project. On the original project these tables already exist, and
-- "if not exists" makes this script a no-op there.

create extension if not exists pgcrypto;

-- One row per user, created on first login (pages/auth/login.tsx)
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  phone text,
  bio text,
  avatar_url text,
  header_url text,
  created_at timestamptz not null default now()
);

-- Journal entries. user_id points at profiles so the feed can embed the
-- author's name and avatar (profiles:profiles(...) in pages/feed.tsx).
create table if not exists journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  title text,
  content text not null,
  mood text,
  public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- One mood per user per day (enforced by lib/moodLog.ts)
create table if not exists moods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now()
);

-- Kanban tasks: status is todo, inprogress or done
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  status text not null default 'todo',
  created_at timestamptz not null default now()
);

-- Comments on public journal entries
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references journal (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists journal_user_created_idx on journal (user_id, created_at desc);
create index if not exists journal_public_created_idx on journal (created_at desc) where public;
create index if not exists moods_user_created_idx on moods (user_id, created_at desc);
create index if not exists tasks_user_created_idx on tasks (user_id, created_at desc);
create index if not exists comments_entry_idx on comments (entry_id, created_at);

-- Public buckets for profile pictures and header images
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true), ('headers', 'headers', true)
on conflict (id) do nothing;
