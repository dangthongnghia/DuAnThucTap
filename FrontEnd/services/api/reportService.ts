import { apiClient, ApiResponse } from './apiClient';

// Interfaces
export type ReportType = 'monthly' | 'yearly' | 'category' | 'trend';

export interface CategoryData {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface DailyData {
  day: number;
  date: string;
  income: number;
  expense: number;
}

export interface MonthlyData {
  month: number;
  monthName: string;
  income: number;
  expense: number;
  balance: number;
  transactionCount: number;
}

export interface QuarterlyData {
  quarter: number;
  label: string;
  income: number;
  expense: number;
  transactionCount: number;
}

export interface TrendMonth {
  year: number;
  month: number;
  label: string;
  income: number;
  expense: number;
  balance: number;
  incomeTrend: number;
  expenseTrend: number;
}

// Monthly Report Response
export interface MonthlyReportSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  avgDailyIncome?: number;
  avgDailyExpense?: number;
  avgMonthlyIncome?: number;
  avgMonthlyExpense?: number;
}

export interface MonthlyReportResponse {
  type: 'monthly';
  period: { year: number; month?: number };
  summary: MonthlyReportSummary;
  expenseByCategory?: CategoryData[];
  incomeByCategory?: CategoryData[];
  dailyData?: DailyData[];
  monthlyData?: MonthlyData[];
}

// Yearly Report Response
export interface YearlyReportResponse {
  type: 'yearly';
  period: { year: number };
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
    savingsRate: number;
  };
  comparison: {
    previousYear: number;
    incomeChange: number;
    expenseChange: number;
    prevYearIncome: number;
    prevYearExpense: number;
  };
  expenseByCategory: CategoryData[];
  incomeByCategory: CategoryData[];
  quarterlyData: QuarterlyData[];
}

// Category Report Response
export interface CategoryReportResponse {
  type: 'category';
  category?: string;
  period: { year: number; month?: number };
  summary?: {
    totalAmount: number;
    incomeAmount: number;
    expenseAmount: number;
    transactionCount: number;
    avgAmount: number;
  };
  timeData?: Array<{
    day?: number;
    month?: number;
    date?: string;
    label?: string;
    amount: number;
    count: number;
  }>;
  transactions?: Array<{
    id: string;
    title: string;
    type: 'income' | 'expense';
    amount: number;
    date: string;
  }>;
  expenseCategories?: CategoryData[];
  incomeCategories?: CategoryData[];
  topExpenseCategory?: CategoryData;
  topIncomeCategory?: CategoryData;
}

// Trend Report Response
export interface TrendReportResponse {
  type: 'trend';
  months: TrendMonth[];
  prediction: {
    nextMonth: string;
    income: number;
    expense: number;
    predictedBalance: number;
  };
  insights: string[];
}

/**
 * Report Service
 */
export const reportService = {
  /**
   * Lấy báo cáo theo tháng
   */
  async getMonthlyReport(params?: {
    year?: number;
    month?: number;
  }): Promise<ApiResponse<MonthlyReportResponse>> {
    const searchParams = new URLSearchParams();
    searchParams.append('type', 'monthly');
    if (params?.year) searchParams.append('year', params.year.toString());
    if (params?.month) searchParams.append('month', params.month.toString());

    return apiClient.get<MonthlyReportResponse>(`/reports?${searchParams.toString()}`);
  },

  /**
   * Lấy báo cáo theo năm
   */
  async getYearlyReport(year?: number): Promise<ApiResponse<YearlyReportResponse>> {
    const searchParams = new URLSearchParams();
    searchParams.append('type', 'yearly');
    if (year) searchParams.append('year', year.toString());

    return apiClient.get<YearlyReportResponse>(`/reports?${searchParams.toString()}`);
  },

  /**
   * Lấy báo cáo theo danh mục
   */
  async getCategoryReport(params?: {
    year?: number;
    month?: number;
    category?: string;
  }): Promise<ApiResponse<CategoryReportResponse>> {
    const searchParams = new URLSearchParams();
    searchParams.append('type', 'category');
    if (params?.year) searchParams.append('year', params.year.toString());
    if (params?.month) searchParams.append('month', params.month.toString());
    if (params?.category) searchParams.append('category', params.category);

    return apiClient.get<CategoryReportResponse>(`/reports?${searchParams.toString()}`);
  },

  /**
   * Lấy báo cáo xu hướng
   */
  async getTrendReport(year?: number): Promise<ApiResponse<TrendReportResponse>> {
    const searchParams = new URLSearchParams();
    searchParams.append('type', 'trend');
    if (year) searchParams.append('year', year.toString());

    return apiClient.get<TrendReportResponse>(`/reports?${searchParams.toString()}`);
  },

  /**
   * Lấy báo cáo tổng hợp (gộp nhiều loại)
   */
  async getFullReport(params?: {
    year?: number;
    month?: number;
  }): Promise<{
    monthly: ApiResponse<MonthlyReportResponse>;
    category: ApiResponse<CategoryReportResponse>;
    trend: ApiResponse<TrendReportResponse>;
  }> {
    const [monthly, category, trend] = await Promise.all([
      this.getMonthlyReport(params),
      this.getCategoryReport(params),
      this.getTrendReport(params?.year),
    ]);

    return { monthly, category, trend };
  },
};
