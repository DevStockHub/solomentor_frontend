import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'system' | 'dark' | 'light';

export interface ThemeColors {
  bg: string;
  bgSecondary: string;
  surface: string;
  surfaceElevated: string;
  surfaceGlass: string;
  border: string;
  borderGlow: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryFg: string;
  primaryGlow: string;
  accent: string;
  success: string;
  successBg: string;
  successGlow: string;
  warning: string;
  warningBg: string;
  warningGlow: string;
  danger: string;
  dangerBg: string;
  dangerGlow: string;
  navBg: string;
  navBorder: string;
}

const darkColors: ThemeColors = {
  bg: '#070B14',
  bgSecondary: '#0B0F19',
  surface: '#0F172A',
  surfaceElevated: '#1E293B',
  surfaceGlass: 'rgba(15, 23, 42, 0.85)',
  border: '#1E293B',
  borderGlow: 'rgba(56, 189, 248, 0.3)',
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  primary: '#38BDF8',
  primaryFg: '#070B14',
  primaryGlow: 'rgba(56, 189, 248, 0.25)',
  accent: '#A855F7',
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.15)',
  successGlow: 'rgba(16, 185, 129, 0.25)',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  warningGlow: 'rgba(245, 158, 11, 0.25)',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.15)',
  dangerGlow: 'rgba(239, 68, 68, 0.25)',
  navBg: 'rgba(15, 23, 42, 0.94)',
  navBorder: '#334155',
};

const lightColors: ThemeColors = {
  bg: '#F8FAFC',
  bgSecondary: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#F8FAFC',
  surfaceGlass: 'rgba(255, 255, 255, 0.92)',
  border: '#E2E8F0',
  borderGlow: 'rgba(2, 132, 199, 0.25)',
  text: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  primary: '#0284C7',
  primaryFg: '#FFFFFF',
  primaryGlow: 'rgba(2, 132, 199, 0.15)',
  accent: '#7E22CE',
  success: '#059669',
  successBg: '#ECFDF5',
  successGlow: 'rgba(5, 150, 105, 0.2)',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  warningGlow: 'rgba(217, 119, 6, 0.2)',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  dangerGlow: 'rgba(220, 38, 38, 0.2)',
  navBg: 'rgba(255, 255, 255, 0.95)',
  navBorder: '#E2E8F0',
};

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: darkColors,
  isDark: true,
  themeMode: 'system',
  setThemeMode: () => {},
  toggleTheme: () => {},
});

const THEME_STORAGE_KEY = 'solomentor_theme_mode';

async function safeGetItem(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function safeSetItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Graceful fallback
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    safeGetItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        setThemeModeState(saved as ThemeMode);
      }
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    safeSetItem(THEME_STORAGE_KEY, mode);
  };

  const isDark =
    themeMode === 'system' ? systemScheme !== 'light' : themeMode === 'dark';

  const toggleTheme = () => {
    if (isDark) {
      setThemeMode('light');
    } else {
      setThemeMode('dark');
    }
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        colors,
        isDark,
        themeMode,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
