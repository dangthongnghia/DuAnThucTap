import { useState, useEffect, useCallback } from 'react';
import {
  accountService,
  Account,
  AccountType,
  CreateAccountRequest,
  UpdateAccountRequest,
  AccountSummary,
  TransferRequest,
} from '../services/api';

interface UseAccountsOptions {
  type?: AccountType;
  isActive?: boolean;
  autoFetch?: boolean;
}

interface UseAccountsReturn {
  accounts: Account[];
  totalBalance: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  refetch: () => Promise<void>;
  createAccount: (data: CreateAccountRequest) => Promise<Account | null>;
  updateAccount: (id: string, data: UpdateAccountRequest) => Promise<Account | null>;
  deleteAccount: (id: string) => Promise<boolean>;
  transfer: (data: TransferRequest) => Promise<boolean>;
}

/**
 * Hook để quản lý tài khoản
 */
export function useAccounts(options: UseAccountsOptions = {}): UseAccountsReturn {
  const { type, isActive, autoFetch = true } = options;

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await accountService.getAccounts({ type, isActive });
      if (response.success && response.data) {
        setAccounts(response.data.accounts);
        setTotalBalance(response.data.totalBalance);
      } else {
        setError(response.message || 'Không thể tải danh sách tài khoản');
      }
    } catch {
      setError('Đã xảy ra lỗi khi tải tài khoản');
    } finally {
      setLoading(false);
    }
  }, [type, isActive]);

  useEffect(() => {
    if (autoFetch) {
      fetchAccounts();
    }
  }, [fetchAccounts, autoFetch]);

  const createAccount = useCallback(async (data: CreateAccountRequest): Promise<Account | null> => {
    try {
      const response = await accountService.createAccount(data);
      if (response.success && response.data) {
        setAccounts((prev) => [...prev, response.data!]);
        setTotalBalance((prev) => prev + (data.balance || 0));
        return response.data;
      }
      setError(response.message || 'Không thể tạo tài khoản');
      return null;
    } catch {
      setError('Đã xảy ra lỗi khi tạo tài khoản');
      return null;
    }
  }, []);

  const updateAccount = useCallback(async (id: string, data: UpdateAccountRequest): Promise<Account | null> => {
    try {
      const response = await accountService.updateAccount(id, data);
      if (response.success && response.data) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === id ? response.data! : a))
        );
        await fetchAccounts(); // Refresh to update total balance
        return response.data;
      }
      setError(response.message || 'Không thể cập nhật tài khoản');
      return null;
    } catch {
      setError('Đã xảy ra lỗi khi cập nhật tài khoản');
      return null;
    }
  }, [fetchAccounts]);

  const deleteAccount = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await accountService.deleteAccount(id);
      if (response.success) {
        setAccounts((prev) => prev.filter((a) => a.id !== id));
        await fetchAccounts(); // Refresh to update total balance
        return true;
      }
      setError(response.message || 'Không thể xóa tài khoản');
      return false;
    } catch {
      setError('Đã xảy ra lỗi khi xóa tài khoản');
      return false;
    }
  }, [fetchAccounts]);

  const transfer = useCallback(async (data: TransferRequest): Promise<boolean> => {
    try {
      const response = await accountService.transfer(data);
      if (response.success) {
        await fetchAccounts(); // Refresh accounts after transfer
        return true;
      }
      setError(response.message || 'Không thể chuyển tiền');
      return false;
    } catch {
      setError('Đã xảy ra lỗi khi chuyển tiền');
      return false;
    }
  }, [fetchAccounts]);

  return {
    accounts,
    totalBalance,
    loading,
    error,
    refetch: fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    transfer,
  };
}

/**
 * Hook để lấy tổng quan tài khoản
 */
export function useAccountSummary() {
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await accountService.getSummary();
      if (response.success && response.data) {
        setSummary(response.data);
      } else {
        setError(response.message || 'Không thể tải tổng quan tài khoản');
      }
    } catch {
      setError('Đã xảy ra lỗi khi tải tổng quan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
}
