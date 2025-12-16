import { Transaction, PeriodStats, CategoryBreakdown, ComparisonData } from './types';
import { getCategoryColor } from './constants';

/**
 * Calculate overall statistics for a period
 */
export const calculatePeriodStats = (transactions: Transaction[]): PeriodStats => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;
  const avgAmount = transactions.length > 0 
    ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length 
    : 0;

  return {
    totalIncome: income,
    totalExpense: expense,
    balance,
    savingsRate,
    transactionCount: transactions.length,
    avgTransactionAmount: avgAmount,
  };
};

/**
 * Calculate category breakdown for expenses or income
 */
export const calculateCategoryBreakdown = (
  transactions: Transaction[],
  type: 'income' | 'expense'
): CategoryBreakdown[] => {
  const filtered = transactions.filter(t => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<string, { amount: number; count: number }>();

  filtered.forEach(t => {
    const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
    categoryMap.set(t.category, {
      amount: existing.amount + t.amount,
      count: existing.count + 1,
    });
  });

  const breakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
      count: data.count,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.amount - a.amount);

  return breakdown;
};

/**
 * Compare current period with previous period
 */
export const comparePeriodsData = (
  currentTransactions: Transaction[],
  previousTransactions: Transaction[]
): ComparisonData => {
  const current = calculatePeriodStats(currentTransactions);
  const previous = calculatePeriodStats(previousTransactions);

  const incomeChange = previous.totalIncome > 0
    ? ((current.totalIncome - previous.totalIncome) / previous.totalIncome) * 100
    : 0;

  const expenseChange = previous.totalExpense > 0
    ? ((current.totalExpense - previous.totalExpense) / previous.totalExpense) * 100
    : 0;

  const balanceChange = previous.balance > 0
    ? ((current.balance - previous.balance) / previous.balance) * 100
    : 0;

  return {
    current,
    previous,
    incomeChange,
    expenseChange,
    balanceChange,
  };
};

/**
 * Get top spending categories
 */
export const getTopCategories = (
  transactions: Transaction[],
  type: 'income' | 'expense',
  limit: number = 5
): CategoryBreakdown[] => {
  const breakdown = calculateCategoryBreakdown(transactions, type);
  return breakdown.slice(0, limit);
};

/**
 * Calculate daily average
 */
export const calculateDailyAverage = (
  transactions: Transaction[],
  type: 'income' | 'expense'
): number => {
  if (transactions.length === 0) return 0;

  const filtered = transactions.filter(t => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const dates = filtered.map(t => new Date(t.date).toISOString().split('T')[0]);
  const uniqueDays = new Set(dates).size;

  return uniqueDays > 0 ? total / uniqueDays : 0;
};

/**
 * Calculate monthly average
 */
export const calculateMonthlyAverage = (
  transactions: Transaction[],
  type: 'income' | 'expense'
): number => {
  if (transactions.length === 0) return 0;

  const filtered = transactions.filter(t => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  const months = filtered.map(t => {
    const date = new Date(t.date);
    return `${date.getFullYear()}-${date.getMonth()}`;
  });
  const uniqueMonths = new Set(months).size;

  return uniqueMonths > 0 ? total / uniqueMonths : 0;
};

/**
 * Calculate transaction frequency
 */
export const calculateTransactionFrequency = (transactions: Transaction[]): {
  dailyAvg: number;
  weeklyAvg: number;
  monthlyAvg: number;
} => {
  if (transactions.length === 0) {
    return { dailyAvg: 0, weeklyAvg: 0, monthlyAvg: 0 };
  }

  const dates = transactions.map(t => new Date(t.date).toISOString().split('T')[0]);
  const uniqueDays = new Set(dates).size;
  
  const weeks = transactions.map(t => {
    const date = new Date(t.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    return weekStart.toISOString().split('T')[0];
  });
  const uniqueWeeks = new Set(weeks).size;

  const months = transactions.map(t => {
    const date = new Date(t.date);
    return `${date.getFullYear()}-${date.getMonth()}`;
  });
  const uniqueMonths = new Set(months).size;

  return {
    dailyAvg: uniqueDays > 0 ? transactions.length / uniqueDays : 0,
    weeklyAvg: uniqueWeeks > 0 ? transactions.length / uniqueWeeks : 0,
    monthlyAvg: uniqueMonths > 0 ? transactions.length / uniqueMonths : 0,
  };
};