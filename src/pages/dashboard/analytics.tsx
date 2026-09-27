// /pages/dashboard/analytics.tsx

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../../components/Sidebar";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDarkMode } from "../../components/DarkModeContext";
import { FaCalendarDay, FaChartLine, FaCalendarAlt, FaStar } from "react-icons/fa";
import { getMood, moodLabel, moodScore } from "../../components/moods";
import { localDateKey } from "../../lib/dates";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";

export default function Analytics() {
  const [moodData, setMoodData] = useState<{ date: string; moods: number }[]>([]);
  const [journalData, setJournalData] = useState<{ date: string; entries: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();
  const { darkMode } = useDarkMode();


  // Generate random stars for dark mode decoration
  const generateStars = () => {
    const stars = [];
    for (let i = 0; i < 18; i++) {
      stars.push({
        id: i,
        top: Math.random() * 90 + 2, // avoid edges
        left: Math.random() * 90 + 2,
        size: Math.random() * 10 + 8, // 8-18px
        opacity: Math.random() * 0.4 + 0.6,
        blur: Math.random() > 0.5 ? 8 : 0,
        animationDelay: Math.random() * 3
      });
    }
    return stars;
  };
  const [stars] = useState(generateStars());

  // After fetching moods, fetch mood details for reports
  const [moodDetails, setMoodDetails] = useState<{ date: string; emoji: string }[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      // Fetch moods (with emoji)
      const { data: moods } = await supabase
        .from("moods")
        .select("created_at, emoji")
        .eq("user_id", session.user.id);
      setMoodDetails((moods || []).map(m => ({ date: localDateKey(m.created_at), emoji: m.emoji })));
      // Fetch moods
      const { data: moodsGrouped } = await supabase
        .from("moods")
        .select("created_at")
        .eq("user_id", session.user.id);
      const moodChart = Object.entries(moodsGrouped?.reduce((acc, entry) => {
        const date = new Date(entry.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {}).map(([date, moods]) => ({ date, moods }));
      setMoodData(moodChart);
      // Fetch journal entries
      const { data: journals } = await supabase
        .from("journal")
        .select("created_at")
        .eq("user_id", session.user.id);
      const journalGrouped = journals?.reduce((acc, entry) => {
        const date = new Date(entry.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const journalChart = Object.entries(journalGrouped || {}).map(([date, entries]) => ({ date, entries }));
      setJournalData(journalChart);
      setLoading(false);
    }
    fetchData();
  }, [router]);

  // Merge data by date for combined chart
  const allDates = Array.from(new Set([
    ...moodData.map(d => d.date),
    ...journalData.map(d => d.date)
  ])).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const combinedData = allDates.map(date => ({
    date,
    moods: moodData.find(d => d.date === date)?.moods || 0,
    entries: journalData.find(d => d.date === date)?.entries || 0
  }));

  // Helper to get mood stats for a date range
  function getMoodStatsForRange(moods: { date: string; emoji: string }[], start: Date, end: Date) {
    // compare yyyy-mm-dd keys so whole local days are included
    const from = localDateKey(start);
    const to = localDateKey(end);
    const filtered = moods.filter(m => m.date >= from && m.date <= to);
    if (filtered.length === 0) return null;
    const scores = filtered.map(m => moodScore(m.emoji));
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const freq: Record<string, number> = {};
    filtered.forEach(m => { const key = getMood(m.emoji)?.value ?? m.emoji; freq[key] = (freq[key] || 0) + 1; });
    const mostCommon = Object.keys(freq).reduce((a, b) => freq[a] > freq[b] ? a : b);
    return {
      avg,
      mostCommon,
      count: filtered.length
    };
  }

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${darkMode ? 'bg-[#1a1a2e]' : 'bg-gradient-to-br from-[#E1D8E9] via-[#D5CFE1] to-[#B6A6CA]'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A09ABC]"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Analytics Dashboard - Muni</title>
        <meta name="description" content="Mood and Journal Analytics" />
      </Head>
      <div className={`flex min-h-screen ${darkMode ? 'bg-[#1a1a2e]' : 'bg-gradient-to-br from-[#E1D8E9] via-[#D5CFE1] to-[#B6A6CA]'}`} style={{ position: 'relative' }}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        {/* Scattered starfield for dark mode */}
        {darkMode && stars.map(star => (
          <div
            key={star.id}
            className="star-glow"
            style={{
              position: 'absolute',
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              filter: `drop-shadow(0 0 ${star.blur}px #fffbe9) drop-shadow(0 0 24px #A09ABC)` + (star.blur ? ' blur(1px)' : ''),
              zIndex: 0,
              animation: `starTwinkle ${3 + star.animationDelay}s infinite alternate ease-in-out`,
              pointerEvents: 'none',
            }}
          >
            {starSVG('#fff', '#A09ABC')}
          </div>
        ))}
        <main className={`flex-1 p-4 md:p-10 min-h-screen transition-all duration-300 ${collapsed ? 'ml-0' : 'ml-64'}`}>
          <div className="w-full flex justify-center">
            <div className="w-full max-w-6xl">
              <h2 className={`text-3xl font-bold mb-6 ${darkMode ? 'text-[#A09ABC]' : 'text-[#A09ABC]'}`}>Analytics Dashboard</h2>
              {/* Main Chart Card */}
              <div className={`bg-white/60 dark:bg-[#23234a] rounded-3xl shadow-lg border border-white/30 dark:border-[#23234a] p-8 mb-10`}>
                <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-[#A09ABC]' : 'text-[#6C63A6]'}`}>Mood Trends & Journal Analytics</h3>
                {combinedData.length === 0 ? (
                  <div className={`text-center py-8 ${darkMode ? 'text-[#A09ABC]' : 'text-[#6C63A6]'}`}>No data yet. Start tracking your moods and journals.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={combinedData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
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
                      <XAxis dataKey="date" stroke="#A09ABC" tick={{ fontSize: 14 }} />
                      <YAxis stroke="#A09ABC" allowDecimals={false} tick={{ fontSize: 14 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255,255,255,0.95)',
                          border: '1px solid #B6A6CA',
                          borderRadius: '8px',
                          color: '#6C63A6',
                          fontWeight: 600
                        }}
                        formatter={(value) => (typeof value === 'number' ? Math.round(value) : value)}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area
                        type="monotone"
                        dataKey="moods"
                        stroke="#B6A6CA"
                        fill="url(#lightPurple)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#B6A6CA' }}
                        activeDot={{ r: 7, fill: '#B6A6CA' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="entries"
                        stroke="#6C3483"
                        fill="url(#darkPurple)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#6C3483' }}
                        activeDot={{ r: 7, fill: '#6C3483' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className={`mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`}>
                {/* Today */}
                {(() => {
                  const today = new Date();
                  const daily = getMoodStatsForRange(moodDetails, today, today);
                  return (
                    <div className="p-5 rounded-xl bg-[#F3F0F9] shadow flex flex-col h-full border-2 border-[#A09ABC]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCalendarDay className="text-xl text-[#A09ABC]" aria-hidden />
                        <span className="font-bold text-lg text-[#A09ABC]">Today</span>
                      </div>
                      <div className="mt-2 text-xl font-bold text-[#A09ABC]">{daily ? daily.avg.toFixed(2) : 'N/A'} <span className="text-base font-normal">{daily ? '(' + moodLabel(daily.mostCommon) + ')' : ''}</span></div>
                      <div className="mb-1 text-[#6C63A6]">Avg Mood</div>
                      <div className="text-lg font-semibold">{daily ? moodLabel(daily.mostCommon) : 'N/A'}</div>
                      <div className="mb-1 text-[#6C63A6]">Most Common Mood</div>
                      <div className="text-lg font-semibold">{daily ? daily.count : 0}</div>
                      <div className="text-[#6C63A6]">Entries</div>
                    </div>
                  );
                })()}
                {/* This Week */}
                {(() => {
                  const today = new Date();
                  const weekAgo = new Date();
                  weekAgo.setDate(today.getDate() - 6);
                  const weekly = getMoodStatsForRange(moodDetails, weekAgo, today);
                  return (
                    <div className="p-5 rounded-xl bg-[#F3F0F9] shadow flex flex-col h-full border-2 border-[#A09ABC]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <FaChartLine className="text-xl text-[#A09ABC]" aria-hidden />
                        <span className="font-bold text-lg text-[#A09ABC]">This Week</span>
                      </div>
                      <div className="mt-2 text-xl font-bold text-[#A09ABC]">{weekly ? weekly.avg.toFixed(2) : 'N/A'} <span className="text-base font-normal">{weekly ? '(' + moodLabel(weekly.mostCommon) + ')' : ''}</span></div>
                      <div className="mb-1 text-[#6C63A6]">Avg Mood</div>
                      <div className="text-lg font-semibold">{weekly ? moodLabel(weekly.mostCommon) : 'N/A'}</div>
                      <div className="mb-1 text-[#6C63A6]">Most Common Mood</div>
                      <div className="text-lg font-semibold">{weekly ? weekly.count : 0}</div>
                      <div className="text-[#6C63A6]">Entries</div>
                    </div>
                  );
                })()}
                {/* This Month */}
                {(() => {
                  const today = new Date();
                  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  const monthly = getMoodStatsForRange(moodDetails, startOfMonth, today);
                  return (
                    <div className="p-5 rounded-xl bg-[#F3F0F9] shadow flex flex-col h-full border-2 border-[#A09ABC]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCalendarAlt className="text-xl text-[#A09ABC]" aria-hidden />
                        <span className="font-bold text-lg text-[#A09ABC]">This Month</span>
                      </div>
                      <div className="mt-2 text-xl font-bold text-[#A09ABC]">{monthly ? monthly.avg.toFixed(2) : 'N/A'} <span className="text-base font-normal">{monthly ? '(' + moodLabel(monthly.mostCommon) + ')' : ''}</span></div>
                      <div className="mb-1 text-[#6C63A6]">Avg Mood</div>
                      <div className="text-lg font-semibold">{monthly ? moodLabel(monthly.mostCommon) : 'N/A'}</div>
                      <div className="mb-1 text-[#6C63A6]">Most Common Mood</div>
                      <div className="text-lg font-semibold">{monthly ? monthly.count : 0}</div>
                      <div className="text-[#6C63A6]">Entries</div>
                    </div>
                  );
                })()}
                {/* Overall */}
                {(() => {
                  const overall = getMoodStatsForRange(moodDetails, new Date('2000-01-01'), new Date());
                  let message = '';
                  if (overall) {
                    if (overall.avg >= 4) message = "You're doing great! Keep up the positive energy.";
                    else if (overall.avg >= 3) message = "Your mood is balanced. Remember to take care of yourself.";
                    else message = "It's okay to have tough days. Take care and reach out if you need support.";
                  }
                  return (
                    <div className="p-5 rounded-xl bg-[#E1D8E9] shadow flex flex-col h-full border-2 border-[#A09ABC]">
                      <div className="flex items-center gap-2 mb-2">
                        <FaStar className="text-xl text-[#A09ABC]" aria-hidden />
                        <span className="font-bold text-lg text-[#A09ABC]">Overall</span>
                      </div>
                      <div className="mt-2 text-xl font-bold text-[#A09ABC]">{overall ? overall.avg.toFixed(2) : 'N/A'} <span className="text-base font-normal">{overall ? '(' + moodLabel(overall.mostCommon) + ')' : ''}</span></div>
                      <div className="mb-1 text-[#6C63A6]">Avg Mood</div>
                      <div className="text-lg font-semibold">{overall ? moodLabel(overall.mostCommon) : 'N/A'}</div>
                      <div className="mb-1 text-[#6C63A6]">Most Common Mood</div>
                      <div className="text-lg font-semibold">{overall ? overall.count : 0}</div>
                      <div className="text-[#6C63A6]">Entries</div>
                      <div className="mt-3 text-[#A09ABC] text-base font-bold">{message}</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </main>
      </div>
      <style jsx global>{`
        .star-glow {
          filter: drop-shadow(0 0 24px #fffbe9) drop-shadow(0 0 48px #A09ABC);
          opacity: 0.85;
          animation: starTwinkle 5s infinite alternate ease-in-out;
        }
        @keyframes starTwinkle {
          0% { transform: translateY(0) scale(1); opacity: 0.85; }
          50% { transform: translateY(-12px) scale(1.05); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 0.85; }
        }
      `}</style>
    </>
  );
}

function starSVG(color1: string, color2: string) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 16px #fffbe9) blur(0.5px)' }}>
      <defs>
        <radialGradient id="starGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stopColor={color1} stopOpacity="1" />
          <stop offset="100%" stopColor={color2} stopOpacity="0.7" />
        </radialGradient>
      </defs>
      {/* 5-pointed star */}
      <path 
        d="M50 10 L61 35 L88 35 L68 55 L78 82 L50 65 L22 82 L32 55 L12 35 L39 35 Z" 
        fill="url(#starGradient)" 
        stroke={color2} 
        strokeWidth="2"
      />
      {/* Inner glow */}
      <circle cx="50" cy="50" r="15" fill={color1} opacity="0.3" />
    </svg>
  );
}
