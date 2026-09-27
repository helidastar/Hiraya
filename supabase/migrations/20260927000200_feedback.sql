-- Ratings and feedback sent from the Settings page.
-- Users can submit but not read feedback; read it in the Supabase table editor.

create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  rating int check (rating between 1 and 5),
  name text,
  email text,
  message text,
  created_at timestamptz not null default now(),
  check (rating is not null or message is not null)
);

alter table feedback enable row level security;

drop policy if exists "feedback_insert_own" on feedback;
create policy "feedback_insert_own" on feedback
  for insert to authenticated with check (user_id = auth.uid());
