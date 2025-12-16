import { Transaction } from '../../contexts/DataContext';

export interface PeriodStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  transactionCount: number;
  avgTransactionAmount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface TrendData {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface ComparisonData {
  current: PeriodStats;
  previous: PeriodStats;
  incomeChange: number;
  expenseChange: number;
  balanceChange: number;
}

// Re-export Transaction type for convenience
export type { Transaction };