import '../styles/globals.css';
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { createContext } from "react";
import { DarkModeProvider } from "../components/DarkModeContext";

export const TransitionContext = createContext<{ showContent: boolean }>({ showContent: true });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [showContent, setShowContent] = useState(true);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      setShowOverlay(true);
      setShowContent(false);
    };
    const handleComplete = () => {
      setTimeout(() => {
        setShowOverlay(false);
        setTimeout(() => setShowContent(true), 350);
      }, 400);
    };
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
      <Toaster position="top-right" reverseOrder={false} />
      {/* Global transition overlay */}
      <div
        className={`fixed inset-0 z-[100] pointer-events-none transition-opacity duration-500 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: "linear-gradient(120deg, #A09ABC, #B6A6CA, #E1D8E9, #D4BEBE)", backgroundSize: "200% 200%" }}
      />
      <Component {...pageProps} />
    </TransitionContext.Provider>
    </DarkModeProvider>
  );
}

