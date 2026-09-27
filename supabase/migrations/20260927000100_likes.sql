-- Likes on community feed posts. One like per user per entry.

create table if not exists likes (
  entry_id uuid not null references journal (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id)
);

alter table likes enable row level security;

-- Likes are visible on any entry the user can see
drop policy if exists "likes_select_visible" on likes;
create policy "likes_select_visible" on likes
  for select to authenticated using (
    exists (
      select 1 from journal j
      where j.id = likes.entry_id and (j.public = true or j.user_id = auth.uid())
    )
  );

drop policy if exists "likes_insert_own" on likes;
create policy "likes_insert_own" on likes
  for insert to authenticated with check (
    user_id = auth.uid()
    and exists (select 1 from journal j where j.id = likes.entry_id and j.public = true)
  );

drop policy if exists "likes_delete_own" on likes;
create policy "likes_delete_own" on likes
  for delete to authenticated using (user_id = auth.uid());
