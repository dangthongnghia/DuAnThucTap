import React, { createContext, useState, useEffect, useContext, ReactNode, useRef, useMemo } from 'react';
import { storeData, getData } from '../lib/storage';
import { recurringStorage } from '../lib/recurringStorage';
import { RecurringTransaction } from '../types/transaction';
import { notificationService } from '../services/notificationService';
import { transactionService } from '../services/api/transactionService';
import { accountService, Account } from '../services/api/accountService';
import { categoryService, Category } from '../services/api/categoryService';

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
  categoryId?: string;
  accountId?: string;
  paymentMethod?: string;
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
  categories: Category[];
  accounts: Account[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
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
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Data Provider Component ---
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
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

  const loadData = async () => {
    setLoading(true);
    try {
      // Request notification permissions
      await notificationService.requestPermissions();

      try {
        // Load Transactions
        const transactionRes = await transactionService.getTransactions({}, {
          limit: 1000
        });

        if (transactionRes.success && transactionRes.data) {
          const apiTransactions = transactionRes.data.transactions.map((t: any) => ({
            id: t.id,
            title: t.title || t.category || 'Untitled', // Fallback title
            amount: t.amount,
            type: t.type,
            category: t.category, // Now a string thanks to backend fix
            categoryId: t.categoryId,
            date: t.date,
            note: t.note || '',
            receiptImage: t.receiptImage,
            accountId: t.accountId,
            recurringId: t.recurringId,
            paymentMethod: t.account?.name || t.paymentMethod
          }));
          setTransactions(apiTransactions);
        } else {
          console.warn("Failed to fetch transactions:", transactionRes.message);
          let storedTransactions = await getData('transactions');
          if (storedTransactions) setTransactions(storedTransactions);
        }

        // Load Categories
        const categoryRes = await categoryService.getCategories();
        if (categoryRes.success && categoryRes.data) {
          setCategories(categoryRes.data);
        }

        // Load Accounts
        const accountRes = await accountService.getAccounts();
        if (accountRes.success && accountRes.data) {
          setAccounts(accountRes.data.accounts);
        }

      } catch (apiError) {
        console.error("API error loading data:", apiError);
        let storedTransactions = await getData('transactions');
        if (storedTransactions) setTransactions(storedTransactions);
      }

      let storedBudgets = await getData('budgets');
      if (storedBudgets === null || storedBudgets.length === 0) {
        storedBudgets = MOCK_BUDGETS;
        await storeData('budgets', storedBudgets);
      }

      // Load recurring transactions
      const storedRecurring = await recurringStorage.getAll();

      setBudgets(storedBudgets);
      setRecurringTransactions(storedRecurring);
    } catch (error) {
      console.error("Failed to load data:", error);
      // Fallback to local storage if everything fails
    } finally {
      setLoading(false);
    }
  };

  // --- Data Loading & Persistence ---
  useEffect(() => {
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
      try {
        await transactionService.deleteTransaction(transaction.id);
        const currentTransactions = await getData('transactions') || [];
        const updatedTransactions = currentTransactions.filter((t: Transaction) => t.id !== transaction.id);
        await storeData('transactions', updatedTransactions);
      } catch (error) {
        console.error("Failed to delete transaction on server:", error);
      }
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

    // Create payload matching API expectation
    const payload = {
      title: transaction.title,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      date: transaction.date,
      note: transaction.note,
      receiptImage: transaction.receiptImage || undefined,
      accountId: transaction.accountId,
      paymentMethod: transaction.paymentMethod
    };

    try {
      const response = await transactionService.createTransaction(payload);
      if (response.success && response.data) {
        const newTransaction: Transaction = {
          id: response.data.id,
          title: response.data.title,
          amount: response.data.amount,
          type: response.data.type,
          category: response.data.category,
          categoryId: response.data.categoryId,
          date: response.data.date,
          note: response.data.note || '',
          receiptImage: response.data.receiptImage,
          accountId: response.data.accountId,
          recurringId: response.data.recurringId,
          paymentMethod: transaction.paymentMethod
        };
        const updatedTransactions = [newTransaction, ...transactions];
        setTransactions(updatedTransactions);
        await storeData('transactions', updatedTransactions);

        // Refresh account balance if needed
        if (transaction.accountId) {
          const accountRes = await accountService.getAccounts();
          if (accountRes.success && accountRes.data) {
            setAccounts(accountRes.data.accounts);
          }
        }
      }
    } catch (error) {
      console.error("Failed to create transaction:", error);
    }
  };

  const updateTransaction = async (id: string, updatedData: Partial<Transaction>) => {
    dismissUndo(); // Confirm any pending deletion

    const originalTransaction = transactions.find(t => t.id === id);
    if (!originalTransaction) return;

    const payload = {
      title: updatedData.title || originalTransaction.title,
      type: updatedData.type || originalTransaction.type,
      category: updatedData.category || originalTransaction.category,
      amount: updatedData.amount || originalTransaction.amount,
      date: updatedData.date || originalTransaction.date,
      note: updatedData.note || originalTransaction.note,
      receiptImage: updatedData.receiptImage || undefined,
      accountId: updatedData.accountId || originalTransaction.accountId,
      paymentMethod: updatedData.paymentMethod || originalTransaction.paymentMethod
    };

    try {
      const response = await transactionService.updateTransaction(id, payload);
      if (response.success) {
        const finalList = transactions.map(t => t.id === id ? { ...t, ...updatedData } : t);
        setTransactions(finalList);
        await storeData('transactions', finalList);

        // Refresh account balance
        const accountRes = await accountService.getAccounts();
        if (accountRes.success && accountRes.data) {
          setAccounts(accountRes.data.accounts);
        }
      }
    } catch (error) {
      console.error("Failed to update transaction:", error);
    }
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
      transactions, budgets, recurringTransactions, categories, accounts, loading,
      addTransaction, updateTransaction, deleteTransaction, undoDelete, showUndoSnackbar, dismissUndo,
      filteredTransactions, searchQuery, setSearchQuery, sortOrder, setSortOrder, filters, setFilters,
      addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction,
      toggleRecurringTransaction, refreshData: loadData
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
