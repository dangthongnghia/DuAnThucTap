// API Services - Export all services
export { apiClient } from './apiClient';
export type { ApiResponse, ApiError } from './apiClient';

export { authService } from './authService';
export type { User, LoginRequest, RegisterRequest, LoginResponse } from './authService';

export { accountService } from './accountService';
export type { 
  Account, 
  AccountType, 
  CreateAccountRequest, 
  UpdateAccountRequest,
  AccountSummary,
  Transfer,
  TransferRequest,
} from './accountService';

export { transactionService } from './transactionService';
export type { 
  Transaction, 
  TransactionType,
  CreateTransactionRequest, 
  UpdateTransactionRequest,
  TransactionFilters,
} from './transactionService';

export { dashboardService } from './dashboardService';
export type { 
  DashboardData, 
  DashboardSummary,
  Period,
  CategorySummary,
  ChartDataPoint,
  BudgetStatus,
} from './dashboardService';

export { reportService } from './reportService';
export type { 
  ReportType,
  MonthlyReportResponse,
  YearlyReportResponse,
  CategoryReportResponse,
  TrendReportResponse,
} from './reportService';

export { notificationApiService } from './notificationApiService';
export type { 
  Notification, 
  NotificationType,
  NotificationCategory,
  CreateNotificationRequest,
} from './notificationApiService';
