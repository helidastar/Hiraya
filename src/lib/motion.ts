import type { Transition, Variants } from "framer-motion";

// Shared motion settings so every page moves the same way.
// A soft ease-out: quick to start, slow to settle.
export const ease = [0.22, 1, 0.36, 1] as const;

// Parent that reveals its children one after another
export const stagger = (step = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

// Child that rises into place
export const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

// Pop-up panels: backdrop fades, panel scales up from slightly smaller
export const backdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const panel = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 6 },
  transition: { duration: 0.25, ease } as Transition,
};
