import '../styles/globals.css';
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { createContext } from "react";
import { MotionConfig, motion } from "framer-motion";
import { DarkModeProvider } from "../components/DarkModeContext";
import { Onest, Young_Serif } from "next/font/google";
import { ease } from "../lib/motion";

const body = Onest({ subsets: ["latin"], variable: "--font-body" });
const display = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-display" });

export const TransitionContext = createContext<{ showContent: boolean }>({ showContent: true });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    const handleStart = () => setShowContent(false);
    const handleComplete = () => setShowContent(true);
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <DarkModeProvider>
    <TransitionContext.Provider value={{ showContent }}>
    {/* reducedMotion="user" turns off movement for people who ask their OS for less motion */}
    <MotionConfig reducedMotion="user">
    <div className={`${body.variable} ${display.variable} font-sans`}>
      {/* Above pop-ups (z-[10000]) so save messages are never hidden behind them */}
      <Toaster position="top-right" reverseOrder={false} containerStyle={{ zIndex: 10001 }} />
      {/* Each page fades in when you navigate to it. Opacity only: a transform
          here would shift the fixed sidebar and pop-ups while it runs. */}
      <motion.div
        key={router.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease }}
      >
        <Component {...pageProps} />
      </motion.div>
    </div>
    </MotionConfig>
    </TransitionContext.Provider>
    </DarkModeProvider>
  );
}
