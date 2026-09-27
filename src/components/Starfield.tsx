// Twinkling stars and the odd shooting star, drawn behind the page.
// Positions come from a seeded random generator so the server and the browser
// draw the same sky (no hydration mismatch).

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

type Star = { x: number; y: number; size: number; dur: number; delay: number; sparkle: boolean };

function makeStars(count: number, seed: number): Star[] {
  const rand = seeded(seed);
  return Array.from({ length: count }, () => {
    const sparkle = rand() < 0.12;
    return {
      x: rand() * 100,
      y: rand() * 100,
      size: sparkle ? 8 + rand() * 8 : 1 + rand() * 2,
      dur: 2 + rand() * 4,
      delay: rand() * -6,
      sparkle,
    };
  });
}

// A four-point sparkle, like the ones in the corners of the stream packs
export function Sparkle({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 0C12.8 7.2 16.8 11.2 24 12C16.8 12.8 12.8 16.8 12 24C11.2 16.8 7.2 12.8 0 12C7.2 11.2 11.2 7.2 12 0Z" fill="currentColor" />
    </svg>
  );
}

export default function Starfield({ count = 70, seed = 7, shooting = true, className = "fixed" }: {
  count?: number;
  seed?: number;
  shooting?: boolean;
  className?: string;
}) {
  const stars = makeStars(count, seed);
  return (
    <div className={`pointer-events-none inset-0 overflow-hidden ${className}`} aria-hidden>
      {stars.map((s, i) =>
        s.sparkle ? (
          <span
            key={i}
            className="star absolute text-white drop-shadow-[0_0_6px_rgb(var(--iris)/0.8)]"
            style={{ left: `${s.x}%`, top: `${s.y}%`, ["--dur" as string]: `${s.dur}s`, ["--delay" as string]: `${s.delay}s` }}
          >
            <Sparkle size={s.size} />
          </span>
        ) : (
          <span
            key={i}
            className="star absolute rounded-full bg-white shadow-[0_0_6px_1px_rgb(var(--iris)/0.55)] dark:shadow-[0_0_6px_1px_rgb(255_255_255/0.5)]"
            style={{
              left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size,
              ["--dur" as string]: `${s.dur}s`, ["--delay" as string]: `${s.delay}s`,
            }}
          />
        )
      )}
      {shooting &&
        [
          { top: "8%", left: "85%", dur: "11s", delay: "2s" },
          { top: "22%", left: "60%", dur: "14s", delay: "7s" },
        ].map((s, i) => (
          <span
            key={`s${i}`}
            className="shooting-star absolute h-px w-28 bg-gradient-to-r from-white via-white/60 to-transparent"
            style={{ top: s.top, left: s.left, ["--dur" as string]: s.dur, ["--delay" as string]: s.delay }}
          />
        ))}
    </div>
  );
}
