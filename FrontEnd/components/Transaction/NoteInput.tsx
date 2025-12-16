import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useSettings } from '../../contexts/SettingsContext';

interface NoteInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const NoteInput: React.FC<NoteInputProps> = ({
  value,
  onChangeText
}) => {
  const { isDarkMode } = useSettings();

  return (
    <View className="mb-4">
      <Text className={`font-semibold mb-3 px-1 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Note (Optional)
      </Text>
      <View className={`border-2 rounded-2xl p-4 ${
        isDarkMode 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <TextInput
          className={`text-base min-h-[60px] ${
            isDarkMode ? 'text-gray-200' : 'text-gray-800'
          }`}
          value={value}
          onChangeText={onChangeText}
          placeholder="Add a note about this transaction..."
          placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
          multiline
          textAlignVertical="top"
        />
      </View>
    </View>
  );
};