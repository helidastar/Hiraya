import { MOODS, getMood } from "./moods";

// Compact mood selector used by the journal editors
export default function MoodPicker({ value, onChange, darkMode }: {
  value: string | null;
  onChange: (value: string | null) => void;
  darkMode?: boolean;
}) {
  const selected = getMood(value);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: darkMode ? '#A09ABC' : '#6C63A6' }}>
        Mood: {selected ? selected.label : 'None'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {MOODS.map(({ value: mood, label, Icon }) => {
          const active = selected?.value === mood;
          return (
            <button
              key={mood}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={active}
              onClick={() => onChange(active ? null : mood)}
              style={{
                fontSize: 22, width: 40, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active ? '#A09ABC' : (darkMode ? '#23234a' : '#f8f6fa'),
                color: active ? '#fff' : '#A09ABC',
              }}
            >
              <Icon />
            </button>
          );
        })}
      </div>
    </div>
  );
}
