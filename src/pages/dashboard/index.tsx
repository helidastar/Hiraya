import Head from "next/head";
import { useState, useEffect } from "react";
import { FaBook, FaStar, FaRss, FaFire, FaRegSmile, FaPen } from "react-icons/fa";
import { MOODS, MoodIcon, getMood, moodLabel, moodScore, moodTone } from "../../components/moods";
import { localDateKey, dayBounds } from "../../lib/dates";
import { setMoodForDay, clearMoodForDay } from "../../lib/moodLog";
import Sidebar from "../../components/Sidebar";
import Starfield, { Sparkle } from "../../components/Starfield";
import { PageHeader } from "../../components/PageShell";
import { supabase } from "../../lib/supabaseClient";
import { useDarkMode } from "../../components/DarkModeContext";
import { useRouter } from "next/router";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TooltipProps } from 'recharts';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { rise, stagger, ease, backdrop, panel } from '../../lib/motion';

// A logged mood as read from the moods table
type MoodRow = { emoji: string; created_at: string };

export default function Dashboard() {
  type UserProfile = { first_name: string; id: string };
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const [recentMood, setRecentMood] = useState<MoodRow | null>(null);
  const [recentJournal, setRecentJournal] = useState<{ title: string | null; created_at: string } | null>(null);
  const [recentTask, setRecentTask] = useState<{ description: string; created_at: string; completed_at: string | null } | null>(null);
  const [todayMood, setTodayMood] = useState<MoodRow | null>(null);

  // Add missing state and constants for dashboard functionality
  const [streak, setStreak] = useState(0);


  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalMood, setModalMood] = useState("");
  const [monthlyMoods, setMonthlyMoods] = useState<{ [date: string]: string }>({});

  // Add state for dashboard mood modal

  const moodOptions = MOODS.map((m) => m.value);


  const fetchMonthlyMoods = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const { data: moods } = await supabase
      .from("moods")
      .select("emoji, created_at")
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString())
      .lt("created_at", startOfNextMonth.toISOString())
      .order("created_at", { ascending: true });

    const moodsMap: { [date: string]: string } = {};
    if (moods) {
      moods.forEach((mood: MoodRow) => {
        const dateStr = localDateKey(mood.created_at);
        moodsMap[dateStr] = mood.emoji;
      });
    }
    setMonthlyMoods(moodsMap);
  };

  // Add format time function
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  // Add this function to calculate the streak
  const calculateStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Fetch all moods for the user, sorted by date descending
    const { data: moods } = await supabase
      .from("moods")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!moods || moods.length === 0) {
      setStreak(0);
      return;
    }
    // Build a set of unique dates with moods
    const moodDates = new Set(moods.map((m: { created_at: string }) => localDateKey(m.created_at)));
    let streakCount = 0;
    const current = new Date();
    while (true) {
      const dateStr = localDateKey(current);
      if (moodDates.has(dateStr)) {
        streakCount++;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(streakCount);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      let firstName = "";
      if (profile && profile.full_name && profile.full_name.trim() !== "") {
        firstName = profile.full_name.split(" ")[0];
      }
      setUser({ first_name: firstName, id: user.id });
    };
    checkAuth();
  }, [router]);

  // Move fetchRecentActivity to top-level and ensure it is available
  async function fetchRecentActivity() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Fetch latest mood
    const { data: moods } = await supabase
      .from("moods")
      .select("emoji, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);
    setRecentMood(moods && moods[0]);
    // Fetch today's mood
    const { start: todayStart, end: todayEnd } = dayBounds(localDateKey());
    const { data: todayMoodData } = await supabase
      .from("moods")
      .select("emoji, created_at")
      .eq("user_id", user.id)
      .gte("created_at", todayStart)
      .lt("created_at", todayEnd)
      .order("created_at", { ascending: false })
      .limit(1);
    setTodayMood(todayMoodData && todayMoodData[0]);
    // Fetch latest journal
    const { data: journals } = await supabase
      .from("journal")
      .select("title, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);
    setRecentJournal(journals && journals[0]);
    // The latest hope that came true (hopes live in the tasks table)
    const { data: tasks } = await supabase
      .from("tasks")
      .select("description, created_at, completed_at")
      .eq("user_id", user.id)
      .eq("completed", true)
      .order("completed_at", { ascending: false })
      .limit(1);
    setRecentTask(tasks && tasks[0]);
  }

  // Replace the current useEffect for fetchMonthlyMoods with the following:
  useEffect(() => {
    fetchMonthlyMoods();
    fetchRecentActivity();
    calculateStreak();
  }, []);

  // Add a new useEffect to sync todayMood and mood consistency chart whenever monthlyMoods changes
  useEffect(() => {
    fetchRecentActivity();
    calculateStreak();
  }, [monthlyMoods]);

  // Calendar logic
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
  const calendarCells: React.ReactNode[] = [];
  for (let i = 0; i < totalCells; i++) {
    const day = i - firstDayOfWeek + 1;
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (i < firstDayOfWeek || day > daysInMonth) {
      calendarCells.push(<div key={`empty-${i}`}></div>);
    } else {
      const emoji = monthlyMoods[dateStr];
      const isToday = dateStr === localDateKey();
      calendarCells.push(
        <motion.button
          key={dateStr}
          type="button"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 + day * 0.012, duration: 0.35, ease }}
          whileHover={{ scale: 1.1, rotate: 3 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => openMoodModal(dateStr)}
          title={emoji ? `${dateStr}: ${moodLabel(emoji)}` : `Set mood for ${dateStr}`}
          aria-label={emoji ? `${dateStr}: ${moodLabel(emoji)}` : `Set mood for ${dateStr}`}
          className={`relative flex aspect-square flex-col items-center justify-center rounded-xl transition-[box-shadow,background-color,color] duration-300 hover:shadow-soft ${emoji ? moodTone(emoji) : 'border border-dashed border-line text-muted hover:border-iris hover:text-iris'} ${isToday ? 'ring-2 ring-iris ring-offset-2 ring-offset-surface' : ''}`}
        >
          <span className="absolute left-1.5 top-1 text-[10px] font-semibold leading-none opacity-70">{day}</span>
          {emoji && (
            <motion.span key={emoji} initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }}>
              <MoodIcon value={emoji} className="mt-1.5 text-base sm:text-lg" />
            </motion.span>
          )}
        </motion.button>
      );
    }
  }

  // Calculate mood consistency for the current month
  const daysInCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysWithMood = Object.keys(monthlyMoods).length;
  const moodConsistency = daysInCurrentMonth > 0 ? Math.round((daysWithMood / daysInCurrentMonth) * 100) : 0;

  // Ensure all handlers are defined before they are used in the JSX
  const openMoodModal = (date: string) => {
    setModalDate(date);
    setModalMood("");
    setModalOpen(true);
  };

  // Today's mood (and a few lines, if wanted) is logged on the check-in page
  const handleUpdateMood = () => router.push('/dashboard/mood');

  const [showTrendsModal, setShowTrendsModal] = useState(false);

  const handleViewTrends = () => {
    setShowTrendsModal(true);
  };

  const handleNewEntry = () => {
    router.push('/dashboard/journal?new=1');
  };

  // 3. When a mood is saved or deleted, always call both fetchMonthlyMoods and fetchRecentActivity
  const deleteMoodForDate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const date = modalDate;
    const { error } = await clearMoodForDay(user.id, date);
    if (error) {
      console.error("Error deleting mood:", error);
      return;
    }
    setMonthlyMoods(prev => {
      const newState = { ...prev };
      delete newState[date];
      return newState;
    });
    await fetchMonthlyMoods();
    await fetchRecentActivity();
    await calculateStreak();
    setModalOpen(false);
  };

  const closeMoodModal = () => {
    setModalOpen(false);
  };

  // 2. Modal works for both calendar and today's mood, always showing all emoji (already handled by openMoodModal and handleUpdateMood)
  const saveMoodForDate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const date = modalDate;
    const { error } = await setMoodForDay(user.id, date, modalMood);
    if (error) {
      console.error("Error saving mood:", error);
      return;
    }
    setMonthlyMoods(prev => ({ ...prev, [date]: modalMood }));
    await fetchMonthlyMoods();
    await fetchRecentActivity();
    await calculateStreak();
    setModalOpen(false);
  };


  // 4. Mood Consistency chart uses real mood data for the current month
  const moodChartData = Object.entries(monthlyMoods).map(([date, emoji]) => ({
    date,
    entries: 1,
    moods: moodScore(emoji), // Default to neutral if not found
    label: moodLabel(emoji),
  }));

  // In the chart, add a custom tooltip to show the mood label
  const CustomTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload, label } = props as TooltipProps<number, string> & {
      payload?: { payload: { label?: string } }[];
      label?: string;
    };
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-xl px-3 py-2 text-sm text-ink shadow-soft">
          <div className="font-semibold">{label}</div>
          {payload[0] && payload[0].payload.label && (
            <div className="text-muted">{payload[0].payload.label}</div>
          )}
        </div>
      );
    }
    return null;
  };

  // Update getMoodStats to return avg as a number and bestDay/worstDay as [string, string]
  const getMoodStats = () => {
    const scores = Object.values(monthlyMoods).map(emoji => moodScore(emoji));
    if (scores.length === 0) return null;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const moodsArr = Object.values(monthlyMoods);
    const freq = moodsArr.reduce((acc: Record<string, number>, m) => { acc[m] = (acc[m] || 0) + 1; return acc; }, {});
    const mostCommon = Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b, Object.keys(freq)[0] || "");
    const entries = Object.entries(monthlyMoods);
    const bestDayEntry = entries.length > 0 ? entries.reduce<[string, string]>((a, b) => (moodScore(a[1]) > moodScore(b[1]) ? a : b), entries[0]) : ["", ""];
    const worstDayEntry = entries.length > 0 ? entries.reduce<[string, string]>((a, b) => (moodScore(a[1]) < moodScore(b[1]) ? a : b), entries[0]) : ["", ""];
    return {
      avg,
      mostCommon,
      bestDay: bestDayEntry,
      worstDay: worstDayEntry
    };
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const todayLabel = today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const monthLabel = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayInfo = todayMood ? getMood(todayMood.emoji) : undefined;
  const TodayIcon = todayInfo?.Icon;
  const chartColor = darkMode ? '#BEA8FF' : '#7A5AE4';
  const chartBlush = darkMode ? '#E28CC8' : '#F2A8D4';
  const axisColor = darkMode ? '#B2A8D8' : '#6C6194';

  // Mood picker shared by the calendar modal and the today modal
  const moodGrid = (selected: string, onSelect: (mood: string) => void) => (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {moodOptions.map((mood) => {
        const active = selected === mood;
        return (
          <motion.button
            key={mood}
            type="button"
            aria-pressed={active}
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelect(mood)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-sm font-medium transition ${active ? `${moodTone(mood)} border-transparent shadow-soft` : 'border-line text-ink hover:border-iris'}`}
          >
            <MoodIcon value={mood} className="text-2xl" />
            {moodLabel(mood)}
          </motion.button>
        );
      })}
    </div>
  );

  const modalShell = "fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm";
  const modalBox = "card max-h-[90vh] w-full overflow-y-auto p-6 sm:p-8";

  return (
    <>
      <Head>
        <title>Dashboard | Hiraya</title>
        <meta name="description" content="Your Hiraya dashboard" />
      </Head>
      <div className="sky relative min-h-screen text-ink">
        <Starfield count={50} />
        <Sidebar />
        <main className="app-main relative">
          <motion.div className="mx-auto max-w-6xl" variants={stagger(0.08)} initial="hidden" animate="show">
            <PageHeader
              eyebrow={todayLabel}
              title={<>{greeting}{user?.first_name ? <>, <span className="text-aurora italic">{user.first_name}</span></> : ''}.</>}
              actions={<>
                <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-soft">
                  <FaFire className="text-mood-4" aria-hidden />
                  <motion.span key={streak} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, ease }}>{streak}</motion.span> day streak
                </span>
                <button onClick={handleNewEntry} className="btn-primary">
                  <FaPen aria-hidden className="text-sm" /> New entry
                </button>
              </>}
            />

            <motion.div className="grid gap-6 lg:grid-cols-3" variants={stagger(0.08)}>
              {/* Today */}
              <motion.section variants={rise} className={`relative flex min-h-[20rem] flex-col justify-between overflow-hidden rounded-3xl p-7 shadow-soft transition-colors duration-500 ${todayMood ? moodTone(todayMood.emoji) : 'night dark'}`}>
                {/* Before a mood is logged, the card is a night sky waiting for its sunrise */}
                {todayMood ? (
                  <>
                    <Sparkle size={18} className="star absolute right-8 top-8 opacity-60" />
                    <Sparkle size={10} className="star absolute right-16 top-20 opacity-50 [--delay:-1.2s]" />
                    <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
                  </>
                ) : (
                  <>
                    <Starfield className="absolute" count={24} seed={9} shooting={false} />
                    <motion.div className="planet top-[calc(100%-4.5rem)]" initial={{ y: 60 }} animate={{ y: 0 }} transition={{ duration: 1.4, ease }} />
                  </>
                )}
                <div className="relative">
                  <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${todayMood ? 'opacity-70' : 'text-muted'}`}>Today</p>
                  {todayInfo && TodayIcon ? (
                    <>
                      <motion.div key={todayInfo.value} initial={{ scale: 0.5, rotate: -12, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="mt-6 inline-block">
                        <TodayIcon className="text-6xl" aria-hidden />
                      </motion.div>
                      <p className="mt-4 font-display text-3xl">{todayInfo.label}</p>
                      <p className="mt-2 opacity-80">{todayInfo.advice}</p>
                    </>
                  ) : (
                    <>
                      <motion.div className="mt-6 inline-block" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                        <FaRegSmile className="text-6xl text-iris drop-shadow-[0_0_18px_rgb(var(--iris)/0.7)]" aria-hidden />
                      </motion.div>
                      <p className="mt-4 font-display text-3xl">How are you feeling?</p>
                      <p className="mt-2 text-muted">Log a mood to fill in today on your calendar.</p>
                    </>
                  )}
                </div>
                <button
                  onClick={handleUpdateMood}
                  className={todayMood ? 'relative mt-8 self-start rounded-full bg-black/10 px-5 py-2.5 font-semibold transition hover:bg-black/20' : 'btn-primary relative mt-8 self-start'}
                >
                  {todayMood ? 'Change mood' : 'Check in'}
                </button>
              </motion.section>

              {/* Mood calendar */}
              <motion.section variants={rise} className="card p-6 sm:p-7 lg:col-span-2">
                <div className="mb-5 flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-2xl">{monthLabel}</h2>
                  <span className="text-sm text-muted">{daysWithMood} of {daysInMonth} days logged</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="pb-1 text-center text-xs font-semibold text-muted">{d}</div>
                  ))}
                  {calendarCells}
                </div>
                <div className="mt-5 flex items-center gap-3 text-xs text-muted">
                  <span>Low</span>
                  <div className="h-2 w-40 rounded-full bg-[linear-gradient(90deg,rgb(var(--mood-1)),rgb(var(--mood-2)),rgb(var(--mood-3)),rgb(var(--mood-4)),rgb(var(--mood-5)))]" />
                  <span>High</span>
                </div>
              </motion.section>

              {/* Mood this month */}
              <motion.section variants={rise} className="card p-6 sm:p-7 lg:col-span-2">
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl">Mood this month</h2>
                    <p className="mt-1 text-sm text-muted">{moodConsistency}% of days logged</p>
                  </div>
                  <button onClick={handleViewTrends} className="btn-ghost py-2 text-sm">View report</button>
                </div>
                {moodChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={moodChartData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                      <defs>
                        <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartBlush} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="moodStroke" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={chartColor} />
                          <stop offset="100%" stopColor={chartBlush} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tickFormatter={(d: string) => String(Number(d.slice(8)))} tick={{ fontSize: 12, fill: axisColor }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: axisColor }} domain={[1, 5]} ticks={[1, 3, 5]} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="moods" stroke="url(#moodStroke)" fill="url(#moodFill)" strokeWidth={3} dot={{ r: 3, fill: chartColor, strokeWidth: 0 }} activeDot={{ r: 6, fill: chartColor }} name="Mood score" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="flex h-[200px] items-center justify-center rounded-2xl border border-dashed border-line px-6 text-center text-muted">
                    Log a mood to see your month take shape.
                  </p>
                )}
              </motion.section>

              {/* Recent activity */}
              <motion.section variants={rise} className="card flex flex-col p-6 sm:p-7">
                <h2 className="font-display text-2xl">Recent activity</h2>
                <ul className="mt-5 flex-1 space-y-4 text-sm">
                  <li className="flex gap-3">
                    <span className="icon-badge"><FaRegSmile /></span>
                    {recentMood ? (
                      <div className="min-w-0"><p>Logged <span className="font-semibold">{moodLabel(recentMood.emoji)}</span></p><p className="text-muted">{formatTime(recentMood.created_at)}</p></div>
                    ) : <p className="self-center text-muted">No mood logged yet</p>}
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-badge"><FaBook /></span>
                    {recentJournal ? (
                      <div className="min-w-0"><p className="truncate">Wrote <span className="font-semibold">{recentJournal.title || 'an entry'}</span></p><p className="text-muted">{formatTime(recentJournal.created_at)}</p></div>
                    ) : <p className="self-center text-muted">No journal entry yet</p>}
                  </li>
                  <li className="flex gap-3">
                    <span className="icon-badge"><FaStar /></span>
                    {recentTask ? (
                      <div className="min-w-0"><p className="truncate">Came true: <span className="font-semibold">{recentTask.description}</span></p><p className="text-muted">{formatTime(recentTask.completed_at || recentTask.created_at)}</p></div>
                    ) : <p className="self-center text-muted">No hope has come true yet</p>}
                  </li>
                </ul>
                <div className="mt-6 flex gap-2 border-t border-line pt-5">
                  <button onClick={() => router.push('/dashboard/hopes')} className="btn-ghost flex-1 px-3 py-2 text-sm"><FaStar aria-hidden /> Hopes</button>
                  <button onClick={() => router.push('/feed')} className="btn-ghost flex-1 px-3 py-2 text-sm"><FaRss aria-hidden /> Feed</button>
                </div>
              </motion.section>
            </motion.div>
          </motion.div>
        </main>
      </div>

      {/* Mood modal (calendar day or today) */}
      <AnimatePresence>
      {modalOpen && (
        <motion.div key="mood-modal" {...backdrop} className={modalShell} onClick={closeMoodModal}>
          <motion.div {...panel} className={`${modalBox} max-w-lg`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="mood-modal-title">
            <h3 id="mood-modal-title" className="font-display text-2xl">How did you feel?</h3>
            <p className="mb-6 mt-1 text-muted">{new Date(modalDate + 'T00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            {moodGrid(modalMood, setModalMood)}
            <div className="mt-7 flex items-center justify-between gap-3">
              <div>
                {monthlyMoods[modalDate] && (
                  <button onClick={deleteMoodForDate} className="rounded-full px-4 py-2.5 font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40">
                    Clear mood
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={closeMoodModal} className="btn-ghost">Cancel</button>
                <button onClick={saveMoodForDate} disabled={!modalMood} className="btn-primary">Save mood</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Monthly mood report */}
      {showTrendsModal && (
        <motion.div key="report-modal" {...backdrop} className={modalShell} onClick={() => setShowTrendsModal(false)}>
          <motion.div {...panel} className={`${modalBox} max-w-md`} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="report-title">
            <h2 id="report-title" className="font-display text-2xl">Mood report</h2>
            <p className="mb-6 mt-1 text-muted">{monthLabel}</p>
            {(() => {
              const stats = getMoodStats();
              if (!stats) return <p className="text-muted">No moods logged this month yet.</p>;
              const todayStr = localDateKey();
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 6);
              const weekStr = localDateKey(weekAgo);
              const weeklyMoods = Object.entries(monthlyMoods).filter(([date]) => date >= weekStr && date <= todayStr);
              const weeklyScores = weeklyMoods.map(([, emoji]) => moodScore(emoji));
              const weeklyAvg = weeklyScores.length > 0 ? (weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length).toFixed(1) : null;
              const rows: [string, React.ReactNode][] = [
                ["Average this month", <>{stats.avg.toFixed(1)} <span className="text-muted">/ 5</span></>],
                ["Average this week", weeklyAvg ? <>{weeklyAvg} <span className="text-muted">/ 5</span></> : <span className="text-muted">No moods</span>],
                ["Most frequent", moodLabel(stats.mostCommon)],
                ["Best day", `${stats.bestDay[0]} · ${moodLabel(stats.bestDay[1])}`],
                ["Toughest day", `${stats.worstDay[0]} · ${moodLabel(stats.worstDay[1])}`],
              ];
              return (
                <>
                  <dl className="divide-y divide-line">
                    {rows.map(([term, value]) => (
                      <div key={term} className="flex items-center justify-between gap-4 py-3">
                        <dt className="text-muted">{term}</dt>
                        <dd className="text-right font-semibold">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-6 rounded-2xl bg-gradient-to-br from-iris-soft to-blush/20 p-4 leading-relaxed">
                    {stats.avg >= 4
                      ? "You've been in a great mood this month. Keep doing what's working."
                      : stats.avg >= 3
                      ? "Your mood has been balanced. Make time for yourself and notice the small wins."
                      : "It's been a hard month. Ups and downs are normal. Be gentle with yourself, and reach out if you need support."}
                  </p>
                </>
              );
            })()}
            <button className="btn-primary mt-7 w-full" onClick={() => setShowTrendsModal(false)}>Done</button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
