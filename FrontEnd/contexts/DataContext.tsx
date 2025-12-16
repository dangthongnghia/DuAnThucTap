import React, { createContext, useState, useEffect, useContext, ReactNode, useRef, useMemo } from 'react';
import { storeData, getData } from '../lib/storage';
import { recurringStorage } from '../lib/recurringStorage';
import { RecurringTransaction } from '../types/transaction';
import { notificationService } from '../services/notificationService';

import { registerRecurringTask } from '../tasks/recurring-task';

// --- Types ---
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // ISO date string
  note: string;
  receiptImage?: string | null;
  recurringId?: string; // Link to recurring transaction
}

export interface Budget {
  id: string;
  category: string;
  categoryColor: string;
  remaining: number;
  spent: number;
  total: number;
  isOverBudget: boolean;
  isOverBudgetNotified?: boolean; // Add this line
}

export type SortOrder = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
export interface Filters {
  type: 'all' | 'income' | 'expense';
  category: string | null;
  startDate: string | null;
  endDate: string | null;
}

// --- Mock Data ---
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

const initialTransactions: Transaction[] = [
  { id: '1', title: 'Groceries', amount: 15.00, date: today.toISOString(), type: 'expense', category: 'Food', note: 'Buy an Avocado...' },
  { id: '2', title: 'Salary', amount: 5000.00, date: today.toISOString(), type: 'income', category: 'Salary', note: 'Monthly income' },
  { id: '3', title: 'Netflix', amount: 10.00, date: yesterday.toISOString(), type: 'expense', category: 'Subscription', note: 'Netflix subscription' },
];

const MOCK_BUDGETS: Budget[] = [
  { id: '1', category: 'Shopping', categoryColor: '#facc15', remaining: 150.50, spent: 349.50, total: 500, isOverBudget: false, isOverBudgetNotified: false },
  { id: '2', category: 'Food', categoryColor: '#fb923c', remaining: 50, spent: 250, total: 300, isOverBudget: false, isOverBudgetNotified: false },
  { id: '3', category: 'Transportation', categoryColor: '#60a5fa', remaining: 0, spent: 150, total: 150, isOverBudget: true, isOverBudgetNotified: true },
];

// --- Context Definition ---
interface DataContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => void;
  undoDelete: () => void;
  showUndoSnackbar: boolean;
  dismissUndo: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  // Recurring transactions methods
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecurringTransaction: (recurring: RecurringTransaction) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  toggleRecurringTransaction: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Data Provider Component ---
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);
  const recentlyDeleted = useRef<{ transaction: Transaction; timeoutId: ReturnType<typeof setTimeout> } | null>(null);


  // State for filtering, sorting, searching
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');
  const [filters, setFiltersState] = useState<Filters>({ type: 'all', category: null, startDate: null, endDate: null });

  const setFilters = (newFilters: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  // --- Data Loading & Persistence ---
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Request notification permissions
        await notificationService.requestPermissions();
        
        let storedTransactions = await getData('transactions');
        if (storedTransactions === null || storedTransactions.length === 0) {
          storedTransactions = initialTransactions;
          await storeData('transactions', storedTransactions);
        } else {
          // Data migration for old string amounts
          let needsUpdate = false;
          const migratedTransactions = storedTransactions.map((t: any) => {
            if (typeof t.amount === 'string') {
              needsUpdate = true;
              const numericAmount = Math.abs(parseFloat(t.amount.replace(/[^0-9.-]/g, '')));
              return {
                ...t,
                amount: isNaN(numericAmount) ? 0 : numericAmount,
                note: t.note || t.description || '',
                category: t.category || 'Other',
              };
            }
            return t;
          });

          if (needsUpdate) {
            await storeData('transactions', migratedTransactions);
          }
          storedTransactions = migratedTransactions;
        }

        let storedBudgets = await getData('budgets');
        if (storedBudgets === null || storedBudgets.length === 0) {
          storedBudgets = MOCK_BUDGETS;
          await storeData('budgets', storedBudgets);
        }
        
        // Load recurring transactions
        const storedRecurring = await recurringStorage.getAll();
        
        setTransactions(storedTransactions);
        setBudgets(storedBudgets);
        setRecurringTransactions(storedRecurring);
      } catch (error) {
        console.error("Failed to load data:", error);
        setTransactions(initialTransactions);
        setBudgets(MOCK_BUDGETS);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Register recurring task after initial data load
  useEffect(() => {
    if (!loading) {
      const setupRecurringTask = async () => {
        try {
          await registerRecurringTask();
        } catch (error) {
          console.error("Failed to register recurring task:", error);
        }
      };
      setupRecurringTask();
    }
  }, [loading]);

  const confirmDelete = async () => {
    if (recentlyDeleted.current) {
        const { transaction } = recentlyDeleted.current;
        const currentTransactions = await getData('transactions') || [];
        const updatedTransactions = currentTransactions.filter((t: Transaction) => t.id !== transaction.id);
        await storeData('transactions', updatedTransactions);
        recentlyDeleted.current = null;
    }
  };

  const dismissUndo = () => {
      if (recentlyDeleted.current) {
          clearTimeout(recentlyDeleted.current.timeoutId);
          confirmDelete();
      }
      setShowUndoSnackbar(false);
  }

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    dismissUndo(); // Confirm any pending deletion
    const newTransaction: Transaction = { ...transaction, id: Date.now().toString() };
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    await storeData('transactions', updatedTransactions);
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    dismissUndo(); // Confirm any pending deletion
    const updatedTransactions = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
    setTransactions(updatedTransactions);
    await storeData('transactions', updatedTransactions);
  };

  const deleteTransaction = (id: string) => {
    dismissUndo(); // Confirm any previous pending deletion first

    const transactionToDelete = transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    // Optimistically update UI
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);

    // Show snackbar
    setShowUndoSnackbar(true);

    // Schedule final deletion
    const timeoutId = setTimeout(() => {
        confirmDelete();
        setShowUndoSnackbar(false); // Hide snackbar after timeout
        recentlyDeleted.current = null;
    }, 5000); // 5-second undo window

    recentlyDeleted.current = { transaction: transactionToDelete, timeoutId };
  };

  const undoDelete = () => {
    if (!recentlyDeleted.current) return;

    clearTimeout(recentlyDeleted.current.timeoutId);

    // Restore transaction
    setTransactions(prev => [recentlyDeleted.current!.transaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    recentlyDeleted.current = null;
    setShowUndoSnackbar(false);
  };

  // --- Recurring Transactions Methods ---
  const addRecurringTransaction = async (recurring: Omit<RecurringTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRecurring: RecurringTransaction = {
      ...recurring,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    await recurringStorage.save(newRecurring);
    setRecurringTransactions(prev => [...prev, newRecurring]);
    
    // Schedule notification if enabled
    if (newRecurring.isActive && newRecurring.notifyBefore && newRecurring.notifyBefore > 0) {
      await notificationService.scheduleRecurringNotification(newRecurring);
    }
  };

  const updateRecurringTransaction = async (recurring: RecurringTransaction) => {
    const updated = { ...recurring, updatedAt: new Date().toISOString() };
    await recurringStorage.save(updated);
    setRecurringTransactions(prev => prev.map(r => r.id === recurring.id ? updated : r));
    
    // Reschedule notifications
    await notificationService.cancelRecurringNotifications(recurring.id);
    if (updated.isActive && updated.notifyBefore && updated.notifyBefore > 0) {
      await notificationService.scheduleRecurringNotification(updated);
    }
  };

  const deleteRecurringTransaction = async (id: string) => {
    await recurringStorage.delete(id);
    setRecurringTransactions(prev => prev.filter(r => r.id !== id));
    
    // Cancel notifications
    await notificationService.cancelRecurringNotifications(id);
  };

  const toggleRecurringTransaction = async (id: string) => {
    const recurring = recurringTransactions.find(r => r.id === id);
    if (recurring) {
      await updateRecurringTransaction({ ...recurring, isActive: !recurring.isActive });
    }
  };

  // Memoized selector for derived data
  const filteredTransactions = useMemo(() => {
    let processedTransactions = [...transactions];

    // 1. Search
    if (searchQuery) {
      processedTransactions = processedTransactions.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Filter
    if (filters.type !== 'all') {
      processedTransactions = processedTransactions.filter(t => t.type === filters.type);
    }
    if (filters.category) {
      processedTransactions = processedTransactions.filter(t => t.category === filters.category);
    }
    if (filters.startDate) {
      processedTransactions = processedTransactions.filter(t => new Date(t.date) >= new Date(filters.startDate!));
    }
    if (filters.endDate) {
      processedTransactions = processedTransactions.filter(t => new Date(t.date) <= new Date(filters.endDate!));
    }

    // 3. Sort
    processedTransactions.sort((a, b) => {
      switch (sortOrder) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'date-desc':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return processedTransactions;
  }, [transactions, searchQuery, sortOrder, filters]);

  return (
    <DataContext.Provider value={{
      transactions, budgets, recurringTransactions, loading, 
      addTransaction, updateTransaction, deleteTransaction, undoDelete, showUndoSnackbar, dismissUndo,
      filteredTransactions, searchQuery, setSearchQuery, sortOrder, setSortOrder, filters, setFilters,
      addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, 
      toggleRecurringTransaction
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};