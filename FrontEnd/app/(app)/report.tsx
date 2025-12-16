import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, useColorScheme, RefreshControl, Text } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { useReportData } from '../../hooks/useReportData';
import { useSettings } from '../../contexts/SettingsContext';
import { Colors } from '../../constants/Colors';
import { formatCurrency } from '../../utils/currency';
import { LineChart } from 'react-native-chart-kit';
import { Download, TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle, Award } from 'lucide-react-native';
import { useExportActions } from '../../components/Report/ExportActions';

const { width } = Dimensions.get('window');

type Period = 'week' | 'month' | 'year' | 'all';

export default function ReportScreen() {
  const { isDarkMode } = useSettings();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const {
    selectedPeriod,
    setSelectedPeriod,
    refreshing,
    stats,
    trendData,
    expenseBreakdown,
    incomeBreakdown,
    insights,
    onRefresh,
    currentTransactions,
  } = useReportData();

  const { exportToCSV } = useExportActions();

  const periods: { key: Period; label: string }[] = [
    { key: 'week', label: '7 Days' },
    { key: 'month', label: '30 Days' },
    { key: 'year', label: '1 Year' },
    { key: 'all', label: 'All' },
  ];

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: (opacity = 1) => `rgba(${colorScheme === 'dark' ? '139, 92, 246' : '127, 61, 255'}, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    labelColor: (opacity = 1) => colorScheme === 'dark' ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    decimalPlaces: 0,
  };

  const StatCard = ({ title, amount, icon, type }: any) => (
    <Card className="flex-1 p-4 flex-row items-center justify-between">
      <View>
        <Text className="text-muted-foreground text-xs mb-1">{title}</Text>
        <Text className={`text-lg font-bold ${type === 'income' ? 'text-green-500' : type === 'expense' ? 'text-red-500' : 'text-primary'}`}>
          {formatCurrency(amount)}
        </Text>
      </View>
      <View className={`p-2 rounded-full ${type === 'income' ? 'bg-green-100 dark:bg-green-900/30' : type === 'expense' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary/10'}`}>
        {icon}
      </View>
    </Card>
  );

  // Transform trendData for chart
  const chartData = {
    labels: trendData.map(d => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }).slice(-6), // Show last 6 points to avoid crowding
    datasets: [
      {
        data: trendData.map(d => d.expense).slice(-6),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for expense
        strokeWidth: 2
      },
      {
        data: trendData.map(d => d.income).slice(-6),
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Green for income
        strokeWidth: 2
      }
    ],
    legend: ["Expense", "Income"]
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center bg-background">
        <View>
          <Text className="text-2xl font-bold text-foreground">Reports</Text>
          <Text className="text-muted-foreground">Financial Overview</Text>
        </View>
        <TouchableOpacity
          onPress={() => exportToCSV(currentTransactions, selectedPeriod)}
          className="h-10 w-10 rounded-full bg-secondary items-center justify-center"
        >
          <Download size={20} color={theme.foreground} />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View className="px-6 py-4">
        <View className="flex-row bg-secondary rounded-2xl p-1">
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              onPress={() => setSelectedPeriod(period.key)}
              className={`flex-1 py-2 rounded-xl items-center ${selectedPeriod === period.key ? 'bg-background shadow-sm' : ''}`}
            >
              <Text
                className={`font-semibold text-xs ${selectedPeriod === period.key ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Grid */}
        <View className="px-6 gap-4 mb-6">
          <View className="flex-row gap-4">
            <StatCard
              title="Income"
              amount={stats.totalIncome}
              type="income"
              icon={<TrendingUp size={20} color="#22c55e" />}
            />
            <StatCard
              title="Expense"
              amount={stats.totalExpense}
              type="expense"
              icon={<TrendingDown size={20} color="#ef4444" />}
            />
          </View>
          <View className="flex-row gap-4">
            <StatCard
              title="Net Balance"
              amount={stats.balance}
              type="net"
              icon={<DollarSign size={20} color={theme.primary} />}
            />
            <StatCard
              title="Savings"
              amount={stats.savingsRate}
              type="net"
              icon={<Award size={20} color={theme.primary} />}
            />
          </View>
        </View>

        {/* Trend Chart */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold mb-4 text-foreground">Trend Analysis</Text>
          <Card className="p-0 overflow-hidden items-center pt-4">
            {trendData.length > 0 ? (
              <LineChart
                data={chartData}
                width={width - 48 - 32} // Card width minus padding
                height={220}
                chartConfig={chartConfig}
                bezier
                style={{ borderRadius: 16 }}
                withInnerLines={false}
                withOuterLines={false}
              />
            ) : (
              <View className="h-[220px] items-center justify-center">
                <Text className="text-muted-foreground">No data available</Text>
              </View>
            )}
          </Card>
        </View>

        {/* Insights */}
        {insights.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-bold mb-4 text-foreground">Insights</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
              {insights.map((insight, index) => (
                <Card key={index} className="mr-4 w-64 p-4">
                  <View className={`h-10 w-10 rounded-full items-center justify-center mb-3 ${insight.iconBg}`}>
                    {insight.icon === 'trophy' && <Award size={20} color={insight.iconColor} />}
                    {insight.icon === 'warning' && <AlertCircle size={20} color={insight.iconColor} />}
                    {insight.icon === 'analytics' && <TrendingDown size={20} color={insight.iconColor} />}
                    {insight.icon === 'calendar' && <Calendar size={20} color={insight.iconColor} />}
                    {insight.icon === 'alert-circle' && <AlertCircle size={20} color={insight.iconColor} />}
                  </View>
                  <Text className="font-semibold mb-1 text-foreground">{insight.title}</Text>
                  <Text className="text-muted-foreground text-xs">{insight.description}</Text>
                </Card>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Expense Breakdown */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold mb-4 text-foreground">Expense Breakdown</Text>
          <Card className="p-4">
            {expenseBreakdown.length > 0 ? (
              expenseBreakdown.map((item, index) => (
                <View key={index} className="mb-4 last:mb-0">
                  <View className="flex-row justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                      <View className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <Text className="font-medium text-foreground">{item.category}</Text>
                    </View>
                    <Text className="font-semibold text-foreground">{formatCurrency(item.amount)}</Text>
                  </View>
                  <View className="h-2 bg-secondary rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </View>
                  <Text className="text-right mt-1 text-muted-foreground text-xs">
                    {item.percentage.toFixed(1)}%
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-center text-muted-foreground py-4">
                No expense data for this period
              </Text>
            )}
          </Card>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}