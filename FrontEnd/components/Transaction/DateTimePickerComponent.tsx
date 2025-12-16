import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DateTimePickerComponentProps {
  date: Date;
  onPress: () => void;
}

export const DateTimePickerComponent: React.FC<DateTimePickerComponentProps> = ({
  date,
  onPress
}) => {
  const formatDateTime = (dateObj: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return dateObj.toLocaleDateString('en-US', options);
  };

  return (
    <View className="mb-4">
      <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-3 px-1">
        Date & Time
      </Text>
      <TouchableOpacity
        onPress={onPress}
        className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex-row justify-between items-center bg-gray-50 dark:bg-gray-800">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={24} color="#8b5cf6" />
          <Text className="text-gray-800 dark:text-gray-200 font-semibold ml-3">
            {formatDateTime(date)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );
};