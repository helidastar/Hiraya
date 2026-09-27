import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../../components/Sidebar";
import Head from "next/head";
import { useRouter } from "next/router";
import { useDarkMode } from "../../components/DarkModeContext";
import { FaTrash } from "react-icons/fa";
import { MOODS, MoodIcon, getMood, moodLabel } from "../../components/moods";
import { localDateKey } from "../../lib/dates";
import { setMoodForDay } from "../../lib/moodLog";

export default function MoodTracker() {
const [selectedMood, setSelectedMood] = useState("");
type Mood = {
id: string;
emoji: string;
created_at: string;
user_id?: string;
};

  const [moodData, setMoodData] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const [showAdvice, setShowAdvice] = useState(false);

  // Change this variable to switch between horizontal and vertical layouts
  const layoutDirection = "flex-col gap-8"; // use "flex-row gap-12" for horizontal
  const isVertical = layoutDirection === "flex-col gap-8";

useEffect(() => {
fetchMoodData();
}, []);

  async function fetchMoodData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const { data } = await supabase
      .from("moods")
      .select("id, emoji, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setMoodData(data || []);
    setLoading(false);
  }

  async function submitMood() {
    if (!selectedMood) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    // one mood per day: saving again replaces today's mood
    await setMoodForDay(user.id, localDateKey(), selectedMood);
    setShowAdvice(true);
    setSelectedMood("");
    fetchMoodData();
  }

async function deleteMood(id: string) {
await supabase.from("moods").delete().eq("id", id);
setMoodData(moodData.filter((m) => m.id !== id));
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
        <title>Mood Tracker - Muni</title>
        <meta name="description" content="Track your daily moods" />
      </Head>
      <div className={`flex min-h-screen ${darkMode ? 'bg-[#1a1a2e]' : 'bg-gradient-to-br from-[#E1D8E9] via-[#D5CFE1] to-[#B6A6CA]'}`}>
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <main className={`flex-1 p-10 min-h-screen transition-all duration-300 ${collapsed ? 'ml-0' : 'ml-64'}`}>
          <div className="max-w-7xl mx-auto">
            <h2 className={`text-4xl font-bold mb-10 ${darkMode ? 'text-[#A09ABC]' : 'text-[#A09ABC]'}`}>Mood Tracker</h2>
            <div className="w-full flex justify-center items-stretch">
              <div className={`w-full flex ${layoutDirection} bg-white/80 dark:bg-[#23234a] rounded-3xl shadow-lg border border-white/30 dark:border-[#23234a] p-4 md:p-12 max-h-screen overflow-auto`}>
                {/* Emoji Picker (left) */}
                <div className="flex flex-col flex-1 justify-between">
                  <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-[#A09ABC]' : 'text-[#6C63A6]'}`}>How are you feeling today?</h3>
                  <p className={`-mt-4 mb-6 text-sm ${darkMode ? 'text-[#A09ABC]' : 'text-[#6C63A6]'}`}>You can log one mood per day. Saving again replaces today's mood.</p>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-wrap gap-4 justify-center w-full">
                          {MOODS.map(({ value: mood }) => (
                            <button
                              key={mood}
                              onClick={() => setSelectedMood(mood)}
                              title={moodLabel(mood)}
                              className={`w-24 h-24 text-3xl rounded-2xl flex flex-col items-center justify-center transition-all duration-300 hover:scale-110 font-bold text-center shadow-md ${
                                selectedMood === mood 
                                  ? 'bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white' 
                                  : darkMode ? 'bg-[#23234a] text-[#A09ABC] hover:bg-[#23234a]/80' : 'bg-white text-[#6C63A6] hover:bg-white'
                              }`}
                            >
                              <MoodIcon value={mood} />
                              <span className="text-xs mt-2 font-semibold">{moodLabel(mood)}</span>
                            </button>
                          ))}
                    </div>
                  </div>
                  <button
                    onClick={submitMood}
                    disabled={!selectedMood}
                    className="px-10 py-5 mt-10 rounded-full bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white text-2xl font-bold shadow hover:from-[#B6A6CA] hover:to-[#A09ABC] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Mood
                  </button>
                  {/* Show advice/task only after saving mood */}
                  {showAdvice && (
                    <div className="mt-8 text-xl font-semibold text-center text-[#6C63A6] dark:text-[#A09ABC]">
                      {getMood(moodData[0]?.emoji)?.advice || "Thank you for sharing your mood. Take care of yourself today."}
                    </div>
                  )}
                </div>
                {/* Mood History (right) */}
                <div className={`flex flex-col flex-1 ${isVertical ? "mt-8" : "ml-12"}`}>
                  <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-[#A09ABC]' : 'text-[#6C63A6]'}`}>Mood History</h3>
                  <div className="flex-1 flex flex-col justify-start">
                    {moodData.length === 0 ? (
                      <div className={`text-center py-16 text-xl ${darkMode ? 'text-[#A09ABC]' : 'text-[#6C63A6]'}`}>No moods logged yet.</div>
                    ) : (
                      <ul className="space-y-6 overflow-y-auto max-h-[400px] pr-2">
                        {moodData.map((mood) => (
                          <li key={mood.id} className={`${darkMode ? 'bg-[#23234a] text-[#A09ABC]' : 'bg-white text-[#6C63A6]'} rounded-xl p-6 flex justify-between items-center text-xl shadow-md`}>
                            <span className="flex items-center gap-3"><MoodIcon value={mood.emoji} className="text-3xl" /><span className="font-semibold">{moodLabel(mood.emoji)}</span></span>
                            <span className="text-lg">{new Date(mood.created_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            <button
                              onClick={() => deleteMood(mood.id)}
                              className="text-red-500 hover:text-red-700 text-lg font-bold flex items-center gap-2"
                            >
                              <FaTrash aria-hidden /> Delete
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}