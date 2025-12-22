import { apiClient, ApiResponse } from './apiClient';

// Interfaces
export type Period = 'day' | 'week' | 'month' | 'year';

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalAccountBalance: number;
  transactionCount: number;
  period: Period;
  startDate: string;
  endDate: string;
}

export interface CategorySummary {
  category: string;
  amount: number;
  count: number;
}

export interface RecentTransaction {
  id: string;
  title: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
}

export interface ChartDataPoint {
  label: string;
  date: string;
  income: number;
  expense: number;
}

export interface BudgetStatus {
  category: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
}

export interface PeriodComparison {
  incomeChange: number;
  expenseChange: number;
  previousIncome: number;
  previousExpense: number;
}

export interface AccountSummary {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  accounts: AccountSummary[];
  topExpenseCategories: CategorySummary[];
  topIncomeCategories: CategorySummary[];
  recentTransactions: RecentTransaction[];
  chartData: ChartDataPoint[];
  budgetStatus: BudgetStatus[];
  comparison: PeriodComparison;
}

/**
 * Dashboard Service
 */
export const dashboardService = {
  /**
   * Lấy dữ liệu dashboard
   */
  async getDashboardData(params?: {
    period?: Period;
    timezone?: string;
  }): Promise<ApiResponse<DashboardData>> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append('period', params.period);
    if (params?.timezone) searchParams.append('timezone', params.timezone);

    const query = searchParams.toString();
    return apiClient.get<DashboardData>(`/dashboard${query ? `?${query}` : ''}`);
  },

  /**
   * Lấy quick summary (dùng cho widget)
   */
  async getQuickSummary(): Promise<ApiResponse<{
    totalIncome: number;
    totalExpense: number;
    balance: number;
    totalAccountBalance: number;
  }>> {
    const response = await this.getDashboardData({ period: 'month' });
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          totalIncome: response.data.summary.totalIncome,
          totalExpense: response.data.summary.totalExpense,
          balance: response.data.summary.balance,
          totalAccountBalance: response.data.summary.totalAccountBalance,
        },
      };
    }
    return {
      success: false,
      message: response.message || 'Không thể tải dữ liệu',
    };
  },
};
