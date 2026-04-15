import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const THEME_KEY = '@musicapp_theme';

export const DARK = {
  bg: '#170f23',
  bg2: '#1e1232',
  bg3: '#0d0820',
  card: '#ffffff08',
  cardBold: '#ffffff15',
  text: '#ffffff',
  textSec: '#aaaaaa',
  textMuted: '#666666',
  accent: '#c665e8',
  border: '#ffffff15',
  gradientBg: ['#170f23', '#1e1232', '#170f23'],
};

export const LIGHT = {
  bg: '#f0ecf7',
  bg2: '#e8e0f5',
  bg3: '#ddd5f0',
  card: '#ffffff',
  cardBold: '#00000015',
  text: '#1a0a2e',
  textSec: '#5a4a6a',
  textMuted: '#9a8aaa',
  accent: '#c665e8',
  border: '#00000015',
  gradientBg: ['#f0ecf7', '#e8e0f5', '#f0ecf7'],
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val !== null) setIsDark(val === 'dark');
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  };

  const theme = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
