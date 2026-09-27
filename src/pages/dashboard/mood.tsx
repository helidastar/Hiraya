import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { FaTrash } from "react-icons/fa";
import PageShell from "../../components/PageShell";
import Starfield from "../../components/Starfield";
import { MOODS, MoodIcon, getMood, moodLabel, moodTone } from "../../components/moods";
import { localDateKey } from "../../lib/dates";
import { setMoodForDay } from "../../lib/moodLog";
import { rise, ease } from "../../lib/motion";

type Mood = {
  id: string;
  emoji: string;
  created_at: string;
  user_id?: string;
};

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState("");
  const [moodData, setMoodData] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvice, setShowAdvice] = useState(false);
  const router = useRouter();

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

  const latest = getMood(moodData[0]?.emoji);

  return (
    <PageShell title="Mood tracker" eyebrow="One mood per day" loading={loading}>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* The check-in is always the night sky, like the phone on the landing page */}
        <motion.section variants={rise} className="night dark p-6 sm:p-8">
          <Starfield className="absolute" count={30} seed={13} shooting={false} />
          <div className="planet top-[calc(100%-3.5rem)] opacity-80" />
          <div className="relative">
          <h2 className="font-display text-3xl">How are you feeling today?</h2>
          <p className="mt-1 text-muted">Saving again replaces today&apos;s mood.</p>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5">
            {MOODS.map(({ value: mood, label, Icon }) => {
              const active = selectedMood === mood;
              return (
                <motion.button
                  key={mood}
                  type="button"
                  aria-pressed={active}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSelectedMood(mood)}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 text-sm font-medium transition-colors ${active ? `${moodTone(mood)} border-transparent shadow-glow` : 'border-white/10 bg-white/[0.06] text-ink backdrop-blur hover:border-iris/60'}`}
                >
                  {active && <motion.span layoutId="mood-ring" className="absolute -inset-1 rounded-[1.2rem] ring-2 ring-white/80" transition={{ duration: 0.4, ease }} />}
                  <Icon className="text-3xl" aria-hidden />
                  {label}
                </motion.button>
              );
            })}
          </div>
          <button onClick={submitMood} disabled={!selectedMood} className="btn-primary mt-7 w-full py-3.5 text-base sm:w-auto sm:px-10">
            Save mood
          </button>
          <AnimatePresence>
            {showAdvice && latest && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                className={`mt-6 flex items-center gap-4 rounded-2xl p-5 ${moodTone(latest.value)}`}
                role="status"
              >
                <latest.Icon className="shrink-0 text-3xl" aria-hidden />
                <div>
                  <p className="font-semibold">Saved: {latest.label}</p>
                  <p className="opacity-80">{latest.advice}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.section>

        <motion.section variants={rise} className="card flex flex-col p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl">History</h2>
            <span className="text-sm text-muted">{moodData.length} logged</span>
          </div>
          {moodData.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-line px-6 py-12 text-center text-muted">
              Your moods will show up here once you log one.
            </p>
          ) : (
            <ul className="-mr-2 mt-5 max-h-[520px] space-y-2 overflow-y-auto pr-2">
              <AnimatePresence initial={false}>
                {moodData.map((mood) => (
                  <motion.li
                    key={mood.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.3, ease }}
                    className="group flex items-center gap-3 rounded-2xl p-2 pr-3 transition hover:bg-iris-soft/60"
                  >
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${moodTone(mood.emoji)}`}>
                      <MoodIcon value={mood.emoji} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{moodLabel(mood.emoji)}</p>
                      <p className="text-sm text-muted">{new Date(mood.created_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <button
                      onClick={() => deleteMood(mood.id)}
                      aria-label={`Delete mood from ${new Date(mood.created_at).toLocaleDateString()}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-muted opacity-100 transition hover:bg-red-50 hover:text-red-600 sm:opacity-0 sm:focus:opacity-100 sm:group-hover:opacity-100 dark:hover:bg-red-950/40"
                    >
                      <FaTrash aria-hidden />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </motion.section>
      </div>
    </PageShell>
  );
}
