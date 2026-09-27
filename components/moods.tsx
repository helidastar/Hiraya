import type { IconType } from "react-icons";
import {
  FaRegGrinBeam, FaRegSmile, FaRegSmileBeam, FaRegGrinHearts, FaRegGrinStars,
  FaRegLaughSquint, FaRegMeh, FaRegFlushed, FaRegTired, FaRegFrown,
  FaRegGrimace, FaRegSadTear, FaRegAngry,
} from "react-icons/fa";

// The mood list used everywhere in the app.
// `value` is what gets stored in the database (moods.emoji and journal.mood).
// It stays an emoji so moods saved by earlier versions keep working, but it is
// never shown to users: the UI shows the icon and label instead.
export type Mood = {
  value: string;
  label: string;
  score: number; // 1 = lowest, 5 = happiest
  Icon: IconType;
  advice: string;
};

export const MOODS: Mood[] = [
  { value: "😁", label: "Very happy", score: 5, Icon: FaRegGrinBeam, advice: "Keep smiling." },
  { value: "🙂", label: "Happy", score: 4, Icon: FaRegSmile, advice: "Stay positive." },
  { value: "😌", label: "Calm", score: 4, Icon: FaRegSmileBeam, advice: "Enjoy the quiet moment." },
  { value: "😍", label: "Loved", score: 5, Icon: FaRegGrinHearts, advice: "Hold on to the people who make you feel this way." },
  { value: "🥳", label: "Excited", score: 5, Icon: FaRegGrinStars, advice: "Celebrate your wins, big or small." },
  { value: "😂", label: "Amused", score: 5, Icon: FaRegLaughSquint, advice: "Laughter is good medicine." },
  { value: "😐", label: "Neutral", score: 3, Icon: FaRegMeh, advice: "It's okay to feel neutral." },
  { value: "😳", label: "Embarrassed", score: 3, Icon: FaRegFlushed, advice: "It happens to everyone. Be kind to yourself." },
  { value: "😴", label: "Tired", score: 2, Icon: FaRegTired, advice: "Rest is important." },
  { value: "😔", label: "Sad", score: 2, Icon: FaRegFrown, advice: "Take some time for yourself." },
  { value: "😱", label: "Anxious", score: 1, Icon: FaRegGrimace, advice: "Take a slow breath and give yourself a moment." },
  { value: "😢", label: "Crying", score: 1, Icon: FaRegSadTear, advice: "It's okay to cry. Reach out if you need support." },
  { value: "😡", label: "Angry", score: 1, Icon: FaRegAngry, advice: "Try a few deep breaths." },
];

// Values saved by older versions of the app, mapped to the closest current mood
const LEGACY: Record<string, string> = {
  "😀": "😁", "😄": "😁", "🤩": "🥳", "😊": "🙂", "😅": "🙂", "😉": "🙂", "😎": "🙂",
  "😇": "😌", "🥰": "😍", "😘": "😍", "😜": "😂", "😏": "😐", "😪": "😴",
  "😥": "😔", "🥲": "😔", "🥺": "😔", "😬": "😱", "😭": "😢", "😤": "😡",
};

export function getMood(value?: string | null): Mood | undefined {
  if (!value) return undefined;
  const key = LEGACY[value] ?? value;
  return MOODS.find((m) => m.value === key);
}

export const moodLabel = (value?: string | null) => getMood(value)?.label ?? "Unknown";
export const moodScore = (value?: string | null) => getMood(value)?.score ?? 3;

export function MoodIcon({ value, className }: { value?: string | null; className?: string }) {
  const Icon = getMood(value)?.Icon ?? FaRegMeh;
  return <Icon className={className} aria-label={moodLabel(value)} />;
}
