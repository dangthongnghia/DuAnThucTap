import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export const paymentMethods: PaymentMethod[] = [
  { id: '1', name: 'Cash', icon: 'cash-outline', color: '#10b981' },
  { id: '2', name: 'Credit Card', icon: 'card-outline', color: '#3b82f6' },
  { id: '3', name: 'Debit Card', icon: 'card-outline', color: '#8b5cf6' },
  { id: '4', name: 'Bank Transfer', icon: 'swap-horizontal-outline', color: '#f59e0b' },
  { id: '5', name: 'E-Wallet', icon: 'wallet-outline', color: '#ec4899' },
  { id: '6', name: 'Check', icon: 'document-text-outline', color: '#6366f1' },
  { id: '7', name: 'Other', icon: 'ellipsis-horizontal-outline', color: '#6b7280' },
];

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
}) => {
  const { isDarkMode } = useSettings();

  return (
    <View className="mb-4">
      <Text className={`font-semibold mb-3 px-1 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Payment Method
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
        <View className="flex-row gap-3">
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod.id === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                onPress={() => onSelect(method)}
                className={`items-center justify-center p-4 rounded-2xl border-2 min-w-[100px] ${
                  isSelected
                    ? isDarkMode 
                      ? 'bg-violet-900/30 border-violet-500' 
                      : 'bg-violet-50 border-violet-500'
                    : isDarkMode 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-gray-50 border-gray-200'
                }`}>
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ 
                    backgroundColor: isSelected 
                      ? method.color 
                      : isDarkMode ? '#4b5563' : '#e5e7eb' 
                  }}>
                  <Ionicons
                    name={method.icon}
                    size={24}
                    color={isSelected ? '#ffffff' : isDarkMode ? '#9ca3af' : '#6b7280'}
                  />
                </View>
                <Text
                  className={`text-sm font-semibold text-center ${
                    isSelected
                      ? isDarkMode 
                        ? 'text-violet-300' 
                        : 'text-violet-700'
                      : isDarkMode 
                        ? 'text-gray-400' 
                        : 'text-gray-600'
                  }`}>
                  {method.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};