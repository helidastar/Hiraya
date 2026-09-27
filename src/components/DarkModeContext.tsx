import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface DarkModeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // The script in _document has already picked the theme; match it
      setDarkMode(document.documentElement.classList.contains('dark'));
      setReady(true);
    }
  }, []);

  useEffect(() => {
    // Wait until the saved theme has been read, or the first render would undo it
    if (ready) {
      localStorage.setItem('darkMode', String(darkMode));
      const html = document.documentElement;
      if (darkMode) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }, [darkMode, ready]);

  return (
    <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}; 