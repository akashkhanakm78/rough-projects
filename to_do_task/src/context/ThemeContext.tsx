import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';

export const ThemeColors = {
  dark: {
    background: '#0B0D13',
    surface: '#151821',
    surfaceSecondary: '#1F2432',
    border: '#2E354A',
    text: '#F3F4F6',
    textMuted: '#9CA3AF',
    primary: '#6366F1', // Indigo
    primaryMuted: 'rgba(99, 102, 241, 0.15)',
    secondary: '#10B981', // Emerald Green (Completion)
    secondaryMuted: 'rgba(16, 185, 129, 0.15)',
    accent: '#EF4444', // Red/Coral (Deletion / High priority)
    accentMuted: 'rgba(239, 68, 68, 0.15)',
    warning: '#F59E0B', // Amber (Medium priority)
    warningMuted: 'rgba(245, 158, 11, 0.15)',
    shadow: '#000000',
  },
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9',
    border: '#E2E8F0',
    text: '#0F172A',
    textMuted: '#64748B',
    primary: '#4F46E5', // Indigo-600
    primaryMuted: 'rgba(79, 70, 229, 0.08)',
    secondary: '#059669', // Emerald-600
    secondaryMuted: 'rgba(5, 150, 105, 0.08)',
    accent: '#DC2626', // Red-600
    accentMuted: 'rgba(220, 38, 38, 0.08)',
    warning: '#D97706', // Amber-600
    warningMuted: 'rgba(217, 119, 6, 0.08)',
    shadow: 'rgba(79, 70, 229, 0.08)',
  }
};

export type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  themeName: ThemeType;
  colors: typeof ThemeColors.dark;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeName, setThemeName] = useState<ThemeType>(systemScheme === 'dark' ? 'dark' : 'light');

  const colors = ThemeColors[themeName];
  const isDark = themeName === 'dark';

  const toggleTheme = () => {
    setThemeName(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const applySystemTheme = async () => {
      try {
        if (Platform.OS === 'android') {
          await SystemUI.setBackgroundColorAsync(colors.background);
          NavigationBar.setStyle(isDark ? 'light' : 'dark');
        } else if (Platform.OS === 'ios') {
          await SystemUI.setBackgroundColorAsync(colors.background);
        }
      } catch (err) {
        console.warn('SystemUI customization not supported in this environment', err);
      }
    };
    applySystemTheme();
  }, [themeName, colors]);

  return (
    <ThemeContext.Provider value={{ themeName, colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
