import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface FrequencySelectorProps {
  frequency: FrequencyType;
  interval: string;
  onFrequencyChange: (frequency: FrequencyType) => void;
  onIntervalChange: (interval: string) => void;
}

export const FrequencySelector: React.FC<FrequencySelectorProps> = ({
  frequency,
  interval,
  onFrequencyChange,
  onIntervalChange
}) => {
  const frequencyOptions = [
    { value: 'daily' as FrequencyType, label: 'Hàng ngày' },
    { value: 'weekly' as FrequencyType, label: 'Hàng tuần' },
    { value: 'monthly' as FrequencyType, label: 'Hàng tháng' },
    { value: 'yearly' as FrequencyType, label: 'Hàng năm' },
  ];

  const getFrequencyLabel = (freq: FrequencyType) => {
    switch (freq) {
      case 'daily': return 'ngày';
      case 'weekly': return 'tuần';
      case 'monthly': return 'tháng';
      case 'yearly': return 'năm';
      default: return 'ngày';
    }
  };

  return (
    <>
      {/* Frequency Selection */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Tần suất</Text>
        <View className="flex-row flex-wrap gap-2">
          {frequencyOptions.map((freq) => (
            <TouchableOpacity
              key={freq.value}
              onPress={() => onFrequencyChange(freq.value)}
              className={`px-4 py-2 rounded-full ${
                frequency === freq.value ? 'bg-violet-500' : 'bg-gray-200'
              }`}
            >
              <Text
                className={`font-medium ${
                  frequency === freq.value ? 'text-white' : 'text-gray-700'
                }`}
              >
                {freq.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Interval */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          Khoảng thời gian (mỗi {interval} {getFrequencyLabel(frequency)})
        </Text>
        <TextInput
          value={interval}
          onChangeText={onIntervalChange}
          placeholder="1"
          keyboardType="numeric"
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-base"
        />
      </View>
    </>
  );
};