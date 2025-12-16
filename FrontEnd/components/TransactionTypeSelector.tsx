import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';

type TransactionType = 'Expense' | 'Income';

interface Props {
  transactionType: TransactionType;
  onTypeChange: (type: TransactionType) => void;
}

const transactionTypes: TransactionType[] = ['Expense', 'Income'];

export const TransactionTypeSelector: React.FC<Props> = ({ transactionType, onTypeChange }) => {
  const { isDarkMode } = useSettings();
  
  return (
    <View className={`flex-row ${isDarkMode ? 'bg-black/30' : 'bg-white/20'} rounded-full p-1 mx-4 my-4`}>
      {transactionTypes.map((type) => (
        <TouchableOpacity
          key={type}
          onPress={() => onTypeChange(type)}
          className={`flex-1 rounded-full py-3 px-3 items-center justify-center ${
            transactionType === type 
              ? (isDarkMode ? 'bg-gray-800 shadow' : 'bg-white shadow')
              : ''
          }`}
        >
          <Text
            className={`font-bold text-base ${
              transactionType === type 
                ? (isDarkMode ? 'text-white' : 'text-gray-800')
                : 'text-white'
            }`}
          >
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};