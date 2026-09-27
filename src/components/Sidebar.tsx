import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FaHome, FaBook, FaSmile, FaTasks, FaChartBar, FaCog, FaUser, FaRss, FaEllipsisH, FaTimes } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import { ease } from "../lib/motion";

type Item = { label: string; short: string; path: string; Icon: IconType };

// Shown in the phone's bottom bar (Mood sits in the raised middle slot)
const PRIMARY: Item[] = [
  { label: "Dashboard", short: "Home", path: "/dashboard", Icon: FaHome },
  { label: "Journal", short: "Journal", path: "/dashboard/journal", Icon: FaBook },
  { label: "Mood Tracker", short: "Mood", path: "/dashboard/mood", Icon: FaSmile },
  { label: "Tasks", short: "Tasks", path: "/dashboard/task", Icon: FaTasks },
];

// Behind "More" on phones
const SECONDARY: Item[] = [
  { label: "Analytics", short: "Analytics", path: "/dashboard/analytics", Icon: FaChartBar },
  { label: "Community Feed", short: "Feed", path: "/feed", Icon: FaRss },
  { label: "Settings", short: "Settings", path: "/dashboard/settings", Icon: FaCog },
  { label: "Account", short: "Account", path: "/dashboard/account", Icon: FaUser },
];

const ALL = [...PRIMARY, ...SECONDARY];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <Image src="/pictures/logo.png" alt="" width={34} height={34} className="drop-shadow-[0_0_10px_rgb(var(--iris)/0.5)]" />
      <span className={`font-display text-2xl text-ink ${compact ? "hidden lg:inline" : ""}`}>Hiraya</span>
    </Link>
  );
}

// App navigation: a floating side rail on tablets and desktops, and a bottom
// tab bar on phones (the theme switch lives in its "More" sheet).
export default function Sidebar() {
  const { pathname } = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = SECONDARY.some((i) => i.path === pathname);

  // Close the sheet when the page changes
  useEffect(() => setMoreOpen(false), [pathname]);

  return (
    <>
      {/* Side rail: icons only on tablets, icons and labels on desktops */}
      <nav
        aria-label="Main"
        className="glass fixed bottom-4 left-4 top-4 z-30 hidden w-20 flex-col items-center rounded-[2rem] py-6 shadow-soft md:flex lg:w-64 lg:items-stretch lg:px-4"
      >
        <div className="mb-8 lg:px-2">
          <Logo compact />
        </div>
        <ul className="flex flex-1 flex-col gap-1">
          {ALL.map((item) => {
            const active = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  aria-current={active ? "page" : undefined}
                  title={item.label}
                  className={`group relative flex items-center justify-center gap-3 rounded-2xl p-3 text-[15px] font-medium transition lg:justify-start lg:px-3 lg:py-2.5 ${active ? "text-iris" : "text-muted hover:text-ink"}`}
                >
                  {active && (
                    <motion.span
                      layoutId="rail-active"
                      className="absolute inset-0 rounded-2xl bg-iris-soft shadow-[inset_0_0_0_1px_rgb(var(--iris)/0.25)]"
                      transition={{ duration: 0.4, ease }}
                    />
                  )}
                  <item.Icon className="relative text-lg transition group-hover:scale-110" />
                  <span className="relative hidden lg:inline">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 hidden lg:block">
          <ThemeToggle label />
        </div>
        <ThemeToggle className="mt-4 lg:hidden" />
      </nav>

      {/* Phone bottom tab bar */}
      <nav
        aria-label="Main"
        className="glass fixed inset-x-3 z-40 flex items-end justify-around rounded-[1.75rem] px-2 pb-2 pt-2 shadow-soft md:hidden"
        style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        {PRIMARY.map((item) => {
          const active = pathname === item.path;
          const tab = (
            <Link
              key={item.path}
              href={item.path}
              aria-current={active ? "page" : undefined}
              className={`relative flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-semibold transition ${active ? "text-iris" : "text-muted"}`}
            >
              {active && (
                <motion.span layoutId="tab-active" className="absolute inset-0 rounded-2xl bg-iris-soft" transition={{ duration: 0.35, ease }} />
              )}
              <item.Icon className="relative text-lg" />
              <span className="relative">{item.short}</span>
            </Link>
          );
          // The Mood tab is the raised round button in the middle
          if (item.path === "/dashboard/mood") {
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-label="Mood Tracker"
                aria-current={active ? "page" : undefined}
                className="-mt-8 flex w-16 flex-col items-center gap-1 text-[11px] font-semibold text-muted"
              >
                <motion.span
                  whileTap={{ scale: 0.9 }}
                  className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-iris to-blush text-2xl text-white shadow-glow ring-4 ring-paper ${active ? "scale-105" : ""}`}
                >
                  <item.Icon />
                </motion.span>
                <span className={active ? "text-iris" : ""}>{item.short}</span>
              </Link>
            );
          }
          return tab;
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-expanded={moreOpen}
          className={`relative flex w-16 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-semibold transition ${moreActive ? "text-iris" : "text-muted"}`}
        >
          {moreActive && <span className="absolute inset-0 rounded-2xl bg-iris-soft" />}
          <FaEllipsisH className="relative text-lg" />
          <span className="relative">More</span>
        </button>
      </nav>

      {/* "More" sheet on phones */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              key="more-backdrop"
              className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              key="more-sheet"
              role="dialog"
              aria-label="More"
              className="card fixed inset-x-3 z-50 p-4 md:hidden"
              style={{ bottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              exit={{ y: "110%" }}
              transition={{ duration: 0.4, ease }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => info.offset.y > 80 && setMoreOpen(false)}
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="font-display text-xl">More</span>
                <button onClick={() => setMoreOpen(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-iris-soft">
                  <FaTimes />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SECONDARY.map((item) => {
                  const active = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex flex-col gap-3 rounded-2xl border p-4 transition ${active ? "border-iris/40 bg-iris-soft text-iris" : "border-line bg-surface/60 text-ink"}`}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-iris/20 to-blush/30 text-iris">
                        <item.Icon />
                      </span>
                      <span className="font-semibold">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-3 border-t border-line pt-3">
                <ThemeToggle label />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
