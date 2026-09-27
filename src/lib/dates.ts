// Date helpers that work in the user's own timezone.
// toISOString() uses UTC, so in the Philippines (UTC+8) anything logged before
// 8am would otherwise land on the previous day.

// yyyy-mm-dd for a date in local time
export function localDateKey(date: Date | string = new Date()): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// ISO timestamps for the start of a local day and the start of the next one
export function dayBounds(key: string): { start: string; end: string } {
  const start = parseKey(key);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

// Timestamp to store for something logged on a given day:
// the current time for today, local noon for any other day
export function timestampForDay(key: string): string {
  if (key === localDateKey()) return new Date().toISOString();
  const d = parseKey(key);
  d.setHours(12);
  return d.toISOString();
}
