-- Row Level Security for Muni
-- Run this in the Supabase SQL editor. It is safe to run more than once.
--
-- The app talks to Supabase straight from the browser with the public anon key,
-- so these policies are the only thing stopping one user from reading or
-- deleting another user's data.

-- ---------------------------------------------------------------------------
-- profiles: any signed-in user can read profiles (the feed shows names and
-- avatars); users can only create and edit their own row.
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;

drop policy if exists "profiles_select_authenticated" on profiles;
create policy "profiles_select_authenticated" on profiles
  for select to authenticated using (true);

drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- journal: public entries are readable by signed-in users, private entries
-- only by their owner. Only the owner can write.
-- ---------------------------------------------------------------------------
alter table journal enable row level security;

drop policy if exists "journal_select_public_or_own" on journal;
create policy "journal_select_public_or_own" on journal
  for select to authenticated using (public = true or user_id = auth.uid());

drop policy if exists "journal_insert_own" on journal;
create policy "journal_insert_own" on journal
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "journal_update_own" on journal;
create policy "journal_update_own" on journal
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "journal_delete_own" on journal;
create policy "journal_delete_own" on journal
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- moods and tasks: fully private to their owner.
-- ---------------------------------------------------------------------------
alter table moods enable row level security;

drop policy if exists "moods_all_own" on moods;
create policy "moods_all_own" on moods
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table tasks enable row level security;

drop policy if exists "tasks_all_own" on tasks;
create policy "tasks_all_own" on tasks
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- comments: visible and postable on entries the user can see. Deletable by the
-- comment author or the owner of the entry.
-- ---------------------------------------------------------------------------
alter table comments enable row level security;

drop policy if exists "comments_select_visible" on comments;
create policy "comments_select_visible" on comments
  for select to authenticated using (
    exists (
      select 1 from journal j
      where j.id = comments.entry_id and (j.public = true or j.user_id = auth.uid())
    )
  );

drop policy if exists "comments_insert_own" on comments;
create policy "comments_insert_own" on comments
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (
      select 1 from journal j
      where j.id = comments.entry_id and (j.public = true or j.user_id = auth.uid())
    )
  );

drop policy if exists "comments_delete_author_or_entry_owner" on comments;
create policy "comments_delete_author_or_entry_owner" on comments
  for delete to authenticated using (
    user_id = auth.uid()
    or exists (select 1 from journal j where j.id = comments.entry_id and j.user_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- Storage: avatars and headers are public to view. Users can only upload,
-- replace or delete files inside their own folder (<user id>/...), which is
-- how pages/dashboard/account.tsx names uploads.
-- ---------------------------------------------------------------------------
drop policy if exists "profile_images_insert_own_folder" on storage.objects;
create policy "profile_images_insert_own_folder" on storage.objects
  for insert to authenticated with check (
    bucket_id in ('avatars', 'headers') and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "profile_images_update_own_folder" on storage.objects;
create policy "profile_images_update_own_folder" on storage.objects
  for update to authenticated using (
    bucket_id in ('avatars', 'headers') and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "profile_images_delete_own_folder" on storage.objects;
create policy "profile_images_delete_own_folder" on storage.objects
  for delete to authenticated using (
    bucket_id in ('avatars', 'headers') and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Check the result: every table below should show rowsecurity = true.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename in ('profiles', 'journal', 'moods', 'tasks', 'comments');
