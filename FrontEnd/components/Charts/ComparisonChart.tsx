import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { screenWidth, getChartConfig, CHART_COLORS } from './chartConfig';
import { useSettings } from '../../contexts/SettingsContext';

interface ComparisonBarChartProps {
  current: number;
  previous: number;
  title: string;
  type: 'income' | 'expense' | 'balance';
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  current,
  previous,
  title,
  type,
}) => {
  const { isDarkMode } = useSettings();
  const chartData = {
    labels: ['Kỳ trước', 'Kỳ này'],
    datasets: [
      {
        data: [previous, current],
      },
    ],
  };

  const getColor = () => {
    switch (type) {
      case 'income':
        return CHART_COLORS.income;
      case 'expense':
        return CHART_COLORS.expense;
      case 'balance':
        return CHART_COLORS.balance;
    }
  };

  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4`}>
      <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{title}</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 48}
        height={200}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={getChartConfig(getColor())}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        showValuesOnTopOfBars
      />
    </View>
  );
};

interface PercentageComparisonProps {
  current: number;
  previous: number;
  title: string;
  type: 'income' | 'expense' | 'balance';
  showPercentage?: boolean;
}

export const PercentageComparison: React.FC<PercentageComparisonProps> = ({
  current,
  previous,
  title,
  type,
  showPercentage = true,
}) => {
  const { isDarkMode } = useSettings();
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const isPositive = change > 0;
  
  const getColorClass = () => {
    if (type === 'expense') {
      return isPositive ? 'text-red-500' : 'text-green-500';
    }
    return isPositive ? 'text-green-500' : 'text-red-500';
  };

  const getBackgroundColor = () => {
    if (isDarkMode) {
      switch (type) {
        case 'income':
          return '#064e3b'; // dark green
        case 'expense':
          return '#7f1d1d'; // dark red
        case 'balance':
          return '#4c1d95'; // dark violet
      }
    } else {
      switch (type) {
        case 'income':
          return '#dcfce7'; // green-100
        case 'expense':
          return '#fee2e2'; // red-100
        case 'balance':
          return '#ede9fe'; // violet-100
      }
    }
  };

  return (
    <View 
      className="rounded-2xl p-4"
      style={{ backgroundColor: getBackgroundColor() }}
    >
      <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{title}</Text>
      
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kỳ trước</Text>
          <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(previous)}
          </Text>
        </View>
        
        <View className="items-end">
          <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Kỳ này</Text>
          <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(current)}
          </Text>
        </View>
      </View>

      {showPercentage && (
        <View className={`flex-row items-center justify-between pt-2 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Thay đổi:</Text>
          <Text className={`text-sm font-semibold ${getColorClass()}`}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );
};