import React, { createContext, useContext, ReactNode } from 'react';
import { useDataManager } from '../hooks/useDataManager';
import { Transaction, RecurringTransaction, Budget } from '../types/transaction';
import { FilterOptions } from '../hooks/useTransactionFiltering';

interface DataContextType {
  // Data
  transactions: Transaction[];
  isLoading: boolean;
  
  // Transaction operations
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction;
  editTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  undoDelete: () => boolean;
  canUndo: boolean;
  
  // Filtering and sorting
  filteredTransactions: Transaction[];
  filterOptions: FilterOptions;
  sortBy: string;
  searchQuery: string;
  updateFilter: (newFilters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  updateSort: (newSortBy: string) => void;
  updateSearchQuery: (query: string) => void;
  
  // Recurring transactions
  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (recurringData: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => RecurringTransaction;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  toggleRecurringTransaction: (id: string) => void;
  processRecurringTransaction: (recurringId: string) => Transaction | null;
  getUpcomingRecurringTransactions: (daysAhead?: number) => RecurringTransaction[];
  
  // Budget management
  budgets: Budget[];
  addBudget: (budgetData: Omit<Budget, 'id' | 'spent' | 'createdAt' | 'updatedAt'>) => Budget;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getBudgetByCategory: (category: string) => Budget | undefined;
  getActiveBudgets: () => Budget[];
  getOverBudgets: () => Budget[];
  getBudgetProgress: (budgetId: string) => any;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const dataManager = useDataManager();

  const value: DataContextType = {
    // Data
    transactions: dataManager.transactions,
    isLoading: dataManager.isLoading,
    
    // Transaction operations
    addTransaction: dataManager.addTransaction,
    editTransaction: dataManager.editTransaction,
    removeTransaction: dataManager.removeTransaction,
    undoDelete: dataManager.undoDelete,
    canUndo: dataManager.canUndo,
    
    // Filtering and sorting
    filteredTransactions: dataManager.filteredTransactions,
    filterOptions: dataManager.filterOptions,
    sortBy: dataManager.sortBy,
    searchQuery: dataManager.searchQuery,
    updateFilter: dataManager.updateFilter,
    clearFilters: dataManager.clearFilters,
    updateSort: dataManager.updateSort,
    updateSearchQuery: dataManager.updateSearchQuery,
    
    // Recurring transactions
    recurringTransactions: dataManager.recurringTransactions,
    addRecurringTransaction: dataManager.addRecurringTransaction,
    updateRecurringTransaction: dataManager.updateRecurringTransaction,
    deleteRecurringTransaction: dataManager.deleteRecurringTransaction,
    toggleRecurringTransaction: dataManager.toggleRecurringTransaction,
    processRecurringTransaction: dataManager.processRecurringTransaction,
    getUpcomingRecurringTransactions: dataManager.getUpcomingRecurringTransactions,
    
    // Budget management
    budgets: dataManager.budgets,
    addBudget: dataManager.addBudget,
    updateBudget: dataManager.updateBudget,
    deleteBudget: dataManager.deleteBudget,
    getBudgetByCategory: dataManager.getBudgetByCategory,
    getActiveBudgets: dataManager.getActiveBudgets,
    getOverBudgets: dataManager.getOverBudgets,
    getBudgetProgress: dataManager.getBudgetProgress,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};