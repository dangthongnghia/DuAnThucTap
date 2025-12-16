import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface BasicInfoSectionProps {
  name: string;
  amount: string;
  type: 'income' | 'expense';
  onNameChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onTypeChange: (type: 'income' | 'expense') => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  name,
  amount,
  type,
  onNameChange,
  onAmountChange,
  onTypeChange
}) => {
  return (
    <>
      {/* Name Input */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Tên giao dịch *</Text>
        <TextInput
          value={name}
          onChangeText={onNameChange}
          placeholder="VD: Tiền nhà, Lương tháng..."
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
        />
      </View>

      {/* Type Selection */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Loại giao dịch</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => onTypeChange('expense')}
            className={`flex-1 py-3 rounded-xl border-2 ${
              type === 'expense' ? 'bg-red-50 border-red-500' : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                type === 'expense' ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              Chi tiêu
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => onTypeChange('income')}
            className={`flex-1 py-3 rounded-xl border-2 ${
              type === 'income' ? 'bg-green-50 border-green-500' : 'bg-white border-gray-300'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                type === 'income' ? 'text-green-600' : 'text-gray-600'
              }`}
            >
              Thu nhập
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Input */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Số tiền *</Text>
        <TextInput
          value={amount}
          onChangeText={onAmountChange}
          placeholder="0"
          keyboardType="numeric"
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
        />
      </View>
    </>
  );
};