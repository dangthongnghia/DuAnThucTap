import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { TrendData } from '../../lib/analytics';
import { screenWidth, getChartConfig, CHART_COLORS } from './chartConfig';
import { useSettings } from '../../contexts/SettingsContext';

interface TrendChartProps {
  data: TrendData[];
  title?: string;
}

export const TrendLineChart: React.FC<TrendChartProps> = ({ data, title }) => {
  const { isDarkMode } = useSettings();
  
  if (data.length === 0) {
    return (
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 items-center justify-center`} style={{ height: 220 }}>
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Không có dữ liệu</Text>
      </View>
    );
  }

  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: data.map(d => d.income),
        color: CHART_COLORS.income,
        strokeWidth: 2,
      },
      {
        data: data.map(d => d.expense),
        color: CHART_COLORS.expense,
        strokeWidth: 2,
      },
    ],
    legend: ['Thu nhập', 'Chi tiêu'],
  };

  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4`}>
      {title && <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{title}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={chartData}
          width={Math.max(screenWidth - 48, data.length * 50)}
          height={220}
          chartConfig={{
            ...getChartConfig(),
            propsForDots: {
              r: '4',
              strokeWidth: '2',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </ScrollView>
      
      {/* Legend */}
      <View className="flex-row justify-center gap-6 mt-3">
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-green-500 mr-2" />
          <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Thu nhập</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 rounded-full bg-red-500 mr-2" />
          <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Chi tiêu</Text>
        </View>
      </View>
    </View>
  );
};