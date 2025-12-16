import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

export const ThemeSelector = () => {
  const { theme, setTheme } = useSettings();

  const themes = [
    { id: 'light', name: 'Light', icon: 'sunny-outline' },
    { id: 'dark', name: 'Dark', icon: 'moon-outline' },
    { id: 'system', name: 'System', icon: 'settings-outline' },
  ] as const;

  return (
    <View className="mb-4">
      <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-3 px-1">
        Theme
      </Text>
      <View className="flex-row space-x-2">
        {themes.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setTheme(item.id)}
            className={`flex-1 px-4 py-3 rounded-xl items-center ${
              theme === item.id
                ? 'bg-violet-100 dark:bg-violet-900'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={theme === item.id ? '#8b5cf6' : '#6b7280'}
            />
            <Text className={`mt-1 font-medium ${
              theme === item.id
                ? 'text-violet-600 dark:text-violet-300'
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};