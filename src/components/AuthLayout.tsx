import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { rise, stagger, ease } from "../lib/motion";
import Starfield from "./Starfield";

// One week of example mood colors, night to sunrise
const WEEK = ["bg-mood-1", "bg-mood-2", "bg-mood-3", "bg-mood-3", "bg-mood-4", "bg-mood-5", "bg-mood-4"];

// Two-column layout for the login and sign-up pages: a quiet brand panel on
// large screens and the form on the right.
export default function AuthLayout({ title, subtitle, children }: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="sky relative grid min-h-screen text-ink lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <Starfield count={40} />
      <aside className="relative m-4 hidden flex-col justify-between overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#140e33,#2a1d5e_65%,#4a3386)] p-12 text-[#ECE9F7] shadow-soft lg:flex">
        <Starfield className="absolute" count={45} seed={5} />
        <div className="pointer-events-none absolute -bottom-[26rem] left-1/2 h-[36rem] w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_0%,#fbeaff,#d9a8e8_12%,#9c7ae8_32%,#4a3386_60%)] opacity-90" />
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/pictures/logo.png" alt="" width={32} height={32} />
          <span className="font-display text-2xl">Hiraya</span>
        </Link>
        <div>
          {/* The week rises like a sunrise, one day at a time */}
          <div className="mb-8 flex h-12 items-end gap-2">
            {WEEK.map((tone, i) => (
              <motion.div
                key={i}
                className={`h-full flex-1 origin-bottom rounded-xl ${tone}`}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.09, duration: 0.6, ease }}
              />
            ))}
          </div>
          <motion.p
            className="max-w-sm font-display text-3xl leading-snug"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease }}
          >
            Some days are night, some are sunrise. Hiraya keeps them all.
          </motion.p>
        </div>
        <p className="text-sm text-[#A8A1C4]">hi·ra·ya: the fruit of one&apos;s hopes and dreams</p>
      </aside>

      <main className="relative flex items-center justify-center px-5 py-12 sm:px-8">
        <motion.div className="w-full max-w-md" variants={stagger(0.08)} initial="hidden" animate="show">
          <Link href="/" className="mb-10 flex items-center gap-2.5 lg:hidden">
            <Image src="/pictures/logo.png" alt="" width={28} height={28} />
            <span className="font-display text-xl">Hiraya</span>
          </Link>
          <motion.h1 variants={rise} className="font-display text-4xl">{title}</motion.h1>
          <motion.p variants={rise} className="mt-2 text-muted">{subtitle}</motion.p>
          <motion.div variants={rise} className="mt-8">{children}</motion.div>
        </motion.div>
      </main>
    </div>
  );
}
