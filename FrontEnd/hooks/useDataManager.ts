import { useState, useCallback, useEffect } from 'react';
import { Transaction, Budget, RecurringTransaction } from '../types/transaction';
import { useTransactionOperations } from './useTransactionOperations';
import { useTransactionFiltering } from './useTransactionFiltering';
import { useRecurringTransactions } from './useRecurringTransactions';
import { useBudgetManagement } from './useBudgetManagement';
import { storeData, getData } from '../lib/storage';

export const useDataManager = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize all hooks
  const transactionOps = useTransactionOperations();
  const filtering = useTransactionFiltering(transactions);
  const recurring = useRecurringTransactions();
  const budgets = useBudgetManagement(transactions);

  // Load data on initialization
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const savedTransactions = await getData('transactions');
        setTransactions(savedTransactions || []);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save transactions when they change
  useEffect(() => {
    if (!isLoading && transactions.length >= 0) {
      storeData('transactions', transactions);
    }
  }, [transactions, isLoading]);

  // Transaction operations with state updates
  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction = transactionOps.createTransaction(transactionData);
    setTransactions(prev => [...prev, newTransaction]);
    return newTransaction;
  }, [transactionOps]);

  const editTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id 
          ? transactionOps.updateTransaction(transaction, updates)
          : transaction
      )
    );
  }, [transactionOps]);

  const removeTransaction = useCallback((id: string) => {
    setTransactions(prev => transactionOps.deleteTransaction(id, prev));
  }, [transactionOps]);

  const undoDelete = useCallback(() => {
    const lastAction = transactionOps.undoLastAction();
    if (lastAction && lastAction.action === 'delete') {
      setTransactions(prev => [...prev, lastAction.data]);
      return true;
    }
    return false;
  }, [transactionOps]);

  // Create transaction from recurring
  const processRecurringTransaction = useCallback((recurringId: string) => {
    const recurringTransaction = recurring.recurringTransactions.find(r => r.id === recurringId);
    if (recurringTransaction) {
      const newTransaction = recurring.createTransactionFromRecurring(recurringTransaction);
      setTransactions(prev => [...prev, newTransaction]);
      return newTransaction;
    }
    return null;
  }, [recurring]);

  return {
    // Data
    transactions,
    isLoading,
    
    // Transaction operations
    addTransaction,
    editTransaction,
    removeTransaction,
    undoDelete,
    canUndo: transactionOps.canUndo,
    
    // Filtering and sorting
    filteredTransactions: filtering.filteredTransactions,
    filterOptions: filtering.filterOptions,
    sortBy: filtering.sortBy,
    searchQuery: filtering.searchQuery,
    updateFilter: filtering.updateFilter,
    clearFilters: filtering.clearFilters,
    updateSort: filtering.updateSort,
    updateSearchQuery: filtering.updateSearchQuery,
    
    // Recurring transactions
    recurringTransactions: recurring.recurringTransactions,
    addRecurringTransaction: recurring.addRecurringTransaction,
    updateRecurringTransaction: recurring.updateRecurringTransaction,
    deleteRecurringTransaction: recurring.deleteRecurringTransaction,
    toggleRecurringTransaction: recurring.toggleRecurringTransaction,
    processRecurringTransaction,
    getUpcomingRecurringTransactions: recurring.getUpcomingRecurringTransactions,
    
    // Budget management
    budgets: budgets.budgets,
    addBudget: budgets.addBudget,
    updateBudget: budgets.updateBudget,
    deleteBudget: budgets.deleteBudget,
    getBudgetByCategory: budgets.getBudgetByCategory,
    getActiveBudgets: budgets.getActiveBudgets,
    getOverBudgets: budgets.getOverBudgets,
    getBudgetProgress: budgets.getBudgetProgress,
  };
};