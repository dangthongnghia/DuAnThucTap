import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PeriodStats, formatCurrency, formatPercentage } from '../../lib/analytics';
import { useSettings } from '../../contexts/SettingsContext';

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  change?: number;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconColor,
  iconBg,
  change,
  subtitle,
}) => {
  const { isDarkMode } = useSettings();
  
  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 flex-1 shadow-sm`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</Text>
        <View className={`${iconBg} p-2 rounded-full`}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      </View>
      
      <Text className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{value}</Text>
      
      {change !== undefined && (
        <View className="flex-row items-center">
          <Ionicons
            name={change >= 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={change >= 0 ? '#22c55e' : '#ef4444'}
          />
          <Text
            className={`text-sm ml-1 ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatPercentage(change)}
          </Text>
        </View>
      )}
      
      {subtitle && (
        <Text className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</Text>
      )}
    </View>
  );
};

interface StatsOverviewProps {
  stats: PeriodStats;
  showComparison?: boolean;
  incomeChange?: number;
  expenseChange?: number;
  balanceChange?: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  stats,
  showComparison = false,
  incomeChange,
  expenseChange,
  balanceChange,
}) => {
  const { isDarkMode } = useSettings();
  
  return (
    <View className="px-4">
      {/* Income & Expense */}
      <View className="flex-row gap-3 mb-3">
        <StatCard
          title="Thu nhập"
          value={formatCurrency(stats.totalIncome)}
          icon="trending-up"
          iconColor="#22c55e"
          iconBg="bg-green-100"
          change={showComparison ? incomeChange : undefined}
        />
        <StatCard
          title="Chi tiêu"
          value={formatCurrency(stats.totalExpense)}
          icon="trending-down"
          iconColor="#ef4444"
          iconBg="bg-red-100"
          change={showComparison ? expenseChange : undefined}
        />
      </View>

      {/* Balance */}
      <View className={`${isDarkMode ? 'bg-violet-700' : 'bg-violet-500'} rounded-2xl p-4 mb-3 shadow-sm`}>
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-violet-100 text-sm">Số dư</Text>
          <View className={`${isDarkMode ? 'bg-violet-600' : 'bg-violet-400'} p-2 rounded-full`}>
            <Ionicons name="wallet" size={20} color="#ffffff" />
          </View>
        </View>
        <Text className="text-3xl font-bold text-white mb-1">
          {formatCurrency(stats.balance)}
        </Text>
        {showComparison && balanceChange !== undefined && (
          <View className="flex-row items-center">
            <Ionicons
              name={balanceChange >= 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color="#ffffff"
            />
            <Text className="text-violet-100 text-sm ml-1">
              {formatPercentage(balanceChange)} so với kỳ trước
            </Text>
          </View>
        )}
      </View>

      {/* Savings Rate & Transaction Count */}
      <View className="flex-row gap-3">
        <StatCard
          title="Tỷ lệ tiết kiệm"
          value={`${stats.savingsRate.toFixed(1)}%`}
          icon="pie-chart"
          iconColor="#7f3dff"
          iconBg="bg-violet-100"
          subtitle={stats.savingsRate >= 20 ? 'Tốt!' : 'Cần cải thiện'}
        />
        <StatCard
          title="Giao dịch"
          value={stats.transactionCount.toString()}
          icon="list"
          iconColor="#3b82f6"
          iconBg="bg-blue-100"
          subtitle={`TB: ${formatCurrency(stats.avgTransactionAmount)}`}
        />
      </View>
    </View>
  );
};

interface CategoryStatsItemProps {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export const CategoryStatsItem: React.FC<CategoryStatsItemProps> = ({
  category,
  amount,
  percentage,
  count,
  color,
}) => {
  const { isDarkMode } = useSettings();
  
  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 mb-2 shadow-sm`}>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: `${color}20` }}
          >
            <View className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
          </View>
          <View className="flex-1">
            <Text className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{category}</Text>
            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{count} giao dịch</Text>
          </View>
        </View>
        <View className="items-end">
          <Text className={`text-base font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {formatCurrency(amount)}
          </Text>
          <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{percentage.toFixed(1)}%</Text>
        </View>
      </View>
      
      {/* Progress Bar */}
      <View className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} h-2 rounded-full overflow-hidden`}>
        <View
          className="h-full rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
};

interface InsightCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  icon,
  iconColor,
  iconBg,
  title,
  description,
}) => {
  const { isDarkMode } = useSettings();
  
  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 mb-3 shadow-sm`}>
      <View className="flex-row items-start">
        <View className={`${iconBg} p-3 rounded-full mr-3`}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        <View className="flex-1">
          <Text className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{title}</Text>
          <Text className={`text-sm leading-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{description}</Text>
        </View>
      </View>
    </View>
  );
};
