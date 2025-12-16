import { Transaction } from './types';

/**
 * Get date range for common periods
 */
export const getDateRange = (period: 'week' | 'month' | 'year' | 'all') => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'week':
      start.setDate(end.getDate() - 7);
      break;
    case 'month':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(end.getFullYear() - 1);
      break;
    case 'all':
      start.setFullYear(2000); // Far back in the past
      break;
  }

  return { start, end };
};

/**
 * Filter transactions by date range
 */
export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date >= startDate && date <= endDate;
  });
};

/**
 * Group transactions by time period
 */
export const groupTransactionsByPeriod = (
  transactions: Transaction[],
  groupBy: 'day' | 'week' | 'month' = 'day'
): Map<string, Transaction[]> => {
  const grouped = new Map<string, Transaction[]>();

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

    const existing = grouped.get(key) || [];
    existing.push(t);
    grouped.set(key, existing);
  });

  return grouped;
};

/**
 * Get unique dates from transactions
 */
export const getUniqueDatesFromTransactions = (transactions: Transaction[]): string[] => {
  const dates = transactions.map(t => new Date(t.date).toISOString().split('T')[0]);
  return Array.from(new Set(dates)).sort();
};

/**
 * Get week start date
 */
export const getWeekStart = (date: Date): Date => {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

/**
 * Get month start date
 */
export const getMonthStart = (date: Date): Date => {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  return monthStart;
};

/**
 * Check if date is within range
 */
export const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
  return date >= start && date <= end;
};

/**
 * Format date for display
 */
export const formatDateForDisplay = (date: Date | string, format: 'short' | 'long' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    return d.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  return d.toLocaleDateString('vi-VN');
};