import { useSettings } from '../contexts/SettingsContext';
import { lightTheme, darkTheme } from '../constants/themes';
import { Theme } from '../types/theme';

export function useThemeColors(): Theme['colors'] {
  const { isDarkMode } = useSettings();
  return isDarkMode ? darkTheme.colors : lightTheme.colors;
}