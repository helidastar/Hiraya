import Head from "next/head";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Starfield, { Sparkle } from "./Starfield";
import { rise, stagger } from "../lib/motion";

// Layout for every signed-in page: the starry sky, the navigation, a page
// header and the content.
// Children that are motion elements with `variants={rise}` arrive in order
// after the header.
export default function PageShell({ title, eyebrow, actions, loading, width = "max-w-6xl", children }: {
  title: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
  width?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Head>
        <title>{`${title} | Hiraya`}</title>
      </Head>
      <div className="sky relative min-h-screen text-ink">
        <Starfield count={50} />
        <Sidebar />
        <main className="app-main relative">
          {loading ? (
            <Loader />
          ) : (
            <motion.div className={`mx-auto ${width}`} variants={stagger(0.08)} initial="hidden" animate="show">
              <PageHeader title={title} eyebrow={eyebrow} actions={actions} />
              {children}
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}

// The title block at the top of each page: a glass pill, the title with a
// twinkling sparkle, and any buttons on the right
export function PageHeader({ title, eyebrow, actions }: { title: ReactNode; eyebrow?: ReactNode; actions?: ReactNode }) {
  return (
    <motion.header variants={rise} className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-4">
            <p className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted shadow-soft">
              <Sparkle size={11} className="text-iris" />
              {eyebrow}
            </p>
          </div>
        )}
        <h1 className="relative inline-block pr-6 font-display text-4xl leading-tight sm:text-5xl">
          {title}
          <Sparkle size={16} className="star absolute right-0 top-1 text-blush" />
        </h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </motion.header>
  );
}

export function Loader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.span
            key={n}
            className={`h-2.5 w-2.5 rounded-full bg-mood-${n}`}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: n * 0.1, ease: "easeInOut" }}
          />
        ))}
      </div>
    </div>
  );
}
