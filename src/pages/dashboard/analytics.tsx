import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { getMood, moodLabel, moodScore, moodTone } from "../../components/moods";
import { useDarkMode } from "../../components/DarkModeContext";
import PageShell from "../../components/PageShell";
import { localDateKey } from "../../lib/dates";
import { rise, ease } from "../../lib/motion";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

type MoodDay = { date: string; emoji: string };

const WEEKS = 12;
const SCORE_TONE: Record<number, string> = { 1: "bg-mood-1", 2: "bg-mood-2", 3: "bg-mood-3", 4: "bg-mood-4", 5: "bg-mood-5" };
const SCORE_LABEL: Record<number, string> = { 1: "Very low", 2: "Low", 3: "In between", 4: "Good", 5: "Great" };

export default function Analytics() {
  const [moodDetails, setMoodDetails] = useState<MoodDay[]>([]);
  const [journalDays, setJournalDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { darkMode } = useDarkMode();

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      const { data: moods } = await supabase
        .from("moods")
        .select("created_at, emoji")
        .eq("user_id", session.user.id);
      setMoodDetails((moods || []).map(m => ({ date: localDateKey(m.created_at), emoji: m.emoji })));
      const { data: journals } = await supabase
        .from("journal")
        .select("created_at")
        .eq("user_id", session.user.id);
      setJournalDays((journals || []).map(j => localDateKey(j.created_at)));
      setLoading(false);
    }
    fetchData();
  }, [router]);

  // Mood stats for a range of whole local days
  function getMoodStatsForRange(moods: MoodDay[], start: Date, end: Date) {
    const from = localDateKey(start);
    const to = localDateKey(end);
    const filtered = moods.filter(m => m.date >= from && m.date <= to);
    if (filtered.length === 0) return null;
    const scores = filtered.map(m => moodScore(m.emoji));
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const freq: Record<string, number> = {};
    filtered.forEach(m => { const key = getMood(m.emoji)?.value ?? m.emoji; freq[key] = (freq[key] || 0) + 1; });
    const mostCommon = Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
    return { avg, mostCommon, count: filtered.length };
  }

  const today = new Date();
  const weekAgo = new Date(); weekAgo.setDate(today.getDate() - 6);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const ranges = [
    { label: "Today", stats: getMoodStatsForRange(moodDetails, today, today) },
    { label: "Last 7 days", stats: getMoodStatsForRange(moodDetails, weekAgo, today) },
    { label: "This month", stats: getMoodStatsForRange(moodDetails, startOfMonth, today) },
    { label: "All time", stats: getMoodStatsForRange(moodDetails, new Date('2000-01-01'), today) },
  ];
  const overall = ranges[3].stats;

  // Last 12 weeks as a grid: one column per week, Sunday at the top
  const moodByDay = new Map(moodDetails.map(m => [m.date, m.emoji]));
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7);
  const weeks: { key: string; emoji?: string; future: boolean; label: string }[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + w * 7 + d);
      const key = localDateKey(day);
      week.push({
        key,
        emoji: moodByDay.get(key),
        future: day > today,
        label: day.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    weeks.push(week);
  }

  // How many logged moods fall on each score
  const mix = [1, 2, 3, 4, 5].map(score => ({ score, count: moodDetails.filter(m => moodScore(m.emoji) === score).length }));
  const mixTotal = mix.reduce((a, b) => a + b.count, 0);

  // Moods and journal entries per day over the last 30 days
  const activity = Array.from({ length: 30 }, (_, i) => {
    const day = new Date(today);
    day.setDate(today.getDate() - 29 + i);
    const key = localDateKey(day);
    return {
      date: key,
      Entries: journalDays.filter(d => d === key).length,
      Moods: moodByDay.has(key) ? 1 : 0,
    };
  });
  const hasActivity = activity.some(a => a.Entries > 0 || a.Moods > 0);
  const chartIris = darkMode ? '#BEA8FF' : '#7A5AE4';
  const chartMood = darkMode ? '#E28CC8' : '#F2A8D4';
  const axisColor = darkMode ? '#B2A8D8' : '#6C6194';

  let message = '';
  if (overall) {
    if (overall.avg >= 4) message = "You've been doing well. Keep up whatever is working.";
    else if (overall.avg >= 3) message = "Your mood is balanced. Keep making time for yourself.";
    else message = "It's been a heavy stretch. Be gentle with yourself, and reach out if you need support.";
  }

  return (
    <PageShell title="Analytics" eyebrow="Your moods over time" loading={loading}>
      <motion.div variants={rise} className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ranges.map(({ label, stats }) => (
          <section key={label} className="card card-lift relative flex flex-col overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-iris/25 to-blush/25 blur-2xl" />
            <h2 className="eyebrow">{label}</h2>
            {stats ? (
              <>
                <p className="relative mt-3 font-display text-4xl">{stats.avg.toFixed(1)}<span className="ml-1 font-sans text-base text-muted">/ 5</span></p>
                <p className="mt-3 flex items-center gap-2 text-sm">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${moodTone(stats.mostCommon)}`}>{moodLabel(stats.mostCommon)}</span>
                  <span className="text-muted">most often</span>
                </p>
                <p className="mt-auto pt-3 text-sm text-muted">{stats.count} {stats.count === 1 ? 'mood' : 'moods'} logged</p>
              </>
            ) : (
              <p className="mt-3 text-muted">No moods logged yet.</p>
            )}
          </section>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <motion.section variants={rise} className="card p-6 sm:p-7">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl">Last {WEEKS} weeks</h2>
            <span className="text-sm text-muted">Each square is a day</span>
          </div>
          <div className="flex gap-3">
            <div className="grid grid-rows-7 gap-1 pt-0.5 text-[10px] font-semibold text-muted sm:gap-1.5">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="flex h-full items-center">{d}</span>)}
            </div>
            <div className="grid flex-1 grid-flow-col grid-cols-12 grid-rows-7 gap-1 sm:gap-1.5">
              {weeks.flatMap((week, w) => week.map((day, d) => (
                <motion.div
                  key={day.key}
                  title={day.future ? undefined : `${day.label}: ${day.emoji ? moodLabel(day.emoji) : 'no mood'}`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + w * 0.04 + d * 0.01, duration: 0.3, ease }}
                  className={`aspect-square rounded-[5px] ${day.future ? 'opacity-0' : day.emoji ? moodTone(day.emoji).split(' ')[0] : 'bg-line/60'}`}
                />
              )))}
            </div>
          </div>
        </motion.section>

        <motion.section variants={rise} className="card flex flex-col p-6 sm:p-7">
          <h2 className="font-display text-2xl">Mood mix</h2>
          <p className="mt-1 text-sm text-muted">All the moods you&apos;ve logged, from low to high</p>
          {mixTotal === 0 ? (
            <p className="mt-6 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-line px-6 py-10 text-center text-muted">Log a few moods to see your mix.</p>
          ) : (
            <>
              <div className="mt-6 flex h-4 overflow-hidden rounded-full bg-line/60">
                {mix.filter(m => m.count > 0).map(m => (
                  <motion.div
                    key={m.score}
                    className={SCORE_TONE[m.score]}
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.count / mixTotal) * 100}%` }}
                    transition={{ delay: 0.5, duration: 0.8, ease }}
                  />
                ))}
              </div>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[...mix].reverse().map(m => (
                  <li key={m.score} className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${SCORE_TONE[m.score]}`} aria-hidden />
                    <span className="flex-1">{SCORE_LABEL[m.score]}</span>
                    <span className="font-semibold tabular-nums">{m.count}</span>
                    <span className="w-10 text-right tabular-nums text-muted">{Math.round((m.count / mixTotal) * 100)}%</span>
                  </li>
                ))}
              </ul>
              {message && <p className="mt-6 rounded-2xl bg-gradient-to-br from-iris-soft to-blush/20 p-4 text-sm leading-relaxed">{message}</p>}
            </>
          )}
        </motion.section>
      </div>

      <motion.section variants={rise} className="card mt-6 p-6 sm:p-7">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl">Last 30 days</h2>
          <div className="flex gap-4 text-sm text-muted">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: chartIris }} />Journal entries</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: chartMood }} />Mood logged</span>
          </div>
        </div>
        {hasActivity ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={activity} margin={{ top: 8, right: 0, left: -28, bottom: 0 }} barGap={2}>
              <XAxis dataKey="date" tickFormatter={(d: string) => String(Number(d.slice(8)))} interval={4} tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: darkMode ? 'rgba(190,168,255,0.08)' : 'rgba(122,90,228,0.06)' }}
                contentStyle={{ background: darkMode ? 'rgba(38,29,76,0.85)' : 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: `1px solid ${darkMode ? '#403570' : '#E2D8F6'}`, borderRadius: 14, color: darkMode ? '#F2EEFF' : '#2A1E52' }}
              />
              <Bar dataKey="Entries" fill={chartIris} radius={[6, 6, 0, 0]} />
              <Bar dataKey="Moods" fill={chartMood} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="flex h-[240px] items-center justify-center rounded-2xl border border-dashed border-line text-center text-muted">
            Write an entry or log a mood to see your activity.
          </p>
        )}
      </motion.section>
    </PageShell>
  );
}
