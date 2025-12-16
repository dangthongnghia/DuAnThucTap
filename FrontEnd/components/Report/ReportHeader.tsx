import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPeriodLabel } from '../../lib/analytics';

type Period = 'week' | 'month' | 'year' | 'all';

interface ReportHeaderProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
  onExport: () => void;
}

const periods: { key: Period; label: string }[] = [
  { key: 'week', label: '7 ngày' },
  { key: 'month', label: '30 ngày' },
  { key: 'year', label: '1 năm' },
  { key: 'all', label: 'Tất cả' },
];

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  selectedPeriod,
  onPeriodChange,
  onExport,
}) => {
  return (
    <View className="bg-violet-500 pt-12 pb-6 px-4">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-white text-2xl font-bold">Báo cáo & Thống kê</Text>
          <Text className="text-violet-200 text-sm mt-1">
            {getPeriodLabel(selectedPeriod)}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={onExport}
          className="bg-white rounded-full p-3"
        >
          <Ionicons name="download-outline" size={24} color="#7f3dff" />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              onPress={() => onPeriodChange(period.key)}
              className={`px-4 py-2 rounded-full ${
                selectedPeriod === period.key
                  ? 'bg-white'
                  : 'bg-violet-400'
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedPeriod === period.key
                    ? 'text-violet-600'
                    : 'text-white'
                }`}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};