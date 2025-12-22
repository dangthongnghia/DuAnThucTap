import { apiClient, ApiResponse } from './apiClient';

// Interfaces
export type AccountType =
  | 'cash'
  | 'bank'
  | 'credit_card'
  | 'debit_card'
  | 'e_wallet'
  | 'investment'
  | 'savings'
  | 'loan'
  | 'other';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
  description?: string;
}

export interface UpdateAccountRequest {
  name?: string;
  type?: AccountType;
  balance?: number;
  currency?: string;
  icon?: string;
  color?: string;
  description?: string;
  isActive?: boolean;
}

export interface AccountsListResponse {
  accounts: Account[];
  totalBalance: number;
  count: number;
}

export interface AccountSummary {
  overview: {
    totalAccounts: number;
    totalBalance: number;
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  };
  byType: Array<{
    type: AccountType;
    typeName: string;
    count: number;
    totalBalance: number;
    accounts: Array<{ id: string; name: string; balance: number }>;
  }>;
  byCurrency: Array<{
    currency: string;
    totalBalance: number;
    count: number;
  }>;
  topAccounts: Array<{
    id: string;
    name: string;
    type: AccountType;
    typeName: string;
    balance: number;
    currency: string;
  }>;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  fee?: number;
  note?: string;
}

export interface Transfer {
  id: string;
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  fee?: number;
  note?: string;
  createdAt: string;
}

export interface TransferResponse {
  transfer: Transfer;
  fromAccount: Account;
  toAccount: Account;
}

export interface TransferListResponse {
  transfers: Transfer[];
  totalCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Account Service
 */
export const accountService = {
  /**
   * Lấy danh sách tài khoản
   */
  async getAccounts(params?: {
    type?: AccountType;
    isActive?: boolean;
  }): Promise<ApiResponse<AccountsListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.isActive !== undefined)
      searchParams.append('isActive', params.isActive.toString());

    const query = searchParams.toString();
    return apiClient.get<AccountsListResponse>(
      `/accounts${query ? `?${query}` : ''}`
    );
  },

  /**
   * Lấy chi tiết tài khoản
   */
  async getAccount(id: string): Promise<ApiResponse<Account>> {
    return apiClient.get<Account>(`/accounts/${id}`);
  },

  /**
   * Tạo tài khoản mới
   */
  async createAccount(
    data: CreateAccountRequest
  ): Promise<ApiResponse<Account>> {
    return apiClient.post<Account>('/accounts', data);
  },

  /**
   * Cập nhật tài khoản
   */
  async updateAccount(
    id: string,
    data: UpdateAccountRequest
  ): Promise<ApiResponse<Account>> {
    return apiClient.put<Account>(`/accounts/${id}`, data);
  },

  /**
   * Cập nhật số dư
   */
  async updateBalance(
    id: string,
    balance: number
  ): Promise<ApiResponse<Account>> {
    return apiClient.patch<Account>(`/accounts/${id}`, { balance });
  },

  /**
   * Xóa tài khoản
   */
  async deleteAccount(id: string): Promise<ApiResponse<Account>> {
    return apiClient.delete<Account>(`/accounts/${id}`);
  },

  /**
   * Lấy tổng quan tài khoản
   */
  async getSummary(): Promise<ApiResponse<AccountSummary>> {
    return apiClient.get<AccountSummary>('/accounts/summary');
  },

  /**
   * Chuyển tiền giữa các tài khoản
   */
  async transfer(data: TransferRequest): Promise<ApiResponse<TransferResponse>> {
    return apiClient.post<TransferResponse>('/accounts/transfer', data);
  },

  /**
   * Lấy lịch sử chuyển tiền
   */
  async getTransferHistory(params?: {
    accountId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<TransferListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.accountId) searchParams.append('accountId', params.accountId);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const query = searchParams.toString();
    return apiClient.get<TransferListResponse>(
      `/accounts/transfer${query ? `?${query}` : ''}`
    );
  },
};
