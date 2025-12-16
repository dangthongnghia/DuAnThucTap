import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  hasEndDate: boolean;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onHasEndDateChange: (hasEndDate: boolean) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  hasEndDate,
  onStartDateChange,
  onEndDateChange,
  onHasEndDateChange
}) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  return (
    <>
      {/* Start Date */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</Text>
        <TouchableOpacity
          onPress={() => setShowStartDatePicker(true)}
          className="bg-white border border-gray-300 rounded-xl px-4 py-3 flex-row items-center justify-between"
        >
          <Text className="text-base text-gray-900">
            {startDate.toLocaleDateString('vi-VN')}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event: any, selectedDate?: Date | undefined) => {
              setShowStartDatePicker(false);
              if (selectedDate) onStartDateChange(selectedDate);
            }}
          />
        )}
      </View>

      {/* End Date Toggle */}
      <View className="mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-gray-700">Có ngày kết thúc</Text>
          <Switch
            value={hasEndDate}
            onValueChange={onHasEndDateChange}
            trackColor={{ false: '#d1d5db', true: '#7f3dff' }}
            thumbColor={hasEndDate ? '#ffffff' : '#f3f4f6'}
          />
        </View>
        {hasEndDate && (
          <TouchableOpacity
            onPress={() => setShowEndDatePicker(true)}
            className="bg-white border border-gray-300 rounded-xl px-4 py-3 flex-row items-center justify-between"
          >
            <Text className="text-base text-gray-900">
              {endDate.toLocaleDateString('vi-VN')}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            minimumDate={startDate}
            onChange={(event: any, selectedDate?: Date | undefined) => {
              setShowEndDatePicker(false);
              if (selectedDate) onEndDateChange(selectedDate);
            }}
          />
        )}
      </View>
    </>
  );
};