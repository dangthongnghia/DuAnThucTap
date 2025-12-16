import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  transactionCount: number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ transactionCount }) => {
  if (transactionCount > 0) return null;

  return (
    <View className="items-center justify-center py-12">
      <Ionicons name="bar-chart-outline" size={64} color="#d1d5db" />
      <Text className="text-lg font-semibold text-gray-400 mt-4">
        Chưa có dữ liệu
      </Text>
      <Text className="text-sm text-gray-400 text-center mt-2 px-8">
        Thêm giao dịch để xem báo cáo và thống kê
      </Text>
    </View>
  );
};