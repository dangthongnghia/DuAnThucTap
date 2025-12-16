import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { TrendData } from '../../lib/analytics';
import { screenWidth, getChartConfig, CHART_COLORS } from './chartConfig';
import { useSettings } from '../../contexts/SettingsContext';

interface MonthlyTrendProps {
  data: TrendData[];
  title?: string;
  type?: 'line' | 'bar';
}

export const MonthlyTrendChart: React.FC<MonthlyTrendProps> = ({ 
  data, 
  title,
  type = 'line' 
}) => {
  const { isDarkMode } = useSettings();
  
  if (data.length === 0) {
    return (
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 items-center justify-center`} style={{ height: 220 }}>
        <Text className="text-gray-400">Không có dữ liệu</Text>
      </View>
    );
  }

  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.date + '-01'); // Add day for month format
      return date.toLocaleDateString('vi-VN', { month: 'short' });
    }),
    datasets: [
      {
        data: data.map(d => d.balance),
        color: CHART_COLORS.balance,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4`}>
      {title && <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{title}</Text>}
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {type === 'line' ? (
          <LineChart
            data={chartData}
            width={Math.max(screenWidth - 48, data.length * 60)}
            height={220}
            chartConfig={{
              ...getChartConfig(CHART_COLORS.balance),
              propsForDots: {
                r: '5',
                strokeWidth: '2',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        ) : (
          <BarChart
            data={{
              labels: chartData.labels,
              datasets: [{ data: chartData.datasets[0].data }],
            }}
            width={Math.max(screenWidth - 48, data.length * 60)}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={getChartConfig(CHART_COLORS.balance)}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            showValuesOnTopOfBars
          />
        )}
      </ScrollView>

      {/* Summary Stats */}
      <View className={`flex-row justify-around pt-4 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
        <View className="items-center">
          <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Cao nhất</Text>
          <Text className="text-sm font-semibold text-green-600">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact',
            }).format(Math.max(...data.map(d => d.balance)))}
          </Text>
        </View>
        
        <View className="items-center">
          <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Thấp nhất</Text>
          <Text className="text-sm font-semibold text-red-600">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact',
            }).format(Math.min(...data.map(d => d.balance)))}
          </Text>
        </View>
        
        <View className="items-center">
          <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Trung bình</Text>
          <Text className="text-sm font-semibold text-blue-600">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact',
            }).format(data.reduce((sum, d) => sum + d.balance, 0) / data.length)}
          </Text>
        </View>
      </View>
    </View>
  );
};

interface IncomeExpenseComparisonProps {
  data: TrendData[];
  title?: string;
}

export const IncomeExpenseComparison: React.FC<IncomeExpenseComparisonProps> = ({ 
  data, 
  title 
}) => {
  const { isDarkMode } = useSettings();
  
  if (data.length === 0) {
    return (
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 items-center justify-center`} style={{ height: 220 }}>
        <Text className="text-gray-400">Không có dữ liệu</Text>
      </View>
    );
  }

  // Calculate totals
  const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
  const totalExpense = data.reduce((sum, d) => sum + d.expense, 0);

  const chartData = [
    {
      name: 'Thu nhập',
      amount: totalIncome,
      color: '#22c55e',
      legendFontColor: isDarkMode ? '#E5E7EB' : '#374151',
      legendFontSize: 12,
    },
    {
      name: 'Chi tiêu', 
      amount: totalExpense,
      color: '#ef4444',
      legendFontColor: isDarkMode ? '#E5E7EB' : '#374151',
      legendFontSize: 12,
    },
  ];

  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4`}>
      {title && <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{title}</Text>}
      
      <View className="flex-row justify-around mb-4">
        <View className="items-center">
          <View className="w-4 h-4 rounded-full bg-green-500 mb-1" />
          <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Thu nhập</Text>
          <Text className="text-lg font-bold text-green-600">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact',
            }).format(totalIncome)}
          </Text>
        </View>
        
        <View className="items-center">
          <View className="w-4 h-4 rounded-full bg-red-500 mb-1" />
          <Text className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Chi tiêu</Text>
          <Text className="text-lg font-bold text-red-600">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact',
            }).format(totalExpense)}
          </Text>
        </View>
      </View>

      <View className="items-center">
        <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Số dư cuối kỳ</Text>
        <Text className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            notation: 'compact',
          }).format(totalIncome - totalExpense)}
        </Text>
      </View>
    </View>
  );
};