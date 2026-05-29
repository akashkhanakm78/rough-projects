import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

export const Theme = {
  dark: {
    background: '#08090D',
    surface: '#12131C',
    surfaceSecondary: '#1B1D2B',
    primary: '#8B5CF6', // Electric Violet
    primaryMuted: 'rgba(139, 92, 246, 0.15)',
    secondary: '#06B6D4', // Cyan Accent
    accent: '#EF4444', // Red (Backspace/Clear)
    equalBtn: '#10B981', // Emerald Equal Button
    text: '#F9FAFB',
    textMuted: '#9CA3AF',
    border: '#272A3D',
    shadowColor: '#000000',
  },
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceSecondary: '#E2E8F0',
    primary: '#6366F1', // Indigo
    primaryMuted: 'rgba(99, 102, 241, 0.12)',
    secondary: '#0EA5E9', // Sky Blue Accent
    accent: '#EF4444', // Red
    equalBtn: '#10B981', // Emerald Equal Button
    text: '#0F172A',
    textMuted: '#64748B',
    border: '#E2E8F0',
    shadowColor: 'rgba(99, 102, 241, 0.1)',
  }
};

export type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  themeName: ThemeType;
  colors: typeof Theme.dark;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeName, setThemeName] = useState<ThemeType>(systemScheme === 'dark' ? 'dark' : 'light');

  const colors = Theme[themeName];
  const isDark = themeName === 'dark';

  const toggleTheme = () => {
    setThemeName(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    // Apply styling to systemic UI components if on native devices
    const applySystemTheme = async () => {
      try {
        if (Platform.OS === 'android') {
          await SystemUI.setBackgroundColorAsync(colors.background);
          NavigationBar.setStyle(isDark ? 'light' : 'dark');
        } else if (Platform.OS === 'ios') {
          await SystemUI.setBackgroundColorAsync(colors.background);
        }
      } catch (err) {
        console.warn('SystemUI customization is not supported on this platform/environment', err);
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
