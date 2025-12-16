import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../contexts/SettingsContext';

type Frequency = 'Yearly' | 'Monthly' | 'Weekly' | 'Daily';
type EndType = 'Date' | 'Indefinitely';

interface RecurringFormProps {
  onSubmit?: (data: RecurringData) => void;
  showEndAfter?: boolean;
}

interface RecurringData {
  frequency: Frequency;
  month?: string;
  day?: number;
  date?: string;
  endType?: EndType;
  endDate?: string;
}

export default function RecurringForm({ onSubmit, showEndAfter = false }: RecurringFormProps) {
  const { isDarkMode } = useSettings();
  const [frequency, setFrequency] = useState<Frequency>('Yearly');
  const [month, setMonth] = useState('April');
  const [day, setDay] = useState(29);
  const [date, setDate] = useState('27 Aug 2021');
  const [endType, setEndType] = useState<EndType>('Indefinitely');
  const [endDate, setEndDate] = useState('27 Aug 2021');

  const handleSubmit = () => {
    onSubmit?.({
      frequency,
      month: frequency === 'Yearly' ? month : undefined,
      day: frequency === 'Monthly' || frequency === 'Yearly' ? day : undefined,
      date,
      endType: showEndAfter ? endType : undefined,
      endDate: showEndAfter && endType === 'Date' ? endDate : undefined,
    });
  };

  return (
    <ScrollView 
      className="flex-1" 
      showsVerticalScrollIndicator={false}
    >
      {/* Simple form - chỉ Frequency và End After */}
      {!showEndAfter && (
        <View className="p-4 gap-4">
          <DropdownField label="Frequency" value={frequency} />
          <DropdownField label="End After" value="Never" />
          <TouchableOpacity 
            className="bg-violet-600 py-4 rounded-2xl items-center active:opacity-80"
            onPress={handleSubmit}
          >
            <Text className="text-white font-semibold text-lg">Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Full forms - 4 variants */}
      {showEndAfter && (
        <View className="p-4 gap-6">
          {/* Yearly */}
          <View className={`gap-4 p-4 rounded-2xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <View className="flex-row gap-2">
              <DropdownField 
                label="Yearly" 
                value="Yearly" 
                style="flex-1" 
                onPress={() => setFrequency('Yearly')}
              />
              <DropdownField 
                label={month} 
                value={month} 
                style="flex-1"
                onPress={() => {/* Open month picker */}}
              />
              <DropdownField 
                label={day.toString()} 
                value={day.toString()} 
                style="flex-1"
                onPress={() => {/* Open day picker */}}
              />
            </View>
            <DropdownField label="Date" value={date} />
            <TouchableOpacity 
              className="bg-violet-600 py-4 rounded-2xl items-center active:opacity-80"
              onPress={handleSubmit}
            >
              <Text className="text-white font-semibold text-lg">Next</Text>
            </TouchableOpacity>
          </View>

          {/* Monthly */}
          <View className={`gap-4 p-4 rounded-2xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <View className="flex-row gap-2">
              <DropdownField 
                label="Monthly" 
                value="Monthly" 
                style="flex-[2]"
                onPress={() => setFrequency('Monthly')}
              />
              <DropdownField 
                label="26" 
                value="26" 
                style="flex-1"
              />
            </View>
            <DropdownField label="Date" value={date} />
            <TouchableOpacity 
              className="bg-violet-600 py-4 rounded-2xl items-center active:opacity-80"
              onPress={handleSubmit}
            >
              <Text className="text-white font-semibold text-lg">Next</Text>
            </TouchableOpacity>
          </View>

          {/* Weekly */}
          <View className={`gap-4 p-4 rounded-2xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <View className="flex-row gap-2">
              <DropdownField 
                label="Weekly" 
                value="Weekly" 
                style="flex-[2]"
                onPress={() => setFrequency('Weekly')}
              />
              <DropdownField 
                label="Fri" 
                value="Fri" 
                style="flex-1"
              />
            </View>
            <DropdownField label="Date" value={date} />
            <TouchableOpacity 
              className="bg-violet-600 py-4 rounded-2xl items-center active:opacity-80"
              onPress={handleSubmit}
            >
              <Text className="text-white font-semibold text-lg">Next</Text>
            </TouchableOpacity>
          </View>

          {/* Daily with end date */}
          <View className={`gap-4 p-4 rounded-2xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <DropdownField 
              label="Daily" 
              value="Daily"
              onPress={() => setFrequency('Daily')}
            />
            <DropdownField label="Date" value={date} />
            <TouchableOpacity 
              className={`py-4 rounded-2xl items-center active:opacity-80 ${
                isDarkMode ? 'bg-violet-900' : 'bg-violet-100'
              }`}
              onPress={handleSubmit}
            >
              <Text className="text-violet-600 font-semibold text-lg">Primary</Text>
            </TouchableOpacity>
          </View>

          {/* With Indefinitely option */}
          <View className={`gap-4 p-4 rounded-2xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <View className="flex-row gap-2">
              <DropdownField 
                label="Yearly" 
                value="Yearly" 
                style="flex-1"
                onPress={() => setFrequency('Yearly')}
              />
              <DropdownField 
                label={month} 
                value={month} 
                style="flex-1"
              />
              <DropdownField 
                label={day.toString()} 
                value={day.toString()} 
                style="flex-1"
              />
            </View>
            <DropdownField 
              label="Indefinitely" 
              value="Indefinitely"
              onPress={() => setEndType('Indefinitely')}
            />
            <TouchableOpacity 
              className="bg-violet-600 py-4 rounded-2xl items-center active:opacity-80"
              onPress={handleSubmit}
            >
              <Text className="text-white font-semibold text-lg">Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

interface DropdownFieldProps {
  label: string;
  value: string;
  style?: string;
  onPress?: () => void;
}

function DropdownField({ label, value, style, onPress }: DropdownFieldProps) {
  const { isDarkMode } = useSettings();
  
  return (
    <TouchableOpacity 
      className={`flex-row items-center justify-between px-4 py-3 rounded-xl border ${
        isDarkMode 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-white border-gray-200'
      } ${style || ''}`}
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <Text className={`font-medium text-base ${
        isDarkMode ? 'text-gray-200' : 'text-gray-700'
      }`}>
        {label}
      </Text>
      <Ionicons 
        name="chevron-down" 
        size={20} 
        color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
      />
    </TouchableOpacity>
  );
}