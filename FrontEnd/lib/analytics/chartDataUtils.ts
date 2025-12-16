import { Transaction, TrendData } from './types';
import { groupTransactionsByPeriod } from './dateUtils';
import { CHART_COLORS } from './constants';

/**
 * Generate trend data grouped by day/week/month
 */
export const calculateTrendData = (
  transactions: Transaction[],
  groupBy: 'day' | 'week' | 'month' = 'day'
): TrendData[] => {
  const grouped = new Map<string, { income: number; expense: number }>();

  transactions.forEach(t => {
    const date = new Date(t.date);
    let key: string;

    if (groupBy === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    const existing = grouped.get(key) || { income: 0, expense: 0 };
    if (t.type === 'income') {
      existing.income += t.amount;
    } else {
      existing.expense += t.amount;
    }
    grouped.set(key, existing);
  });

  const trendData: TrendData[] = Array.from(grouped.entries())
    .map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return trendData;
};

/**
 * Prepare data for pie chart
 */
export const preparePieChartData = (
  breakdown: Array<{ category: string; amount: number; color: string }>
) => {
  return breakdown.map(item => ({
    name: item.category,
    value: item.amount,
    color: item.color,
  }));
};

/**
 * Prepare data for bar chart
 */
export const prepareBarChartData = (
  breakdown: Array<{ category: string; amount: number; color: string }>
) => {
  return breakdown.map(item => ({
    category: item.category,
    value: item.amount,
    color: item.color,
  }));
};

/**
 * Prepare data for line chart
 */
export const prepareLineChartData = (trendData: TrendData[]) => {
  return trendData.map(item => ({
    date: item.date,
    income: item.income,
    expense: item.expense,
    balance: item.balance,
  }));
};

/**
 * Generate data for income vs expense comparison chart
 */
export const generateIncomeExpenseChartData = (transactions: Transaction[]) => {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

  return [
    {
      name: 'Thu nhập',
      value: totalIncome,
      color: CHART_COLORS.income,
    },
    {
      name: 'Chi tiêu',
      value: totalExpense,
      color: CHART_COLORS.expense,
    },
  ];
};

/**
 * Generate data for monthly comparison chart
 */
export const generateMonthlyComparisonData = (transactions: Transaction[]) => {
  const monthlyData = new Map<string, { income: number; expense: number }>();

  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const existing = monthlyData.get(monthKey) || { income: 0, expense: 0 };
    if (t.type === 'income') {
      existing.income += t.amount;
    } else {
      existing.expense += t.amount;
    }
    monthlyData.set(monthKey, existing);
  });

  return Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Calculate chart dimensions and formatting
 */
export const getChartConfig = () => {
  return {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };
};

/**
 * Format chart labels
 */
export const formatChartLabel = (value: number, type: 'currency' | 'percentage' | 'number' = 'currency'): string => {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
      return value.toLocaleString('vi-VN');
    default:
      return value.toString();
  }
};