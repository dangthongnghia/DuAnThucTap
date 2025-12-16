import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onCalculatorPress: () => void;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChangeText,
  onCalculatorPress
}) => {
  const { isDarkMode } = useSettings();

  return (
    <View className="mb-4">
      <Text className={`font-semibold mb-3 px-1 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Amount
      </Text>
      <View className={`flex-row items-center border-2 rounded-2xl p-4 ${
        isDarkMode 
          ? 'border-gray-700 bg-gray-800' 
          : 'border-gray-200 bg-gray-50'
      }`}>
        <Text className={`text-lg font-medium mr-2 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          $
        </Text>
        <TextInput
          className={`flex-1 text-2xl font-bold ${
            isDarkMode ? 'text-gray-100' : 'text-gray-900'
          }`}
          value={value}
          onChangeText={onChangeText}
          placeholder="0.00"
          placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
          keyboardType="numeric"
        />
        <TouchableOpacity onPress={onCalculatorPress} className="ml-2 p-2">
          <Ionicons 
            name="calculator-outline" 
            size={24} 
            color={isDarkMode ? '#9ca3af' : '#6b7280'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};