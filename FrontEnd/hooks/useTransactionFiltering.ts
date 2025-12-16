import { useState, useMemo, useCallback } from 'react';
import { Transaction } from '../types/transaction';
import { 
  filterTransactionsByAmount, 
  sortTransactions, 
  getTransactionsByCategory, 
  getTransactionsByType 
} from '../utils/transactionUtils';

export interface FilterOptions {
  category?: string;
  type?: 'income' | 'expense';
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

export const useTransactionFiltering = (transactions: Transaction[]) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by category
    if (filterOptions.category) {
      filtered = getTransactionsByCategory(filtered, filterOptions.category);
    }

    // Filter by type
    if (filterOptions.type) {
      filtered = getTransactionsByType(filtered, filterOptions.type);
    }

    // Filter by amount range
    if (filterOptions.minAmount !== undefined || filterOptions.maxAmount !== undefined) {
      filtered = filterTransactionsByAmount(filtered, filterOptions.minAmount, filterOptions.maxAmount);
    }

    // Filter by date range
    if (filterOptions.startDate || filterOptions.endDate) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const startDate = filterOptions.startDate ? new Date(filterOptions.startDate) : null;
        const endDate = filterOptions.endDate ? new Date(filterOptions.endDate) : null;

        if (startDate && transactionDate < startDate) return false;
        if (endDate && transactionDate > endDate) return false;
        return true;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query)
      );
    }

    // Sort transactions
    return sortTransactions(filtered, sortBy);
  }, [transactions, filterOptions, sortBy, searchQuery]);

  const updateFilter = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterOptions({});
    setSearchQuery('');
  }, []);

  const updateSort = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return {
    filteredTransactions,
    filterOptions,
    sortBy,
    searchQuery,
    updateFilter,
    clearFilters,
    updateSort,
    updateSearchQuery,
  };
};