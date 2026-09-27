import type { User } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

// Journal entries reference profiles(id), so a user without a profile row
// cannot save one. Sign-up can't always create the row (with email
// confirmation on there is no session yet, and row level security blocks the
// insert), so call this once the user is signed in.
export async function ensureProfile(user: User): Promise<{ error: string | null }> {
  const { data, error } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (error) return { error: error.message };
  if (data) return { error: null };

  const first = user.user_metadata?.first_name;
  const last = user.user_metadata?.last_name;
  const { error: insertError } = await supabase.from('profiles').insert([{
    id: user.id,
    email: user.email,
    full_name: first && last ? `${first} ${last}` : '',
  }]);
  return { error: insertError ? insertError.message : null };
}
