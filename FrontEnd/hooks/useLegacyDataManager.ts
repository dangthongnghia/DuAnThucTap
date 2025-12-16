import { useState, useCallback, useMemo } from 'react';
import { storeData, getData } from '../lib/storage';

// Legacy types từ DataContext cũ
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  note: string;
  receiptImage?: string | null;
  recurringId?: string;
}

export interface Budget {
  id: string;
  category: string;
  categoryColor: string;
  remaining: number;
  spent: number;
  total: number;
  isOverBudget: boolean;
  isOverBudgetNotified?: boolean;
}

export type SortOrder = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

export interface Filters {
  type: 'all' | 'income' | 'expense';
  category: string | null;
  startDate: string | null;
  endDate: string | null;
}

// Hook tương thích với DataContext cũ
export const useLegacyDataManager = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    category: null,
    startDate: null,
    endDate: null,
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');
  const [searchQuery, setSearchQuery] = useState('');

  const generateId = useCallback((): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }, []);

  // Filtered và sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply filters
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate!));
    }

    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate!));
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.note.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, filters, sortOrder, searchQuery]);

  // Transaction operations
  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: generateId(),
    };
    setTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  }, [generateId]);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id ? { ...transaction, ...updates } : transaction
      )
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // Budget operations
  const addBudget = useCallback((budgetData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: generateId(),
    };
    setBudgets(prev => [...prev, newBudget]);
    return newBudget;
  }, [generateId]);

  const updateBudget = useCallback((id: string, updates: Partial<Budget>) => {
    setBudgets(prev => 
      prev.map(budget => 
        budget.id === id ? { ...budget, ...updates } : budget
      )
    );
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  // Filter operations
  const setFilter = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      type: 'all',
      category: null,
      startDate: null,
      endDate: null,
    });
    setSearchQuery('');
  }, []);

  // Statistics calculations
  const getTransactionsByCategory = useCallback((category: string) => {
    return transactions.filter(t => t.category === category);
  }, [transactions]);

  const getTotalIncome = useCallback(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTotalExpense = useCallback(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getBalance = useCallback(() => {
    return getTotalIncome() - getTotalExpense();
  }, [getTotalIncome, getTotalExpense]);

  return {
    // Data
    transactions,
    budgets,
    filteredAndSortedTransactions,
    filters,
    sortOrder,
    searchQuery,

    // Transaction operations
    addTransaction,
    updateTransaction,
    deleteTransaction,

    // Budget operations
    addBudget,
    updateBudget,
    deleteBudget,

    // Filter operations
    setFilter,
    clearFilters,
    setSortOrder,
    setSearchQuery,

    // Statistics
    getTransactionsByCategory,
    getTotalIncome,
    getTotalExpense,
    getBalance,
  };
};