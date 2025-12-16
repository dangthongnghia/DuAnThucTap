import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { CategoryBreakdown } from '../../lib/analytics';
import { screenWidth, getChartConfig, CHART_COLORS } from './chartConfig';
import { useSettings } from '../../contexts/SettingsContext';

interface CategoryBarChartProps {
  data: CategoryBreakdown[];
  title?: string;
  type: 'income' | 'expense';
  maxItems?: number;
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ 
  data, 
  title, 
  type,
  maxItems = 5 
}) => {
  const { isDarkMode } = useSettings();
  
  if (data.length === 0) {
    return (
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 items-center justify-center`} style={{ height: 220 }}>
        <Text className="text-gray-400">Không có dữ liệu</Text>
      </View>
    );
  }

  const displayData = data.slice(0, maxItems);
  const chartData = {
    labels: displayData.map(d => d.category.substring(0, 8)),
    datasets: [
      {
        data: displayData.map(d => d.amount),
      },
    ],
  };

  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4`}>
      {title && <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{title}</Text>}
      <BarChart
        data={chartData}
        width={screenWidth - 48}
        height={220}
        yAxisLabel=""
        yAxisSuffix="đ"
        chartConfig={{
          ...getChartConfig(type === 'income' ? CHART_COLORS.income : CHART_COLORS.expense),
          propsForLabels: {
            fontSize: 10,
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        showValuesOnTopOfBars
      />
    </View>
  );
};

interface HorizontalBarChartProps {
  data: CategoryBreakdown[];
  title?: string;
  type: 'income' | 'expense';
  maxItems?: number;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ 
  data, 
  title, 
  type,
  maxItems = 5 
}) => {
  const { isDarkMode } = useSettings();
  
  if (data.length === 0) {
    return (
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 items-center justify-center`} style={{ height: 220 }}>
        <Text className="text-gray-400">Không có dữ liệu</Text>
      </View>
    );
  }

  const displayData = data.slice(0, maxItems);
  const maxAmount = Math.max(...displayData.map(d => d.amount));

  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4`}>
      {title && <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{title}</Text>}
      <View className="space-y-3">
        {displayData.map((item, index) => (
          <View key={index} className="space-y-1">
            <View className="flex-row justify-between items-center">
              <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.category}</Text>
              <Text className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(item.amount)}
              </Text>
            </View>
            <View className={`h-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full`}>
              <View 
                className="h-2 rounded-full"
                style={{ 
                  width: `${(item.amount / maxAmount) * 100}%`,
                  backgroundColor: type === 'income' ? '#22c55e' : '#ef4444'
                }}
              />
            </View>
            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {item.percentage.toFixed(1)}% • {item.count} giao dịch
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};