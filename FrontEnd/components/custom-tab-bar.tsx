import { View, Text, TouchableOpacity } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { TABS } from '../constants/app.constant';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { theme as themeConfig } from '../constants/theme';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const activeColor = themeConfig.colors.violetViolet100;
  const inactiveColor = theme === 'dark' ? themeConfig.colors.baseDarkDark25 : themeConfig.colors.baseLightLight20;

  return (
    <View className="mx-4 mb-4 mt-2 flex-row items-center justify-between rounded-xl px-2 py-2 shadow-lg bg-card">
      {TABS.map((tab, idx) => {
        const isFocused = state.index === idx;
        const Icon = tab.icon;
        const color = isFocused ? activeColor : inactiveColor;
        
        return (
          <TouchableOpacity key={tab.name} onPress={() => navigation.navigate(tab.name as never)} className="flex-1 items-center" activeOpacity={0.8}>
            <Icon size={28} color={color} />
            <Text style={{ color }} className={`mt-1.5 text-sm font-medium ${isFocused ? 'font-bold' : ''}`}>
              {t(tab.name)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}