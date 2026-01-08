import { useState, useEffect, useCallback } from 'react';
import {
  transactionService,
  Transaction,
  TransactionFilters,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from '../services/api';

interface UseTransactionsOptions {
  filters?: TransactionFilters;
  pagination?: { limit?: number; offset?: number };
  autoFetch?: boolean;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  totalCount: number;
  totalIncome: number;
  totalExpense: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;

  // Actions
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  createTransaction: (data: CreateTransactionRequest) => Promise<Transaction | null>;
  updateTransaction: (id: string, data: UpdateTransactionRequest) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  deleteMultiple: (ids: string[]) => Promise<boolean>;
  setFilters: (filters: TransactionFilters) => void;
}

/**
 * Hook để quản lý giao dịch
 */
export function useTransactions(options: UseTransactionsOptions = {}): UseTransactionsReturn {
  const { 
    filters: initialFilters = {}, 
    pagination: initialPagination = { limit: 50, offset: 0 },
    autoFetch = true 
  } = options;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [pagination, setPagination] = useState(initialPagination);

  const fetchTransactions = useCallback(async (isLoadMore = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await transactionService.getTransactions(
        filters,
        isLoadMore 
          ? { ...pagination, offset: pagination.offset! + pagination.limit! }
          : pagination
      );

      if (response.success && response.data) {
        if (isLoadMore) {
          setTransactions((prev) => [...prev, ...response.data!.transactions]);
          setPagination((prev) => ({
            ...prev,
            offset: prev.offset! + response.data!.transactions.length,
          }));
        } else {
          setTransactions(response.data.transactions);
          setPagination({ ...pagination, offset: 0 });
        }
        
        setTotalCount(response.data.totalCount);
        setTotalIncome(response.data.totalIncome);
        setTotalExpense(response.data.totalExpense);
        setHasMore(response.data.hasMore);
      } else {
        setError(response.message || 'Không thể tải giao dịch');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tải giao dịch';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions(false);
    }
  }, [autoFetch, filters]);

  const loadMore = useCallback(async () => {
    if (!loading && hasMore) {
      await fetchTransactions(true);
    }
  }, [loading, hasMore, fetchTransactions]);

  const createTransaction = useCallback(
    async (data: CreateTransactionRequest): Promise<Transaction | null> => {
      try {
        const response = await transactionService.createTransaction(data);
        if (response.success && response.data) {
          // Refresh transactions list
          await fetchTransactions(false);
          return response.data;
        }
        setError(response.message || 'Không thể tạo giao dịch');
        return null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tạo giao dịch';
        setError(errorMessage);
        return null;
      }
    },
    [fetchTransactions]
  );

  const updateTransaction = useCallback(
    async (id: string, data: UpdateTransactionRequest): Promise<Transaction | null> => {
      try {
        const response = await transactionService.updateTransaction(id, data);
        if (response.success && response.data) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === id ? response.data! : t))
          );
          return response.data;
        }
        setError(response.message || 'Không thể cập nhật giao dịch');
        return null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi cập nhật giao dịch';
        setError(errorMessage);
        return null;
      }
    },
    []
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const response = await transactionService.deleteTransaction(id);
        if (response.success) {
          setTransactions((prev) => prev.filter((t) => t.id !== id));
          return true;
        }
        setError(response.message || 'Không thể xóa giao dịch');
        return false;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa giao dịch';
        setError(errorMessage);
        return false;
      }
    },
    []
  );

  const deleteMultiple = useCallback(
    async (ids: string[]): Promise<boolean> => {
      try {
        const response = await transactionService.deleteMultiple(ids);
        if (response.success) {
          setTransactions((prev) => prev.filter((t) => !ids.includes(t.id)));
          return true;
        }
        setError(response.message || 'Không thể xóa giao dịch');
        return false;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi xóa giao dịch';
        setError(errorMessage);
        return false;
      }
    },
    []
  );

  const handleSetFilters = useCallback((newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setPagination({ limit: pagination.limit, offset: 0 });
  }, [pagination.limit]);

  return {
    transactions,
    totalCount,
    totalIncome,
    totalExpense,
    loading,
    error,
    hasMore,
    refetch: () => fetchTransactions(false),
    loadMore,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    deleteMultiple,
    setFilters: handleSetFilters,
  };
}
