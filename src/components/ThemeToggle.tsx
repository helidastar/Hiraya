import { AnimatePresence, motion } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";
import { useDarkMode } from "./DarkModeContext";
import { ease } from "../lib/motion";

// Round button that switches between the light (dusk) and dark (night) themes.
// With `label`, it becomes a full-width row for menus.
export default function ThemeToggle({ label = false, className = "" }: { label?: boolean; className?: string }) {
  const { darkMode, setDarkMode } = useDarkMode();
  const icon = (
    <span className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={darkMode ? "moon" : "sun"}
          initial={{ y: 14, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.35, ease }}
          className="absolute"
        >
          {darkMode ? <FaMoon /> : <FaSun />}
        </motion.span>
      </AnimatePresence>
    </span>
  );

  if (label) {
    return (
      <button
        type="button"
        onClick={() => setDarkMode(!darkMode)}
        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium text-muted transition hover:bg-iris-soft/70 hover:text-ink ${className}`}
      >
        <span className="text-iris">{icon}</span>
        <span className="flex-1 text-left">{darkMode ? "Night mode" : "Day mode"}</span>
        <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition ${darkMode ? "bg-iris" : "bg-line"}`}>
          <motion.span layout transition={{ duration: 0.3, ease }} className={`h-5 w-5 rounded-full bg-white shadow ${darkMode ? "ml-auto" : ""}`} />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setDarkMode(!darkMode)}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      className={`glass flex h-10 w-10 items-center justify-center rounded-full text-iris shadow-soft transition hover:scale-105 ${className}`}
    >
      {icon}
    </button>
  );
}
