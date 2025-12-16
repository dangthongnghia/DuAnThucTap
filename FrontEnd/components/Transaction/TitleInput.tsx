import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';

interface TitleInputProps {
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
}

export const TitleInput: React.FC<TitleInputProps> = ({
  value,
  onChangeText,
  autoFocus = false
}) => {
  const { isDarkMode } = useSettings();

  return (
    <View className="mb-4">
      <Text className={`font-semibold mb-3 px-1 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Transaction Title
      </Text>
      <View className={`border-2 rounded-2xl p-4 ${
        isDarkMode 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <TextInput
          className={`font-semibold text-lg ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}
          value={value}
          onChangeText={onChangeText}
          placeholder="e.g., Lunch at restaurant"
          placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
          autoFocus={autoFocus}
        />
      </View>
    </View>
  );
};