import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { rise, stagger, ease } from "../lib/motion";
import { MOODS, moodTone } from "../components/moods";
import Starfield, { Sparkle } from "../components/Starfield";
import ThemeToggle from "../components/ThemeToggle";
import { FaBook, FaRegSmile, FaCalendarAlt, FaColumns, FaChartLine, FaGlobeAsia, FaLock, FaMoon, FaHome, FaTasks, FaEllipsisH, FaSmile, FaArrowRight, FaFire, FaCheck, FaThLarge, FaListOl, FaSignInAlt } from "react-icons/fa";

// An example month of mood scores (1 = lowest, 5 = happiest)
const SAMPLE_MONTH = [3, 4, 4, 2, 1, 2, 3, 4, 5, 5, 4, 3, 3, 2, 3, 4, 4, 5, 4, 3, 2, 2, 3, 4, 5, 5, 4, 4, 3, 5];
const TONE: Record<number, string> = { 1: "bg-mood-1", 2: "bg-mood-2", 3: "bg-mood-3", 4: "bg-mood-4", 5: "bg-mood-5" };
const SCALE = ["Anxious", "Sad", "Neutral", "Happy", "Excited"];

// The five moods the phone cycles through in the hero
const PHONE_MOODS = ["😱", "😔", "😐", "😌", "🥳"].map((v) => MOODS.find((m) => m.value === v)!);
const JOURNAL_LINE = "Walked home under the stars tonight. Felt lighter than I have all week.";

const FEATURES = [
  { icon: <FaBook />, title: "Journal", text: "Write, edit and look back on daily entries. Each one keeps the mood you felt when you wrote it.", span: "lg:col-span-2" },
  { icon: <FaRegSmile />, title: "Mood log", text: "Pick from 13 moods, once a day, in one tap.", span: "" },
  { icon: <FaCalendarAlt />, title: "Mood calendar", text: "Every day of the month in its mood color.", span: "" },
  { icon: <FaChartLine />, title: "Analytics", text: "Spot patterns over weeks and months.", span: "" },
  { icon: <FaColumns />, title: "Task board", text: "Drag tasks from To do to Done.", span: "" },
  { icon: <FaGlobeAsia />, title: "Community feed", text: "Share an entry publicly if you want to, then like and comment on what others have shared.", span: "lg:col-span-2" },
  { icon: <FaLock />, title: "Private by default", text: "Entries stay yours unless you choose to share them. Nothing is public until you say so.", span: "lg:col-span-2" },
  { icon: <FaMoon />, title: "Day and night", text: "A dusk theme and a night theme. Try it:", span: "lg:col-span-2", toggle: true },
];

const STEPS = [
  { title: "Pick a mood", text: "One tap. From anxious to excited, night to sunrise." },
  { title: "Write a few lines", text: "Or a few pages. Whatever today needs." },
  { title: "Watch your month fill in", text: "Your days turn into a sky of colors you can read at a glance." },
];

export default function Home() {
  return (
    <div className="sky relative min-h-screen overflow-x-clip text-ink">
      <Head>
        <title>Hiraya | A journal that remembers how you felt</title>
        <meta name="description" content="Write daily entries, log your mood in one tap, and see a month of your days at a glance." />
      </Head>

      <SiteHeader />
      <MobileBar />
      <main>
        <Hero />
        <MoodMarquee />
        <MonthSection />
        <Features />
        <Steps />
        <FinalCta />
      </main>
      <footer className="relative border-t border-line/70 pb-28 md:pb-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted md:px-8">
          <span className="flex items-center gap-2">
            <Image src="/pictures/logo.png" alt="" width={20} height={20} /> Hiraya · the fruit of one&apos;s hopes and dreams
          </span>
          <nav className="flex gap-5">
            <Link href="/about" className="hover:text-ink">About</Link>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/cookies" className="hover:text-ink">Cookies</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => scrollY.on("change", (y) => setScrolled(y > 24)), [scrollY]);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease }}
    >
      <div className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2 transition-all duration-500 sm:px-5 ${scrolled ? "glass shadow-soft" : "border border-transparent"}`}>
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/pictures/logo.png" alt="" width={32} height={32} className="drop-shadow-[0_0_10px_rgb(var(--iris)/0.6)]" />
          <span className="font-display text-2xl">Hiraya</span>
        </Link>
        <nav className="hidden items-center gap-3 md:flex">
          <a href="#features" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:text-ink md:block">Features</a>
          <a href="#how" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:text-ink md:block">How it works</a>
          <ThemeToggle />
          <Link href="/auth/login" className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:text-ink">Log in</Link>
          <Link href="/auth/signup" className="btn-primary py-2 text-sm">Create account</Link>
        </nav>
      </div>
    </motion.header>
  );
}

// On phones the links sit in a bottom bar, the same shape as the app's tab bar
function MobileBar() {
  const tab = "flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-semibold text-muted transition active:scale-95";
  return (
    <motion.nav
      aria-label="Site"
      className="glass fixed inset-x-3 z-50 flex items-end justify-around rounded-[1.75rem] px-2 py-2 shadow-soft md:hidden"
      style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.7, ease }}
    >
      <a href="#features" className={tab}><FaThLarge className="text-lg" />Features</a>
      <a href="#how" className={tab}><FaListOl className="text-lg" />Steps</a>
      <Link href="/auth/signup" aria-label="Create account" className="-mt-8 flex w-16 flex-col items-center gap-1 text-[11px] font-semibold text-iris">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-iris to-blush text-white shadow-glow ring-4 ring-paper">
          <Sparkle size={22} />
        </span>
        Join
      </Link>
      <span className={tab}>
        <ThemeToggle className="!h-[18px] !w-[18px] !border-0 !bg-transparent !shadow-none !backdrop-blur-none" />
        Theme
      </span>
      <Link href="/auth/login" className={tab}><FaSignInAlt className="text-lg" />Log in</Link>
    </motion.nav>
  );
}

/* ---------------------------------------------------------------- Hero */

const HEADLINE = ["A", "journal", "that", "remembers", "how", "you"];

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const planetY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const planetScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // The phone leans toward the pointer
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), { stiffness: 120, damping: 18 });
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [10, -10]), { stiffness: 120, damping: 18 });
  const onMove = (e: MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => { px.set(0); py.set(0); }}
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-48 pt-28 lg:pb-48"
    >
      <Starfield className="absolute" count={90} seed={11} />
      <Constellation />
      <RingedPlanet />

      {/* The planet rising over the horizon */}
      <motion.div
        style={{ x: "-50%", y: planetY, scale: planetScale }}
        className="pointer-events-none absolute left-1/2 top-[calc(100%-9rem)] h-[160vw] w-[160vw] rounded-full md:h-[110vw] md:w-[110vw] lg:top-[calc(100%-11rem)]"
        aria-hidden
      >
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,rgb(255_255_255/0.95),rgb(var(--blush)/0.9)_12%,rgb(var(--iris)/0.85)_30%,rgb(var(--sky-mid))_55%)] shadow-[0_-30px_120px_20px_rgb(var(--blush)/0.45)]" />
        <div className="absolute inset-0 rounded-full opacity-40 mix-blend-overlay [background:repeating-radial-gradient(circle_at_50%_-10%,transparent_0_28px,rgb(255_255_255/0.25)_30px_31px)]" />
      </motion.div>

      {/* Drifting clouds on the horizon */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48" aria-hidden>
        <div className="animate-cloud-left absolute -left-10 bottom-10 h-24 w-[28rem] rounded-full bg-white/50 blur-2xl dark:bg-blush/20" />
        <div className="animate-cloud-right absolute -right-10 bottom-4 h-28 w-[32rem] rounded-full bg-white/40 blur-3xl dark:bg-iris/25" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 md:px-8 lg:grid-cols-[1.15fr_1fr]">
        <motion.div style={{ y: textY, opacity: fade }}>
        <motion.div variants={stagger(0.12, 0.3)} initial="hidden" animate="show" className="text-center lg:text-left">
          <motion.p variants={rise} className="glass mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-muted shadow-soft">
            <Sparkle size={12} className="text-iris" />
            <span className="font-display text-ink">hi·ra·ya</span>
            <span className="italic">Filipino</span> · the fruit of one&apos;s hopes and dreams
          </motion.p>

          <h1 className="font-display text-[2.8rem] leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {HEADLINE.map((word, i) => (
              <span key={i} className="inline-block overflow-hidden pb-2 align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.35 + i * 0.07, duration: 0.8, ease }}
                >
                  {word}&nbsp;
                </motion.span>
              </span>
            ))}
            <span className="inline-block overflow-hidden pb-2 align-bottom">
              <motion.span
                className="text-aurora inline-block italic"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.35 + HEADLINE.length * 0.07, duration: 0.8, ease }}
              >
                felt.
              </motion.span>
            </span>
          </h1>

          <motion.p variants={rise} className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted lg:mx-0">
            Write daily entries, log your mood in one tap, and watch your month
            fill in from night to sunrise.
          </motion.p>
          <motion.div variants={rise} className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link href="/auth/signup" className="btn-primary group px-7 py-3.5 text-lg">
              Start your journal
              <FaArrowRight className="text-sm transition group-hover:translate-x-1" />
            </Link>
            <Link href="/auth/login" className="btn-ghost px-7 py-3.5 text-lg">Log in</Link>
          </motion.div>
          <motion.ul variants={rise} className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted lg:justify-start">
            {["13 moods", "One tap a day", "Private by default"].map((t) => (
              <li key={t} className="flex items-center gap-2"><FaCheck className="text-iris" /> {t}</li>
            ))}
          </motion.ul>
        </motion.div>
        </motion.div>

        <motion.div
          className="relative mx-auto [perspective:1200px]"
          initial={{ opacity: 0, y: 80, rotate: 6 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.5, duration: 1.1, ease }}
        >
          <motion.div style={{ rotateX: rotX, rotateY: rotY }} className="[transform-style:preserve-3d]">
            <motion.div animate={{ y: [0, -14, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
              <Phone />
            </motion.div>
          </motion.div>
          <FloatingChip className="-left-32 top-8" delay={1.2}>
            <FaFire className="text-mood-4" /> 12-day streak
          </FloatingChip>
          <FloatingChip className="-right-24 top-1/2" delay={1.45}>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mood-5 text-[10px] text-[#1E1A33]"><FaCheck /></span> Entry saved
          </FloatingChip>
          <FloatingChip className="-left-28 bottom-28" delay={1.7}>
            <span className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <span key={n} className={`h-3 w-3 rounded-full ${TONE[n]}`} />)}</span>
            night → sunrise
          </FloatingChip>
        </motion.div>
      </div>
    </section>
  );
}

function FloatingChip({ className, delay, children }: { className: string; delay: number; children: ReactNode }) {
  return (
    <motion.div
      className={`glass absolute hidden items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-soft sm:flex ${className}`}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
      transition={{ opacity: { delay, duration: 0.5 }, scale: { delay, duration: 0.6, ease }, y: { delay, duration: 5, repeat: Infinity, ease: "easeInOut" } }}
    >
      {children}
    </motion.div>
  );
}

// A small constellation that draws itself in the top corner of the sky
function Constellation() {
  const pts: [number, number][] = [[20, 60], [70, 30], [130, 50], [170, 20], [210, 70], [160, 110]];
  const d = `M${pts.map((p) => p.join(",")).join(" L")} L130,50`;
  return (
    <svg viewBox="0 0 240 130" className="pointer-events-none absolute right-[6%] top-[14%] hidden w-56 md:block text-white opacity-80 drop-shadow-[0_0_6px_rgb(var(--iris)/0.8)] md:w-72" aria-hidden>
      <motion.path d={d} fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.7"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1, duration: 2.4, ease: "easeInOut" }} />
      {pts.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r={i === 3 ? 3 : 2} fill="currentColor"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1 + i * 0.35, duration: 0.5 }} />
      ))}
    </svg>
  );
}

function RingedPlanet() {
  return (
    <motion.svg
      viewBox="0 0 80 50" className="pointer-events-none absolute left-[46%] top-[13%] hidden w-14 text-iris/70 md:block md:w-20" aria-hidden
      animate={{ y: [0, -12, 0], rotate: [-8, -2, -8] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    >
      <circle cx="40" cy="25" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="40" cy="25" rx="36" ry="8" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(-15 40 25)" />
    </motion.svg>
  );
}

/* ------------------------------------------------ The phone in the hero */

function Phone() {
  const [mood, setMood] = useState(3);
  const [typed, setTyped] = useState(0);

  // Cycle through moods and type the journal line, so the app feels alive
  useEffect(() => {
    const id = setInterval(() => setMood((m) => (m + 1) % PHONE_MOODS.length), 2200);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const id = setInterval(() => setTyped((t) => (t >= JOURNAL_LINE.length + 25 ? 0 : t + 1)), 55);
    return () => clearInterval(id);
  }, []);

  const current = PHONE_MOODS[mood];

  return (
    // Always a night sky inside the phone, whatever the page theme
    <div className="dark relative h-[560px] w-[272px] rounded-[3rem] border-[9px] border-[#130d2b] bg-[#130d2b] shadow-[0_40px_80px_-20px_rgb(var(--shadow)/0.6),0_0_0_1px_rgb(255_255_255/0.08)] sm:h-[600px] sm:w-[292px]">
      <div className="relative h-full overflow-hidden rounded-[2.4rem] bg-[linear-gradient(180deg,#1a1240,#2a1d5e_60%,#46317f)] text-ink">
        <Starfield className="absolute" count={28} seed={3} shooting={false} />
        {/* The planet at the foot of the screen */}
        <div className="absolute -bottom-44 left-1/2 h-72 w-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_0%,#f4e6ff,#b99cf0_35%,#6c4fc0_70%)] opacity-90 shadow-[0_-10px_60px_rgb(190_160_255/0.5)]" />

        <div className="absolute left-1/2 top-2 h-6 w-24 -translate-x-1/2 rounded-full bg-[#130d2b]" />
        <div className="relative flex items-center justify-between px-6 pt-3 text-[11px] font-semibold">
          <span>9:41</span>
          <span className="flex gap-1"><span className="h-2 w-3 rounded-sm bg-white/80" /><span className="h-2 w-2 rounded-full bg-white/80" /></span>
        </div>

        <div className="relative px-5 pt-6">
          <p className="text-xs text-muted">Good evening</p>
          <p className="font-display text-[22px] leading-tight">How are you feeling tonight?</p>

          <div className="mt-4 flex justify-between">
            {PHONE_MOODS.map((m, i) => (
              <button key={m.value} onClick={() => setMood(i)} className="relative flex h-10 w-10 items-center justify-center" aria-label={m.label}>
                {i === mood && (
                  <motion.span layoutId="phone-mood" className="absolute -inset-1 rounded-full ring-2 ring-white/80" transition={{ duration: 0.45, ease }} />
                )}
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${moodTone(m.value)} ${i === mood ? "scale-110" : "opacity-70"} transition`}>
                  <m.Icon />
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 h-5 text-center text-sm font-semibold">
            <AnimatePresence mode="wait">
              <motion.span key={current.label} className="inline-block" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.25 }}>
                {current.label}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted">This week</p>
            <div className="flex h-14 items-end gap-1.5">
              {[3, 2, 4, 3, 5, 4, PHONE_MOODS[mood].score].map((s, i) => (
                <motion.div key={i} className={`flex-1 rounded-md ${TONE[s]}`} animate={{ height: `${s * 20}%` }} transition={{ duration: 0.6, ease }} />
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted">Journal</p>
            <p className="min-h-[3.2rem] text-[13px] leading-snug">
              {JOURNAL_LINE.slice(0, typed)}
              <span className="ml-0.5 inline-block h-3.5 w-px animate-pulse bg-white align-middle" />
            </p>
          </div>
        </div>

        {/* A copy of the app's phone tab bar */}
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-around rounded-[1.4rem] border border-white/10 bg-[#21174a]/80 px-1 pb-1.5 pt-1.5 backdrop-blur-xl">
          {[FaHome, FaBook].map((Icon, i) => (
            <span key={i} className={`flex w-12 flex-col items-center rounded-xl py-1 text-sm ${i === 0 ? "bg-iris-soft text-iris" : "text-muted"}`}><Icon /></span>
          ))}
          <span className="-mt-6 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-iris to-blush text-lg text-white shadow-glow ring-4 ring-[#21174a]"><FaSmile /></span>
          {[FaTasks, FaEllipsisH].map((Icon, i) => (
            <span key={i} className="flex w-12 flex-col items-center py-1 text-sm text-muted"><Icon /></span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ Mood marquee */

// One continuous ribbon of moods. They run night to sunrise and back again,
// each segment fading into the next, so the colors flow in a single sweep.
const RIBBON = (() => {
  const up = [...MOODS].sort((a, b) => a.score - b.score);
  return [...up, ...[...up].reverse()];
})();

function MoodMarquee() {
  const loop = [...RIBBON, ...RIBBON];
  return (
    <section aria-label="The moods in Hiraya" className="relative z-10 -mt-12 overflow-hidden pb-16 pt-6">
      <motion.div
        className="-mx-8 shadow-glow"
        initial={{ opacity: 0, x: 80, rotate: -2 }}
        whileInView={{ opacity: 1, x: 0, rotate: -2 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 1.2, ease }}
      >
        <div className="animate-marquee flex w-max">
          {loop.map((m, i) => {
            const next = loop[(i + 1) % loop.length];
            return (
              <span
                key={i}
                className={`flex items-center gap-2.5 whitespace-nowrap py-3.5 pl-6 pr-4 text-sm font-semibold ${m.score <= 2 ? "text-white" : "text-[#1E1A33]"}`}
                style={{ background: `linear-gradient(90deg, rgb(var(--mood-${m.score})), rgb(var(--mood-${next.score})))` }}
              >
                <m.Icon className="text-lg" aria-hidden />
                {m.label}
                <Sparkle size={10} className="ml-3 opacity-60" />
              </span>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------ A month section */

function MonthSection() {
  return (
    <section className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-24 md:px-8 lg:grid-cols-2 lg:gap-20">
      <motion.div variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.5 }}>
        <motion.p variants={rise} className="eyebrow mb-4">Your month at a glance</motion.p>
        <motion.h2 variants={rise} className="font-display text-4xl leading-tight sm:text-5xl">
          Every day gets a color. <span className="text-aurora italic">Together they tell a story.</span>
        </motion.h2>
        <motion.p variants={rise} className="mt-5 max-w-md text-lg leading-relaxed text-muted">
          Heavy days are deep indigo, bright ones glow like sunrise. Scroll back through
          a month and you&apos;ll see what the weeks felt like before you read a word.
        </motion.p>
      </motion.div>

      <motion.figure
        className="card relative p-6 sm:p-8"
        initial={{ opacity: 0, y: 40, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.9, ease }}
      >
        <Sparkle size={22} className="absolute -right-2 -top-2 text-iris" />
        <figcaption className="mb-5 flex items-baseline justify-between">
          <span className="font-display text-xl">A month in Hiraya</span>
          <span className="eyebrow">Example</span>
        </figcaption>
        <motion.div className="grid grid-cols-6 gap-2 sm:gap-2.5" variants={stagger(0.03)} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.4 }}>
          {SAMPLE_MONTH.map((score, i) => (
            <motion.div
              key={i}
              className={`flex aspect-square cursor-default items-end rounded-xl p-1.5 ${TONE[score]}`}
              variants={{ hidden: { opacity: 0, scale: 0.4, rotate: -20 }, show: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5, ease } } }}
              whileHover={{ scale: 1.15, rotate: 4, zIndex: 1 }}
            >
              <span className={`text-[11px] font-semibold leading-none ${score <= 2 ? "text-white/80" : "text-[#1E1A33]/60"}`}>{i + 1}</span>
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-6 border-t border-line pt-5">
          <div className="flex h-2.5 overflow-hidden rounded-full">
            {[1, 2, 3, 4, 5].map((s) => <div key={s} className={`flex-1 ${TONE[s]}`} />)}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted">
            {SCALE.map((s) => <span key={s}>{s}</span>)}
          </div>
        </div>
      </motion.figure>
    </section>
  );
}

/* ------------------------------------------------------------ Features */

function Features() {
  // A soft light follows the pointer across each card
  const spotlight = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <section id="features" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:px-8">
      <motion.div className="mx-auto max-w-2xl text-center" variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.6 }}>
        <motion.p variants={rise} className="eyebrow mb-4">Everything in one quiet place</motion.p>
        <motion.h2 variants={rise} className="font-display text-4xl leading-tight sm:text-5xl">Check in with yourself, gently</motion.h2>
      </motion.div>
      <motion.ul
        className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={stagger(0.07)} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.15 }}
      >
        {FEATURES.map((f) => (
          <motion.li
            key={f.title}
            variants={rise}
            onMouseMove={spotlight}
            whileHover={{ y: -6 }}
            className={`card group relative overflow-hidden p-6 ${f.span}`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 [background:radial-gradient(320px_circle_at_var(--x)_var(--y),rgb(var(--iris)/0.16),transparent_65%)]" />
            <div className="relative">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-iris to-blush text-lg text-white shadow-glow transition duration-500 group-hover:rotate-[10deg] group-hover:scale-110">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 leading-relaxed text-muted">{f.text}</p>
              {f.toggle && <ThemeToggle className="mt-4" />}
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

/* --------------------------------------------------------------- Steps */

function Steps() {
  return (
    <section id="how" className="relative mx-auto max-w-6xl scroll-mt-24 px-5 py-24 md:px-8">
      <motion.h2
        className="mx-auto max-w-xl text-center font-display text-4xl leading-tight sm:text-5xl"
        variants={rise} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.6 }}
      >
        Three steps, every night
      </motion.h2>
      <div className="relative mt-16">
        {/* The line joining the steps draws itself in, like a constellation */}
        <motion.div
          className="absolute left-[16.6%] right-[16.6%] top-7 hidden h-px origin-left bg-gradient-to-r from-iris via-blush to-iris md:block"
          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: false, amount: 0.8 }} transition={{ duration: 1.4, ease }}
        />
        <motion.div
          className="absolute bottom-10 left-7 top-7 w-px origin-top bg-gradient-to-b from-iris via-blush to-iris md:hidden"
          initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: false, amount: 0.5 }} transition={{ duration: 1.4, ease }}
        />
        <motion.ol className="relative grid gap-10 md:grid-cols-3" variants={stagger(0.35)} initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.5 }}>
          {STEPS.map((s, i) => (
            <motion.li key={s.title} variants={rise} className="flex gap-5 md:flex-col md:items-center md:text-center">
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-iris to-blush font-display text-xl text-white shadow-glow ring-8 ring-paper/60">
                {i + 1}
                <Sparkle size={14} className="star absolute -right-1 -top-1 text-white" />
              </span>
              <div>
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="mt-1.5 max-w-xs leading-relaxed text-muted">{s.text}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Final CTA */

function FinalCta() {
  return (
    <section className="px-3 pb-20 pt-10 sm:px-5">
      <motion.div
        // Always the night sky, in both themes
        className="dark relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-[linear-gradient(180deg,#140e33,#2a1d5e_65%,#4a3386)] px-6 pb-40 pt-20 text-center text-ink shadow-soft sm:pb-48"
        initial={{ opacity: 0, y: 60, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 1, ease }}
      >
        <Starfield className="absolute" count={60} seed={21} />
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[calc(100%-7rem)] h-[60rem] w-[60rem] rounded-full bg-[radial-gradient(circle_at_50%_0%,#fbeaff,#d9a8e8_12%,#9c7ae8_32%,#4a3386_60%)] shadow-[0_-20px_120px_rgb(220_160_240/0.5)] sm:top-[calc(100%-9rem)]"
          initial={{ x: "-50%", y: 120 }}
          whileInView={{ x: "-50%", y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 1.6, ease }}
          aria-hidden
        />
        <div className="relative">
          <Image src="/pictures/logo.png" alt="" width={56} height={56} className="mx-auto mb-6 drop-shadow-[0_0_20px_rgb(190_168_255/0.8)]" />
          <h2 className="font-display text-4xl leading-tight sm:text-6xl">
            How are you feeling <span className="text-aurora italic">tonight?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-muted">
            Sign up, pick a mood, write a few lines. That&apos;s your first entry.
          </p>
          <Link href="/auth/signup" className="btn-primary group mt-9 px-8 py-4 text-lg">
            Start your journal
            <FaArrowRight className="text-sm transition group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
