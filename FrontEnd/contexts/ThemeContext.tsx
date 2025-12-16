import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme, setColorScheme } = useNativewindColorScheme();
  
  // Initialize state from system settings or stored preference
  const [theme, setTheme] = useState<Theme>(colorScheme === 'dark' ? 'dark' : 'light');

  // Effect to load theme from storage and subscribe to system changes
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
        if (storedTheme) {
          setTheme(storedTheme);
          setColorScheme(storedTheme);
        } else {
          // If no stored theme, use system theme
          const systemTheme = Appearance.getColorScheme() || 'light';
          setTheme(systemTheme);
          setColorScheme(systemTheme);
        }
      } catch (e) {
        console.error("Failed to load theme from storage", e);
      }
    };

    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      // explicitly type storedTheme to avoid implicit any
      AsyncStorage.getItem(THEME_STORAGE_KEY).then((storedTheme: Theme | null) => {
        if (!storedTheme) {
          const systemTheme = (newColorScheme as Theme) || 'light';
          setTheme(systemTheme);
          setColorScheme(systemTheme);
        }
      });
    });

    return () => subscription.remove();
  }, [setColorScheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setColorScheme(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error("Failed to save theme to storage", e);
    }
  };

  const value = { theme, toggleTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};