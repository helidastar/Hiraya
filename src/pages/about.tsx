import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import Starfield, { Sparkle } from "../components/Starfield";
import ThemeToggle from "../components/ThemeToggle";
import { rise, stagger, ease } from "../lib/motion";

export default function About() {
  return (
    <div className="sky relative flex min-h-screen items-center overflow-hidden px-5 py-24 text-ink">
      <Head>
        <title>About | Hiraya</title>
      </Head>
      <Starfield count={60} seed={4} />

      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/pictures/logo.png" alt="" width={30} height={30} className="drop-shadow-[0_0_10px_rgb(var(--iris)/0.6)]" />
          <span className="font-display text-2xl">Hiraya</span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-12 md:grid-cols-2">
        <motion.div
          className="mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: [0, -12, 0] }}
          transition={{ opacity: { duration: 0.8, ease }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
        >
          <Image src="/journaling.svg" alt="" width={340} height={340} className="h-[240px] w-[240px] object-contain drop-shadow-[0_20px_40px_rgb(var(--iris)/0.35)] md:h-[340px] md:w-[340px]" priority />
        </motion.div>

        <motion.div variants={stagger(0.1, 0.2)} initial="hidden" animate="show" className="text-center md:text-left">
          <motion.p variants={rise} className="glass mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-muted shadow-soft">
            <Sparkle size={12} className="text-iris" />
            <span className="font-display text-ink">hi·ra·ya</span> the fruit of one&apos;s hopes and dreams
          </motion.p>
          <motion.h1 variants={rise} className="font-display text-4xl leading-tight sm:text-5xl">
            About <span className="text-aurora italic">Hiraya</span>
          </motion.h1>
          <motion.p variants={rise} className="mt-5 text-lg leading-relaxed text-muted">
            Hiraya is your personal mindfulness companion. Write daily entries, tag how you feel, and look back on
            your past reflections in a calm, clutter-free space. Whether you&apos;re having a great day or facing
            challenges, Hiraya gives you a safe and private place to understand your thoughts and build emotional
            strength, one step at a time.
          </motion.p>
          <motion.div variants={rise} className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link href="/auth/signup" className="btn-primary px-7 py-3">Start your journal</Link>
            <Link href="/auth/login" className="btn-ghost px-7 py-3">Log in</Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
