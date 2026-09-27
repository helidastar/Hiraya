-- Lets a signed-in user permanently delete their own account and data.
-- Called from pages/dashboard/account.tsx with supabase.rpc('delete_own_account').
--
-- Runs as the function owner (security definer) because deleting from
-- auth.users is not allowed with the anon key. It only ever deletes the caller.
-- Rows are removed explicitly so it also works on the original project, whose
-- foreign keys may not cascade.
--
-- Uploaded avatar and header files are not removed: Supabase does not allow
-- deleting storage files from SQL.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  delete from likes where user_id = uid or entry_id in (select id from journal where user_id = uid);
  delete from comments where user_id = uid or entry_id in (select id from journal where user_id = uid);
  delete from journal where user_id = uid;
  delete from moods where user_id = uid;
  delete from tasks where user_id = uid;
  update feedback set user_id = null where user_id = uid;
  delete from profiles where id = uid;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
