import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

export const CurrencySelector = () => {
  const { currency, setCurrency, availableCurrencies } = useSettings();

  return (
    <View className="mb-4">
      <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-3 px-1">
        Currency
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="flex-row space-x-2"
      >
        {availableCurrencies.map((curr) => (
          <TouchableOpacity
            key={curr.code}
            onPress={() => setCurrency(curr)}
            className={`px-4 py-3 rounded-xl flex-row items-center space-x-2 ${
              currency.code === curr.code
                ? 'bg-violet-100 dark:bg-violet-900'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}
          >
            <Text className={`text-lg ${
              currency.code === curr.code
                ? 'text-violet-600 dark:text-violet-300'
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              {curr.symbol}
            </Text>
            <Text className={`font-medium ${
              currency.code === curr.code
                ? 'text-violet-600 dark:text-violet-300'
                : 'text-gray-600 dark:text-gray-300'
            }`}>
              {curr.code}
            </Text>
            {currency.code === curr.code && (
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color="#8b5cf6"
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};