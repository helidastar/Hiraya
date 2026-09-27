import { motion } from "framer-motion";
import { MOODS, getMood, moodTone } from "./moods";

// Compact mood selector used by the journal editors. Tap a mood again to clear it.
export default function MoodPicker({ value, onChange }: {
  value: string | null;
  onChange: (value: string | null) => void;
  darkMode?: boolean;
}) {
  const selected = getMood(value);
  return (
    <div className="mb-4">
      <p className="label">
        Mood <span className="font-normal text-muted">{selected ? `· ${selected.label}` : '(optional)'}</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {MOODS.map(({ value: mood, label, Icon }) => {
          const active = selected?.value === mood;
          return (
            <motion.button
              key={mood}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={active}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(active ? null : mood)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition ${active ? moodTone(mood) : 'bg-paper text-muted hover:bg-iris-soft hover:text-iris'}`}
            >
              <Icon />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
