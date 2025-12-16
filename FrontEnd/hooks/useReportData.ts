import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import {
  calculatePeriodStats,
  calculateCategoryBreakdown,
  calculateTrendData,
  comparePeriodsData,
  filterTransactionsByDateRange,
  getDateRange,
  getTopCategories,
  calculateDailyAverage,
  formatCurrency,
} from '../lib/analytics';

type Period = 'week' | 'month' | 'year' | 'all';

export const useReportData = () => {
  const { transactions } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [refreshing, setRefreshing] = useState(false);

  // Filter transactions by selected period
  const { currentTransactions, previousTransactions } = useMemo(() => {
    const { start, end } = getDateRange(selectedPeriod);
    const current = filterTransactionsByDateRange(transactions, start, end);

    // Get previous period for comparison
    const periodLength = end.getTime() - start.getTime();
    const previousStart = new Date(start.getTime() - periodLength);
    const previousEnd = new Date(start.getTime() - 1);
    const previous = filterTransactionsByDateRange(transactions, previousStart, previousEnd);

    return { currentTransactions: current, previousTransactions: previous };
  }, [transactions, selectedPeriod]);

  // Calculate statistics
  const stats = useMemo(() => calculatePeriodStats(currentTransactions), [currentTransactions]);

  const comparison = useMemo(
    () => comparePeriodsData(currentTransactions, previousTransactions),
    [currentTransactions, previousTransactions]
  );

  const expenseBreakdown = useMemo(
    () => calculateCategoryBreakdown(currentTransactions, 'expense'),
    [currentTransactions]
  );

  const incomeBreakdown = useMemo(
    () => calculateCategoryBreakdown(currentTransactions, 'income'),
    [currentTransactions]
  );

  const trendData = useMemo(
    () => calculateTrendData(currentTransactions, selectedPeriod === 'week' ? 'day' : 'week'),
    [currentTransactions, selectedPeriod]
  );

  const topExpenses = useMemo(() => getTopCategories(currentTransactions, 'expense', 3), [currentTransactions]);

  const dailyAvgExpense = useMemo(() => calculateDailyAverage(currentTransactions, 'expense'), [currentTransactions]);

  // Generate insights
  const insights = useMemo(() => {
    const result = [];

    // Savings rate insight
    if (stats.savingsRate >= 30) {
      result.push({
        icon: 'trophy' as const,
        iconColor: '#22c55e',
        iconBg: 'bg-green-100',
        title: 'Tiết kiệm tốt!',
        description: `Bạn đang tiết kiệm ${stats.savingsRate.toFixed(1)}% thu nhập. Tỷ lệ này rất tốt, hãy duy trì!`,
      });
    } else if (stats.savingsRate < 10 && stats.totalIncome > 0) {
      result.push({
        icon: 'warning' as const,
        iconColor: '#f59e0b',
        iconBg: 'bg-amber-100',
        title: 'Cảnh báo tiết kiệm',
        description: `Bạn chỉ tiết kiệm được ${stats.savingsRate.toFixed(1)}% thu nhập. Hãy xem xét cắt giảm chi tiêu không cần thiết.`,
      });
    }

    // Top spending category
    if (topExpenses.length > 0) {
      const top = topExpenses[0];
      result.push({
        icon: 'analytics' as const,
        iconColor: '#ef4444',
        iconBg: 'bg-red-100',
        title: 'Chi tiêu nhiều nhất',
        description: `${top.category} chiếm ${top.percentage.toFixed(1)}% tổng chi tiêu với ${formatCurrency(top.amount)}.`,
      });
    }

    // Daily average
    result.push({
      icon: 'calendar' as const,
      iconColor: '#3b82f6',
      iconBg: 'bg-blue-100',
      title: 'Chi tiêu trung bình/ngày',
      description: `Bạn chi trung bình ${formatCurrency(dailyAvgExpense)} mỗi ngày trong kỳ này.`,
    });

    // Comparison with previous period
    if (comparison.expenseChange > 20) {
      result.push({
        icon: 'alert-circle' as const,
        iconColor: '#ef4444',
        iconBg: 'bg-red-100',
        title: 'Chi tiêu tăng cao',
        description: `Chi tiêu tăng ${comparison.expenseChange.toFixed(1)}% so với kỳ trước. Hãy xem xét ngân sách của bạn.`,
      });
    }

    return result;
  }, [stats, topExpenses, dailyAvgExpense, comparison]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return {
    // State
    selectedPeriod,
    setSelectedPeriod,
    refreshing,
    
    // Data
    currentTransactions,
    stats,
    comparison,
    expenseBreakdown,
    incomeBreakdown,
    trendData,
    insights,
    
    // Actions
    onRefresh,
  };
};