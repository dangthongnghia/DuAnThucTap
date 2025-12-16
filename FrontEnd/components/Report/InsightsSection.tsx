import React from 'react';
import { View, Text } from 'react-native';
import { InsightCard } from '../Card/StatsCard';

interface Insight {
  icon: 'trophy' | 'warning' | 'analytics' | 'calendar' | 'alert-circle';
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}

interface InsightsSectionProps {
  insights: Insight[];
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({ insights }) => {
  if (insights.length === 0) return null;

  return (
    <View className="px-4 mb-4">
      <Text className="text-lg font-bold text-gray-900 mb-3">💡 Thông tin chi tiết</Text>
      {insights.map((insight, index) => (
        <InsightCard key={index} {...insight} />
      ))}
    </View>
  );
};