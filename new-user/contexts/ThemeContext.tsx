import React, { createContext, useContext, useState, useEffect } from 'react';
import { LightTheme, DarkTheme, ThemeColors } from '../constants/theme';
import { DemoStorage } from '../services/DemoStorage';

type ThemeContextType = {
  theme: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: LightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const saved = await DemoStorage.getTheme();
    setIsDark(saved === 'dark');
  };

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await DemoStorage.setTheme(next ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: isDark ? DarkTheme : LightTheme,
        isDark,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
