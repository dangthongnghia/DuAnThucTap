import React from 'react';
import { View, Text } from 'react-native';
import { CategoryStatsItem } from '../Card/StatsCard';
import { CategoryPieChart, CategoryBarChart } from '../Chart/ReportCharts';

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

interface CategoryBreakdownSectionProps {
  title: string;
  data: CategoryBreakdown[];
  type: 'expense' | 'income';
  showChart?: boolean;
}

export const CategoryBreakdownSection: React.FC<CategoryBreakdownSectionProps> = ({
  title,
  data,
  type,
  showChart = true,
}) => {
  if (data.length === 0) return null;

  return (
    <View className="px-4 mb-4">
      <Text className="text-lg font-bold text-gray-900 mb-3">
        {title}
      </Text>
      
      {showChart && (
        <View className="mb-4">
          {type === 'expense' ? (
            <CategoryPieChart data={data.slice(0, 5)} />
          ) : (
            <CategoryBarChart data={data} title="" type="income" />
          )}
        </View>
      )}
      
      {data.map((item, index) => (
        <CategoryStatsItem key={index} {...item} />
      ))}
    </View>
  );
};