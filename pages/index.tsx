import React, { useState } from 'react';
import Head from 'next/head';
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const palette = {
  nostalgia1: "#A09ABC",
  nostalgia2: "#B6A6CA",
  nostalgia3: "#D5CFE1",
  nostalgia4: "#E1D8E9",
  nostalgia5: "#D4BEBE",
  dark: "#6C63A6"
};

const slides = ["welcome", "about", "features", "auth"];

export default function Home() {
  const [current, setCurrent] = useState(0);

  const nextSlide = () => setCurrent((c) => Math.min(c + 1, slides.length - 1));
  const prevSlide = () => setCurrent((c) => Math.max(c - 1, 0));

  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      <Head>
        <title>Welcome | Muni</title>
        {/* Font link moved to _document.tsx */}
      </Head>
      {/* Animated Background */}
      <div
        className="fixed inset-0 -z-10 animate-gradient-bg"
        style={{
          background: `linear-gradient(120deg, ${palette.dark}, ${palette.nostalgia1}, ${palette.nostalgia2}, ${palette.nostalgia3}, ${palette.nostalgia4}, ${palette.nostalgia5})`,
          backgroundSize: "300% 300%"
        }}
      />
      {/* Animated Doodles & Graphics */}
      {/* Floating Notebook */}
      <motion.div
        className="absolute left-8 bottom-16 z-0"
        initial={{ y: 0, rotate: -8 }}
        animate={{ y: [0, -20, 0], rotate: [-8, 8, -8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="50" height="50" rx="8" fill="#B6A6CA" stroke="#A09ABC" strokeWidth="3"/>
          <rect x="18" y="18" width="34" height="34" rx="4" fill="#fff" stroke="#A09ABC" strokeWidth="2"/>
          <line x1="22" y1="26" x2="48" y2="26" stroke="#A09ABC" strokeWidth="2"/>
          <line x1="22" y1="34" x2="48" y2="34" stroke="#A09ABC" strokeWidth="2"/>
          <line x1="22" y1="42" x2="48" y2="42" stroke="#A09ABC" strokeWidth="2"/>
        </svg>
      </motion.div>
      {/* Animated Pen */}
      <motion.div
        className="absolute right-12 top-24 z-0"
        initial={{ y: 0, rotate: 0 }}
        animate={{ y: [0, 18, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="8" width="10" height="30" rx="4" fill="#A09ABC"/>
          <rect x="22" y="38" width="6" height="8" rx="2" fill="#D4BEBE"/>
          <rect x="22" y="4" width="6" height="8" rx="2" fill="#E1D8E9"/>
        </svg>
      </motion.div>
      {/* Twinkling Stars */}
      <motion.div
        className="absolute left-1/3 top-1/4 text-[#fff] text-2xl opacity-80 z-0"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >✦</motion.div>
      <motion.div
        className="absolute right-1/4 bottom-1/3 text-[#fff] text-xl opacity-60 z-0"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >✧</motion.div>
      <motion.div
        className="absolute left-1/4 bottom-1/4 text-[#fff] text-lg opacity-40 z-0"
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >✦</motion.div>
      <motion.div
        className="absolute left-1/2 top-1/6 text-[#fff] text-lg opacity-60 z-0"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >✦</motion.div>
      {/* Floating Cloud (extra) */}
      <motion.div
        className="absolute left-1/2 bottom-10 w-32 h-16 bg-white rounded-full opacity-30 z-0"
        initial={{ x: 0 }}
        animate={{ x: [0, 40, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Smiley Face */}
      <motion.div
        className="absolute right-1/3 top-1/2 z-0"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="#D5CFE1" stroke="#A09ABC" strokeWidth="2"/>
          <circle cx="17" cy="21" r="2" fill="#A09ABC"/>
          <circle cx="31" cy="21" r="2" fill="#A09ABC"/>
          <path d="M18 30c2 2 8 2 12 0" stroke="#A09ABC" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </motion.div>
      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          animation: gradientBG 16s ease-in-out infinite;
        }
      `}</style>
      <div className="relative min-h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {current === 0 && (
            <motion.section
              key="welcome"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="flex flex-col items-center justify-center min-h-screen w-full relative"
            >
              <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 0.6, x: 0 }} transition={{ duration: 1 }} className="absolute left-8 top-10 w-32 h-16 bg-white rounded-full opacity-60" />
              <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 0.4, x: 0 }} transition={{ duration: 1.2 }} className="absolute right-8 top-20 w-40 h-20 bg-white rounded-full opacity-40" />
              <motion.div
                className="z-10 p-10 bg-white/80 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col items-center"
                initial={{ opacity: 0, y: 40, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#A09ABC] mb-4 drop-shadow" style={{ fontFamily: 'DM Serif Display, serif' }}>
                  Welcome to Muni
                </h1>
                <p className="mb-8 text-lg text-[#A09ABC] text-center" style={{ fontFamily: 'DM Serif Display, serif' }}>
                  Click the button below to begin your journey
                </p>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={nextSlide}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-semibold text-xl shadow-lg hover:from-[#B6A6CA] hover:to-[#A09ABC] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#A09ABC]/30"
                >
                  Click Me
                </motion.button>
              </motion.div>
            </motion.section>
          )}
          {current === 1 && (
            <motion.section
              key="about"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="flex flex-col items-center justify-center min-h-screen w-full relative"
            >
              <motion.div
                className="z-10 p-10 bg-white/80 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col items-center max-w-2xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#A09ABC] mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>
                  About Muni
                </h2>
                <p className="mb-8 text-lg text-[#A09ABC] text-center" style={{ fontFamily: 'DM Serif Display, serif' }}>
                  Muni is your personal mindfulness companion. This journaling app helps you reflect, grow, and stay in tune with your emotions. You can write daily entries, tag how you feel, and look back on your past reflections in a calm and clutter-free space. Whether you&#39;re having a great day or facing challenges, Muni gives you a safe and private place to understand your thoughts and build emotional strength. It&#39;s simple, serene, and designed to support your journey every step of the way.
                </p>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={nextSlide}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-semibold text-xl shadow-lg hover:from-[#B6A6CA] hover:to-[#A09ABC] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#A09ABC]/30"
                >
                  Proceed
                </motion.button>
              </motion.div>
            </motion.section>
          )}
          {current === 2 && (
            <motion.section
              key="features"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="flex flex-col items-center justify-center min-h-screen w-full relative"
            >
              <motion.div
                className="z-10 p-10 bg-white/80 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col items-center max-w-2xl"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#A09ABC] mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>
                  Features
                </h2>
                <FeatureToggle nextSlide={nextSlide} prevSlide={prevSlide} />
              </motion.div>
            </motion.section>
          )}
          {current === 3 && (
            <motion.section
              key="auth"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="flex flex-col items-center justify-center min-h-screen w-full relative"
            >
              <motion.div
                className="z-10 p-10 bg-white/80 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col items-center"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#A09ABC] mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>
                  Get Started
                </h2>
                  <div className="flex gap-6 mt-4">
                    <Link href="/auth/signup" passHref legacyBehavior>
                      <a className="px-8 py-3 rounded-full bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-bold text-lg shadow hover:from-[#B6A6CA] hover:to-[#A09ABC] transition-all duration-300">Sign Up</a>
                    </Link>
                    <Link href="/auth/login" passHref legacyBehavior>
                      <a className="px-8 py-3 rounded-full bg-white/80 text-[#A09ABC] font-bold text-lg shadow border border-[#A09ABC] hover:bg-[#E1D8E9] transition-all duration-300">Log In</a>
                    </Link>
                  </div>
                </motion.div>
                {current > 0 && (
                  <button onClick={prevSlide} className="absolute left-4 top-4 text-[#A09ABC] underline">Back</button>
                )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Add this above your Home component or in the same file:

function FeatureToggle({ nextSlide, prevSlide }: { nextSlide: () => void; prevSlide: () => void }) {
  const [show, setShow] = useState(false);
  if (!show) {
    return (
      <div className="flex flex-col items-center gap-6 w-full">
        <button
          onClick={() => setShow(true)}
          className="px-10 py-4 rounded-full bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-semibold text-xl shadow-lg hover:from-[#B6A6CA] hover:to-[#A09ABC] transition-all duration-300"
          style={{ minWidth: 180 }}
        >
          Show Features
        </button>
        <div className="flex gap-6 mt-2">
          <button
            onClick={nextSlide}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-semibold text-xl shadow-lg hover:from-[#B6A6CA] hover:to-[#A09ABC] transition-all duration-300"
            style={{ minWidth: 180 }}
          >
            Skip
          </button>
          <button
            onClick={prevSlide}
            className="px-10 py-4 rounded-full bg-white/80 text-[#A09ABC] font-semibold text-xl shadow border border-[#A09ABC] hover:bg-[#E1D8E9] transition-all duration-300"
            style={{ minWidth: 180 }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex flex-col items-center mb-4">
        <span className="text-4xl mb-2">🌟</span>
        <p className="text-[#A09ABC] text-lg text-center font-serif italic mb-2">
          Explore what makes Muni magical!
        </p>
      </div>
      <ul className="text-[#6C63A6] text-lg mt-2 space-y-3 text-left list-none w-full max-w-xl mx-auto">
        <li>📝 <b>Easy Journaling:</b> Create, edit, and delete daily journal entries with ease</li>
        <li>😊 <b>Mood Tagging:</b> Tag each day and entry with an emoji mood</li>
        <li>📅 <b>Calendar View:</b> Interactive calendar for mood and entry history tracking</li>
        <li>🌗 <b>Minimalist UI:</b> Light and dark mode options for every mood</li>
        <li>✅ <b>Task Board:</b> Drag-and-drop to-do, in progress and done columns</li>
        <li>📊 <b>Mood Analytics:</b> Visualize your emotional patterns over time</li>
        <li>🌍 <b>Public Journaling:</b> Share select entries with the world to inspire and connect</li>
        <li>🔒 <b>Private Thoughts:</b> Keep entries just for you—safe, secure, and personal</li>
      </ul>
      <button
        onClick={nextSlide}
        className="mt-8 px-10 py-4 rounded-full bg-gradient-to-r from-[#A09ABC] to-[#B6A6CA] text-white font-semibold text-xl shadow-lg hover:from-[#B6A6CA] hover:to-[#A09ABC] transition-all duration-300"
        style={{ minWidth: 180 }}
      >
        Proceed
      </button>
    </div>
  );
}