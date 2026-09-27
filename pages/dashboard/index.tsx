import Head from "next/head";
import { useState, useEffect } from "react";
import { FaBook, FaTasks, FaRss, FaFire, FaRegSmile, FaCheckCircle } from "react-icons/fa";
import { MOODS, MoodIcon, moodLabel, moodScore } from "../../components/moods";
import { localDateKey, dayBounds } from "../../lib/dates";
import { setMoodForDay, clearMoodForDay } from "../../lib/moodLog";
import Sidebar from "../../components/Sidebar";
import { supabase } from "../../lib/supabaseClient";
import { useDarkMode } from "../../components/DarkModeContext";
import { useRouter } from "next/router";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TooltipProps } from 'recharts';
import React from 'react';

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(true);
  type UserProfile = { first_name: string; id: string };
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { darkMode } = useDarkMode();
  // Add missing state variables
  const [recentMood, setRecentMood] = useState<any>(null);
  const [recentJournal, setRecentJournal] = useState<any>(null);
  const [recentTask, setRecentTask] = useState<any>(null);
  const [todayMood, setTodayMood] = useState<any>(null);

  // Add missing state and constants for dashboard functionality
  const [streak, setStreak] = useState(0);


  const [modalOpen, setModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalMood, setModalMood] = useState("");
  const [monthlyMoods, setMonthlyMoods] = useState<{ [date: string]: string }>({});

  // Add state for dashboard mood modal
  const [dashboardMoodModalOpen, setDashboardMoodModalOpen] = useState(false);
  const [dashboardSelectedMood, setDashboardSelectedMood] = useState("");

  const moodOptions = MOODS.map((m) => m.value);

  const motivationalQuotes = [
    "Keep going, you’re doing great!",
    "Every day is a fresh start.",
    "Progress, not perfection.",
    "You are stronger than you think.",
    "Small steps every day.",
    "Your feelings are valid.",
    "Celebrate your wins, big or small.",
    "Growth is a journey."
  ];

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
      moods.forEach((mood: any) => {
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
    const moodDates = new Set(moods.map((m: any) => localDateKey(m.created_at)));
    let streakCount = 0;
    let current = new Date();
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
      setLoading(false);
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
    // Fetch latest completed task (include completed_at)
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
      const faded = !monthlyMoods[dateStr];
      calendarCells.push(
        <div
          key={dateStr}
          className={`text-2xl text-center cursor-pointer select-none transition hover:scale-110 ${faded ? 'opacity-30' : ''}`}
          onClick={() => openMoodModal(dateStr)}
          title={emoji ? `${dateStr}: ${moodLabel(emoji)}` : `Set mood for ${dateStr}`}
        >
          <MoodIcon value={emoji} className="mx-auto" />
        </div>
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

  // 1. Make the 'Update Mood' button always open the emoji picker modal for today's date
  const handleUpdateMood = () => {
    const todayStr = localDateKey();
    setModalDate(todayStr);
    setModalMood(monthlyMoods[todayStr] || "");
    setModalOpen(true);
  };

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

  const handleSaveDashboardMood = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const date = localDateKey();
    const { error } = await setMoodForDay(user.id, date, dashboardSelectedMood);
    if (error) {
      console.error("Error saving dashboard mood:", error);
      return;
    }
    setMonthlyMoods(prev => ({ ...prev, [date]: dashboardSelectedMood }));
    await fetchMonthlyMoods();
    await fetchRecentActivity();
    await calculateStreak();
    setDashboardMoodModalOpen(false);
  };

  // 4. Mood Consistency chart uses real mood data for the current month
  const moodChartData = Object.entries(monthlyMoods).map(([date, emoji]) => ({
    date,
    entries: 1,
    moods: moodScore(emoji), // Default to neutral if not found
    label: moodLabel(emoji),
  }));

  // In the chart, add a custom tooltip to show the mood label
  const CustomTooltip = (props: TooltipProps<any, any>) => {
    const { active, payload, label } = props as any;
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', borderRadius: 8, padding: 8, boxShadow: '0 2px 8px #A09ABC22', color: '#6C63A6' }}>
          <div><b>{label}</b></div>
          {payload.map((entry: any, idx: number) => (
            <div key={idx} style={{ color: entry.color }}>{entry.name}: {entry.value}</div>
          ))}
          {payload[0] && payload[0].payload.label && (
            <div style={{ marginTop: 4, fontStyle: 'italic', color: '#A09ABC' }}>Mood: {payload[0].payload.label}</div>
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

  return (
    <>
      <Head>
        <title>Muni Dashboard</title>
        <meta
          name="description"
          content="Muni minimalist journaling dashboard"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`flex min-h-screen ${darkMode ? 'bg-[#1a1a2e]' : 'bg-gradient-to-br from-[#E1D8E9] via-[#D5CFE1] to-[#B6A6CA]'}`}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`flex-1 p-6 md:p-10 min-h-screen transition-all duration-300 ${collapsed ? 'ml-0' : 'ml-64'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Welcome Card */}
            <div className="rounded-3xl bg-white/60 dark:bg-[#23234a] shadow-lg p-8 mb-8 backdrop-blur-md border border-white/30 dark:border-[#23234a]">
              <h2 className="text-2xl md:text-3xl font-bold text-[#A09ABC] mb-2">Welcome back, {user?.first_name || 'User'}!</h2>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-[#6C63A6] text-lg">How are you feeling today?</div>
                <div className="flex items-center gap-4">
                  <span className="bg-[#B6A6CA] text-white rounded-full px-4 py-1 text-sm font-semibold shadow flex items-center gap-2">
                    <FaFire aria-hidden /> {streak} day streak
                  </span>
                  {todayMood ? (
                    <span className="bg-[#A09ABC] text-white rounded-full px-4 py-1 text-sm font-semibold shadow flex items-center gap-2">
                      <MoodIcon value={todayMood.emoji} /> {moodLabel(todayMood.emoji)}
                    </span>
                  ) : (
                    <span className="bg-[#A09ABC] text-white rounded-full px-4 py-1 text-sm font-semibold shadow flex items-center gap-2">
                      No mood yet
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Main Grid - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {/* Mood Calendar */}
              <div className="rounded-2xl bg-white/60 dark:bg-[#23234a] shadow p-6 backdrop-blur-md border border-white/30 dark:border-[#23234a] col-span-1">
                <h3 className="text-xl font-bold text-[#A09ABC] mb-4">Mood Calendar</h3>
                <div className="text-center text-[#6C63A6] font-semibold mb-2">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="text-xs text-[#A09ABC] font-bold text-center">
                      {["S", "M", "T", "W", "T", "F", "S"][i]}
                    </div>
                  ))}
                  {calendarCells}
                </div>
              </div>
              {/* Today's Mood */}
              <div className="rounded-2xl bg-white/60 dark:bg-[#23234a] shadow p-6 flex flex-col items-center justify-center backdrop-blur-md border border-white/30 dark:border-[#23234a]">
                <div className="text-lg font-semibold text-[#6C63A6] mb-2">Today's Mood</div>
                <div className="text-5xl mb-2">
                  {todayMood ? (
                    <MoodIcon value={todayMood.emoji} className="text-[#A09ABC]" />
                  ) : (
                    <FaRegSmile className="opacity-30 text-[#A09ABC]" />
                  )}
                </div>
                <div className="text-[#A09ABC] text-base font-semibold mb-4">
                  {todayMood ? moodLabel(todayMood.emoji) : 'No mood logged'}
                </div>
                <button onClick={handleUpdateMood} className="bg-[#A09ABC] text-white px-5 py-2 rounded-lg font-bold shadow hover:bg-[#B6A6CA] transition">
                  Update Mood
                </button>
              </div>
              {/* Mood Consistency with area chart (analytics style) */}
              <div className="rounded-2xl bg-white/60 dark:bg-[#23234a] shadow p-6 flex flex-col items-center justify-center backdrop-blur-md border border-white/30 dark:border-[#23234a]">
                <div className="text-lg font-semibold text-[#6C63A6] mb-2">Mood Consistency</div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={moodChartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="lightPurple" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#B6A6CA" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#E1D8E9" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="darkPurple" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6C3483" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#23234a" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#A09ABC' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#A09ABC' }} domain={[1, 5]} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} labelStyle={{ color: '#6C63A6' }} />
                    <Legend verticalAlign="top" height={24} iconType="circle" wrapperStyle={{ color: '#A09ABC', fontWeight: 600, fontSize: 15 }} />
                    <Area type="monotone" dataKey="entries" stroke="#6C3483" fill="url(#darkPurple)" strokeWidth={3} dot={{ r: 4, fill: '#6C3483' }} activeDot={{ r: 7, fill: '#6C3483' }} name="entries" />
                    <Area type="monotone" dataKey="moods" stroke="#8B7BB9" fill="url(#lightPurple)" strokeWidth={3} dot={{ r: 4, fill: '#8B7BB9' }} activeDot={{ r: 7, fill: '#8B7BB9' }} name="moods" />
                  </AreaChart>
                </ResponsiveContainer>
                <button onClick={handleViewTrends} className="mt-4 bg-[#B6A6CA] text-white px-5 py-2 rounded-lg font-bold shadow hover:bg-[#A09ABC] transition">
                  View Trends
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <div className="rounded-2xl shadow-xl p-6 bg-gradient-to-br from-[#E1D8E9]/80 to-[#B6A6CA]/80 border border-white/40 col-span-1">
                <div className="flex items-center gap-2 text-lg font-semibold mb-2 text-[#6C63A6]">
                  <FaTasks className="text-2xl text-[#A09ABC]" /> Recent Activity
                </div>
                <ul className="text-[#6C63A6] text-sm space-y-2 w-full">
                  <li className="flex items-center gap-2">
                    <FaRegSmile className="text-[#A09ABC] shrink-0" />
                    {recentMood ? (
                      <>
                        Logged mood: <span className="font-semibold">{moodLabel(recentMood.emoji)}</span>
                        <span className="ml-auto text-[#A09ABC]/70">{formatTime(recentMood.created_at)}</span>
                      </>
                    ) : (
                      <span className="italic text-[#A09ABC]/70">No mood logged yet</span>
                    )}
                  </li>
                  <li className="flex items-center gap-2">
                    <FaBook className="text-[#A09ABC] shrink-0" />
                    {recentJournal ? (
                      <>
                        Created journal entry{recentJournal.title ? `: ${recentJournal.title}` : ""}
                        <span className="ml-auto text-[#A09ABC]/70">{formatTime(recentJournal.created_at)}</span>
                      </>
                    ) : (
                      <span className="italic text-[#A09ABC]/70">No journal entry yet</span>
                    )}
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle className="text-[#A09ABC] shrink-0" />
                    {recentTask ? (
                      <>
                        Completed task: <span className="font-semibold">{recentTask.description}</span>
                        <span className="ml-auto text-[#A09ABC]/70">{formatTime(recentTask.completed_at || recentTask.created_at)}</span>
                      </>
                    ) : (
                      <span className="italic text-[#A09ABC]/70">No completed task yet</span>
                    )}
                  </li>
                </ul>
              </div>
              {/* Quick Entry */}
              <div className="rounded-2xl shadow-xl p-6 flex flex-col items-center bg-gradient-to-br from-[#B6A6CA]/80 to-[#E1D8E9]/80 border border-white/40 col-span-1">
                <div className="flex items-center gap-2 text-lg font-semibold mb-2 text-[#6C63A6]">
                  <FaBook className="text-2xl text-[#A09ABC]" /> Quick Entry
                </div>
                <p className="text-[#6C63A6] mb-4 text-center">Tap below to create a new journal entry</p>
                <button onClick={handleNewEntry} className="bg-[#A09ABC] text-white px-5 py-2 rounded-lg font-bold shadow flex items-center gap-2 hover:bg-[#B6A6CA] transition">
                  <span className="text-xl">+</span> New Entry
                </button>
              </div>
              {/* Community Feed */}
              <div className="rounded-2xl shadow-xl p-6 flex flex-col items-center bg-gradient-to-br from-[#B6A6CA]/80 to-[#E1D8E9]/80 border border-white/40 col-span-1">
                <div className="flex items-center gap-2 text-lg font-semibold mb-4 text-[#6C63A6]">
                  <FaRss className="text-2xl text-[#A09ABC]" /> Community Feed
                </div>
                <div className="text-[#6C63A6] text-center mb-4">Discover inspiring reflections from the community</div>
                <button
                  onClick={() => router.push('/feed')}
                  className="bg-[#A09ABC] text-white px-5 py-2 rounded-lg font-bold shadow hover:bg-[#B6A6CA] transition"
                >
                  Explore Feed
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Mood Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#23234a] rounded-2xl p-8 shadow-lg min-w-[320px] max-w-[90vw]">
            <h3 className="text-xl font-bold mb-4 text-center">Select Mood for {modalDate}</h3>
            <div className="grid grid-cols-5 gap-4 mb-6">
              {moodOptions.map((mood) => (
                <button
                  key={mood}
                  title={moodLabel(mood)}
                  className={`text-2xl w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2 ${modalMood === mood ? 'border-[#A09ABC] bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white' : 'border-transparent bg-white dark:bg-[#23234a] text-[#6C63A6] dark:text-[#A09ABC]'}`}
                  onClick={() => setModalMood(mood)}
                >
                  <MoodIcon value={mood} />
                  <span className="text-[10px] mt-1 leading-none">{moodLabel(mood)}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between gap-4 items-center">
              <div>
                {monthlyMoods[modalDate] && (
                  <button
                    onClick={deleteMoodForDate}
                    className="px-4 py-2 rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 font-semibold mr-2"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <button onClick={closeMoodModal} className="px-4 py-2 rounded bg-gray-200 dark:bg-[#23234a] text-gray-700 dark:text-[#A09ABC] font-semibold">Cancel</button>
                <button
                  onClick={saveMoodForDate}
                  disabled={!modalMood}
                  className="px-6 py-2 rounded bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-bold disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {dashboardMoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#23234a] rounded-2xl p-8 shadow-lg min-w-[320px] max-w-[90vw]">
            <h3 className="text-xl font-bold mb-4 text-center">Select Mood for {localDateKey()}</h3>
            <div className="grid grid-cols-5 gap-4 mb-6">
              {moodOptions.map((mood) => (
                <button
                  key={mood}
                  title={moodLabel(mood)}
                  className={`text-2xl w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-all duration-200 border-2 ${dashboardSelectedMood === mood ? 'border-[#A09ABC] bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white' : 'border-transparent bg-white dark:bg-[#23234a] text-[#6C63A6] dark:text-[#A09ABC]'}`}
                  onClick={() => setDashboardSelectedMood(mood)}
                >
                  <MoodIcon value={mood} />
                  <span className="text-[10px] mt-1 leading-none">{moodLabel(mood)}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between gap-4 items-center">
              <button onClick={() => setDashboardMoodModalOpen(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-[#23234a] text-gray-700 dark:text-[#A09ABC] font-semibold">Cancel</button>
              <button
                onClick={handleSaveDashboardMood}
                disabled={!dashboardSelectedMood}
                className="px-6 py-2 rounded bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-bold disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mood Consistency Report Modal */}
      {showTrendsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-[#A09ABC]">Mood Consistency Report</h2>
            {(() => {
              const stats = getMoodStats();
              if (!stats) return <div>No mood data for this month.</div>;
              const avgNum = stats.avg;
              const modalBestDay = stats.bestDay;
              const modalWorstDay = stats.worstDay;
              const modalMostCommon = stats.mostCommon;

              // Daily and weekly stats
              const todayStr = localDateKey();
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 6);
              const weekStr = localDateKey(weekAgo);
              // Filter moods for today and this week
              const dailyMoods = Object.entries(monthlyMoods).filter(([date]) => date === todayStr);
              const weeklyMoods = Object.entries(monthlyMoods).filter(([date]) => date >= weekStr && date <= todayStr);
              const dailyMoodScore = dailyMoods.length > 0 ? moodScore(dailyMoods[0][1]) : null;
              const weeklyMoodScores = weeklyMoods.map(([_, emoji]) => moodScore(emoji));
              const weeklyAvgMood = weeklyMoodScores.length > 0 ? (weeklyMoodScores.reduce((a, b) => a + b, 0) / weeklyMoodScores.length).toFixed(2) : null;
              const weeklyMostCommon = (() => {
                if (weeklyMoods.length === 0) return null;
                const freq: Record<string, number> = {};
                weeklyMoods.forEach(([_, emoji]) => { freq[emoji] = (freq[emoji] || 0) + 1; });
                return Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
              })();
              return (
                <>
                  <div className="mb-4 text-[#6C63A6] text-base">
                    Here’s a summary of your mood patterns for <b>{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</b>:
                  </div>
                  {/* Daily Report */}
                  <div className="mb-4 p-3 rounded-lg bg-[#F3F0F9]">
                    <div className="font-semibold text-[#A09ABC] mb-1">Today’s Report</div>
                    <div>Average Mood: <b>{dailyMoodScore ? dailyMoodScore + ' (' + moodLabel(dailyMoods[0][1]) + ')' : 'No mood logged'}</b></div>
                    <div>Entries: <b>{dailyMoods.length}</b></div>
                  </div>
                  {/* Weekly Report */}
                  <div className="mb-4 p-3 rounded-lg bg-[#F3F0F9]">
                    <div className="font-semibold text-[#A09ABC] mb-1">This Week’s Report</div>
                    <div>Average Mood: <b>{weeklyAvgMood ? weeklyAvgMood + ' (' + (weeklyMostCommon ? moodLabel(weeklyMostCommon) : '') + ')' : 'No moods logged'}</b></div>
                    <div>Most Common Mood: <b>{weeklyMostCommon ? moodLabel(weeklyMostCommon) : 'N/A'}</b></div>
                    <div>Entries: <b>{weeklyMoods.length}</b></div>
                  </div>
                  {/* Monthly Report */}
                  <div className="mb-2">
                    <span className="font-semibold text-[#A09ABC]">Average Mood Score:</span>
                    <span className="ml-2">{stats.avg.toFixed(2)} <span className="text-xs text-[#6C63A6]">(1 = lowest, 5 = happiest)</span></span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#A09ABC]">Most Frequent Mood:</span>
                    <span className="ml-2">{moodLabel(modalMostCommon)}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#A09ABC]">Best Day:</span>
                    <span className="ml-2">{modalBestDay[0]} — {moodLabel(modalBestDay[1])}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-[#A09ABC]">Toughest Day:</span>
                    <span className="ml-2">{modalWorstDay[0]} — {moodLabel(modalWorstDay[1])}</span>
                  </div>
                  <div className="mt-6 text-[#6C63A6] text-base font-semibold">
                    {avgNum >= 4 ? (
                      <>You’ve been in a <span className="text-[#A09ABC] font-bold">great mood</span> this month! Keep it up and continue spreading positivity.</>
                    ) : avgNum >= 3 ? (
                      <>Your mood has been <span className="text-[#A09ABC] font-bold">balanced</span>. Remember to take time for yourself and celebrate small wins.</>
                    ) : (
                      <>It’s been a <span className="text-[#A09ABC] font-bold">challenging month</span>. Remember, it’s okay to have ups and downs. Take care of yourself and reach out if you need support.</>
                    )}
                  </div>
                </>
              );
            })()}
            <button
              className="mt-8 bg-[#A09ABC] text-white px-5 py-2 rounded-lg font-bold shadow hover:bg-[#B6A6CA] transition"
              onClick={() => setShowTrendsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
