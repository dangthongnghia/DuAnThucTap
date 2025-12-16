import React from 'react';
import { View } from 'react-native';
import {
  TrendLineChart,
  CategoryPieChart,
  CategoryBarChart,
} from '../Chart/ReportCharts';

interface TrendData {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

interface ChartSectionProps {
  trendData: TrendData[];
  expenseBreakdown: CategoryBreakdown[];
  incomeBreakdown: CategoryBreakdown[];
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  trendData,
  expenseBreakdown,
  incomeBreakdown,
}) => {
  return (
    <>
      {/* Trend Chart */}
      {trendData.length > 0 && (
        <View className="px-4 mb-4">
          <TrendLineChart data={trendData} title="Xu hướng thu chi" />
        </View>
      )}

      {/* Expense Pie Chart */}
      {expenseBreakdown.length > 0 && (
        <View className="px-4 mb-4">
          <CategoryPieChart data={expenseBreakdown.slice(0, 5)} />
        </View>
      )}

      {/* Income Bar Chart */}
      {incomeBreakdown.length > 0 && (
        <View className="px-4 mb-4">
          <CategoryBarChart data={incomeBreakdown} title="" type="income" />
        </View>
      )}
    </>
  );
};