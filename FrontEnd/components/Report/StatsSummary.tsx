import React from 'react';
import { View } from 'react-native';
import { StatsOverview } from '../Card/StatsCard';

interface StatsSummaryProps {
  stats: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    savingsRate: number;
    transactionCount: number;
    avgTransactionAmount: number;
  };
  comparison: {
    incomeChange: number;
    expenseChange: number;
    balanceChange: number;
  };
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  stats,
  comparison,
}) => {
  return (
    <View className="mt-4 mb-4">
      <StatsOverview
        stats={stats}
        showComparison
        incomeChange={comparison.incomeChange}
        expenseChange={comparison.expenseChange}
        balanceChange={comparison.balanceChange}
      />
    </View>
  );
};