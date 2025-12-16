import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Currency = {
  code: string;
  symbol: string;
  name: string;
};

type Theme = 'light' | 'dark' | 'auto';

interface SettingsContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  availableCurrencies: Currency[];
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const defaultCurrency: Currency = {
  code: 'VND',
  symbol: '₫',
  name: 'Vietnamese Dong'
};

export const availableCurrencies: Currency[] = [
  defaultCurrency,
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar'
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro'
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound'
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen'
  }
];

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [theme, setTheme] = useState<Theme>('light');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem('currency');
        const savedTheme = await AsyncStorage.getItem('theme');

        if (savedCurrency) {
          setCurrency(JSON.parse(savedCurrency));
        }
        if (savedTheme) {
          const themeValue = JSON.parse(savedTheme) as Theme;
          setTheme(themeValue);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('currency', JSON.stringify(currency));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };

    saveSettings();
  }, [currency]);

  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem('theme', JSON.stringify(theme));
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    };

    saveTheme();
  }, [theme]);

  // Update isDarkMode based on theme
  useEffect(() => {
    if (theme === 'dark') {
      setIsDarkMode(true);
    } else if (theme === 'light') {
      setIsDarkMode(false);
    } else {
      // Auto mode - you can implement system theme detection here
      setIsDarkMode(false); // Default to light for now
    }
  }, [theme]);

  const value = {
    currency,
    setCurrency,
    availableCurrencies,
    theme,
    setTheme,
    isDarkMode
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};