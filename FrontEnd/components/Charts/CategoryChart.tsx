import React from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { CategoryBreakdown } from '../../lib/analytics';
import { screenWidth } from './chartConfig';
import { useSettings } from '../../contexts/SettingsContext';

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
  title?: string;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, title }) => {
  const { isDarkMode } = useSettings();
  
  if (data.length === 0) {
    return (
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 items-center justify-center`} style={{ height: 250 }}>
        <Text className="text-gray-400">Không có dữ liệu</Text>
      </View>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.category,
    amount: item.amount,
    color: item.color,
    legendFontColor: isDarkMode ? '#E5E7EB' : '#374151',
    legendFontSize: 12,
  }));

  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4`}>
      {title && <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{title}</Text>}
      <PieChart
        data={chartData}
        width={screenWidth - 48}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
};

interface CategoryChartLegendProps {
  data: CategoryBreakdown[];
  maxItems?: number;
}

export const CategoryChartLegend: React.FC<CategoryChartLegendProps> = ({ 
  data, 
  maxItems = 5 
}) => {
  const { isDarkMode } = useSettings();
  const displayData = data.slice(0, maxItems);

  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 mt-2`}>
      <Text className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} mb-3`}>Chi tiết danh mục</Text>
      {displayData.map((item, index) => (
        <View key={index} className="flex-row items-center justify-between py-2">
          <View className="flex-row items-center flex-1">
            <View 
              className="w-4 h-4 rounded-full mr-3"
              style={{ backgroundColor: item.color }}
            />
            <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex-1`} numberOfLines={1}>
              {item.category}
            </Text>
          </View>
          <View className="items-end">
            <Text className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {item.percentage.toFixed(1)}%
            </Text>
            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(item.amount)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};