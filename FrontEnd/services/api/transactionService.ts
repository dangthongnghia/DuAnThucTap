import { apiClient, ApiResponse } from './apiClient';

// Interfaces
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  note?: string;
  paymentMethod?: string;
  accountId?: string;
  receiptImage?: string;
  recurringId?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  title: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  note?: string;
  paymentMethod?: string;
  accountId?: string;
  receiptImage?: string;
  attachments?: string[];
}

export interface UpdateTransactionRequest {
  title?: string;
  type?: TransactionType;
  category?: string;
  amount?: number;
  date?: string;
  note?: string;
  paymentMethod?: string;
  accountId?: string;
  receiptImage?: string;
  attachments?: string[];
}

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  totalCount: number;
  totalIncome: number;
  totalExpense: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Transaction Service
 */
export const transactionService = {
  /**
   * Lấy danh sách giao dịch
   */
  async getTransactions(
    filters?: TransactionFilters,
    pagination?: { limit?: number; offset?: number }
  ): Promise<ApiResponse<TransactionListResponse>> {
    const searchParams = new URLSearchParams();

    // Add filters
    if (filters?.type) searchParams.append('type', filters.type);
    if (filters?.category) searchParams.append('category', filters.category);
    if (filters?.accountId) searchParams.append('accountId', filters.accountId);
    if (filters?.startDate) searchParams.append('startDate', filters.startDate);
    if (filters?.endDate) searchParams.append('endDate', filters.endDate);
    if (filters?.minAmount)
      searchParams.append('minAmount', filters.minAmount.toString());
    if (filters?.maxAmount)
      searchParams.append('maxAmount', filters.maxAmount.toString());
    if (filters?.search) searchParams.append('search', filters.search);

    // Add pagination
    if (pagination?.limit)
      searchParams.append('limit', pagination.limit.toString());
    if (pagination?.offset)
      searchParams.append('offset', pagination.offset.toString());

    const query = searchParams.toString();
    return apiClient.get<TransactionListResponse>(
      `/transactions${query ? `?${query}` : ''}`
    );
  },

  /**
   * Lấy chi tiết giao dịch
   */
  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    return apiClient.get<Transaction>(`/transactions/${id}`);
  },

  /**
   * Tạo giao dịch mới
   */
  async createTransaction(
    data: CreateTransactionRequest
  ): Promise<ApiResponse<Transaction>> {
    return apiClient.post<Transaction>('/transactions', data);
  },

  /**
   * Cập nhật giao dịch
   */
  async updateTransaction(
    id: string,
    data: UpdateTransactionRequest
  ): Promise<ApiResponse<Transaction>> {
    return apiClient.put<Transaction>(`/transactions/${id}`, data);
  },

  /**
   * Xóa giao dịch
   */
  async deleteTransaction(id: string): Promise<ApiResponse<Transaction>> {
    return apiClient.delete<Transaction>(`/transactions/${id}`);
  },

  /**
   * Xóa nhiều giao dịch
   */
  async deleteMultiple(ids: string[]): Promise<ApiResponse<{ deletedCount: number }>> {
    return apiClient.post<{ deletedCount: number }>('/transactions/delete-many', { ids });
  },
};
