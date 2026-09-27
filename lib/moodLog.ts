import { supabase } from './supabaseClient';
import { dayBounds, timestampForDay } from './dates';

// Users log one mood per day. These helpers keep that true no matter which
// page the mood is saved from.

export async function clearMoodForDay(userId: string, dateKey: string) {
  const { start, end } = dayBounds(dateKey);
  return supabase
    .from('moods')
    .delete()
    .eq('user_id', userId)
    .gte('created_at', start)
    .lt('created_at', end);
}

export async function setMoodForDay(userId: string, dateKey: string, value: string) {
  const { error } = await clearMoodForDay(userId, dateKey);
  if (error) return { error };
  return supabase
    .from('moods')
    .insert([{ user_id: userId, emoji: value, created_at: timestampForDay(dateKey) }]);
}
